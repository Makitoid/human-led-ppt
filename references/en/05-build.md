# Step 5 · Build the HTML deck

## Before starting

1. The skeleton was approved by the user (Step 4's gate).
2. You have read `assets/deck-shell.css` and `assets/deck-shell.js` — **inline them as-is; do not rewrite a navigation layer**.
3. The source file is open beside you; take data per slide from it.
4. **Skip §4's reviewer-facing legend when reading the skeleton** — jump from `⧉ legend start` straight to `⧉ legend end` and read nothing between. That block is a human-facing copy of §4's library; reading it only burns context. If you need a keyword's meaning, look it up in this document's §4 table. Trailing `- xxx: value <!-- comment -->` annotations are cross-reference too — they never produce DOM.

## Conflict rules (most important)

Build strictly from skeleton + source file. **Add nothing on your own initiative.** When the skeleton has a problem:

- **Minor** (wording, slide order, visual detail, an inferable missing field) → build to the skeleton, then note the actual state in skeleton §6.
- **Serious** (number conflicts with the source file, number has no source, a slide's claim contradicts another, a corrected misreading crept back in, slide count/time clearly blown) → fix it, **and update the skeleton and the source file in the same pass** so all three agree; state what and why in the delivery note.
- New data needed → go back to Step 3, cite it in the source file, then fill skeleton and HTML. Never fill from memory.

## Assembly

Single file: `<style>` and `<script>` inlined, zero network requests, zero localStorage. Start from `assets/deck-shell.html` — it holds two shell placeholders (SHELL_CSS / SHELL_JS, wrapped in comment delimiters) — and inline them with the bundled assembler, which replaces globally, verifies no token survives, and fails with a one-line message:

```bash
node <skill dir>/assets/assemble.cjs deck.src.html <topic>.html     # --css <f> / --js <f> override the defaults

# with the step-7 / step-8 layers (fixed order: ink first, presenter last)
node <skill dir>/assets/assemble.cjs deck.src.html <topic>.html \
  --ink <skill dir>/assets/ink-overlay.html \
  --presenter <skill dir>/assets/presenter-overlay.html

# both layer flags may be written bare — they then default to the file of that name
# sitting next to the assembler, i.e. exactly the two paths above
node <skill dir>/assets/assemble.cjs deck.src.html <topic>.html --ink --presenter
```

Typical flow: copy `deck-shell.html` to `deck.src.html`, replace the three sample slides with the skeleton's pages, add your theme CSS, then run the assembler to produce `<topic>.html`. Keep the editable copy — a file with the shell inlined is much harder to hand-edit. Never hand-copy the CSS/JS: a single missed or partially replaced token yields a deck that silently loses its navigation. Editing the shell itself is rare; if you do, `node --check assets/deck-shell.js` catches syntax errors before assembly.

Never hand-write the optional layers into `<body>` either: both are appended before `</body>` by the assembler (slice/join, not replace, because they contain `$` sequences). If presenter mode is enabled, read step 8 first — it requires re-authoring two config blocks, and its prompts may come from skeleton §7 only.

## DOM contract

```html
<body>
  <div id="viewport"><div id="stage">
    <section class="slide" data-i="1">
      <header class="slide-head">
        <p class="kicker"><span class="act">…Act 2 · section name…</span></p>
        <h2>…slide title…</h2>
        <p class="key">…the slide's single claim…</p>
      </header>
      <div class="slide-body">…data area…</div>
      <p class="foot">…source · year… <a href="…" target="_blank" rel="noopener">↗</a></p>
      <aside class="notes">speaker note, never shown</aside>
    </section>
    …
  </div></div>
  <div id="overview" role="dialog" aria-label="Slide overview"></div>
  <div id="aria" aria-live="polite"></div>
  <div id="rotate-mask"><div class="ico"></div><p>Please rotate to landscape</p><p class="sm">or open in a wide window</p></div>
</body>
```

Class names the shell depends on: `.slide` must be a direct child of `#stage`; `.slide-head` (or `.kicker` + `h1/h2`) decides what the thumbnail shows; `.notes` is hidden automatically; `<span data-count="50" data-dec="1" data-pre="~" data-suf=" GWh">` counts up from 0 when its slide becomes active.

`.notes` holds that page's prompt from skeleton §7 — **move it verbatim** (keep `<strong>` / `<em>` / `<code>`; the presenter window's prompt card reads nothing else). Even with presenter mode off it stays a note: never visible to the audience, never printed.

## Media (image / audio / video)

The three skeleton §4 keywords `image` / `audio` / `video` decide **where the file goes**; in the HTML there are exactly three ways to write them.
**All three are taken over by the shell**: it scans `[data-mp]`, injects the transport bar and attaches the source late — **never write your own `controls`,
never hand-write `.mp-bar`**; if you do, you are fighting the shell for control.

| Keyword | What to write | Where the file goes |
|---|---|---|
| `image` | an `<img>` inside `.img-frame`, `src` written as `data:image/...;base64,...` | inlined into the HTML, no external file |
| `audio` | `<figure class="mp" data-mp><audio data-src="a.flac"></audio></figure>` | a file of the same name in the **same directory** as the `.html` |
| `video` | `<figure class="mp" data-mp><video data-src="clip.mp4"></video></figure>` | a file of the same name in the **same directory** as the `.html` |

```html
<!-- video: these two lines only, the transport bar is injected by the shell -->
<figure class="mp" data-mp>
  <video data-src="demo.mp4"></video>
</figure>

<!-- image: base64 inlined, still a single file -->
<div class="img-frame">
  <img src="data:image/png;base64,iVBORw0KGgo…" alt="…alt is mandatory…">
</div>
```

Points:

- **Images go into the HTML, audio/video do not.** An image grows by at most about a third once base64'd, and it still travels and still displays; audio/video grow by roughly a third once base64'd, and on `file://` the browser must finish decoding that whole string before the first frame — a 30 MB clip stalls the opening for several seconds. The shell therefore defers attaching the source until **the slide first appears**, so the opening never downloads for a slide that was not played.
- **`data-src` is the single entry point**; the shell removes it once it has read it, so the same value never becomes a second source of truth in the DOM.
- **The transport bar sits below the picture, part of the card**, so the card's height must count it in: first measure the height this slide still has, then fix `.mp`'s size at "picture height + ~30px bar" (an audio card has no picture — at rest it collapses into one small loudspeaker chip, but **reserve height for the unfolded bar**: the moment the pointer arrives it must already be the full bar, with no layout jump). **Do not stretch it with `width:100%` + `aspect-ratio`**: that pushes the bar outside `.slide`'s clip box, so the picture is visible but the bar cannot be clicked (measured: a 1152px-wide 16:9 card wants 608px of height while only 523px remains under the heading, and the whole bar got pushed 85px out). The shell will not clamp it for you — this is a build error; step 6 has a dedicated reachability assertion.
- A missing file does not fail silently: the shell writes "media file X not found — audio and video must sit in the same folder as this .html" under the card. Step 6 must actually exercise this branch.
- On print the shell `display:none`s the transport bar and keeps only the picture/placeholder; ink and prompts likewise never print.
- The delivery note must say it plainly: this deck is **not** self-contained, and the audio/video must be copied along with the folder.

## Required features (skeleton §1 `navigation`, realised)

| Feature | Provided by |
|---|---|
| 1280×720 proportional scaling, recomputed on resize, centred | deck-shell (`fit()`) |
| Space / → / ↓ / PageDown next, ← / ↑ / PageUp previous, Home / End, digits 1–9 | deck-shell |
| **G grid overview** (current slide highlighted, click a thumbnail to jump, ←/→ still page inside it, Esc closes) | deck-shell |
| **click left/right half to page**; links and the overview do not page | deck-shell |
| touch swipe | deck-shell |
| URL hash remembers the slide (`#s5`), survives reload / back-forward | deck-shell |
| F fullscreen | deck-shell |
| **`Q` shortcut panel** (grouped sections listing every key this deck answers: the shell seeds its own section, the ink/presenter layers push theirs into `window.__deckHelp` at load; the panel renders the registry as it stands when opened) | deck-shell |
| **mobile portrait mask** (portrait + narrow/coarse pointer; clears on rotate) | deck-shell |
| counting numerals with a background-tab fallback | deck-shell |
| **media transport** (one strip below the picture: play/pause, a **continuous volume** that pulls up from the loudspeaker, a draggable **thick PowerPoint-style scrub bar**, the time, the rate, **fullscreen** for video; `K` play/pause, `,` `.` nudge ±1s, `[` `]` rate, `M` mute; the source is attached only when that slide first appears) | deck-shell |
| **media keys do not overreach**: `←` `→` always page (even when focus is on the transport), the other media keys only apply while focus is inside it | deck-shell |
| `prefers-reduced-motion` kills all motion | deck-shell |
| `@media print` one slide per page | deck-shell |

You supply: per-slide layout, page types, charts, badges, persona capsules, citation-bar styling.

## Slide-level visual rules

- **Text on an accent fill**: any block that uses `--accent` as its background (badge, capsule, band, cover headline) takes its text colour from `var(--accent-ink)` — never a literal `#fff` / `#000`. Hard-coding it is exactly how you get 1.01:1 invisible text (see the step-2 template disciplines).
- **Images**: every `<img>` sits inside a container carrying `aspect-ratio` + `object-fit` (`.img-frame` or your equivalent); a bare `<img>` is not allowed. Put a scrim over dark backgrounds, and use `contain` plus a filled container when the whole image must stay legible.
- **Density**: ≤ 4 numbers per slide; one claim (`key`) per slide; the rest into `.notes`. Every number on screen must trace back to one of that slide's §4 entries that carries it (`table` / `kpi` / `compare` / `formula` / `code`, …) — the library and picking rules live in `04-skeleton.md` §4.
- **Type**: body ≥ skeleton's `min_body_px` (default 22px); hero numerals 72–120px with `tabular-nums`; citation bar 9–11px yet still legible.
- **Citation bar**: bottom-right "source · year" on every slide; ⚠️ / 🔍 badges sit tight against the value, two consistent badge styles, meaning explained on the sources slide.
- **Persona capsules**: persistent at the bottom; the speaking persona gets a border plus a `›` before its name; never more than two speak on one slide.
- **Charts**: inline SVG / pure CSS. Five recurring forms — log bars (cross-magnitude comparison), indexed line (2024 = 100, shared origin, start value folded into the x label to avoid overlap, annotate "middle segment is a linear illustration"), waterfall/steps (self-revision narratives), iceberg (direct vs indirect), lifecycle strip (horizontal segments with a data card each, problem segments in warn).
- **Chart text**: white halo stroke on every label (`paint-order:stroke; stroke:<bg>; stroke-width:4px`) so lines never cross glyphs; axis titles, units and years complete; derived/estimated values labelled as such inside the chart.

## Motion

Implement skeleton §1 `motion` (Step 2 gives a recommendation per preset):

- **Transition**: the shell cross-fades by default (`.45s` in / `.3s` out). For a hard cut + flash, directional slide or refractive fade, change only the `opacity` + `transform` transitions on `.slide` / `.slide.active` / `.slide.leaving`. **Never animate paging with `display`** — thumbnails are restored by `#overview .frame .slide{display:block}` and would go blank.
- **In-page**: bars `width:0→final`; lines via `stroke-dashoffset`; cards `riseIn` staggered 0.2–0.35 s; numerals via `data-count`.
- Everything plays on slide change, never on click; re-entering a slide replays it (the shell's `runCounters` does this; CSS animation replays through the `.active` class).
- ≤ 6 animated elements per slide; `prefers-reduced-motion` must win (built into the shell — do not defeat it with `!important` in your own `@keyframes`).
- Need timing/easing values you can defend? Consult `web-animation-design` (marketplace) rather than inventing magic numbers.

## Links

Citation bars, sources slide and inline `srcline` all use `target="_blank" rel="noopener"`; the shell already falls back to `window.open` (embedded previewers ignore `target`) and keeps link clicks from paging. Entries with no verifiable URL get **no link**, and the source file records why (paywall / delisted / unreachable).

## Known traps

1. **Do not recompute scaling yourself**: `fit()` sets `scale` plus the centring offset with `transform-origin:0 0`. Switching `#stage` to a `translate(-50%,-50%)` scheme breaks the click-half hit test.
2. **Never `display:none` on `.slide`** — it blanks the thumbnails. Use `opacity` + `visibility`.
3. **Override the shell through variables**: set `--bg/--ink/--accent/--ovl-bg/--ovl-ink/--ovl-card` in your own `:root`; do not edit colours inside the shell CSS.
4. **Click collisions**: any custom control must fall outside the shell's paging hit test (it already ignores `a`, `button`, `#overview`).
5. **rAF pauses in background tabs**: numeral animations stall; the shell has a `setTimeout` fallback — add your own final-value fallback for custom animation too.
6. **Portrait mask rule**: "portrait + (coarse pointer or short side < 600px)", so a narrow desktop window does not trigger it; to test layout, add `.show` to `#rotate-mask`.
7. **Chinese font fallback**: a Latin stack must be followed by a CJK stack (`"PingFang SC","Microsoft YaHei"`), otherwise headings render in a serif face.
8. **Dark themes**: purge every hard-coded colour (chart fills, badges, borders, overview wall) or pale rectangles survive the switch.
9. **Print**: `@media print` must reset `#stage`'s transform and positioning, else only slide 1 prints.
10. **Mobile**: `<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">` is mandatory; the shell already sets `overflow:hidden` — do not add body scrolling.
11. **Overlay clicks**: every clickable presenter/ink element must `stopPropagation` — the shell reads a click on either half of the screen as "turn the page", so a bubbled click becomes "the deck jumped when the speaker reached for a prompt".
12. **`?preview=N` belongs to the shell**, not to a page: with step 8 enabled, leave it alone. A `data-preview` page builds no overview, writes no hash, and swallows every paging input. When the canvas size changes, `CANVAS` in `assets/presenter-overlay.html` has to change with the skeleton or previews read as "blurry".
13. **Never add `controls` to `<video>` / `<audio>` or hand-write a bar**: the shell's injected one is the single entry point, and two control bars each answer a click (the shell isolates clicks inside its own bar, yours does not) — which shows up as "one click plays twice".
14. **Do not size the media element, but do count the transport bar into the card**: the shell tags the element `.mp-el` (`width/height:100%` + `object-fit:contain`); all you set is the size on `.mp` — and that size **must include the ~30px bar below the picture**. Drop `.mp-el` and a `4:3` clip overflows the card at its intrinsic size; forget the bar and the bar is pushed outside `.slide`'s clip box — visible but unclickable. Step 6's assertions catch both.
15. **An audio card gets stretched by the author's own flex**: `.mp[data-kind="audio"]` already collapses the media row and centres, but if your layout container still stretches it (`align-items:stretch` + a fixed-height ancestor) the card becomes one big blank panel — either stop the parent stretching, or add `align-self:center` to `.mp`. Step 6 must measure the height of `.mp`; an audio-only page rests as **one small loudspeaker** (~36px) and unfolds into the full strip (~38px) only on hover / Tab focus / a touchscreen tap — neither state may be a panel.
16. **The overview wall is a deep clone of every slide**: the shell runs `cloneNode(true)` per slide into `#overview`, and in the clone the media card is replaced by one static chip `.mp-ph` (dark box + a play glyph) — the injected bar and the `<video>`/`<audio>` element never reach a thumbnail, and `data-mp` is taken off the clone, so `[data-mp]` in a built deck counts live players only. Do not author a second set of media styles for thumbnails, and never imply in the delivery note that a thumbnail can play anything.
17. **Using the same inlined image twice puts two copies of the base64 in the HTML**: a 366 KB screenshot is a 488 KB string, and every extra slide that shows it adds another 488 KB (measured: the same image on two slides took the finished deck from ~540 KB to 1,032 KB). A graphic that recurs through the deck belongs in `visual`, not in `image` twice.

## Output

Write to the path in skeleton §1 `filename` (default: alongside the skeleton). Go straight into Step 6 — never deliver before verification.
