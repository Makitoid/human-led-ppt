> One of the 17 entries in step 2's style library. Pairing advice, template disciplines and the style decision block live in `../02-style.md`.

## E. Liquid Glass (Apple 2025 / translucent / showcase)
- Look: refracting translucent layers, specular edges, content flowing underneath; keynote energy. **Projector risk is real** — low contrast and thin type turn to mush.
- Light: base colour field `#EDEFF3 → #F7F4F0` (low-contrast gradient, purely to refract), glass layer `rgba(255,255,255,.14)`, ink `#1D1D1F`, accent `#0B62B8` (body-safe, 5.28:1; system blue `#0A84FF` is 3.17:1, large type only), inner highlight `inset 0 1px 0 rgba(255,255,255,.45)`
- Dark: base field `#0B0D12 → #141A24`, glass layer `rgba(255,255,255,.08)`, ink `#F2F5FA`, muted `#9BA6B5`, accent `#64D2FF`, highlight `inset 0 1px 0 rgba(255,255,255,.22)`, border `rgba(255,255,255,.16)`
- Type: `"SF Pro Display","PingFang SC","Microsoft YaHei",system-ui,sans-serif`, heading tracking `-0.02em`
- Shape: radius 24–32px; `backdrop-filter: blur(24px) saturate(180%)`
- Motion / transition: refractive entry — new page fades in from 12px below while the base field parallaxes 2–3%; glass may tighten blur 40px → 24px on entry (covers and act dividers only). Performance-sensitive: never more than three live `backdrop-filter` layers.
- Helper skill: `majiayu000-axiom-liquid-glass` for the design principles and artifact/perf review; re-derive CSS yourself (it targets Swift).
- Hard rule: measured body contrast on glass ≥ 4.5:1 (script in `06-verify.md`); raise opacity if it fails. In dark mode also darken the overview wall, or the thumbnail grid glows white.
