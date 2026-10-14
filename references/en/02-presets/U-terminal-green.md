> This file is preset **U** in Step 2's style library. Pairing advice, template disciplines and the style decision block live in `../02-style.md`; the other 21 presets sit alongside it.

## U. Terminal Green (geek / terminal / developer talk)
- Look: near-black terminal ground with phosphor-green mono type, like a terminal that is running. Suits developer talks, CTF/security, command-line demos, technical reviews with attitude. Distilled from `zarazhangrui/frontend-slides`'s Terminal Green (MIT, © Zara Zhang).
- Difference from **L Dark terminal**: L is a **layout template** (layer it on any temperament; `$ prompt` headings + scanlines), U is a **full temperament** (fixed phosphor green, near-black ground, all-mono); do not stack the two.
- Light (rarely used, kept for completeness): bg `#F2F4F0`, panel `#FFFFFF`, ink `#12211A`, accent `#0B6B3A` (usable as body, 5.6:1)
- Dark (default): bg `#070B09`, panel `#0E1512`, elevated `#131C18`, ink `#B7F5C8`, muted `#5F8C6E`, rule `rgba(183,245,200,.16)`, accent `#39FF14` (≈15:1 on the ground but **too loud** — reserve it for the cursor, prompt glyphs and key numbers; body uses ink)
- Type: everything `"JetBrains Mono",ui-monospace,SFMono-Regular,"PingFang SC","Microsoft YaHei",monospace` — **headings and body both mono**; Chinese falls back to PingFang with letter-spacing for a grid feel
- Shape: square, 0 radius; left-aligned, a `$`/`>` prompt at the line start; ASCII rules (`──`) instead of borders; no shadows, no gradients
- Motion: typewriter reveal (via `steps()` or a JS per-character append, 30–45ms/char, on headings and `key` only); elements appear in sequence; a block cursor blinking `1s step-end`; reduced-motion jumps straight to the final value
- Helper skill: `frontend-design` (mono type, terminal feel)
- Risk: large areas of phosphor green glare and shift on projectors — keep it a **highlight colour** under ~10% of the area; Chinese mono reads poorly, so long body copy may fall back to sans while code and labels stay mono.
