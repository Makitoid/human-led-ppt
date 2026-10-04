# Step 6 · Verify and deliver

Order: static checks → live browser test → number audit → delivery. If anything fails, go back and fix it; never present unverified work as done.

## 1. Static checks

```bash
# zero external dependencies
grep -nEo '<(script|link|img|iframe)[^>]*(src|href)="(https?:)?//[^"]*"' <topic>.html
grep -n 'localStorage\|sessionStorage\|fetch(\|XMLHttpRequest' <topic>.html

# slide count matches the skeleton
grep -c 'class="slide"' <topic>.html        # vs skeleton §1 slides
grep -o 'data-i="[0-9]*"' <topic>.html      # contiguous, matching §3's rendered order

# every slide has a citation bar (cover/dividers may be exempt — say so in the skeleton)
grep -c 'class="foot"' <topic>.html

# the §4 reviewer-facing legend is human-only and must not leak into the deck (expect 0)
grep -c '⧉\|legend start' <topic>.html
```

Do not grep a built deck for `data-src` and count the hits: the inlined shell's own JS comments carry the markup example `data-src="clip.mp4"`, so those two comment lines always match. Count media figures inside `#stage`, or grep `class="mp"` instead.

Also confirm: `<meta name="viewport">` present; `#viewport/#stage/#overview/#aria/#rotate-mask` all exist; nothing from `.notes` renders visibly.

## 2. Live browser test

The embedded browser often cannot screenshot, so assert structure with `evaluate_script`. After every file edit, reload with a new `?v=N` — otherwise you are testing a cached copy.

```js
async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const key = k => document.dispatchEvent(new KeyboardEvent('keydown', {key:k, bubbles:true, cancelable:true}));
  const out = {total: window.__deck.total, hash: location.hash};
  // navigation
  key(' '); await sleep(450); out.afterSpace = window.__deck.index;
  key('ArrowLeft'); await sleep(450); out.afterLeft = window.__deck.index;
  key('End'); await sleep(450); out.afterEnd = window.__deck.index;
  key('Home'); await sleep(450);
  key('3'); await sleep(450); out.afterDigit3 = {idx: window.__deck.index, hash: location.hash};
  // click left/right half
  const r = document.getElementById('stage').getBoundingClientRect();
  document.body.dispatchEvent(new MouseEvent('click',{clientX:r.left+r.width*0.9, clientY:r.top+r.height*0.85, bubbles:true, cancelable:true}));
  await sleep(450); out.afterClickRight = window.__deck.index;
  // G overview
  key('g'); await sleep(200);
  const ov = document.getElementById('overview');
  out.overview = {open: ov.classList.contains('open'), thumbs: ov.querySelectorAll('.thumb').length,
                  scale: ov.querySelector('.thumb-slide')?.style.transform,
                  caps: [...ov.querySelectorAll('.capno')].map(e=>e.textContent)};
  ov.querySelectorAll('.thumb')[0].click(); await sleep(450);
  out.thumbJump = {idx: window.__deck.index, closed: !ov.classList.contains('open')};
  // per-slide overflow + minimum font size
  const bad = [];
  for (let i=0;i<window.__deck.total;i++){
    window.__deck.go(i); await sleep(120);
    const s = document.querySelectorAll('#stage > .slide')[i];
    if (s.scrollHeight > s.clientHeight + 2 || s.scrollWidth > s.clientWidth + 2)
      bad.push({i:i+1, overflow:[s.scrollHeight,s.clientHeight,s.scrollWidth,s.clientWidth].join('/')});
    // font floor applies to body text only; citation bars, kickers, chips and badges are small by design
    s.querySelectorAll('p,li,td,span').forEach(el=>{
      if (el.closest('.notes, .foot, .kicker, .srcline, .badge, .capno')) return;
      if (el.textContent.trim() && parseFloat(getComputedStyle(el).fontSize) < 21.5)
        bad.push({i:i+1, small:Math.round(parseFloat(getComputedStyle(el).fontSize))+'px', text:el.textContent.trim().slice(0,24)});
    });
  }
  out.problems = bad;
  out.stageTransform = document.getElementById('stage').style.transform;
  // portrait mask layout
  const m = document.getElementById('rotate-mask'); m.classList.add('show');
  out.mask = getComputedStyle(m).display; m.classList.remove('show');
  return JSON.stringify(out);
}
```

Deep link and print: opening `<topic>.html#s7` must land on slide 7; `Ctrl+P` should give one slide per page (if the embedded browser cannot render print, verify the `@media print` rules exist and state that print was not exercised).

Shortcut panel: a real `Q` keypress opens `#deckhelp` with at least the shell's own "paging & view" section; with the optional layers installed, `window.__deckHelp` must also carry the sections the ink and presenter layers registered. `Esc` closes it, every ink surface steps aside while it is open (the `#deckhelp.open ~ …` sibling selectors), clicking the panel must not page, and `Q` inside `?preview=N` must do nothing.

