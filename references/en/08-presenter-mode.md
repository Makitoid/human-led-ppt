# Step 8 · Presenter mode (optional feature)

Opens a second window for the speaker: a fixed top banner carries the **timer** and the paging
buttons; on the left, scaled pixel-perfect previews of **the page being shown** and **the next
one**; on the right, **the spoken prompt for this page** and an
**all-slide overview**. The audience screen is untouched. **The blackboard is not here** — it is
raised in the audience window with `B` (see `07-annotation.md` §6.1). Presenter mode is **opt-in** — offer it when the deck will really be presented
on stage, when it runs to a dozen-plus pages delivered in sequence, or when the user
says 演讲者模式 / presenter / 提词 / teleprompter / 双屏 / "notes don't show up". Skip it for decks
that are only ever handed out as files or printed to PDF, and say why.

In the workflow it sits after verification and delivery (step 6): make the deck stand on its own
first, then add the tool window.

## 1. Install

The whole feature is one self-contained block: `assets/presenter-overlay.html`.

```bash
node assets/assemble.cjs deck.src.html deck.html --presenter assets/presenter-overlay.html

# combined with the step-7 ink layer (fixed order: ink first, presenter last)
node assets/assemble.cjs deck.src.html deck.html \
  --ink assets/ink-overlay.html --presenter assets/presenter-overlay.html
```

It never edits the deck's DOM, its CSS or `deck-shell.js`. The assembler appends it verbatim
immediately before `</body>`, with the ink block landing first when both are requested. Before
shipping, change **only** the two config blocks the file marks.

It relies on two parts of the shell: the `#stage > .slide` structure and `window.__deck`. With
`__deck` absent the overlay does not activate and writes a single `noShell` line to the console —
the deck still plays; adding this never leaves a broken button behind.

## 2. What each window owns

**Audience window** (the normal deck) — nothing changes except these:

| Key | Effect |
|---|---|
| `S` | open / refresh the presenter window (**while annotation is on, `S` belongs to the ink layer** — see `07-annotation.md` §8) |
| `N` | raise the **prompt bar** at the bottom of the page (the fallback when the popup is blocked; same prompt text) |
| `Esc` | close the prompt bar |

**Presenter window** — a fixed top banner (elapsed clock, `current / total`, prev / next / reset;
not a card, not draggable, not remembered) plus **four** magnetic cards. Drag a header to move one,
drag its bottom-right corner to resize; positions are remembered per deck URL, and so is each card's
**stacking order** — the card you touched last stays on top, after a reload too.

| Card | Content |
|---|---|
| Current | the slide being shown, scaled, no flicker |
| Next | the following slide; on the last page it reads "— END OF DECK —" |
| Prompt | this page's prompt from skeleton §7 (see §6) |
| Overview | every slide as a horizontal filmstrip of `?preview=N` thumbnails; the wheel scrolls it, a click jumps both windows; only the ~8 iframes near the strip's viewport are mounted |

The right column is therefore **two rows** (next slide takes 32%, the prompt fills the rest); the
left column is unchanged (current 66% / overview 34%). **There is no blackboard card**: the board
belongs to the audience window.

| Key | Effect |
|---|---|
| `← →` `↑ ↓` `Space` `PageUp/Down` | page, **and it drives the audience window too** |
| `Home` `End` | first / last page |
| Wheel (over the overview) | scroll the filmstrip; click a thumbnail to jump both windows |
| `R` | reset the timer |
| `Esc` | close the window |
| "Reset layout" in the hint bar | forget remembered positions, back to the default four cards |

Sync is **bidirectional**: paging the audience window moves the previews; paging from the presenter
window moves the audience window.

## 3. The preview is the deck itself, not a screenshot

The card shows the same HTML file reopened with `?preview=N`. The shell recognises that parameter
and:

- marks `<html data-preview="1">` and lands on page N directly;
- does **not** build the overview, does **not** write `location.hash`, and disables keyboard, click
  and touch paging — a stray click inside a preview can never drag the live deck along;
