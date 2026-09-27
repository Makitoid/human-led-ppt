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

## Output

Write to the path in skeleton §1 `filename` (default: alongside the skeleton). Go straight into Step 6 — never deliver before verification.
