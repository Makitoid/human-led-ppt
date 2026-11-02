# Step 2 · Visual direction

Goal: lock a set of executable design decisions and write them into skeleton §1 fields `typography` / `theme` / `motion` / `constraints`. **Discuss first, write second — this step produces no finished artifact (HTML or PPTX).**

## Ask three things

1. Temperament: 2–3 adjectives or one reference image ("like The Economist", "like an Apple keynote", "like class notes").
2. Brand colour: corporate palette, departmental VI, or "you pick". If a brand guideline exists, ask for it — never guess.
3. Deal-breakers: what they explicitly do not want (gradients, glass, cartoon, emoji, colour charts, serifs…).

**Background** is not part of these three questions: the ground is flat colour by default, and the `background` keyword (see `04-skeleton.md` / `05-build.md`) only comes up when the user asks for a full-bleed photo or a generated backdrop. Do not add a backdrop to every page — it inflates the deck, and the more backdrops the harder body contrast is to hold.

Do not ask about light/dark separately — every preset has light/dark palettes; pick one per deck and write it into the skeleton (**never mix within one deck**): projected classrooms favour light, dark rooms / keynotes / code-and-data-dense favour dark. If the user says "you decide", pick the one closest to the subject, justify it in one line, and leave room to swap.

## Optional helper skills

- Use installed, relevant helpers: `frontend-design` for visual decisions and `material-3` for component guidance. Selecting a preset does not require installing tools.
- Third-party skill names are historical suggestions, not dependencies. Verify availability and instructions before use; obtain consent before installation. Mention overlapping presentation skills only when alternatives are requested.

## Style presets

A–I set temperament through palette, type and motion; J–Q provide compatible layouts; R–V are complete styles used alone. Choose one temperament, optionally one J–Q layout, without stacking complete styles. Palettes are starting points, not official tokens; remeasure contrast after colour changes. Open only the chosen preset.

| ID | Name and character | Suits | File |
|---|---|---|---|
| A | Fluent Design 2 · layered depth + acrylic backplates + hairline cards, strong order | policy, data, formal reporting | `02-presets/A-fluent.md` |
| B | Material Design 3 · tonal surfaces + explicit role colours, component-like | process, method, teaching | `02-presets/B-material-3.md` |
| C | Paper-neutral · paper ground + hairlines + generous whitespace | technical surveys, serious topics | `02-presets/C-openai.md` |
| D | Editorial · cream ground + terracotta accent + serif headings, publishery | humanities, education, opinion, interview narrative | `02-presets/D-claude.md` |
| E | Liquid Glass · refracting layers + specular edges, keynote energy | showcase decks (**real projector risk**: low contrast and thin type turn to mush) | `02-presets/E-liquid-glass.md` |
| F | Doc-list · white ground + warm-grey text + faint dividers + coloured chips | bullet-dense, checklist, retrospective | `02-presets/F-notion.md` |
| G | Manga · saturated accents + thick-outlined cards + screentone and speed lines | science popularisation, clubs, student audiences (**never use copyrighted characters**) | `02-presets/G-anime.md` |
| H | Academic · paper ground + serif headings + strict chart conventions | thesis defence, lab meetings, technical review | `02-presets/H-academic.md` |
| I | Playful · candy blocks + very large radii + inline-SVG geometric faces | icebreakers, events, young or informal internal audiences | `02-presets/I-playful.md` |


## Template library (J–V)