- builds the video fullscreen button (`.mp-fs`) **and** honours double-click-to-fullscreen, but the
  tile is not the screen it wants: inside a `?preview=N` iframe the deck is still a mirror, not the
  stage, so pressing it posts `media-fs` and the audience window is what fills itself with the clip
  (see §3.6); play, seek and volume still work in the tile;
- dispatches a `deck:go` CustomEvent on every `go()`, which the presenter overlay listens to in
  order to broadcast the page index.

Windows exchange the minimum — a page index, a media index, one switch — and iframes are never
reloaded (one reposition is made only after the `preview-ready` handshake, which is what keeps the
preview from flashing white):

| Message | Direction | Purpose |
|---|---|---|
| `deck-goto {idx}` | audience → presenter | previews follow |
| `presenter-goto {idx}` | presenter → audience | reverse paging |
| `presenter-open` | presenter → audience | handshake: push the current page so opening the window never lands on slide 1 |
| `preview-goto {idx}` | presenter → iframe inside a card | change page without reload |
| `preview-ready` | iframe → presenter | triggers that reposition |
| `media-fs {id,on}` | iframe inside a card → presenter; audience → presenter | someone wants the audience window's screen (§3.6). `id` is which `[data-mp]`, and both windows count them from the same DOM order, so it works as an address |
| `presenter-media-fs {id,on}` | presenter → audience | tells the audience window to enter / leave video fullscreen |
| `preview-media-fs {id,on}` | presenter → iframe inside a card | mirrors the state back into that button's icon; the picture in the card does not move |
| `audience-media-fs {id,on}` | shell inside the audience window → presenter overlay | the audience window's fullscreen truth (its own button, a double click, Esc and paging all report here); the badge trusts nothing else |
| `ink-cmd {cmd, arg/store…}` | presenter ↔ iframe | annotation remote control and ink payload (§3.5) |
| `ink-state {on}` | iframe → presenter | the preview's ink layer toggled; the chip follows (accepted from the current-slide iframe only) |
| `ink-store {store,rev}` | presenter ↔ host | whole-store ink relay, revision-guarded (§3.5) |

The presenter window finds its host through `window.opener`, falling back to `window.parent` when
there is no opener (and not when `parent === window`). So the same file works popped out and works
embedded, and sync never silently breaks.

## 3.5 Annotation relay (only when step 7 is installed as well)

The presenter window can be **annotated directly**: the preview iframe already is this deck, so the
ink layer inside it is the same engine — nothing is copied and no second store exists. What the
presenter overlay does:

- restores `pointer-events` on the **current-slide card only**
  (`#c-cur .pbody iframe{pointer-events:auto}`); the next-slide card stays `pointer-events:none`;
- adds an "Annotate" chip in the current card's header (`COPY.inkBtn / inkBtnOn`) that sends
  `ink-cmd{cmd:'on'}` into the iframe; the preview's ink layer replies with `ink-state`, and the
  chip follows. Clicking the little tile button inside the preview works too — both paths converge;
- relays strokes with the ink layer's revision protocol (step 7 §5): whoever saves broadcasts, the
  peer adopts only newer revisions, echoes are absorbed, **last write wins**. Strokes and undo stay
  consistent across both windows, and undo crosses windows (a remote takeover is one `k:'*'` step);
- after each stroke the iframe hands the keyboard back (`parent.focus()`), so ← → pages immediately.

This layer can annotate only the page inside the current-slide card — the blackboard is still raised
only in the audience window with `B` (`07-annotation.md` §6.1).

**Known limits** (state them in the delivery note): preview iframes are never reloaded, so sync
runs over messages rather than refresh; both sides write the same `localStorage` keys, and if both
windows truly draw in the same instant the revision decides — the last stroke drawn wins. That is
the design, not a bug.

## 3.6 Video fullscreen: press it in the tile, the audience window takes the screen

