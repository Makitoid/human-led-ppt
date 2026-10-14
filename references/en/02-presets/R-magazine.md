> This file is preset **R** in Step 2's style library. Pairing advice, template disciplines and the style decision block live in `../02-style.md`; the other 21 presets sit alongside it.

## R. Electronic magazine (narrative / humanist / editorial)
- Look: like Monocle magazine with code grafted on — serif display + sans body + mono metadata in three tiers, large hero pages, image-led, generous whitespace and breathing room. Suits intimate talks, opinion pieces, story-driven talks, and AI / creative / design subjects.
- **Five e-ink palettes; pick exactly one, no custom hex** ("protecting the aesthetics matters more than giving freedom"):
  | Theme | Dark ground | Light ground | Suits |
  |---|---|---|---|
  | Ink Classic | `#0A0A0B` | `#F1EFEA` | general default, commercial launches, safest |
  | Indigo Porcelain | `#0A1F3D` | `#F1F3F5` | tech, research, AI, technical launches |
  | Forest Ink | `#1A2E1F` | `#F5F1E8` | nature, sustainability, non-fiction |
  | Kraft Paper | `#2A1E13` | `#EEDFC7` | nostalgic, humanist, reading, literature |
  | Dune | `#1F1A14` | `#F0E6D2` | art, design, creative, fashion |
- Light: bg = the light column above, panel `#FFFFFF`, ink a darkened version of the matching dark ground (Ink Classic uses `#141412`), muted `#6F6A60`, rule `rgba(20,20,18,.14)`; **accent is just ink** (black/deep-ink as the emphasis colour, so contrast is free), colour emphasis only on cover blocks
- Dark: bg = the dark column above, panel one step up in the same hue (e.g. `#151517`), ink `#F1EFEA`, muted `#B4ADA0`, rule `rgba(241,239,234,.18)`
- Type: display `"Noto Serif SC","Songti SC",Georgia,serif` (pair with Playfair Display for Latin display); body `"PingFang SC","Microsoft YaHei",system-ui,sans-serif`; metadata/headers/footers `"JetBrains Mono",ui-monospace,SFMono-Regular`, 12–13px, uppercase, letterspaced
- Shape: mostly square, radius ≤ 4px; **no shadows, no gradient fills**; 1px hairlines and type hierarchy do the dividing; images full-bleed or half-bleed with a mono caption line beneath
- Motion: slow — cross-fade 450ms, in-page elements stagger in at 0.12s, a hero page may let a WebGL fluid ground drift (optional; if you do it, write one canvas — do not pull in a library); `prefers-reduced-motion` disables all
- Helper skill: `frontend-design` (serif/sans pairing, editorial grid)
- Source: distilled from `op7418/guizang-ppt-skill`'s electronic-magazine × e-ink system (5 themes + 10 layouts). **Design language only — the code is rewritten to this skill's constraints.** Risk: serif Chinese goes soft at small sizes, so body stays sans and serifs stay on display; the Kraft and Dune light grounds run yellow and dim on projectors — measure before committing.
