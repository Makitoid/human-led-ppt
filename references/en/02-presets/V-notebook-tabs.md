> This file is preset **V** in Step 2's style library. Pairing advice, template disciplines and the style decision block live in `../02-style.md`; the other 21 presets sit alongside it.

## V. Notebook Tabs (editorial / orderly / team share)
- Look: cream paper cards + binder holes down the left + coloured index tabs on the right, like an open ring binder. Clean, light, unpressured — good for internal team shares, retrospectives, training decks, checklist-heavy content. Distilled from `zarazhangrui/frontend-slides`'s Notebook Tabs (MIT, © Zara Zhang).
- Light (default): bg `#FBF9F4`, panel `#FFFFFF`, ink `#1F1D1A`, muted `#6E6A61`, rule `#E7E1D5`, accent `#B23A48` (usable as body, 5.2:1); tab colours (≤ 4) `#B23A48` / `#1D6FB8` / `#2E7D5B` / `#B0720A`, all darkened to body grade
- Dark: bg `#1B1917`, panel `#232120`, ink `#F1EDE4`, muted `#A9A397`, rule `#332F2B`, accent `#E0757F`, tab colours lightened from the list above (e.g. `#E0757F` / `#6FB3E6` / `#6FCFA0` / `#E0A64B`)
- Type: display `"Bodoni Moda","Noto Serif SC",Georgia,serif` (editorial serif); body `"DM Sans","PingFang SC","Microsoft YaHei",sans-serif`
- Shape: cards radius 8px with a very soft shadow; a column of small holes at the left (`radial-gradient` or inline SVG); right-edge tabs as coloured bookmarks poking out of the card, naming the section the page belongs to
- Motion: cross-fade + 6px lift over 300ms; tabs "pull out" in sequence (`translateX` nudge + fade, 90ms apart); reduced-motion disables all
- Helper skill: `frontend-design`; run `vercel-labs-web-design-guidelines` for a UI review pass before delivery
- Risk: at most 4 tab colours and 1–2 tabs per page, or it becomes a sticky-note wall; serif Chinese goes soft small, so tabs stay sans.