The `?preview=N` card is a mirror. It can offer a fullscreen button, but pressing it does not take the card's own screen — it goes over the same message bridge:

- the tile's `.mp-fs` (or a double click on the picture) posts `media-fs{id,on}` to the presenter
  window; the presenter window forwards it as-is to the audience window (`presenter-media-fs`) and
  mirrors the state back onto the button icon (`preview-media-fs`);
- **the audience window is the stage**: it fills its own screen with that one `[data-mp]` card and
  starts playing it;
- a "Video fullscreen" badge lights up at the **top-right of the current-slide tile**
  (`COPY.fsBadge`, in `--s-warn` — that colour has already been measured against the card surface by
  the time the window opens). The picture inside the tile **does not change**; it still shows the page
  as it was before fullscreen, because the speaker has to see where they stopped;
- the badge is clickable, and clicking it hands the screen back to the audience window; pressing the
  tile's fullscreen button again, pressing Esc, or paging away all come out of it too;
- the audience window is the source of truth: its own button, Esc and paging all broadcast
  `audience-media-fs`, and the badge follows. There is never a lit badge over an audience that left
  fullscreen, and never the reverse.

One implementation detail worth writing down: a cross-window `requestFullscreen` is usually refused —
the audience document has neither focus nor its own user activation at that moment. So beside real
fullscreen the shell keeps a **CSS take-over** path (`[data-takeover]`, see `deck-shell.css`): the box
is computed in canvas units (`#stage` is transformed, so it is the containing block of a fixed
descendant) and fills the window. The attribute is dropped as soon as real fullscreen is granted. Both
paths show the same picture, and Esc returns from either.

## 4. Config block 1 · COPY — rewrite the wording for this deck

The first editable region at the top of the file, one object per language; the language is picked
from `<html lang>`. These four **must** be revisited:

- `cardPrompt` (default "Prompt" / 提示词) — this label is on screen the whole talk; make it the
  speaker's own word for it;
- `empty` ("(no prompt for this slide yet — see skeleton §7)") — whenever a prompt is missing this
  line is the most visible thing in the window; never ship it smelling like a placeholder;
- `hintDrag` — if the speaker should not move cards, delete this line and leave the default layout;
- `fsBadge` / `fsTip` (default "Video fullscreen" / 视频全屏中) — only ever seen when the deck carries
  video, but it is the one thing on stage that says "the screen is currently held by a clip", so the
  wording has to land at a glance (see §3.6).

`blocked` is the popup-blocked notice and doubles as the fallback instruction; when translating,
keep both clauses (what to do, then the alternative).

## 5. Config block 2 · CANVAS + TOKEN_MAP — geometry and colour come from this deck

- `CANVAS` must equal this deck's logical canvas (the shell default is 1280×720). Preview cards
  scale by exactly `min(cardWidth/CANVAS.w, cardHeight/CANVAS.h)`, so a wrong value means wrong
  size; any deck whose canvas is not 1280×720 has to change this.
- `TOKEN_MAP` reads seven custom properties: `--bg --panel --ink --muted --accent --warn --rule`.
  Of these, `--panel/--muted/--warn/--rule` **are not in the starter template**; when absent they
  fall back to the built-in recipe and write `tokenMiss` to the console. To carry a client's actual
  palette into the presenter window, declare those four in the step-2 `:root` block of the skeleton.

Colour is inherited by reading the same `:root`, so the presenter window can never drift away from
the deck it belongs to; light versus dark is chosen from the relative luminance of `--bg`
(threshold 0.22).

**The floor is still measured, not guessed.** The overlay has a built-in 4.5:1 guard: when
`--ink/--muted/--accent/--warn` measure below 4.5:1 against **the card surface** (`--panel`, or the
light/dark default), that one colour reverts to the default and an entry such as
`--accent #F0D9E4→#1F4FD8` is written to the console. Prompt body text is 19px and card titles are
11px — small type, so 4.5:1 is a hard line; a pale pink accent must fall back to the default blue
rather than produce invisible emphasis on stage.

