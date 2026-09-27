> One of the 17 entries in step 2's style library. Pairing advice, template disciplines and the style decision block live in `../02-style.md`.

## G. Anime / manga (lively / high rhythm / outreach and clubs)
- Look: saturated accents + thick-outlined cards + screentone and speed lines; fast, emphatic. Good for science popularisation, club talks, student audiences. **Never use copyrighted character imagery** — abstract comic language only (screentone, speech bubble, radial focus lines, onomatopoeia blocks).
- Light: bg `#FFF8F2`, panel `#FFFFFF`, ink `#1B1B2F`, accent `#D62246` (body-safe, 4.78:1); block colour `#FF4D6D` (3.05:1, ≥ 32px type and fills only), accent2 `#0E7C93` (body) / `#3AC0E0` (block), warn `#8A6500` (5.06:1) / `#FFB703` (block), rule `#F2D8C8`, outline `2px solid #1B1B2F`
- Dark: bg `#12122B`, panel `#1D1D3D`, ink `#FFF4EA`, accent `#FF6B85` (6.71:1), accent2 `#5AD1F0` (10.3:1), warn `#FFC94D` (11.95:1), rule `#2E2E57`, outline `2px solid rgba(255,255,255,.85)`
- Type: headings `"Smiley Sans","思源黑体 Heavy","Noto Sans SC",sans-serif` weight 900 with negative tracking; body `"PingFang SC","Microsoft YaHei",sans-serif` regular (bold body turns to mush at distance)
- Shape: square or 6px radius with hard offset shadow (`4px 4px 0 <ink>`, no blur); speech-bubble callouts, onomatopoeia blocks for emphasis
- Motion / transition: hard cut + 120 ms white flash (an opacity layer), or 200 ms radial focus-line burst; page elements overshoot in with `cubic-bezier(.34,1.56,.64,1)` (scale .86→1) at 120 ms intervals; screentone layer drifts over 8 s as background.
- Helper skill: `frontend-design` (no dedicated web style skill found in the market); `web-animation-design` for spring timing values.
- Caveats: hard shadows plus thick outlines go dirty on projectors — measure contrast; ≤ 3 emphasis elements per page or it becomes noise.
