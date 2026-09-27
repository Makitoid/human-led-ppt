> One of the 17 entries in step 2's style library. Pairing advice, template disciplines and the style decision block live in `../02-style.md`.

## O. One colour per slide (keynote minimal · one idea a page)
- Look: the whole canvas is a single hue, rotating per slide (6–8 hues of similar lightness), a 160px-class heading and a 4px accent stub, everything else air.
- Signatures: ① full-bleed background colour, changed per slide ② a `← →` key hint bottom-left (paging already works; it is a cue for the audience)
- Default partner: any preset's type stack — this family needs almost no second device
- Paper: bg `#FFFFFF`, panel `#F7F6F3`, ink `#101010`(19.03), muted `#4A4A48`(8.88), accent `#1B1B1B`(17.22), warn `#8A5A00`(5.93), rule `#E4E2DD`, accent-ink `#FFFFFF`(17.22)
- Dark: bg `#101418`, panel `#191E24`, ink `#F2F4F5`(16.77), muted `#A2ABB3`(7.94), accent `#F2F4F5`(16.77), warn `#E8C05C`(10.68), rule `#252C33`, accent-ink `#0B0B0B`(17.84)
- **The `--accent-ink` worked example**: on paper, accent is near-black `#1B1B1B`. White text on it measures 17.22:1; black text measures **1.14:1** — literally invisible, while the layout still looks fine on screen. Text on an accent fill always takes `--accent-ink`, never a literal `#fff`/`#000`
- Type: one face for headings, one for body, weight gap ≥ 300; a numeral may own half the canvas
- Fits: cover / big-quote / stat-highlight / section-divider / closing — it cannot carry dense data pages
- Motion: cross-fade only (250–320ms). **Recolour by fading, never by sliding**, or every page turn reads as a flashbulb
- Risk: retire this template the moment a page needs a table; plan the colour order up front — complementary hues on adjacent slides leave a afterimage