Measured ratios for the two real recipes (foreground / card surface → ratio):

| Case | ink | accent | warn | muted |
|---|---|---|---|---|
| Light deck (`#FFFFFF` card) | 19.44 | 6.22 | 5.93 | 6.40 |
| Dark deck (`#181C21` card) | 14.20 | 9.57 | 7.44 | 6.50 |

A deliberately broken deck (`--accent:#F0D9E4`, `--warn:#FFF2C8`, `--muted:#EDEDEB` on a white card)
was used to confirm the guard: all three were caught and replaced with `#1F4FD8 / #8A5A00 /
#5C5F66`, the worst post-fallback ratio being 5.93. The guard runs **once, when the window opens**,
so it blocks a bad shipping palette but not a mid-session recolour — reopen the window after
changing colours.

## 6. What goes in the prompt card

One source only: skeleton §7 (see `04-skeleton.md`). Land it by putting that page's prompt verbatim
inside the page's `<aside class="notes">…</aside>`. The card consumes nothing else — no `data-count`,
no `hint`, only the notes HTML — so the §7 markup is exactly what renders:

| Tag | Renders as | Use for |
|---|---|---|
| `<strong>` | warning colour | the keyword or figure that must be said out loud |
| `<em>` | accent colour | the question, the pause, the move |
| `<code>` | monospace chip | term, field name, command |

The three §7 rules still hold: signals not transcript, 150–300 characters, spoken register. Numbers
remain bound by the step-6 audit — a figure in the prompt that no §4 entry on that slide carries
(`data`, `table`, `formula`, whichever it is) is the same violation as one on the page. Notes never render in the audience window and never print;
disclose that difference in the delivery note.

## 7. Verification: these assertions must actually run

The bundled browser often blocks popups (`window.open` returns null). That is **not** a defect in
the feature: try once through a real key event (`press_key`), and if blocked exercise the `blocked`
branch and the fallback. To test sync under automation, replace `window.open` with a stub that
forwards `postMessage` into an iframe carrying the captured HTML — both message paths then execute
the same real code.

