# Step 7 · Screen annotation (optional feature)

Adds a live ink layer on top of a finished deck: presenters draw on the slide while talking,
flip pages normally, and the ink follows the slide. It is **opt-in** — offer it when the deck
will be presented live, taught, reviewed in front of an audience, or when the user says
批注 / annotate / draw on screen / 黑板 / 讲课. Skip it for decks that are only ever exported
to PDF or handed out as files, and say why.

## 1. Install

The whole feature is one self-contained block: `assets/ink-overlay.html`.

```bash
node assets/assemble.cjs deck.src.html deck.html --ink assets/ink-overlay.html
# or paste the file verbatim immediately before </body> of the finished deck
```

It never edits the deck's DOM, its CSS or `deck-shell.js`. It assumes the shell's DOM contract
(`#viewport > #stage > .slide.active`, `#overview`, `window.__deck.index`) and degrades to a
`.active` DOM lookup if `__deck` is absent. Before shipping, edit **only** the two config blocks
marked in the file.

## 2. CONFIG BLOCK 1 · theme (CSS) — the bar must look like it grew out of this deck

The overlay reads eleven custom properties. Map them onto the deck's own tokens; do not invent a
new look, and do not ship the dark-teal defaults.

| Token | Map to | Note |
|---|---|---|
| `--ink-surface` | deck `--panel` (or `--bg`) + alpha `.62–.70` | the acrylic base; alpha is what lets the slide show through |
| `--ink-tint` | deck `--accent` at `.10–.15` | top gradient only |
| `--ink-line` / `--ink-hi` | hairline + inner top highlight | dark decks → white at `.14–.18`; light decks → white at `.6–.8` **plus** a dark inner bottom (`--ink-lo`) |
| `--ink-lo` | inner bottom shade | dark → black `.25`; light → the deck's darkest ink at `.08–.12` |
| `--ink-ink` | deck `--ink` (primary text) | icons and labels |
| `--ink-mut` | deck `--muted` / `--faint` | secondary text, slider track |
| `--ink-accent` | deck `--accent` | selected states, `kbd` chips |
| `--ink-on-bg` / `--ink-on-line` | `--accent` at `.18–.22` / `.55–.65` | active tool button |
| `--ink-warn` | deck `--warn` | status pill emphasis |
| `--ink-blur` / `--ink-sat` | `26px` / `180%` | lower the blur if the deck's own surfaces are busier |
| `--ink-font` | the deck's **chrome** stack | never override the deck's body/heading fonts |

Light and dark recipes:

```css
/* dark deck (deck --bg near-black, light text) */
--ink-surface:rgba(17,27,24,.66); --ink-line:rgba(255,255,255,.15);
--ink-hi:rgba(255,255,255,.17);   --ink-lo:rgba(0,0,0,.28);  --ink-ink:#EAF1EC;

/* light deck (paper background, dark text) */
--ink-surface:rgba(255,255,255,.68); --ink-line:rgba(20,40,31,.14);
--ink-hi:rgba(255,255,255,.9);       --ink-lo:rgba(20,40,31,.10); --ink-ink:#14281F;
```

Floor to verify, not to assume: `--ink-ink` against `--ink-surface` composited over the
**lightest** thing the bar can sit on (the bar floats over the slide, so the worst case is a white
chart card, not `--bg`) must stay ≥ 4.5:1 for the 12–13px labels. Run §7's contrast probe.

## 3. CONFIG BLOCK 2 · PALETTE — five colours derived from this deck, plus one user slot

`PALETTE` is the hard-coded set of pen colours; the 6th swatch is always the user-defined one
(dashed ring, opens the system colour picker, persisted). Pick the five from the deck's palette
with these rules:

1. **Readable where ink actually lands** — ≥3:1 against the deck's **dominant slide background**.
   That is the surface pens cross 95% of the time.
