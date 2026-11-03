# Step 5 · Build the HTML deck

> When `target` includes `native-pptx`, this step reads `05b-pptx.md` instead; everything below serves the HTML primary track only.

## Before starting

1. The skeleton was approved by the user (Step 4's gate).
2. You have read `assets/deck-shell.css` and `assets/deck-shell.js` — **inline them as-is; do not rewrite a navigation layer**.
3. The source file is open beside you; take data per slide from it.
4. **Skip §4's reviewer-facing legend when reading the skeleton** — jump from `⧉ legend start` straight to `⧉ legend end` and read nothing between. That block is a human-facing copy of §4's library; reading it only burns context. If you need a keyword's meaning, look it up in this document's §4 table. Trailing `- xxx: value <!-- comment -->` annotations are cross-reference too — they never produce DOM.

## Conflict rules

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

## Visual hierarchy: fix the primary first

Before building any page, answer one sentence: **what must the eye hit first?** The answer can only be one element — the `key` line, the main number of a `kpi` group, or one `pull` line. Everything else slots into the ladder below:

| Tier | DOM | Size (1280×720) | Weight | Colour | Count |
|---|---|---|---|---|---|
| primary | `.key` / the `.kpi` main number / `.pull` | 48–60; KPI 72–120 | 700–900 | ink, or the single accent fill | **1** |
| title | `h2` | 34 | 600–700 | ink | 1 |
| support | arguments, charts, cards in `.slide-body` | 22–24 | 400–600 | ink / panel | 2–4 |
| detail | `.kicker`, captions, units, `.foot` | 12–15 | 400–500 | muted, ≥ 4.5:1 | unlimited |

Fix the four sizes in `:root` and use only those four on the page (when a preset scales type up, all four scale by the same factor and keep their ratios):

```css
:root{
  --fs-claim:48px; --fs-title:34px; --fs-body:24px; --fs-meta:14px;
}
/* ratios 1.41 / 1.42 / 1.71; large-type presets scale the whole ladder by the same ratios */
```

Hard rules:

- **When `.key` is the primary, `h2` stays on this deck's title step (34px by default)** — never the same size and weight as `.key`; only pages with no `key` (cover / divider / references / thanks) may let `h2` be the primary.
- **A KPI group holds at most 4 numbers and only one may carry accent or run a size larger**; the rest stay peers. Three or more equal hero numbers means no focus — keep one and move the rest into a `table`.
- **Same-tier cards share padding, radius and type size**; emphasis lands on **one** card only and the rest must not change colour. At most 4 cards per row.
- **Three or more columns must break equal width**: the main column ≥ 1.4× a side column, or only the main column gets an accent fill; three equal columns in three colours is noise.
- **Whitespace is hierarchy**: page margin ≥ 56px, header → body ≥ 28px, group gap ≥ 24px, inner gap ≥ 12px; never fill the gaps with rules, tints or ornaments.
- **Decoration ≤ 15% of the page** and never inside the primary's 1/3 hot zone.
- **One accent block and one warn mark per slide**; `emphasis` must land on the primary, and no second accent colour goes on the page.

## Layout baseline (shared aesthetic floor)

`hierarchy` and the four-tier ladder above come first; below is the floor you follow when they say nothing. The rules are lifted from ppt-master's slide-design norms — the rules only, not its SVG pipeline:

- **Page closure**: the finished HTML must hold every visible word, image, shape and backdrop on that page; never count on the shell or CSS to add content afterwards.
- **Few semantic text roles**: four size tiers are already enough; separate roles by size + weight + colour + position + whitespace combined, and never fake a hierarchy with a near-ladder like `24 / 22 / 20`.
- **Leading by role**: titles 1.2–1.3×, dense small text 1.4–1.5×, body 1.5–1.6×, large or sparse pages 1.6–2.0×; never crush the leading to make something fit.
- **Density by viewing distance**: ask "can the back row read it" first, then decide how much goes on the page; when it does not fit, rewrite, split the slide or change the layout — never quietly shrink the type or thin it out with `opacity`.
- **Contrast and semantic encoding**: information-bearing text must be distinguishable from its real background; new distinctions lean on lightness, weight, size, shape, position or an explicit label first, and colour may only reinforce the meaning, never carry it alone.
- **Natural line breaks**: break at a phrase or a punctuation mark; a short last line is fine, an orphan on its own is not. Spaces and `%` in mixed CJK/Latin text follow the content language consistently.
- **Alignment and proximity**: related elements share an edge, a baseline or a centre axis; related groups sit closer than unrelated ones. Breaking an alignment axis has to be expressing hierarchy, direction or tension.
- **Visual weight**: judge area, lightness, saturation, density, stroke and image detail together, not colour depth alone; weight must support where the eye lands, and symmetry is not an obligation.
- **Boundary strength**: from whitespace/alignment and hairlines/brackets and pale grounds up to strokes, solid panels and true floating layers — pick the strength by relation. Peer relations share one strength; only a hierarchy or material difference changes it.
- **Containers must earn their place**: a card or panel has to express grouping, hierarchy, boundary, capacity or a material difference; a row of "web cards" that decides nothing is not a layout.
- **Titles and page chrome are part of the composition**: `h2` is part of this page's composition, not an automatic top bar; only keep a standing header/footer when it carries navigation, identity, attribution or page-number duty.

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

**Full-bleed backdrop (the `background` keyword)**: not an `<img>` in a `.img-frame`, but a ground laid on the **`<section>` itself**. The shell reads `data-bg` to lay it and `data-bg-scrim` to paint the scrim; you only write the attributes and lift this page's content above the scrim:

```html
<!-- backdrop: two attributes on the section; the content block must sit at z-index:1 or the scrim covers it -->
<section class="slide" data-i="1"
  data-bg="data:image/jpeg;base64,…"
  data-bg-scrim="linear-gradient(180deg,rgba(8,10,20,.30),rgba(8,10,20,.72))">
  <header class="slide-head">…</header>
  <div class="slide-body">…</div>
</section>
```

```css
/* lift the whole page one layer; it rides above the shell's ground + ::after scrim */
.slide[data-bg] > *{position:relative;z-index:1}
```

- **Only inline data: images.** Written as `https://…` the shell refuses it and names the slide in the console — the deck must stay offline and single-file, and a backdrop is no exception.
- **The scrim is the readability guarantee.** A full-bleed image with text over it almost always needs `data-bg-scrim`; start from the dark gradient above and only lighten it when the image is dark. Let the gradient go **heavier at the bottom** (white text usually sits there).
- **A backdrop counts toward file size as a whole image.** Use a backdrop on **one page** (never copy the same data URL across pages — known trap 17); for a deck-wide texture, draw a CSS gradient with `visual` instead. Image origin + licence come from step 3's "Candidate images"; a generated backdrop starts as `draw`.

Points:

- **Images go into the HTML, audio/video do not.** An image grows by at most about a third once base64'd, and it still travels and still displays; audio/video grow by roughly a third once base64'd, and on `file://` the browser must finish decoding that whole string before the first frame — a 30 MB clip stalls the opening for several seconds. The shell therefore defers attaching the source until **the slide first appears**, so the opening never downloads for a slide that was not played.
- **`data-src` is the single entry point**; the shell removes it once it has read it, so the same value never becomes a second source of truth in the DOM.
- **The transport bar sits below the picture, part of the card**, so the card's height must count it in: first measure the height this slide still has, then fix `.mp`'s size at "picture height + ~30px bar" (an audio card has no picture — at rest it collapses into one small loudspeaker chip, but **reserve height for the unfolded bar**: the moment the pointer arrives it must already be the full bar, with no layout jump). **Do not stretch it with `width:100%` + `aspect-ratio`**: that pushes the bar outside `.slide`'s clip box, so the picture is visible but the bar cannot be clicked (measured: a 1152px-wide 16:9 card wants 608px of height while only 523px remains under the heading, and the whole bar got pushed 85px out). The shell will not clamp it for you — this is a build error; step 6 has a dedicated reachability assertion.
- A missing file is not a silent failure: the message goes **inside the player box** — "Video not found" / "Audio not found" (`.mp-missing`, with the picture and the bar stepping aside), and the longer "put the file next to the .html" wording moves into its `title`. Step 6 must really run this branch.
- On print the shell `display:none`s the transport bar and keeps only the picture/placeholder; ink and prompts likewise never print.
- The delivery note must say it plainly: this deck is **not** self-contained, and the audio/video must be copied along with the folder.

## Required features (skeleton §1 `navigation`, realised)

| Feature | Provided by |
|---|---|
| 1280×720 proportional scaling, recomputed on resize, centred | deck-shell (`fit()`) |
| Space / → / ↓ / PageDown next, ← / ↑ / PageUp previous, Home / End, digits 1–9 | deck-shell |
| **G grid overview** (current slide highlighted, click a thumbnail to jump, ←/→ still page inside it, Esc closes) | deck-shell |
| **click left/right half to page**; links and the overview do not page | deck-shell |
| **local file links** (the `link` keyword): click a sibling file, no paging, `target="_blank" rel="noopener"`; http(s) opens a new tab; assembly checks the file exists and the scheme | deck-shell + `assemble.cjs` |
| touch swipe | deck-shell |
| URL hash remembers the slide (`#s5`), survives reload / back-forward | deck-shell |
| F fullscreen | deck-shell |
| **`Q` shortcut panel** (grouped sections listing every key this deck answers: the shell seeds its own section, the ink/presenter layers push theirs into `window.__deckHelp` at load; the panel renders the registry as it stands when opened) | deck-shell |
| **mobile portrait mask** (portrait + narrow/coarse pointer; clears on rotate) | deck-shell |
| counting numerals with a background-tab fallback | deck-shell |
| **Full-bleed backdrop** (`data-bg` ground + `data-bg-scrim` scrim, inline data: images only) | deck-shell |
| **Evidence-chain badge**  (`evidence_chain: on`, default off; on only with explicit author approval (HTML badge / PPTX footer)) | deck-shell |
| **media transport** (one strip below the picture: play/pause, a **continuous volume** that pulls up from the loudspeaker, a draggable **thick PowerPoint-style scrub bar**, the time, the rate, **fullscreen** for video; `K` play/pause, `,` `.` nudge ±1s, `[` `]` rate, `M` mute; the source is attached only when that slide first appears) | deck-shell |
| **media keys do not overreach**: `←` `→` always page (even when focus is on the transport), the other media keys only apply while focus is inside it | deck-shell |
| `prefers-reduced-motion` kills all motion | deck-shell |
| `@media print` one slide per page | deck-shell |

You supply: per-slide layout, page types, charts, badges, persona capsules, citation-bar styling.

## Slide-level visual rules

- **Text on an accent fill**: any block that uses `--accent` as its background (badge, capsule, band, cover headline) takes its text colour from `var(--accent-ink)` — never a literal `#fff` / `#000`. Hard-coding it is exactly how you get 1.01:1 invisible text (see the step-2 template disciplines).
- **Text colour uses four tokens only**: `--ink` / `--muted` / `--accent-ink` / `--warn`; no `rgba()` text colours and no `opacity` fading. To recede, use `--muted` or a smaller size, never transparency.
- **`--muted` is measured on both `--bg` and `--panel` ≥ 4.5:1**; citation bars, captions, units and axis labels all count as information-bearing text — small does not exempt them. Large text (≥ 24px, or ≥ 18.66px bold) ≥ 3:1.
- **Text on a full-bleed backdrop is measured at the brightest point after the scrim**: below 4.5:1, strengthen the scrim; never change body text to accommodate the backdrop.
- **Images**: every `<img>` sits inside a container carrying `aspect-ratio` + `object-fit` (`.img-frame` or your equivalent); a bare `<img>` is not allowed. Put a scrim over dark backgrounds, and use `contain` plus a filled container when the whole image must stay legible.
- **Density**: ≤ 4 numbers and ≤ 4 peer cards per slide, one primary and one claim (`key`) per slide; the rest into `.notes`. Every number on screen must trace back to one of that slide's §4 entries that carries it (`table` / `kpi` / `compare` / `formula` / `code`, …) — the library and picking rules live in `04-skeleton.md` §4.
- **Type**: only the four tiers of the skeleton's `hierarchy.scale` (primary / title / body / note), adjacent ratio ≥ 1.4; body ≥ `min_body_px` (default 22px); hero numerals 72–120px with `tabular-nums`; citation bar 9–11px yet still legible.
- Show citation bars only after explicit author approval.
- Evidence badges and source footers default to off. For every deck type, ask the author and obtain explicit approval before setting `evidence_chain: on`. Without approval, omit HTML `data-evidence="1"` and visible source strips; do not add native PPTX source footers in any corner. Keep citations in source records and notes. Include sources pages only when specified in the approved skeleton.
- **Full-bleed backdrop**: `data-bg` goes on the `<section>` only, with the content lifted to `z-index:1` (see the media section above); a backdrop does not enter the text flow and is not framed — it is a different thing from an `image` in an `.img-frame`.
- **Persona capsules**: persistent at the bottom; the speaking persona gets a border plus a `›` before its name; never more than two speak on one slide.
- **Charts**: inline SVG / pure CSS, no charting library. Five recurring forms — log bars (cross-magnitude comparison), indexed line (2024 = 100, shared origin, start value folded into the x label to avoid overlap, annotate "middle segment is a linear illustration"), waterfall/steps (self-revision narratives), iceberg (direct vs indirect), lifecycle strip (horizontal segments with a data card each, problem segments in warn).
- **Chart and diagram templates**: `assets/visual-templates.html` provides 21 templates (11 charts, 10 diagrams). Copy `<style data-viz-kit>` once and a selected `<figure class="viz">` into `.slide-body`; add `on-panel` on panel surfaces. Keep tokens, halos and motion hooks; select by time, hierarchy or flow relationships.
- **Appearance and copying**: rounded by default; choose `viz-outline`, `viz-blueprint` or `viz-editorial`, optionally with `on-panel`. Appearance preserves scales and connection semantics. Gallery filters, search, light/dark previews and copying help selection; copying suffixes internal ids. For manual copies, rename `id`, `url(#…)` and `aria-labelledby` together. Exclude gallery controls/scripts from decks.
- **New chart scales**: slope charts compare two times only; dumbbell endpoints share a scale; bullet values and targets share a scale; each 100% stacked row sums to 100% and does not imply absolute totals; bubble matrix radii use `sqrt(value/max)` with comparable column units; diverging bars retain zero and equal scales on both sides. Coordinate formulas live inside each template. Expand the whole domain for out-of-range values instead of clipping data.
- **Swap the data**: update labels, values, units, SVG `<title>` and the matching coordinates/dimensions together, recalculating geometry with the template formula rather than changing labels alone — preserve the `viewBox`, class names or `pathLength`; when the number of data points changes, recompute the coordinates from the ratio note above the template. Log bars must take their width from `log10(value)`, never the raw value; linear charts convert through the template's ratio formula. The numbers inside a template are placeholder examples and must be replaced with the real figures from the source summary at build time (hard rule 1); write units, years and estimated/extrapolated notes in full, and put the source in `.foot`.
- **Diagram emphasis and text**: emphasis colour lands only on key nodes, warn only on risk nodes; a risk step is stroked in warn rather than filled, and its text stays on `--ink`. Text inside a solid block carries no halo (the kit already hits `<text>` directly through `.box-label` / `.box-sub`), and text on an accent ground takes `--accent-ink`; arrows use `marker-end`, and when several copies of a template share one page, suffix the marker id.
- **Chart text**: the templates already carry the stroke halo in the ground's colour (`paint-order:stroke;stroke:var(--viz-halo);stroke-width:4px`) — do not delete it; axis labels use `--muted`, which must clear 4.5:1 against both `--bg` and `--panel`.

## Motion

Motion is presentation discipline, not decoration: by default there is one cross-fade, and in-page animation is opt-in. These rules share their source with the PPTX track (`05b-pptx.md` §4's discipline table); only the landing spot changes from `p:transition` to CSS.

- **The page turn cross-fades by default** (shell: `.45s` in / `.3s` out). Change it only when the relation between two adjacent pages changes: continuous narration inside one section keeps the fade; a direct cut takes a hard cut; steps / timelines / hierarchy advances may take a lateral move; only an act opening or a key reveal gets one stronger effect, at most once per act. Never change it for the sake of variety.
- **No in-page animation by default**; add one only when you can name the communication task it carries: revealing in reading order (`riseIn` / a drawn line / a count), or pulling attention back to something already visible. Backdrops, scrims, headers/footers and citation bars stay still by default; only ambient background drift that a style preset explicitly declares is exempt (presets A / E / G / M, amplitude ≤3% of the viewport), and it stops under `prefers-reduced-motion` too.
- **One semantic group per reveal**: the same group (one card, one `kpi` group, one process) enters together by default; do not fly each icon and each line separately. Only a preset that explicitly asks for a stagger may reveal item by item, still ≤ 6 animated elements per slide and never cascading more than two levels.
- **Timing follows the style preset, ≤ 800ms per effect**: an entrance slower than 800ms lags behind the talking and is a drag rather than emphasis; never loop body or content elements (`infinite`) — that is the main source of the "AI feel".
- **A page turn changes only `opacity` + `transform` on `.slide` / `.slide.active` / `.slide.leaving`**; never animate paging with `display` (overview thumbnails are restored by `display:block`, so `display` turns them blank).
- In-page implementation stays as it was: bars `width:0→final`; lines drawn via `stroke-dashoffset`; cards `riseIn` one after another (0.2–0.35s apart, the whole group together); numerals counted via `data-count`. All of it plays automatically on the page turn without a click; re-entering a slide replays it (`runCounters` already does this; CSS animation re-hangs through the `.active` class).
- Under `prefers-reduced-motion` everything is off (built into the shell — do not defeat it with `!important` in your own `@keyframes`).
- **No autoplaying media, no auto-advance**: a live talk is paced by a person; a looping booth build is a different deliverable and needs the user's sign-off first.

## Links

Three kinds of link, three landing points. The assembler checks each one as it assembles (`linkErrors` in `assets/assemble.cjs`); a broken link stops the build outright.

**1. Local files (the skeleton's `link` keyword)** — the click opens a file that sits in the same folder as the `.html` (or a subdirectory such as `./assets/`):

```html
<a class="file-link" href="./file.pdf" target="_blank" rel="noopener">Full paper (PDF)</a>
```

- `href` may only be a **relative path**: no `C:\…`, no `file:///…`, and no `../` escaping the delivery folder; a file name with spaces is written as `%20` (or just drop the spaces).
- Link only files that really exist and ship together; the `.html` and those files go in one folder and travel together.
- `target="_blank" rel="noopener"` is mandatory: the shell takes over http(s) only, and a local file is left to the browser to open; without `target` the presentation is replaced in place.
- `class="file-link"` is styled by the shell (accent underline + ↗), so a dark theme needs no second set of rules.
- When the same file appears on several slides, write the `<a>` again — do not copy the file, and never base64 it into the HTML.

**2. External links** — http(s) links in citation bars, the sources page and body text:

- Always `target="_blank" rel="noopener"`; the shell falls back to `window.open` (embedded previewers ignore `target`), and a link click never pages.
- An entry with no verifiable URL gets **no link**, and the source file records why (paywall / delisted / unreachable).
- `javascript:` / `vbscript:` / `data:` links are banned — the assembler fails them outright.

**3. In-deck jumps** — `href="#s5"` goes through the shell's hash router to slide 5; never point at a page number that does not exist, and never use bare `#` as an empty link.

## Maintenance notes

1. Let `fit()` own scaling; retain `transform-origin:0 0` rather than translate centring.
2. Use opacity / visibility for slides; `display:none` breaks overview clones.
3. Override theme and overview tokens in `:root`, not inside the shell.
4. Exclude custom interactive controls from click-to-page handling.
5. Background tabs pause rAF; counters need a timeout fallback to the final value.
6. The portrait mask needs portrait plus coarse pointer or short edge <600px; use `.show` to inspect it.
7. Include CJK fallbacks such as PingFang SC / Microsoft YaHei in Latin font stacks.
8. Remove literal colours from charts, badges, borders and overview to avoid light patches in dark themes.
9. Reset `#stage` positioning and transform for one-slide-per-page printing.
10. Declare viewport meta; the shell owns overflow, so do not add body scrolling.
11. Call `stopPropagation` on overlay controls to prevent accidental paging.
12. Keep shell-owned `?preview=N`: no overview, hash writes or paging. Update presenter `CANVAS` with deck geometry.
13. Use only shell-injected media controls; no native `controls` or duplicate transport.
14. Let `.mp-el` size media; include about 30px of transport height in the `.mp` card.
15. Prevent flex stretching audio cards: about 36px at rest, 38px expanded; unfold rightwards from the speaker with 416px content.
16. Overview clones replace media with static `.mp-ph`; `[data-mp]` counts live players only.
17. Each repeated inline image/backdrop duplicates base64; prefer `visual` for repeated graphics or reduce reuse.
18. Set backdrop content to `position:relative;z-index:1`; `data-bg` accepts inline data: images only.
19. Evidence is opt-in per deck: `evidence_chain: on` → `data-evidence="1"`. No hotkey; badges aggregate real citations and do not print.
20. On missing media, show `.mp-missing` inside the player and hide the image/transport.
21. Do not give `h2` and the primary equal maximum size; keep one primary, with the title second-tier.
22. Recede text with muted tokens or size, not opacity; measure contrast after compositing.
23. For three columns, make the main ≥1.4× a side column, or emphasise just one and use panel elsewhere.
24. Local file links need `target="_blank" rel="noopener"`; assembly validates files and schemes.

## Output

Write to the path in skeleton §1 `filename` (default: alongside the skeleton). Go straight into Step 6 — never deliver before verification.
