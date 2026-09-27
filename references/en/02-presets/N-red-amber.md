> One of the 17 entries in step 2's style library. Pairing advice, template disciplines and the style decision block live in `../02-style.md`.

## N. Red-amber alert (incident post-mortem · red team · policy-as-code)
- Look: white/warm-white, 45° hazard stripes top and bottom, struck-through display headings, green/amber/red tier cards. The audience learns not to skim.
- Signatures: ① hazard stripe bands on the page edges ② L1/L2/L3 tier cards — the tier is always spelled out in words, colour is never the only carrier
- Default partner: F Notion's density, or A Fluent's institutional voice
- Light: bg `#FFFFFF`, panel `#FBF7EE`, ink `#171411`(18.35), muted `#4F4A44`(8.77), accent `#B3261E`(6.54), warn `#8A5A00`(5.93), rule `#E4DED2`, accent-ink `#FFFFFF`(6.54)
- Dark: bg `#141110`, panel `#1E1A18`, ink `#F2EDE6`(16.14), muted `#ADA59B`(7.73), accent `#F2726B`(6.62), warn `#E8C05C`(10.85), rule `#2E2825`, accent-ink `#0B0B0B`(6.93)
- Type: 900-weight sans headings with negative tracking; regular body; monospace tier labels
- Fits: verdict / pros-cons (renamed exposed/mitigated) / timeline (incident clock) / table / checklist
- Motion: 300ms fade + tier cards sequenced 100ms apart; **no shake, no flash, no alarm animation** — they spend the seriousness you need
- Risk: red meaning both "emphasis" and "danger" gives two contradictory signals — here red is risk only, plain emphasis goes to ink weight; colour-blind viewers need the text tier; `prefers-reduced-motion` kills the sequencing
