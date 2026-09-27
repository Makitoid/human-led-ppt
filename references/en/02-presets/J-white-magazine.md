> One of the 17 entries in step 2's style library. Pairing advice, template disciplines and the style decision block live in `../02-style.md`.

## J. White-page magazine (editorial · display headings · long-form narrative)
- Look: pure white, a 4–6px multicolour bar across the top, 80–110px headings, black-on-white "focus pills". Reads like a magazine you can flip.
- Signatures: ① top colour bar (the only place gradient text is allowed) ② focus pill — a filled chip with 2–6 words, one per page
- Default partner: the temperament of D Claude or C OpenAI; this family supplies structure, not colour mood
- Light: bg `#FFFFFF`, panel `#FAF9F7`, ink `#15140F`(18.44), muted `#5E5A52`(6.86), accent `#8B3A62`(7.29), warn `#8A5A00`(5.93), rule `#E7E4DD`, accent-ink `#FFFFFF`(7.29)
- Dark: bg `#17141A`, panel `#221E27`, ink `#F4F0EA`(16.07), muted `#B3ACA2`(8.11), accent `#E79CC0`(8.61), warn `#E3B872`(9.87), rule `#332D3A`, accent-ink `#0B0B0B`(9.29)
- Type: headings `"Source Han Serif SC","Noto Serif SC",Georgia,serif` 700+; body sans; kicker in small tracked monospace
- Fits: cover / section-divider / bullets (as 3–5 equal soft cards) / stat-highlight / closing
- Motion: cross-fade 380–450ms; no mask reveal on headings; the focus pill may land 120ms late on `opacity` alone
- Risk: gradient text on more than ~10 large characters is a fail, and on body text it is disqualifying; in dark mode the top bar needs re-saturation or it reads as grey sludge