2. **Report, do not require, the other surfaces.** Score every candidate against the darkest block
   and the accent fill too, print the ratios, and if a colour falls under ~2:1 on a surface this
   deck really uses, either retune it or disclose the trade-off in the delivery note.
   Measured fact worth knowing before you try: a colour that clears 3:1 against *both* near-white
   (`#F7F5F0`/`#FFFFFF`) and a near-black ink block must sit in relative luminance **≈0.15–0.30**,
   and that band is too narrow to hold five well-separated hues — of twelve plausible pens only
   three pass, and greedy hue spread yields two. So demand the double floor of at most one or two
   "universal" colours and tune the rest to the dominant background.
3. **Distinct at 22px.** Compare candidates by hue *and* lightness; two colours that only differ in
   saturation are indistinguishable as dots.
4. **Never reuse a deck accent or `--warn` as a pen** — the annotation would blend into the
   highlighted element it is meant to point at.
5. Near-white is only allowed on dark decks and near-black only on light decks; on a deck that
   ships both modes, drop the extreme and keep the mid-tones.

Score candidates instead of eyeballing them:

```js
const lum = h => { const c = h.replace('#','').match(/../g).map(x => { let v = parseInt(x,16)/255;
  return v <= .03928 ? v/12.92 : Math.pow((v+.055)/1.055, 2.4); }); return .2126*c[0]+.7152*c[1]+.0722*c[2]; };
const ratio = (a,b) => { const [x,y] = [lum(a),lum(b)].sort((p,q)=>q-p); return +((x+.05)/(y+.05)).toFixed(2); };
// CSS custom properties already hold hex — parse hex directly; feeding "#F7F5F0" to an
// /\d+/g rgb parser silently invents a colour and quietly invalidates the whole table.
const surfaces = { bg:'#F7F5F0', card:'#FFFFFF', dark:'#14281F' };   // read from the deck, don't guess
const candidates = { red:'#C0392B', orange:'#B75E17', gold:'#8A6D1B', lime:'#4F7A12', teal:'#0E7A72',
                     green:'#1E7B4F', pink:'#B0306B', blue:'#2B5FA8', purple:'#8E3B8E', slate:'#4A5A6A' };
const table = Object.entries(candidates).map(([n,c]) => ({ n, c,
  worstBg:  Math.min(...[surfaces.bg].map(s => Math.max(ratio(c,s), 1/ratio(c,s)))),   // the floor
  worstAll: Math.min(...Object.values(surfaces).map(s => Math.max(ratio(c,s), 1/ratio(c,s)))) }));
// keep ≥3 on worstBg, then maximise pairwise hue distance; print the full table
```

Report the chosen five with their measured ratios against each surface — the same evidence
discipline as the number audit.

## 4. What intercepts what (the part that breaks decks if you get it wrong)

| Surface | Mechanism | Why |
|---|---|---|
| Ink canvas | capture-phase `stopImmediatePropagation` on `window` for click/dblclick/touch | the deck's click-half-to-page and swipe handlers live on `document`; the canvas has no handlers of its own, so killing propagation is safe |
| Keyboard | **nothing is blocked** — arrows, Space, PageUp/Down, Home/End and 1–9 keep paging while annotating | presenters navigate while drawing; only `Esc` and the tool keys are ours |
| Toolbar, popovers, hint, help, status pill | `stopPropagation()` on **each element itself** | a window-capture block here would also kill our own click handlers; `stopPropagation` only affects other nodes, so same-node listeners still run |
| Touch drawing | `touch-action:none` on the canvas | otherwise the browser turns a stroke into a scroll/zoom |
| **This layer's own keys** | `stopImmediatePropagation` in the `window` capture phase | when another layer also owns the same key (`S` is the presenter's "open window" too), both firing means one keypress does two jobs. The shell registers first (the ink block lands first at assembly), so **the shell wins**; in the other direction, when the key sits inside a media transport `M` belongs to the media and `[` `]` to the rate — both have to step aside completely |

`isolate()` at the bottom of the block wires the second column's counterpart — extend it if you
add a new ink surface, otherwise clicks on it will flip slides.

**Once a key is "owned" by a layer, uproot it entirely**: `preventDefault` only blocks the default
behaviour, `stopPropagation` only blocks travel downward, and neither blocks **other listeners on
the same node**. Two handlers registered side by side on the `window` capture phase can only cut
each other off with `stopImmediatePropagation`. The live symptom of leaving this out is that with
annotation on, pressing `S` downloads a PNG **and** pops the presenter window — each is "correct" on
its own; together they are an incident.

