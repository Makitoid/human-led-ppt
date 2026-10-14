> This file is preset **S** in Step 2's style library. Pairing advice, template disciplines and the style decision block live in `../02-style.md`; the other 21 presets sit alongside it.

## S. Bold Signal (confident / high impact / keynote)
- Look: charcoal ground under a bright-orange focus card + oversized section numbers (01/02/03), sitting the audience up. Suits keynotes, results-driven reporting, presenting to leadership. Distilled from `zarazhangrui/frontend-slides`'s Bold Signal (MIT, © Zara Zhang).
- Light (only if a bright room forces it): bg `#F4F1EC`, panel `#FFFFFF`, ink `#141414`, muted `#63615C`, rule `#E1DDD5`, accent `#C2410C` (usable as body, 5.4:1 — bright orange `#FF5722` is only 2.7:1, **≥ 32px display and fills only**)
- Dark: bg `#1A1A1A`, panel `#242424`, elevated `#2E2E2E`, ink `#F5F3EF`, muted `#A6A29B`, rule `#33322F`, accent (the orange card) `#FF5722` with everything on it going through `--accent-ink` (against `#1A1A1A` it measures ~5.3:1, so it holds)
- Type: display `"Archivo Black","Noto Sans SC",sans-serif` at 900; body/subhead `"Space Grotesk","PingFang SC","Microsoft YaHei",sans-serif`
- Shape: radius 10–14px; the orange card is the focus (one per page at most); section numbers oversized (120px+) in a corner; no gradients, no glass
- Motion: hard cut + 120ms white flash; the focus card pops in `scale .92→1` (`cubic-bezier(.34,1.56,.64,1)`); numbers count via `data-count`; ≤ 5 animated elements per page
- Helper skill: `frontend-design`; motion curves from `web-animation-design`
- Risk: orange is the **only** saturated colour — a second one turns it into a bazaar; on a dark ground lift `muted` a step or the notes go unreadable.
