> One of the 17 entries in step 2's style library. Pairing advice, template disciplines and the style decision block live in `../02-style.md`.

## D. Claude (warm / human / narrative)
- Look: cream ground + ink text + terracotta accent, serif headings give publishery calm. Good for humanities, education, opinion, interview-style narrative.
- Light: bg `#F5F1E8`, panel `#FBF8F1`, ink `#26221C`, muted `#6B655B`, rule `#DED7C8`, accent `#9E4A28` (body-safe, 5.38:1); clay `#B75C38` is 4.05:1 — headings ≥ 32px and blocks; warn `#7A5F1B`
- Dark: bg `#211D18`, panel `#2B2621`, ink `#F0EAE0`, muted `#B4A99B`, accent `#D97A52`, warn `#D6A94B`, rule `#3B342C`
- Type: headings `"Source Han Serif SC","Noto Serif SC",Georgia,serif`; body `"Söhne","Inter","PingFang SC","Microsoft YaHei",sans-serif`
- Shape: radius 8–12px, borders instead of shadows; a thin hand-drawn inline-SVG illustration can anchor a page
- Motion / transition: slow and soft — 500 ms fade + 6px rise, leading loosens slightly as lines enter; serif headings may use a 20px masked line reveal; avoid spring overshoot (clashes with the publishery tone).
- Helper skill: `frontend-design`; `majiayu000-brand-typography-systems` for the serif/sans pairing and modular scale.
- Caveats: Chinese serifs go mushy below ~24px — body stays sans; in dark mode keep the warm near-black (`#211D18`), pure black makes warm text look dirty.