```js
async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const key = k => document.dispatchEvent(new KeyboardEvent('keydown', {key:k, bubbles:true, cancelable:true}));
  const out = {};
  // 1) fallback prompt bar: opens, clicking it must not page, follows navigation, Esc closes
  key('n'); await sleep(250);
  const dr = document.getElementById('pv-drawer');
  out.drawer = {open: dr.classList.contains('open'), idx: dr.querySelector('.pv-idx').textContent};
  const before = window.__deck.index;
  dr.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true}));
  await sleep(350);
  out.clickDoesNotPage = window.__deck.index === before;
  key('Escape'); await sleep(200); out.escCloses = !dr.classList.contains('open');
  // 2) shell regression: overview, digit jump and hash all still work
  key('g'); await sleep(300);
  out.overview = document.getElementById('overview').querySelectorAll('.thumb').length;
  key('g'); await sleep(250);
  key('3'); await sleep(450); out.digit3 = {idx: window.__deck.index, hash: location.hash};
  // 3) presenter document contents: feed the captured HTML to a srcdoc iframe, wait ~2.5s, then read
  const f = document.getElementById('pvtest'), d = f.contentDocument, w = f.contentWindow;
  out.errs = w.__errs;                                     // must be empty
  out.cards = [...d.querySelectorAll('.pcard')].map(c => c.id + ' ' + c.style.left + ' ' + c.style.top);
  out.cardIds = [...d.querySelectorAll('.pcard')].map(c => c.id);   // exactly four: c-cur c-nxt c-pmt c-ovw
  out.noBoardCard = !d.getElementById('c-bd') &&                     // no board tile in the presenter window
    ![...d.querySelectorAll('iframe')].some(i => (i.getAttribute('src')||'').indexOf('board=1') >= 0);
  out.iframeSrcs = [...d.querySelectorAll('iframe')].map(i => (i.getAttribute('src')||'').split('?')[1]);
  out.prompt = d.getElementById('pmt-body').innerHTML;      // §7's strong/em/code must survive
  out.nxtAtEnd = d.getElementById('m-nxt').textContent;      // last page must read END
  // 4) bidirectional sync: audience pages → cards follow; presenter button → audience follows
  key('ArrowRight'); await sleep(700); out.hostToCard = window.__deck.index + ' / ' + d.getElementById('t-count').textContent;
  d.getElementById('b-prev').click(); await sleep(700); out.cardToHost = window.__deck.index;
  // 5) layout: drag a card → localStorage holds pv.v2|<deckUrl> → close and reopen, position survives; stacking saved too
  out.lsKey = Object.keys(w.localStorage).find(k => k.indexOf('pv.v2|') === 0);
  out.zSaved = JSON.parse(w.localStorage.getItem(out.lsKey));   // every card is {x,y,w,h,z}, z an integer
  // 6) overview: banner fixed, filmstrip virtualized, click jumps both windows
  out.bannerH = d.getElementById('banner').offsetHeight;           // 52; #banner is not a .pcard
  const strip = d.getElementById('ovw-strip');
  strip.dispatchEvent(new WheelEvent('wheel', {deltaY: 1200, bubbles: true, cancelable: true}));
  await sleep(300); out.ovw = {moved: strip.scrollLeft > 0, mounted: strip.querySelectorAll('iframe').length}; // mounted <= 8
  d.querySelector('.ovw-item[data-i="5"]').click(); await sleep(700); out.thumbJump = window.__deck.index; // must be 5
  return JSON.stringify(out);
}
```

Five more, checked individually:

- **The preview page stands alone**: load `deck.html?preview=2` directly — it must land on slide 2,
  set `data-preview="1"`, ignore all keyboard and mouse paging, keep `#overview` empty, and write no
  hash.
- **Zero external requests**: neither the overlay nor the generated presenter document may reference
  any `//`-prefixed resource; `list_network_requests` should show only this one HTML file plus its own
  `?preview=N` iframe loads.
- **Contrast**: re-measure this deck's actual palette against the §5 table, especially when the deck
  overrode `--accent`. If the guard swapped a colour, name it in the delivery note and let the user
  decide whether to fix the deck's palette or 
- **Annotation linkage** (only when step 7 is installed as well): clicking the "Annotate" chip in
  the presenter window must put `inking` on the `body` of the iframe inside the tile; laying one
  stroke in the preview (a pointer event landing on its `#inkc`) must add the same entry to the
  audience window's store; after `undo()` in the audience window the preview canvas must be blank
  again (`getImageData` sampling); and pressing ← → straight after a stroke must page the presenter
  window at once — focus was already handed back, so no extra click is needed.
- **Stacking (z-order)**: read a card's `parseInt(card.style.zIndex,10)`, then drag its header or
  drag its bottom-right corner; after **mouseup** that number must be larger and the card must still
  sit above the ones it crossed — it must not fall back to `z-index:auto`. Enlarging the
  current-slide card (first in the DOM) must lift it above its neighbours, never sink it behind them.
  Reload once and the order survives, because `z` is stored in the layout record next to x/y/w/h;
  "Reset layout" runs `base()` and hands out z 1–4 in DOM order.

## 8. Known traps

- **Origins on `file://`.** The presenter document is written into an `about:blank` popup via
  `document.write`, so it inherits the deck's origin. Switching to `window.open('presenter.html')`
  or any absolute URL makes it cross-origin under `file://`, and `postMessage` plus `localStorage`
  both break. **Do not "tidy" this into an absolute URL.**
- **No `BroadcastChannel`.** `file://` pages are frequently treated as opaque origins and the channel
  works intermittently. Everything here is explicit `postMessage`, covering both the popped-out and
  embedded cases (the opener/parent fallback in §3).
