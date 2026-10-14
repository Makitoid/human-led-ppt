> This file is preset **T** in Step 2's style library. Pairing advice, template disciplines and the style decision block live in `../02-style.md`; the other 21 presets sit alongside it.

## T. Creative Voltage (energetic / retro-modern / brand narrative)
- Look: electric-blue blocks + neon-yellow accents + halftone texture — energetic and rhythmic, leaning brand narrative. Suits product launches, creative showcases, startup demos. Distilled from `zarazhangrui/frontend-slides`'s Creative Voltage (MIT, © Zara Zhang).
- Light: bg (electric blue) `#0066FF`, panel (dark block) `#0A1A3F`, ink `#FFFFFF`, muted `#C7D6FF`, rule `rgba(255,255,255,.28)`, accent (neon yellow, dark grounds / electric blue only) `#D4FF00` — `#D4FF00` on `#0066FF` is ~4.8:1 and on `#0A1A3F` ~14:1; **never put neon yellow on white** (≈1.1:1, invisible)
- Dark (the safer default): bg `#0A1A3F`, panel `#12234D`, ink `#F2F5FF`, muted `#9FB2E0`, rule `rgba(255,255,255,.18)`, accent `#D4FF00`
- Type: display `"Syne","Noto Sans SC",sans-serif` 700–800; metadata/labels `"Space Mono",ui-monospace`; body `"PingFang SC","Microsoft YaHei",sans-serif`
- Shape: square or ≤ 6px; skewed colour blocks and large badges as signatures; halftone dots (`radial-gradient` dot lattice) as texture on block edges, not the whole page
- Motion: directional page transition (24px horizontal slide-in + fade, 280ms); the halftone layer drifts over 10s; labels stagger in; reduced-motion disables all
- Helper skill: `frontend-design`; rhythm and stagger from `web-animation-design`
- Risk: a full page of electric blue is bright on a projector and blurs type; keep the blue as ground/block and carry body copy on darker panels.