## 5. Data model (do not "optimise" this away)

- Strokes are **data**, never pixels: `{t:'p'|'m'|'x', c, w, pr, pts:[[nx,ny,pressure],…]}`.
  `nx,ny` are normalised to `#stage`, so a resized window or a different projector maps them back
  to the same place on the slide and line width scales instead of blurring.
- Everything is redrawn from data (`draw()`), which is what makes undo, clear, resize, per-slide
  switching and PNG export free. Undo is a per-slide snapshot stack, capped at 80.
- The **scrub eraser is stored as a stroke** (`t:'x'`) drawn with `destination-out`, in array order
  after the ink it erases. Erasing therefore survives resize and undo, and the whole eraser can be
  deleted as one op. The **whole-stroke eraser** removes the hit stroke instead (and skips `x`
  entries so you cannot erase an eraser).
- One array per slide (`p0`, `p1`, …); the slide index is locked at pen-down, so pressing → mid
  stroke cannot leak the stroke onto the next slide.
- **The blackboard uses a single key `bd`** and is not split per page. It is one whole sheet of
  "what was written before here" that belongs to no slide — keying it per page would carry the board
  away on every page turn, and then it is gone. Board ink and any slide's ink are never mutually
  visible (`pkey()` returns `bd` in board mode), and clearing the board never touches any page's
  ink.
- Keys: `ink.v1|<deck title>` for ink, `.size` for the two pen widths, `.color` for the custom
  swatch, `.hint` for the one-off toast, `.fab` for the dragged corner-button position.
  Title-based, so renaming the file keeps the ink. Everything is wrapped in `try/catch`: if storage
  is unavailable the layer still works and the status pill tells the user to export JSON.
- **Cross-window sync (step 8)**: the same file runs a second ink instance inside the presenter
  window's `?preview=N` iframes. Every `save()` broadcasts with a **revision** (an `ink:change` event
  on the host; `parent.postMessage` with an `ink-cmd` inside a preview). A peer adopts the remote
  store only when its revision is newer and never re-broadcasts — the revision guard absorbs echoes,
  last write wins. A remote takeover becomes one undo step (`k:'*'`), so `Ctrl+Z` in the audience
  window undoes a stroke drawn in the presenter window and vice versa.

## 6. Feature summary (for the delivery note)

