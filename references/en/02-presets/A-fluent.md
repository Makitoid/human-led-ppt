> One of the 17 entries in step 2's style library. Pairing advice, template disciplines and the style decision block live in `../02-style.md`.

## A. Fluent Design 2 (Microsoft / institutional / report-like)
- Look: layered depth + acrylic backplates + hairline-bordered cards; strong order; good for policy, data, formal reporting.
- Light: bg `#FAF9F8`, panel `#FFFFFF`, ink `#201F1E`, muted `#605E5C`, accent `#0F6CBD`, warn `#8A5A00`, rule `#E1DFDD`
- Dark: bg `#1B1A19`, panel `#292827`, elevated `#323130`, ink `#FAF9F8`, muted `#AAAAAA`, accent `#75B6E9`, warn `#F1D08A`, rule `#3B3A39`
- Type: `"Segoe UI Variable","Segoe UI","Microsoft YaHei UI","Microsoft YaHei",system-ui,sans-serif`; bold the Chinese headings — a Latin-only stack makes Chinese fall back to a serif face
- Shape: radius 4/8px; near-invisible shadow (`0 1.6px 3.6px rgba(0,0,0,.13)`); emphasis via border and acrylic layer, never stacked shadows
- Motion / transition: cross-fade + 8px rise (`cubic-bezier(.1,.9,.2,1)`, 280–350 ms); acrylic layer may drift slowly behind content; Reveal border glow on hover. No directional slide — movement looks like jitter on a projector.
- Helper skill: `fluent-design` (bingfoon) for acrylic recipe, control specs and dark-mode tokens.
- Fit: best for data-dense slides; one 1px column rule per page buys instant order.
