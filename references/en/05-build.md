# Step 5 · Build the HTML deck

> When `target` includes `native-pptx`, this step reads `05b-pptx.md` instead; everything below serves the HTML primary track only.

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
| **Evidence-chain badge** (**per deck**: only when the deck sets `data-evidence="1"` on `<html>`/`<body>` — skeleton §1 `evidence_chain: on` for a serious deck; recounted per slide from `.foot` and the other sources, a click lists them, never fabricated) | deck-shell |
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
- **Citation bar**: bottom-right "source · year" on every slide; ⚠️ / 🔍 badges sit tight against the value, two consistent badge styles, meaning explained on the sources slide.
- **The evidence-chain badge gathers those footnotes into one chip in the bottom-right — but only a serious deck shows it.** When the skeleton sets `evidence_chain: on` (a defence, research, data report or review where every claim must be traceable), the build adds `data-evidence="1"` to `<html>` or `<body>` and the shell builds the badge; a casual deck leaves it off and the corner stays clean. All you do is write the `.foot` ("source · year") fully — the badge counts them and a click lists them. **Do not style it yourself, and never draw a separate "evidence chain" on the page.**
- **Full-bleed backdrop**: `data-bg` goes on the `<section>` only, with the content lifted to `z-index:1` (see the media section above); a backdrop does not enter the text flow and is not framed — it is a different thing from an `image` in an `.img-frame`.
- **Persona capsules**: persistent at the bottom; the speaking persona gets a border plus a `›` before its name; never more than two speak on one slide.
- **Charts**: inline SVG / pure CSS. Five recurring forms — log bars (cross-magnitude comparison), indexed line (2024 = 100, shared origin, start value folded into the x label to avoid overlap, annotate "middle segment is a linear illustration"), waterfall/steps (self-revision narratives), iceberg (direct vs indirect), lifecycle strip (horizontal segments with a data card each, problem segments in warn).
- **Chart text**: white halo stroke on every label (`paint-order:stroke; stroke:<bg>; stroke-width:4px`) so lines never cross glyphs; axis titles, units and years complete; derived/estimated values labelled as such inside the chart.

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
15. **An audio card gets stretched by the author's own flex**: `.mp[data-kind="audio"]` already collapses the media row and centres, but if your layout container still stretches it (`align-items:stretch` + a fixed-height ancestor) the card becomes one big blank panel — either stop the parent stretching, or add `align-self:center` to `.mp`. Step 6 must measure the height of `.mp`; an audio-only page rests as **one small loudspeaker** (~36px) and unfolds into the full strip (~38px) only on hover / Tab focus / a touchscreen tap — neither state may be a panel. The expansion runs **left to right**: the loudspeaker stays where it is and the strip grows to its right; the content is 416px wide (80% of the former 520px). Never put it back to centred — centring makes the buttons jump left and right under the pointer.
16. **The overview wall is a deep clone of every slide**: the shell runs `cloneNode(true)` per slide into `#overview`, and in the clone the media card is replaced by one static chip `.mp-ph` (dark box + a play glyph) — the injected bar and the `<video>`/`<audio>` element never reach a thumbnail, and `data-mp` is taken off the clone, so `[data-mp]` in a built deck counts live players only. Do not author a second set of media styles for thumbnails, and never imply in the delivery note that a thumbnail can play anything.
17. **Using the same inlined image twice puts two copies of the base64 in the HTML**: a 366 KB screenshot is a 488 KB string, and every extra slide that shows it adds another 488 KB (measured: the same image on two slides took the finished deck from ~540 KB to 1,032 KB). A graphic that recurs through the deck belongs in `visual`, not in `image` twice. **The same goes for a backdrop** — one image laid on three pages is three copies of its base64.
18. **The backdrop hides the content, or the content hides the backdrop**: `data-bg` lies on the section and the scrim is the section's `::after`, both below the content; if a page's content block is in normal flow (`static`) it sits *under* the scrim, and the page reads as "a translucent wash with no visible text". Give `.slide[data-bg] > *` `position:relative;z-index:1`. Also: a `data-bg` written as an external `https://…` is refused by the shell (it names the page in the console) — a backdrop must be inlined too, or the deck is no longer offline.
19. **The evidence chain is a per-deck choice, not a hotkey and not a default.** Skeleton §1's `evidence_chain` decides it: `on` makes the build set `data-evidence="1"` on `<html>`/`<body>` and the shell builds a visible badge; write nothing and the corner stays empty. Decide it while writing, not on stage. It recounts per slide from `.foot` and the other sources, so an author who writes sources fully is the one who gives it something to count; a click lists the sources, and it never prints or lands in a screenshot.
20. **A missing-media message lives inside the player box, not under the card.** `.mp[data-state="error"]` hides the picture and the bar and shows `.mp-missing` ("Video not found" / "Audio not found"). Do not go looking for the old `.mp-note`'s bottom margin — that treatment is retired, and the assertion now checks `.mp-missing` is present and **inside** the card.
21. **Two largest font sizes = no primary**: putting both `h2` and `.key` at 48px is the most common way to look tiered while being flat. Only one element may stand on the first tier; the other drops to the second, or step 6's hierarchy assertion will flag it.
22. **Using `opacity` to recede text silently kills contrast**: `--muted` picked at 4.5:1 and then wrapped in `.6` alpha lands near 2:1. Recede with tokens and size, not transparency; step 6 recomputes on the composite colour.
23. **Three equal-width columns with three colours is noise, not hierarchy**: equal cards each with their own colour leave the eye no landing point. Either make the main column ≥ 1.4× a side column, or accent one card and set the rest to panel.
24. **A local file link is not an external link**: the shell intercepts http(s) only, so a local relative href only counts as "somewhere else" with `target="_blank" rel="noopener"`; without `target` the presentation is replaced by the PDF in place. At assembly `linkErrors` checks both the file's existence and the scheme, and `javascript:` / `vbscript:` / `data:` fail outright.

## Output

Write to the path in skeleton §1 `filename` (default: alongside the skeleton). Go straight into Step 6 — never deliver before verification.