`A` or the corner button toggles annotation · **blackboard (`B`, see §6.1)** · pen · highlighter ·
eraser · 5 colours + 1 custom · click the active tool again for its popover (width slider + number
for the two pens, two eraser modes for the eraser) · `[` `]` nudge the active pen · `C` cycles
colours · right-drag erases with any tool · `Ctrl+Z` / `Ctrl+Shift+Z` · `X` clears the current
surface (page or blackboard, undoable) · `V` hides ink without deleting it · `S` exports the current
surface's ink as PNG · JSON export/import for backup · `?` shortcuts · `Q`, the shell's shortcut
panel (this layer's keys are registered into it).
Stylus pressure varies pen width; mouse and touch stay uniform.

**The corner button** keeps the original slim pen glyph and is **draggable**: moving past 6px parks
it, the position is remembered per deck under the `.fab` key, **double-click** forgets the parked
spot, a plain click still starts annotation. The toolbar's on/off button carries a **⏻ power glyph** —
ending annotation closes the layer, so the glyph should say what the click does — and it
deliberately carries **no selected-state highlight**: `.on` belongs to the currently chosen tool and to the
visibility toggles, never to the power glyph, so do not give it a blue frame again. The pen and highlighter icons
stay far apart in silhouette: pen = slim diagonal body with a wavy stroke under the tip; highlighter
= a **solid filled body** (tilted 45°, with a real gap between cap and body as the
dividing line and a slanted trapezoid tip) + a **low-opacity colour band** under the tip — "has the
band or not" is the boundary between the two pens. They must read apart at
17px; do not return them to two near-identical outlined pens, and do not delete the band.
`assets/icon.svg` remains the skill's own logo; it is no longer embedded in the toolbar.

### 6.1 Blackboard (`B`)

One button (on the toolbar, a blackboard glyph) turns the whole page into **one dark board**, the
slides fold away, and you write directly on the board.
Pressing `B` again returns to the slides, with annotation still live.

- **The surface is a CSS variable**, `--ink-board` (`#1D2A26`, one fixed dark slate): it is
  deliberately **not derived from the deck palette**, so the board is this same dark ground whatever
  the deck is. It is the background of `#inkboard` under `body.board`, layered below the canvas and
  above the slides, and the JS constant `BOARD_BG` must equal it.
- **The palette has to switch too**: on a dark ground the old deep-ink pens vanish, so
  `PALETTE_BOARD` is a chalk set (`#FF8F87`/`#FFD86B`/`#7FE3D6`/`#F2F5F1`/`#9EC6FF`; measured against
  `#1D2A26`: 6.75 / 10.83 / 9.82 / 13.54 / 8.48 — all ≥4.5:1). Order and count are unchanged, so
  "colour 3" still sits in the same place as on slides. Because every pen on a dark ground has to be
  light, this set separates by **hue** (≈4°/44°/172°/achromatic near-white/217°), not by lightness.
  On switching, rebuild the swatches with `buildSwatches()` rather than only mutating the `COLORS`
  array — otherwise the swatch DOM and the array diverge.
- **The highlighter's band alpha is surface-dependent too**: `.30` on slides (unchanged), `.55` on
  the board — `.30` over the dark ground only reaches 1.8–2.3:1, and at `.55` the measured band is
  coral 3.01:1 and yellow 4.32:1, clearing 3:1 as a non-text band.
- **The clear button's wording switches as well**: "clear blackboard" on the board, "clear this page"
  on a slide. Users should not meet two different labels on one shared bin.
- **It does not print**: `@media print` hides it together with the canvas and the toolbar.
- With presenter mode installed alongside, the blackboard **is not moved into the presenter window**:
  it is raised in the audience window with `B`, and the presenter window carries four cards with no
  board tile in them (see `08-presenter-mode.md` §2).

**Annotating in the presenter window** (requires step 8): the preview iframe already is this deck,
so the current-slide card gets `pointer-events` back and an "Annotate" chip in its header that
switches the ink layer inside that iframe; strokes sync both ways through the revision protocol in
§5. After each stroke the iframe hands the keyboard back (`parent.focus()`), so ← → pages the
presenter window immediately.

## 7. Verify (mandatory — the traps below were all found this way)

Static:

```bash
grep -c 'id="inkc"\|id="inkbar"\|id="inkpop"\|id="inkmenu"' deck.html      # 4
grep -n 'PALETTE = \|SIZE = \|L = /^zh' deck.html                            # config blocks present
grep -n 'localStorage' deck.html                                             # only inside the ink block
```

Live, with `evaluate_script` in the embedded browser. Assert at least:

```js
// toggling, no page flip from any ink surface, keyboard paging still works
const ink = window.InkOverlay, bar = document.getElementById('inkbar');
const click = el => el.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true}));
const key = k => document.body.dispatchEvent(new KeyboardEvent('keydown', {key:k, bubbles:true, cancelable:true}));
const page = () => ink.page();
click(document.getElementById('inkfab'));                       // must NOT change page
key('ArrowRight'); key(' '); key('5');                          // must page normally
[...bar.querySelectorAll('button')].forEach(click);             // must NOT change page
// widths: pen and highlighter keep separate ranges and remember their own value
ink.tool('p'); const p1 = ink.size('p'); ink.setSize('m', ink.size('m') + 8);
// erasers: scrub erases partially, whole-stroke erases completely, both undoable
// geometry: bar height < 60 (one row), popovers centred within ±2px, 10px above their button
// corner button: tile icon present, drag >6px parks it + writes `ink.v1.fab|<title>` without
//   starting annotation, a plain click still starts it, dblclick resets the parked spot
// cross-window undo: a stroke drawn in the presenter window shows up here; undo() empties both
```

Pixel-level proof for the ink itself — sample the canvas rather than trusting the data:

```js
const cv = document.getElementById('inkc'), ctx = cv.getContext('2d');
const D = cv.width / innerWidth;                     // dpr! getImageData is in device px
const r = document.getElementById('stage').getBoundingClientRect();
const band = (fx, fy) => { const x = Math.round((r.left + fx*r.width)*D), y = Math.round((r.top + fy*r.height)*D);
  let run = 0, best = 0;
  for (let i = y - 30; i < y + 30; i++) { if (i < 0 || i >= cv.height) continue;
    if (ctx.getImageData(x, i, 1, 1).data[3] > 40) { run++; best = Math.max(best, run); } else run = 0; }
  return best; };
// expect band ≈ size × (stage width / 1280), plus ~1px antialiasing on each side
```

Then reload and confirm the ink came back, and clear your own test data
(`localStorage` keys + the in-memory store) before delivery — the user must open a clean deck.

## 8. Traps already paid for

1. `backdrop-filter` (like `filter`) **makes an ancestor the containing block for `position:fixed`
   descendants**. A popover nested inside the acrylic toolbar is positioned from the toolbar's box:
   measured 28px off-centre and 293px too high. Popovers live at body level.
2. A centred fixed bar (`left:50%` + `translateX(-50%)`) only gets **half the viewport** as
   available width. With `flex-wrap:nowrap` it does not overflow, it squeezes (measured 528px for
   753px of content). Set `width:max-content`.
3. Move buttons out of their styled container and the **UA button face leaks through** as a grey
   block. Re-declare `background/border/color/font` in the new scope.
4. `requestAnimationFrame` is paused in hidden tabs: resize redraws must be synchronous (this block
   registers after `deck-shell.js`, so `fit()` has already run), and expose a `redraw()` hook for
   testing.
5. Clicks bubbling to `document` are the deck's paging handler — every ink surface needs `isolate`.
6. On `file://` the browser strips `?v=N` and `#hash` from a `navigate` URL, and `hashchange`,
   `MutationObserver` and class flips are all async: read them in the **next** tool call, not the
   same script.
7. Harness state drifts: clicking every button in one test leaves the last tool/visibility active
   and silently invalidates later assertions. Print `InkOverlay.eraser()/pop()/page()` before each
   measurement group.
8. `getImageData` coordinates are device pixels (multiply by `cv.width / innerWidth`), and sampling
   a point that fell outside the canvas reads transparent — return `OUT` rather than a fake 0.
9. **`a[download]` is not navigation.** The shell has an "open every link in a new tab with
   `window.open`" fallback that also swallows the `<a download="…">` this layer builds for exporting:
   `window.open` on a multi-megabyte `data:` URL is not a download but a window holding the whole
   image, and it steals focus too. The shell now lets `download` anchors through, so **keep your own
   download logic in this file and do not edit the shell's link fallback**.
10. **With the ink layer on, `S` belongs to the ink layer** (export PNG); open the presenter window
    by pressing `A` first to leave annotation, or by using the top-right bubble.
11. **Media keys collide with ink keys by name**: `M` (mute / highlighter), `[` `]` (rate / pen
    width), `Space` (play / page). The shell cuts off later listeners on the `window` capture phase
    with `stopImmediatePropagation`, so the key belongs to the media when focus is inside the
    transport and to the ink otherwise. **Except `←` `→`, which belong to neither and always page** —
    otherwise clicking play pins the presenter to one slide.

## 9. Limits to state when delivering

- Ink is **not** in print or PDF export (`@media print` hides the layer on purpose, the blackboard
  surface likewise). A merged
  slide+ink image needs a screenshot; compositing in-page would require html2canvas and breaks the
  zero-dependency rule.
- Storage is per browser profile and per origin; `file://` shares one bucket for all local files.
  Clearing site data, another machine or another browser loses the ink → JSON export.
- The PNG export is the ink layer only, on a transparent background, at viewport size.
- On phones the shell's portrait mask covers everything; annotation is a presenter feature.
