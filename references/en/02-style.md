# Step 2 · Visual direction

Goal: lock a set of executable design decisions and write them into skeleton §1 fields `typography` / `theme` / `motion` / `constraints`. **Discuss first, write second — this step produces no HTML.**

## Ask three things

1. Temperament: 2–3 adjectives or one reference image ("like The Economist", "like an Apple keynote", "like class notes").
2. Brand colour: corporate palette, departmental VI, or "you pick". If a brand guideline exists, ask for it — never guess.
3. Deal-breakers: what they explicitly do not want (gradients, glass, cartoon, emoji, colour charts, serifs…).

Do not ask about light/dark separately — every preset below ships both palettes. Pick one per deck and write it into the skeleton (**never mix within one deck**). Projected classrooms favour light; dark rooms, keynotes and code/data-dense decks favour dark. If the user says "you decide", pick the preset closest to the subject, justify it in one line, and leave room to change later.

## Helper skills per style

Two kinds of helper:

- **General-purpose design skills (call directly if present)** — `frontend-design` (distinctive visual direction, typography, avoiding templated defaults), `material-3` (Google Material Design 3 / Material You tokens, components, adaptive layout, expressive theming).
- **Marketplace candidates (found in one skill registry; not installed here)** — name them exactly as listed, and let the user install and confirm first: third-party skills execute code and change files. Availability changes, so re-verify with whatever skill search the platform offers (a marketplace/extension search tool, or the skill's own listing) before recommending. The entries below are a snapshot from 2026-09-25; none were installed and none were read.

| Preset | Primary helper | Also useful |
|---|---|---|
| A Fluent Design 2 | `fluent-design` (bingfoon) — Windows 11 language, Mica/Acrylic materials, WinUI 3 control specs, type hierarchy, layout patterns, dark mode, accessibility, Electron adaptation | `frontend-design` |
| B Material Design 3 | `material-3` | `web-animation-design` for expressive motion |
| C OpenAI | `frontend-design` | `agrimsingh-bringhurst-typography` (Bringhurst typographic rules applied to slides) |
| D Claude | `frontend-design` | `ds-ref-typography`-class type pairing, or `majiayu000-brand-typography-systems` (modular scale, serif/sans decision framework, WCAG type rules) |
| E Liquid Glass | `majiayu000-axiom-liquid-glass` — WWDC 2025 liquid-glass design principles, API patterns, visual-artifact debugging, performance and review checklists (Swift-first; treat it as the *design* authority and re-derive the CSS yourself) | `frontend-design` |
| F Notion | `frontend-design` | `vercel-labs-web-design-guidelines` (UI review pass) |
| G Anime / manga | `frontend-design` (no dedicated web style skill found) | `animation-shader` only if you are doing cel-shaded *illustration*, not UI |
| H Academic / paper | `agrimsingh-bringhurst-typography` | `entur-accessibility` (WCAG 2.1), `astoreyai-latex-check` only if a real LaTeX/Beamer deliverable is also required |
| I Playful | `frontend-design` | `web-animation-design` for spring/overshoot timing |
| Any — motion detail | `web-animation-design` — easing, duration, springs, stagger, page transitions, microinteractions, `prefers-reduced-motion`, animation performance | — |
| Any — before delivery | `vercel-labs-web-design-guidelines` (UI/UX/a11y review), `entur-accessibility` (WCAG 2.1 contrast and semantics) | `cognitive-design` (Gestalt grouping, pre-attentive processing, cognitive load) for data-heavy decks |

Adjacent skills that *overlap* with this skill and may compete for the same request: `frontendslides` (zero-dependency animated HTML decks), `ppt-visual-designer` (Block-style PPT visual strategy), `doc2slides`, `image-to-editable-ppt-slide`. Do not chain them silently — mention them if the user asks for alternatives.

## Style presets

Presets come in two families. **A–I are temperament presets** (they decide palette, type and motion character). **J–Q are layout templates** (they decide a slide's information structure, its emphasis devices and the signature elements that make it recognisable at a glance). The mature move is **one deck = 1 temperament + 1 layout template**: temperament supplies the tokens, the template supplies the skeleton. Picking only one is fine; picking both signatures onto the same page is noise.

> These are **usable starting values**, not official design tokens. Only Material 3 and Liquid Glass have a skill carrying an authoritative spec; the rest are reasonable approximations of a brand's look. Re-check the choice with `frontend-design` before finalising, or ask the user for their brand guideline. Always retune the colours to the actual subject — do not paste them onto an unrelated topic.
>
> **Contrast was measured** (body ≥ 4.5:1, large numerals/headings ≥ 3:1, using the ratio script in `06-verify.md`). Re-measure after any colour change: brand colours used directly as body text usually fail (OpenAI `#10A37F`, Fluent `#0078D4`, Notion's grey chips land at 2–3:1), so each preset lists a darkened "body-safe" variant and confines the original to large type or filled blocks.
**Index**: choose here first, then **open that one file only** for the full light + dark palettes, signature elements, type stack, motion and risks. Do not read the other 16.

| ID | Name and character | Suits | File |
|---|---|---|---|
| A | Fluent Design 2 · layered depth + acrylic backplates + hairline cards, strong order | policy, data, formal reporting | `02-presets/A-fluent.md` |
| B | Material Design 3 · tonal surfaces + explicit role colours, component-like | process, method, teaching | `02-presets/B-material-3.md` |
| C | OpenAI · paper-neutral ground + hairlines + generous whitespace | technical surveys, serious topics | `02-presets/C-openai.md` |
| D | Claude · cream ground + terracotta accent + serif headings, publishery | humanities, education, opinion, interview narrative | `02-presets/D-claude.md` |
| E | Liquid Glass · refracting layers + specular edges, keynote energy | showcase decks (**real projector risk**: low contrast and thin type turn to mush) | `02-presets/E-liquid-glass.md` |
| F | Notion · white ground + warm-grey text + faint dividers + coloured chips | bullet-dense, checklist, retrospective | `02-presets/F-notion.md` |
| G | Anime / manga · saturated accents + thick-outlined cards + screentone and speed lines | science popularisation, clubs, student audiences (**never use copyrighted characters**) | `02-presets/G-anime.md` |
| H | Academic / paper · paper ground + serif headings + strict chart conventions | thesis defence, lab meetings, technical review | `02-presets/H-academic.md` |
| I | Playful · candy blocks + very large radii + inline-SVG geometric faces | icebreakers, events, young or informal internal audiences | `02-presets/I-playful.md` |

## Layout template library (J–Q)

**Orthogonal** to the presets: pick the temperament (A–I) first, then decide whether to layer a template. Again, read only the one you choose.

| ID | Name and character | Pairs with | One hard limit | File |
|---|---|---|---|---|
| J | White-page magazine · multicolour top bar + display headings + focus pills | D or C | gradient text only on ≤10 large characters; on body text it is disqualifying | `02-presets/J-white-magazine.md` |
| K | Cream blueprint · cream paper + blueprint grid + 2px hard borders | H or A | ≤4 cards per page or it turns into graph paper | `02-presets/K-cream-blueprint.md` |
| L | Dark terminal · near-black blue + scanlines + `$ prompt` headings | C or M | two of grid/scanlines/glow per page at most; mono Chinese never at body size | `02-presets/L-dark-terminal.md` |
| M | Developer purple gradient · GitHub dark + ambient bloom + tri-stop gradient headings | C | `--accent` is purple, so text on it must take accent-ink | `02-presets/M-purple-gradient.md` |
| N | Red-amber alert · hazard stripes + struck-through headings + tier cards | F or A | red means risk level only; plain emphasis goes to ink weight | `02-presets/N-red-amber.md` |
| O | One colour per slide · whole canvas in a single hue + 160px-class heading | any preset's type stack | retire the moment a page needs a table; never complementary hues on adjacent slides | `02-presets/O-one-colour.md` |
| P | VC roadshow · oversized KPIs + one traction curve | A or C | every KPI must resolve to a row in the source file | `02-presets/P-vc-roadshow.md` |
| Q | Macaron cards · three blurred blobs + italic serif display + rounded cards | I (one notch calmer) | tightest set in the table (accent 4.81 / warn 4.60) — re-measure after any tweak | `02-presets/Q-macaron.md` |
## Five template disciplines (distilled from a mature template system; they hold for every preset)

1. **Colour lives only in `:root`.** Outside gradient endpoints, no literal hex should appear in slide CSS: `color:var(--ink)`, `background:var(--panel)`, `border:1px solid var(--rule)`. One hard-coded value is one place a theme or mode switch will miss (that is exactly known trap 8 in `05-build.md`).
2. **Text on an accent fill takes `--accent-ink`, never `#fff`/`#000`.** Accents span near-white to near-black across themes, so one literal ranges from 17:1 to 1:1 (see O's measurement). Every template above lists its own accent-ink per mode, measured.
3. **One theme = one look; one deck = one mode.** A deck must not put a purple-gradient cover next to cream-blueprint body pages. The temperament preset supplies tokens, the layout template supplies the skeleton, ≤ 2 signature devices per page.
4. **Compose existing page types; do not invent new ones.** Keep the reusable `type` vocabulary at 6–8 and repeat them. Before designing a 9th layout, ask whether the page simply has too much content. Redrawing the layout every page makes the overview wall unreadable and the build error-prone.
5. **Every image gets a frame.** The frame owns `aspect-ratio` and the crop (`object-fit:cover`); the `<img>` only fills it — that is what lets any photo swap in without breaking the page. Screenshots, charts and logos always use `object-fit:contain` (cropping them deletes information); a full-bleed photo gets a bottom scrim (`linear-gradient(180deg,transparent 42%,rgba(8,10,20,.72))`) so white text stays readable; a 12–14px caption goes under the frame. **A bare `<img>` never reaches a slide.**

## Custom route

When the user wants to design their own, walk the same field list as the presets (look / light palette / dark palette / type / shape / rules / motion / risks) and drive the decisions with `frontend-design` (palette relationships, type pairing, avoiding the templated look). Pull `material-3` when a component spec is genuinely needed. Given a reference screenshot, measure its actual hex values and type scale before deciding — never work from impression. **The five template disciplines apply in full**: every colour in `:root`, an measured `--accent-ink`, one mode only, ≤ 8 reused page types, images always framed.

## Deck-level hard requirements, whatever is chosen

- Readable from the back row: body ≥ 22px (24px preferred), hero numerals 72–120px, `font-variant-numeric: tabular-nums`
- Body contrast ≥ 4.5:1; footnote-grade text may be 9–11px but must still be legible
- One visual focus per slide; at most 4 numbers per slide
- Charts as inline SVG / pure CSS; no charting library
- **One light-or-dark theme only**: when overridden, also set `--ovl-bg / --ovl-ink / --ovl-card` (overview wall) and `--bg/--ink/--accent` in `deck-shell.css`; a dark deck must purge every hard-coded colour (chart fills, badges, borders, overview wall) or pale patches will survive
- **Declare `--accent-ink` in `:root`** (the text colour used on accent fills, badges and pills) and measure it ≥ 4.5:1 with the script in `06-verify.md`; slide CSS may only use `var(...)` — no literal hex outside gradient endpoints
- **≤ 2 signature devices per page** (the two named by the chosen template), **≤ 8 reused page types**, and no bare `<img>` — everything framed per template discipline 5
- Do not use pure `#000` + pure white (halation on projectors); use a hue-tinted near-black and drop body text one step in lightness
- All motion plays automatically on slide change, never on click; `prefers-reduced-motion: reduce` disables everything (already in the shell)
- Write an explicit `constraints` list (e.g. no gradient fills, no glassmorphism, no stacked shadows, no emoji ornament, no image carousels) unless the user asks for them

## Output: style decision block

```
Style: <temperament preset A–I or custom name> + <layout template J–Q, or "none">, reason: <one line>
Mode: light | dark
theme: {bg, panel, ink, muted, accent, accent-ink, warn, rule}   ← copied verbatim into skeleton §1
Type: headings <stack>; body <stack>; numerals <stack>
Shape: radius <n>px; shadow <none | spec>; separation <1px rule | whitespace>
Signature devices: <the ≤ 2 named by the template, e.g. "top colour bar + focus pill">
Ornament: <what is allowed>  constraints: <list>
motion: transition <cross-fade | hard cut + white flash | directional slide | refractive fade>
        (<duration>ms, <easing>); in-page <stagger interval | growth animation | counting numerals>;
        reduced-motion disables all
Page-type list: <the 6–8 `type` values skeleton §4 will actually use>
Helper skill: <frontend-design | material-3 | fluent-design | axiom-liquid-glass | bringhurst-typography | …>
Risk: <e.g. Liquid Glass projector contrast / anime outlines going dirty / Q's accent sitting 0.3 above the AA line>
```

Wait for the user's nod, then go to Step 3 (research) or straight to Step 4 (skeleton).