Contrast (mandatory for glass / low-contrast schemes):

```js
const lum = c => { const [r,g,b]=c.match(/\d+/g).map(Number).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}); return .2126*r+.7152*g+.0722*b; };
const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p); return ((x+.05)/(y+.05)).toFixed(2); };
// for each body element compare getComputedStyle(el).color against the nearest opaque ancestor's background-color
```

Mobile: resize to 390×844 portrait — the mask must appear; rotate to 844×390 — it must disappear and the canvas must fit.

### 2.1 Media (mandatory when there is `image` / `audio` / `video`)

```js
// 1) structure: after the shell takes over it looks like this, and carries no author-made controls
const fig = document.querySelector('#stage .slide.active [data-mp]');
out.mp = {kind: fig.dataset.kind,
          hasBar: !!fig.querySelector('.mp-bar'),
          elClass: fig.querySelector('video,audio').className,   // should contain mp-el
          controls: fig.querySelector('video,audio').controls,   // must be false
          dataSrcLeft: fig.querySelector('video,audio').hasAttribute('data-src')};  // must be false: already removed
// 2) the box is constrained inside the card: an audio-only page **rests as one small loudspeaker chip** (.mp under 48px tall,
//    roughly one button wide), not a whole blank panel; the full strip unfolds only on hover / Tab focus / a touchscreen tap
//    (data-open="1" on fig)
out.audioBox = fig.getBoundingClientRect().height;
// 3) walk the slide: K plays → the play button's aria-label flips play → pause → press again to get play
// 4) paging stops it: after leaving the slide, video.paused === true and currentTime === 0
// 5) ← → always page: with focus on a transport-bar button, press ArrowRight and the slide index must still change
// 6) fault branch: temporarily point one slide's data-src at a file that does not exist, then assert
//    fig.dataset.state === 'error' and that fig.querySelector('.mp-note') has copy (human words, not an error code)
// 7) overflow self-check (mandatory): the bar sits below the picture, part of the card — the card must not break .slide's clip box
const s = fig.closest('.slide'), bar = fig.querySelector('.mp-bar');
const limit = s.clientHeight - parseFloat(getComputedStyle(s).paddingBottom);
const br = bar.getBoundingClientRect();
const hit = document.elementFromPoint(br.left + br.width / 2, br.top + br.height / 2);
out.overflow = {cardBottom: fig.offsetTop + fig.offsetHeight, limit,
                fits: fig.offsetTop + fig.offsetHeight <= limit,
                barReachable: !!(hit && hit.closest && hit.closest('.mp-bar'))};
//   both must be true: fits=false means the card is taller than the space left on this slide (the bar is clipped outside the canvas),
//   barReachable=false means the bar sits in the DOM but cannot be clicked — that is the same as having no player. The shell will not
//   clamp it for you; this is a build error, go back and resize per 05-build's "card height includes the bar".
//   the scrub bar .mp-track lives inside the strip and is always on, so running the same elementFromPoint on its midpoint must hit it too.
//   an audio page must be **unfolded before it is measured**: at rest .mp-fold is display:none, so the bar is not meant to be hit —
//   set fig.setAttribute('data-open','1') for that step and remove it once measured; in the resting state assert instead that the
//   loudspeaker .mp-mute is itself clickable.
// 8) volume and fullscreen: volume is not a permanent slider — hovering .mp-mute (or tapping it on a touchscreen) pulls up .mp-volpop, and dragging
//    its slider .mp-volr changes el.volume continuously (0–1, no steps); dragging to 0 mutes, and a mouse click on the loudspeaker toggles mute;
//    with the deck already fullscreen (F), clicking the video card's .mp-fs must nest into media fullscreen — Escape comes back to the deck's fullscreen,
//    not straight down to the window.
// 9) fullscreen ownership: in a normal window the video card exposes .mp-fs, and what it fills is **this window**. Inside a `?preview=N` iframe
//    (the presenter's current-slide tile) the same button is there and clickable too, but the picture must **not** fill the presenter window:
//    that request crosses the media-fs → presenter-media-fs bridge to the audience window, the audience window takes the screen, the tile still
//    shows the page as it was before fullscreen, and a "Video fullscreen" badge lights up at the top-right of the tile (see 08-presenter-mode.md §3).
//    When the audience window itself presses Esc or pages away, the badge must go out with it — the state belongs to the audience window, not to the tile.
```

Check 7 is the new mandatory item in this version, and it must run for **every** media slide (a `for` loop over `#stage [data-mp]` is enough). In a narrow window `#rotate-mask` covers the whole screen and `elementFromPoint` always returns it — that is the test environment, not a bug: widen the window first (or temporarily `mask.classList.remove('show')`) before judging `barReachable`.

