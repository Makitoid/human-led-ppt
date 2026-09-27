> One of the 17 entries in step 2's style library. Pairing advice, template disciplines and the style decision block live in `../02-style.md`.

## M. Developer purple gradient (GitHub Blog / changelog register)
- Look: GitHub blue-black, purple-blue ambient bloom, 60px masked grid, centred composition, tri-stop gradient headings.
- Signatures: ① tri-stop gradient headline `#a855f7→#60a5fa→#34d399` (covers and dividers only) ② blockquote/point block with a purple left rule
- Default partner: C OpenAI's number discipline (≤ 4 numbers per page)
- Dark (primary): bg `#0D1117`, panel `#161B22`, ink `#E6EDF3`(16.02), muted `#A6B3BF`(8.85), accent `#A371F7`(5.64), warn `#E3B341`(9.72), rule `#262D36`, accent-ink `#0B0B0B`(5.87)
- Light (for non-technical audiences): bg `#F7F8FA`, panel `#FFFFFF`, ink `#111820`(16.81), muted `#4C5866`(6.83), accent `#6639BA`(6.91), warn `#7A5300`(6.45), rule `#E2E6EB`, accent-ink `#FFFFFF`(7.34)
- Type: `"Inter","PingFang SC",sans-serif` body + mono code; the centred layout is carried by whitespace, not frames
- Fits: cover / toc / section-divider / config step pages / Q&A
- Motion: cross-fade 400ms + the ambient bloom drifting ≤ 3%; gradient text may shift `background-position`, never shine-sweep
- Risk: `--accent` is purple, so anything drawn on it must take accent-ink (near-black 5.87 vs white 3.35); delete the ambient bloom entirely on the light variant