- **`localStorage` holds card layout only**, keyed by `pv.v2|<deck URL without params>`, one
  `{x,y,w,h,z}` record per card — `z` is the stacking order, which is why a card stays raised when
  you let go and keeps the same front-to-back relation after a reload. This is the
  one place in the whole skill that touches storage — disclose it. Move to another machine or
  directory and the layout resets to default; not one prompt word is lost, since those live in the HTML.
- **The layout key is versioned.** `pv.v1` → `pv.v2` moved with the card-set change; an old saved
  layout is ignored once and the window falls back to the default geometry; leftover old keys are
  never read again and may be left in place. `clean()` reads only the four ids in `IDS`, so extra
  keys in an old record are ignored and a missing `z` reads as 1.
- **The overview is virtualized.** At most ~8 thumbnail iframes are mounted at a time — the strip's
  viewport neighbours only — and the rest show page number + title placeholders; a thumbnail's ink
  reflects `localStorage` at mount time only, and opening on a long deck costs up to 8 extra
  same-file `?preview=N` loads.
- **Popup blocking is normal.** Browsers block it, projection software blocks it, some enterprise
  builds block it always. The `N` prompt bar is therefore not a nicety but the only way the speaker
  sees prompts once blocked; the `blocked` copy must state both routes.
- **Clicking presenter UI must not page.** The shell reads a click on the left/right half as "turn the
  page". Every clickable presenter element (prompt bar, notice) calls `stopPropagation`; do the same
  for any new control, or the deck jumps when the speaker reaches for a prompt.
- **`CANVAS` disagreeing with the skeleton** means mis-scaled previews that read as "blurry". Change
  both places together.
- **Paging does not reload the iframe.** So entrance animations and `data-count` count-ups run once,
  at first load. For decks whose motion depends on replaying per page, record that as a known
  limitation in the delivery note; do not add a reload delay — that buys animation at the price of flicker.
- **With both overlays installed**, `Esc` closes the ink layer's bubble menu and the prompt bar
  independently, without interfering; `S` belongs to the ink layer (export PNG), `N` to the
  presenter layer, see `07-annotation.md` §8.

## 9. What the delivery note must add

On top of the step-6 report:

- how to open presenter mode (`S` for the window, `N` for the prompt bar) and **whether the popup
  path was genuinely verified this time** — when an automation environment blocked it, say "the popup
  path was exercised through the blocked branch; two-window sync was verified over an equivalent
  `postMessage` forward" rather than blurring it into "tested";
- that prompts come from skeleton §7 and were reviewed by the user, or "presenter mode not enabled";
- that the presenter layer's own `localStorage` use is card layout and stacking only (`pv.v2|`, one
  `{x,y,w,h,z}` per card); with step 7
  installed, the ink layer inside the previews writes its own `ink.v1*` keys (owned by the ink
  layer), same keys, same origin, synced by revision;
- with step 7 installed: the presenter window takes ink directly, strokes across windows are
  "last write wins", previews are never reloaded and sync travels over messages, not refreshes;
- with step 7 installed: **the blackboard is not in the presenter window** — the board is raised in
  the audience window with `B`; the presenter window carries four cards and is annotated on the
  current-slide card only;
- video fullscreen inside a preview tile is **mirrored onto the audience window**: click `.mp-fs` in
  the tile or double-click the picture, and it is the audience window that fills its screen while the
  current-slide tile lights a "Video fullscreen" badge in its top-right corner (click the badge, press
  the fullscreen button again, press Esc, or page away to get back); the tile's picture does not move,
  and play, seek and volume still work in the tile;
- the `S` conflict with the ink layer is resolved: with annotation on, `S` only exports a PNG — to
  open the presenter window, press `A` or use the top-right bubble first;
- that prompts do not print and do not reach PDF, and `notes` are never visible in the audience window.