The source files must **really sit next to the HTML** when you test — on `file://` a wrong path *is* the fault branch from check 6, so one pass verifies both.
Inlined images get their own check: `img.complete === true && img.naturalWidth > 0`, plus confirm that `img.src` starts with `data:image/`.

Three probe traps, hit in a live session — read them before writing the script:

- Scope media selectors to `#stage`. `[data-mp]` now matches **live players only**; the overview
  thumbnails hold a static `.mp-ph` chip instead (a black box with a play glyph — no bar, no media
  element). If counting players gives double the expected number, you are looking at an old build.
- Transport-scoped keys (`, . [ ] M Space Enter`) must be dispatched **on a control inside the bar**,
  e.g. `fig.querySelector('.mp-btn-play').dispatchEvent(new KeyboardEvent('keydown',{key:']',bubbles:true,cancelable:true}))`.
  A synthetic keydown on `document` has `target === document`, so `target.closest('[data-mp]')` is
  null and the shell correctly ignores it — you "measure" a dead shortcut that works fine for a real
  key press. `K` is the only global media key. Also: if the browser panel has lost OS focus, real
  key presses are silently dropped — re-focus, or dispatch on the element.
- On `file://` the built-in browser strips the query string, so `?preview=N` (and the `?v=N`
  cache-buster used elsewhere in this document) never reach the page; test preview mode over
  `http://localhost`, or open the presenter window once. A CJK **directory** path may fail to load in
  the built-in browser (keep the test deck in an ASCII directory) — but CJK and spaces inside a
  `data-src` **file name** are fine and were verified working, with no manual URL-encoding.

### 2.2 Annotation / blackboard (when step 7 is installed)

- With annotation opened by `A`, the arrow keys / space / digits still page as usual;
- `B` enters the blackboard: `body` carries `board`, the page becomes the dark board, the status pill appears, the palette switches to the chalk set (every pen ≥4.5:1 against `#1D2A26`; per-colour values are documented in `07-annotation.md` §6.1), and the board's highlighter band is drawn at `.55` alpha so it clears 3:1 on the dark ground;
  **board ink survives paging** (one shared body, not one per page), and **returning to the slides does not leak board ink onto them while the slides' own ink is untouched**;
- `X` clears only the current surface (pressing it on the board does not wipe any slide's ink);
- with annotation on, `S` exports a PNG and does **not** also pop the presenter window (the two layers' `S` must be mutually exclusive, see `07-annotation.md` §8);
- presenter window (if installed alongside): exactly four `.pcard` tiles (`c-cur` `c-nxt` `c-pmt` `c-ovw`), none of them a board and no iframe carrying `board=1`; resize or drag a card, and after **mouseup** it must stay raised above the neighbours it crossed (`parseInt(card.style.zIndex,10)` grew, no fallback to `z-index:auto`), and that front-to-back order must survive a reload, because `z` is stored in the layout record `pv.v2|` together with x/y/w/h.

Optional review pass with marketplace skills (user installs first): `vercel-labs-web-design-guidelines` for a UI/UX/a11y audit, `entur-accessibility` for WCAG 2.1 checks.

## 3. Number audit (never skip)

Walk **every number and claim on screen** back to a specific row of the source file:

- figure, unit, year and source all present and identical to the source file
- derived values say "derived from …" on screen; ⚠️ carries its divergence note; 🔍 reads "as cited in …"; ⛔ items appear zero times
- a corrected misreading is never repeated in its wrong form
- unsourced numbers, adjective-substituted evidence, estimates stated as findings → delete or fix
- Each §4 entry on that slide maps to the HTML, countably: how many `points`, how many `table` rows, how many `steps`, how many `defs`, which `code` lines. In skeleton but not HTML = missed; in HTML but not skeleton = invented

Resolve conflicts per `05-build.md`'s severity rules and sync skeleton plus source file.

## 4. Delivery note

The reply to the user contains:

- clickable links to all three files (HTML first), plus skeleton and source file
- slide count, summed duration, style name
- **what was actually tested**: navigation, G overview, click-half paging, hash, portrait mask, zero external requests, per-slide overflow, font floor, number audit
- **when there is media**: the list of audio/video file names plus the reminder that they must be copied along with the folder; images are inlined, so they are unaffected
- **what was not tested and what was assumed**: e.g. print pagination not exercised, some source unreachable due to network, deep link verified on desktop only
- open decisions for the user (credits, whether to keep a given slide)
- which optional layer was enabled and the exception it brings (the ink layer's localStorage; the presenter layer's popup permission and non-printing prompts) — fill this in per `07-annotation.md` §7 and `08-presenter-mode.md` §9

Do not just say "done". The user judges from this whether they can go on stage.