J–Q are **layout templates** (a slide's information structure, emphasis devices and signatures); R–V are five **complete systems** that arrive with their own palette, type and signatures — use one as the **temperament** (choosing it settles the look), and they also work as layout-language references. Sources: R distils `op7418/guizang-ppt-skill`'s electronic-magazine system; S–V distil `zarazhangrui/frontend-slides` (MIT, © Zara Zhang) — design language only, the code is rewritten to this skill's constraints.

**Orthogonal** to the presets: pick the temperament (A–I) first, then decide whether to layer a J–Q template. Again, read only the one you choose.

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
| R | Electronic magazine · serif display + sans body + mono metadata, five e-ink palettes | use as the temperament | no custom hex — pick one of the five ink palettes | `02-presets/R-magazine.md` |
| S | Bold Signal · charcoal ground + bright-orange focus card + oversized section numbers | use as the temperament | orange only ever on the focus card, never as body colour | `02-presets/S-bold-signal.md` |
| T | Creative Voltage · electric blue + neon yellow + halftone texture | use as the temperament | neon yellow goes on dark grounds only — glaring on light | `02-presets/T-creative-voltage.md` |
| U | Terminal Green · near-black terminal ground + phosphor-green mono | use as the temperament | phosphor green is the only accent — do not add a second colour | `02-presets/U-terminal-green.md` |
| V | Notebook Tabs · cream paper + binder holes + coloured right-edge tabs | use as the temperament | ≤ 4 tab colours or it becomes a sticky-note wall | `02-presets/V-notebook-tabs.md` |

(S–V are the four chosen from `frontend-slides`'s twelve; its Swiss Modern and Paper & Ink are left out — the first overlaps A/H's grid character and the second overlaps C's paper character, so one look does not get two treatments.)

## Visual hierarchy: decide rank before style

Style decides what a page looks like; hierarchy decides what the eye hits first. A page that reads as messy is usually not short of colour — four or five elements are competing for the same glance. The rules below hold for any preset and any custom style; presets that ship larger type (O's 160px-class headings, R's magazine display) scale the whole ladder up and keep the tier count and the ratios unchanged.

### 1. Four tiers per slide

| Tier | Count | What it is | Size (1280×720, scaled with the preset) | Colour |
|---|---|---|---|---|
| primary | **exactly 1** | `key` / one `kpi` group / `pull` — pick one | 48–60px; KPI 72–120px | ink, or the single accent fill |
| title | 1 | `h2`, what this page is called | 34px | ink |
| support | 2–4 | arguments, charts, steps, cards | 22–24px | ink / panel |
| detail | unlimited | kicker, caption, unit, source | 12–15px | muted (still ≥ 4.5:1) |

- **Only one primary.** Two large paragraphs, two cards carrying an accent, a title as heavy as the conclusion — all of that is primaries fighting, and it is a re-layout, not "a bit more colour tuning". Pages with no `key` (cover / divider / references / thanks) are the exception: the page's single title or content block is the primary.
- **Same tier, same weight.** Elements in one tier share size, weight, padding and colour; no card gets to be "slightly different". To distinguish one, promote **one** of them to primary and drop the rest to support.
- **Hierarchy by size and space; colour only locates.** Turn the deck grayscale for a moment: the primary must still be the first thing found. If removing colour removes the hierarchy, the hierarchy hangs on colour alone — go back to size, weight and position.
- **Adjacent tiers keep a size ratio ≥ 1.4.** Default ladder `48 : 34 : 24 : 14` (primary : title : body : note); a `24 : 22 : 20` ladder is no hierarchy at all. Presets with larger type scale the whole ladder and keep these ratios.
- **Whitespace is hierarchy too.** Page margin ≥ 56px, header → body ≥ 28px, group gap ≥ 24px, inner gap ≥ 12px; never fill the gaps with rules, tints or ornaments.

### 2. Accent budget

- **At most one accent-filled block per slide** (a colour block, a badge, a pill, a whole card's ground — each counts as one); accent is the finger that says "look here", not a page ground.
- **At most one warn mark per slide** (a risk paragraph, a badge or a hazard stripe counts as one); warn means risk / absence, never "important".
- **No second accent colour on the page.** To separate two groups, use grouping, whitespace and size first; colour is the last step.
- **`emphasis` must land on the primary.** An accent on a 12px caption is no emphasis; two colours of equal strength on one page is no focus.

### 3. Contrast is the floor of hierarchy

- **All information-bearing text ≥ 4.5:1**, including body, quotes, captions and the source bar; large text (≥ 24px, or ≥ 18.66px bold) ≥ 3:1.
- **`--muted` is measured against both `--bg` and `--panel` ≥ 4.5:1.** If it misses, darken muted or recede with size / weight; **never fade text with `opacity`** — transparency discounts contrast you already measured.
- **Translucent text is measured as the composite colour** (`rgba(…,.6)` and `opacity:.6` both count); unmeasured means unshipped.
- **Accent as text ≥ 4.5:1; accent as a fill takes `--accent-ink` ≥ 4.5:1.** Brand primaries (OpenAI green, Fluent blue, Notion grey) usually sit at 2–3:1 — large type or graphics only.
- **Text on a full-bleed background is measured at the brightest point after the scrim.** If it fails, strengthen the scrim; never lighten body text to accommodate the backdrop.

## Six template disciplines

0. **One backdrop per page, and it never ships without a scrim.** A full-bleed backdrop (third-party photo or generated image) goes through the `background` keyword and `data-bg` layer, with a readable gradient scrim on top; a backdrop is **never** dropped into the text flow as an `<img>` (that is what `image` is for). If contrast will not hold, dim the backdrop — do not lighten body text. See the background-layer rules in `05-build.md`.

1. **Colour lives only in `:root`.** Outside gradient endpoints, no literal hex should appear in slide CSS: `color:var(--ink)`, `background:var(--panel)`, `border:1px solid var(--rule)`. One hard-coded value is one place a theme or mode switch will miss (that is exactly known trap 8 in `05-build.md`).
2. **Text on an accent fill takes `--accent-ink`, never `#fff`/`#000`.** Accents span near-white to near-black across themes, so one literal ranges from 17:1 to 1:1 (see O's measurement). Every template above lists its own accent-ink per mode, measured.
3. **One theme = one look; one deck = one mode.** A deck must not put a purple-gradient cover next to cream-blueprint body pages. The temperament preset supplies tokens, the layout template supplies the skeleton, ≤ 2 signature devices per page.
4. **Compose existing page types; do not invent new ones.** Keep the reusable `type` vocabulary at 6–8 and repeat them. Before designing a 9th layout, ask whether the page simply has too much content. Redrawing the layout every page makes the overview wall unreadable and the build error-prone.
5. **Every image gets a frame.** The frame owns `aspect-ratio` and the crop (`object-fit:cover`); the `<img>` only fills it — that is what lets any photo swap in without breaking the page. Screenshots, charts and logos always use `object-fit:contain` (cropping them deletes information); a full-bleed photo gets a bottom scrim (`linear-gradient(180deg,transparent 42%,rgba(8,10,20,.72))`) so white text stays readable; a 12–14px caption goes under the frame. **A bare `<img>` never reaches a slide.**
6. **One primary per slide.** At most four peer cards, and only one of them may carry accent or step up; the rest share one style. Three or more equal peers → use `table` / `compare` or split the page. Decoration ≤ 15% of the page and never inside the primary's 1/3 hot zone.

## Custom route

When the user designs their own, walk the same field list as the presets (look / light palette / dark palette / type / shape / rules / motion / risks) and drive the decisions with `frontend-design` (palette relationships, type pairing, avoiding the templated look). Pull `material-3` as needed for component specs. Given a reference screenshot, measure its hex values and type scale before deciding — never work from impression. **The "six template disciplines" (including the background rule 0 and one primary per slide) hold for custom too**: every colour in `:root`, a measured `--accent-ink`, one mode only, ≤ 8 reused page types, images always framed, backdrops always scrimmed, one primary per slide.

## Shared constraints

- Body ≥22px; key figures 72–120px with `tabular-nums`; at most four figures per slide. Follow the hierarchy, emphasis and contrast rules above.
- Override both deck and overview tokens (`--ovl-bg / --ovl-ink / --ovl-card` included). Use tinted dark grey rather than pure black with pure white.
- Charts use inline SVG / CSS without a charting library. Apply the six template disciplines to signature elements, page types, images and backdrops.
- HTML reveals play on page entry and stop under `prefers-reduced-motion`. Record deck-specific exclusions.

### PPTX supplement (when `target` includes `native-pptx`)

HTML's CSS tricks do not port straight to PPTX; the style decision block has to be executable by **native objects**:

- **Fonts**: only fonts already installed on the delivery machine; name both `latin` + `ea` for headings and body (e.g. `Arial` + `Microsoft YaHei`); no web fonts, no embedded fonts. A missing font gets substituted by PowerPoint and the layout may shift.
- **Footer**: 10.5pt minimum (the HTML 9px citation bar does not migrate); all information-bearing text still ≥ 4.5:1.
- **Motion**: page turns default to a uniform `fade` 400ms and can be overridden per slide with any of the 58 PowerPoint effects (token grammar and whitelist in `05b-pptx.md` §4); in-page animation is declared per slide, attaches only to `shape` / `chart` (never pictures, tables or media), caps at 6 per page and releases one item per click. There is no CSS easing curve to pick here — only fast/med/slow and PowerPoint presets. Decide which ones land on which slides in this step and write them into the style decision block; do not leave it to the build.
- **Shapes and effects**: radii, outlines, shadows and glows use native PowerPoint parameters; where a preset asks for a CSS texture ("glass / refraction / scanlines / halftone"), PPTX approximates it with the closest native fill / outline / transparency and the style decision block says "PPTX approximation" — never promise pixel parity.
- **Charts**: native charts, 2–12 categories, 1–3 series, linear axis; for log axes, waterfalls and dual units, mark "PPTX degrades this to a table / bar chart" in the style block first.
- **Images**: PNG/JPEG, ≤ 2MB per image recommended; a full-bleed backdrop must carry a readable scrim (the builder defaults to 55% black, adjustable in the block).
- **Forbidden**: web fonts, CSS filters, scrolling/parallax, autoplaying audio or video (unless the user explicitly asks for it), describing a PowerPoint preset as if it were a CSS easing curve.

## Output: style decision block

```
Style: <temperament preset A–I or custom name> + <layout template J–Q, or "none">, reason: <one line>
Mode: light | dark
theme: {bg, panel, ink, muted, accent, accent-ink, warn, rule}   ← copied verbatim into skeleton §1
Type: headings <stack>; body <stack>; numerals <stack>
Hierarchy: primary <key | kpi group | pull>; scale <primary/title/body/meta px> (ratio ≥ 1.4);
           accent block ≤ 1, warn ≤ 1 per slide; still readable in grayscale
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
