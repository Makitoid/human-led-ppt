> One of the 17 entries in step 2's style library. Pairing advice, template disciplines and the style decision block live in `../02-style.md`.

## I. Playful (bright / interactive / icebreakers and clubs)
- Look: candy blocks + very large radii + hand-drawn outlines + geometric "faces" (inline SVG circles, arrows, stars — not emoji glyphs). Good for icebreakers, events, light internal sessions.
- Light: bg `#FFFCF5`, panel `#FFFFFF`, ink `#232323`; body-safe `accent #C24A2E` / `accent2 #007A70` / `accent4 #5A4BD1`; candy originals `#FF7A5C` / `#00B8A9` / `#FFC93C` / `#7B6CF6` for large type and blocks; rule `#EFE6D8`
- Dark: bg `#1A1725`, panel `#241F33`, ink `#FFF6EA`, accent `#FF8E70`, accent2 `#2FD8C4`, accent3 `#FFD75E`, accent4 `#9C8CFF`, rule `#38304D`
- Type: headings `"Smiley Sans","思源黑体 Bold","PingFang SC",sans-serif` 700–900; body regular; numerals may reach 140px as the hero
- Shape: radius 20–28px; hard shadow or coloured offset border (`box-shadow: 6px 6px 0 <accent>`); pill chips
- Motion / transition: directional `slide-left/slide-right` (350 ms, `cubic-bezier(.22,.61,.36,1)`) is acceptable here; `popIn` with ±2° tilt and overshoot; press states sink 4px. **Note**: on a fixed 1280×720 canvas, do directional transitions with `opacity + transform` only — never `display`, or the overview thumbnails go blank.
- Helper skill: `frontend-design`; `web-animation-design` for spring/press feedback.
- Caveats: multi-colour is the easiest thing to lose control of — cap at "1 primary + 2 secondary + neutrals" and ≤ 3 hues per page.


> Each template gives a **page skeleton + two signature devices + a starting palette** — none of these are official tokens. Every palette below was measured with the ratio script in `06-verify.md` (body text ≥ 4.5:1, figure in parentheses); `accent-ink` is the colour of text sitting *on* an accent fill, with its own measured ratio. **Re-run the script after changing any value.**
> How to use: after picking a template, write only its two signature devices into this deck's `<style>`; everything else follows the temperament preset. At most 2 signature devices per page — more is ornament.
