# B. Material Design 3 (Google / friendly / structured)

> Shared constraints and the style decision block: [02-style.md](../02-style.md). Load only the selected preset.

- Look: tonal surfaces + explicit role colours, component-like; good for process, method, teaching.
- Light: primary `#6750A4`, on-primary `#FFFFFF`, surface `#FFFBFE`, surface-variant `#E7E0EC`, on-surface `#1C1B1F`, muted `#49454F`, warn `#B3261E`, rule `#CAC4D0`
- Dark: primary `#D0BCFF`, on-primary `#381E72`, surface `#141218`, surface-container-highest `#36343B`, on-surface `#E6E1E5`, muted `#CAC4D0`, warn `#F2B8B5`, rule `#49454F`
- Type: `Roboto,"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif`; heading weight 500, body 400
- Shape: card radius 12–16px, fully rounded buttons; hierarchy through surface tint, not shadow stacking
- Motion / transition: emphasized easing `cubic-bezier(.2,0,0,1)`; 40–60 ms stagger inside a page; container transform (thumbnail → full slide) works well as an act divider; slide transition = fade + 24px vertical.
- Helper skill: `material-3` — take authoritative tokens from it, do not rely on the approximation above.
