# Step 5 (PPTX track) · Build the native PPTX

> Read this file only when this deck's `target` includes `native-pptx`. The HTML track reads `05-build.md`; both tracks share steps 1–4, the same skeleton and the same source notes.

Goal: compile the approved skeleton into a `.pptx` that **stays editable in PowerPoint / WPS / Keynote**. Native shapes, text, tables, charts, images, media, notes; page turns come from `motion.transition`, in-page motion from the per-slide `animation` (the rules are in §4 "Motion"). **Do not** hand-write OOXML, and do not type officecli commands one by one — all geometry, type sizes and whitespace are the job of the layout library in `assets/pptx/build.cjs`, and motion is generated from the spec the same way.

## 1. Before starting

1. The skeleton was approved by the user (Step 4's gate), and §1 states that `target` includes `native-pptx`.
2. You have read `04-skeleton.md` §1/§4/§7, and this file.
3. The source notes are open beside you; every number in `PPTX-src.json` has to trace back to them.
4. You have run the engine detection once (see §2) and confirmed this chain may use officecli.

## 2. Engine routing (do this first, do not skip)

```bash
node <skill dir>/assets/pptx/detect-engine.cjs --json
```

The script identifies the host from "this skill's install path → environment variables", scans that host for an installed PPT plugin, then checks for `officecli`:

| Host | Routing |
|---|---|
| Claude Code / Codex / ZCode | a default plugin with **PPTX capability** → `host-plugin`; if none → **fall back to `officecli`** and say clearly in the conversation that the fallback happened |
| DeepSeek Harness (dsh) | a PPTX plugin → `host-plugin`; if none → `officecli` |
| Anything else (Qoder, Cursor, VS Code, a repo dev copy, …) | `officecli` (mandatory) |

- `host-plugin`: generate the PPTX through that plugin's flow. **This skill's `lint.cjs` will not run on its artifacts**; only "skeleton approved, nothing invented" is guaranteed — layout and contrast are whatever the plugin can do, and the delivery note must lower the acceptance promise.
- When `officecli` is missing, **get the user's consent first**, then install the binary:
  - Windows: `irm https://d.ai.officecli.ai/install.ps1 | iex`
  - macOS / Linux: `curl -fsSL https://d.ai.officecli.ai/install.sh | bash`
  - or `npm i -g @officecli/officecli` / `scoop install officecli` / `brew install officecli`
- **Never run `officecli install`**: it also drops officecli's own skills/MCP into every agent it detects. Install the binary only.
- Require `officecli --version >= 1.0.159`; reopen the shell after installing or verify with the full path. If it still fails, stop — do not hand-write OOXML.
- **Motion needs 1.0.160 or newer**: transitions other than fade and every in-page animation are verified only on 1.0.160, so `build.cjs` refuses to build them on anything lower — upgrade the binary, or fall back to `motion: "fade-400"` and drop every slide `animation`.

## 3. Artifacts

| File | Written by | What it is |
|---|---|---|
| `<topic>-PPTX-src.json` | the agent | the build spec written per skeleton §4; reviewable, diffable |
| `<topic>.pptx` | `build.cjs` | the deliverable; native objects |
| `<topic>.pptx.batch.json` | `build.cjs` | the officecli commands actually executed; look here first when something breaks |
| `<topic>-PPTX-qa.md` | `lint.cjs --report` | the verification report (step 6) |

`<topic>-PPTX-src.json` is a **build working file**, not a second truth; slide count, page types and numbers follow the skeleton and the source notes.

## 4. `PPTX-src.json` structure

```json
{
  "meta": {
    "title": "…", "author": "…", "lang": "en", "locale": "en-US",
    "skeleton": "<topic>-PPTX-skeleton.md", "slides": 12,
    "numberWhitelist": ["2026"]
  },
  "theme": {
    "bg": "#FFFFFF", "panel": "#F2F4F7", "ink": "#1F2328", "muted": "#5A6472",
    "accent": "#0063B1", "accentInk": "#FFFFFF", "warn": "#B42318", "rule": "#D0D7DE",
    "font": { "latin": "Arial", "ea": "Microsoft YaHei" },
    "scale": { "claim": 48, "title": 34, "body": 24, "meta": 14 },
    "radius": 16
  },
  "motion": { "transition": "fade-400", "discipline": "calm" },
  "slides": [{
    "id": "s3", "type": "kpi-hero", "topic": "…", "title": "…", "key": "…",
    "blocks": [{ "kind": "kpi", "items": [{ "value": "-32", "unit": "%", "label": "…" }] }],
    "emphasis": { "role": "kpi", "index": 0, "tone": "accent" },
    "transition": "push-right-600",
    "transition_why": "pushing from act 2's itemised cost breakdown to act 3's either-or conclusion — the direction follows the argument",
    "animation": { "on": "cards", "effect": "fade", "class": "entrance", "duration": 400 },
    "source": "institution · year",
    "notes": "…"
  }]
}
```

- `theme` is copied straight from Step 2's style decision block; `scale` holds the 1280×720 px values, converted to pt at build time by 1px = 0.75pt (48/34/24/14 → 36/25.5/18/10.5pt), with the four-tier ratios unchanged.
- `emphasis`: `role` is `key | kpi | title`, `tone` is `accent | warn`; it may only land on that slide's primary.
- `source` is mandatory on slides carrying `kpi` / `table` / `chart` / `compare` / `quote`; it lands in the bottom-right footer.
- `notes` comes from skeleton §7 and is plain text; `<strong>` / `<em>` are stripped by the builder — emphasis formatting survives only in the HTML presenter window.

### Motion (`motion` and per-slide `animation`)

Motion is **presentation discipline, not layout**: it changes no geometry and writes only `p:transition` and `p:timing`. The engine offers far more than the first version exposed; the whitelist follows officecli's own error text and is hardcoded in `assets/pptx/lib.cjs`. But "the engine allows 58" and "how many this deck should use" are two different questions — the second is tightened to ppt-master's motion doctrine (default `fade-400`, in-page animation off by default) and enforced by `motionPolicyErrors` in `lib.cjs`.

**Pick the discipline before the effect.** `motion.discipline` has exactly two settings:

| Setting | Page turns allowed | In-page animation | Budget |
|---|---|---|---|
| `calm` (default) | base + directional + identity | `entrance` / `emphasis` only | animated slides ≤ `max(1, ⌈pages/3⌉)`, never two adjacent |
| `story` | plus expressive | all four classes | animated slides ≤ `⌈pages/2⌉`; expressive page turns ≤ `max(2, ⌈pages×20%⌉)`, never adjacent |

Choose the page turn by **the relation between two adjacent slides**, not for the sake of variety:

| Relation between adjacent slides | Which one | Tier |
|---|---|---|
| Continuous narration inside one section | `fade-400` (default) | base |
| A direct cut that need not preserve continuity | `none` / `cut-400` | base |
| Steps, a timeline or a hierarchy with a clear direction of advance | `push-*` / `wipe-*` / `cover-*` / `pull-*` / `split-*` / `reveal-*` | directional |
| The same object changing position, size or crop across pages | `morph` | identity |
| Act opening, key reveal, obvious state boundary | the rest of the "fancy" library (`zoom` / `flip` / `cube` / `vortex` …) | expressive |

- **Every non-base effect needs a stated reason**: deck-wide in `motion.why`, a single-slide override in `slides[].transition_why` — one sentence saying "what changed between these two slides". No reason, no new effect; `fade` / `cut` / `none` need none.
- **`random` only when uncertainty is the content** (random sampling, random failure), and say so in the reason; "afraid of monotony" is not a reason.
- **Expressive is punctuation, not decoration**: once per act at most, never on two adjacent slides. Everything else returns to `fade`.

**Page turns** — `motion.transition` (the deck-wide default) and `slides[].transition` (a single-slide override) both use the same token string:

```
type[-direction or subtype][-speed fast|med|slow | milliseconds]
fade-400 · push-right-600 · split-vertical-in · wipe-slow · morph · none
```

- The type may only be one of the 58 whitelisted values (`fade cut dissolve circle diamond newsflash plus random wedge wipe push cover pull wheel zoom split blinds checker comb bars strips flash honeycomb vortex switch flip ripple glitter prism cube rotate orbit clock doors window shred ferris flythrough warp gallery conveyor pan reveal morph box fallOver drape curtains wind prestige fracture crush peelOff pageCurlDouble pageCurlSingle airplane origami none`); a misspelling is rejected outright by `lib.cjs`, because officecli **rolls back the whole batch** when it receives an invalid token.
- Duration and speed are mutually exclusive: `fade-400` sets `transitionDuration` in the p14 extension, `fade-slow` sets the legacy `transitionSpeed`; giving both is an error.
- Direction and subtype are **type-dependent** (`push-right` is legal, `circle-in` is not); after the build, report the deviation from the read-back result instead of guessing.
- The engine can both write and read `morph`, but matching runs on **same-named shapes on the previous slide**, and the builder gives shapes stable ids, not semantic names — so the effect usually degrades into a plain page turn. Tone the delivery promise down one notch before you use it.
- The old form `{ "transition": "fade", "duration": 400 }` is retired; `lib.cjs` errors out and suggests changing it to `"fade-400"`.

**In-page `animation`** (only on the slides that declare it):

```json
"animation": { "on": "content", "effect": "fade", "class": "entrance", "direction": "up", "duration": 400, "delay": 0, "trigger": "onClick" }
```

| Key | Values | Notes |
|---|---|---|
| `on` | `primary` / `title` / `content` / `cards` / `all` | Which **already-laid-out elements** get animation: the primary, the title (primary included), the body layer, the card layer, everything. Full-bleed backdrops and masks (`ground`) and the corner source footer (`role:detail`) never move |
| `class` | `entrance` / `exit` / `emphasis` / `motion` | Four classes, with the effect whitelist split per class: emphasis has only `spin grow bold wave fade` (plus the colour ones), entrance/exit use `appear fade fly zoom wipe bounce float split wheel swivel checkerboard blinds dissolve flash box circle diamond plus strips wedge random`, and the 16 template effects `contract floatOut sinkDown …` are `class=exit` only |
| `trigger` | `onClick` (default) / `withPrevious` / `afterPrevious` | One click reveals one element — that is the pace of the talk. Under `onClick` elements queue in reading order (top first, then left) |
| `duration` / `delay` | integer ms | Template exit effects keep PowerPoint's own duration; passing `duration` is an error outright |
| `direction` | `in out left right up down` | Only the directional effects accept it; the read-back normalises it to `left/right/up/down` |
| `path` / `d` | `line arc circle diamond triangle square custom` | `class=motion` uses this instead of `effect`; `path=custom` requires `d` (0..1 relative coordinates, SVG-like) |
| `repeat` | positive integer / `indefinite` | Meaningful only for emphasis / motion; banned under `calm`, allowed under `story` only with a `why` |
| `why` | one sentence | Mandatory when `class` is not `entrance`: say what communication job the animation does (win attention back / free up a slot / express what the movement means) |

- **In-page animation is opt-in per slide**: under `calm` only `entrance` (reveal in reading order) and `emphasis` (make something already visible matter again) are allowed; `exit` / `motion` belong to `story` and must carry a `why`. By default the whole slide appears in one go.
- **Budget**: under `calm` no more than a third of the slides animate, and never two adjacent slides; under `story` no more than half. Each slide still keeps ≤ 6 elements, one per click — an effect that is still running after you finished the sentence gets rewritten.
- **≤ 800ms per animation**: past 800ms is an error outright — an animation slower than the talk is a drag, not an emphasis.
- **Backdrops, masks, footers and kickers never animate** (`ground` and `role:detail` stay out of the animation pool); cover / sources / thanks pages usually stay static, and `lint` reminds you.
- **Use `exit` only to remove or replace in-page content**: an ordinary page turn already takes the whole slide away; use a `motion` path **only when the movement itself carries meaning** (causality, spatial relation), otherwise `entrance` / `emphasis`.
- **Pictures and tables cannot carry animation**: officecli accepts only `shape` and `chart` as animation parents. To add motion to an image page, animate the text/cards above it; when `on` selects no animatable element at all the build fails outright instead of silently skipping.
- At most 6 animated elements per slide (= at most 6 clicks); more is an error, so go back and cut content or change `trigger`.
- Unlike the HTML primary track, there is **no** `prefers-reduced-motion` fallback here and no CSS easing curve to pick; PowerPoint's animation has presets and fast/slow/medium only. For a real entrance curve, take the HTML track.

### block kind (v1 accepts only these)

`points` · `prose` · `kpi` · `table` · `chart` · `compare` · `steps` · `timeline` · `diagram` · `image` · `media` · `pull` · `quote` · `code`

The skeleton's 58-word library maps to blocks in this one place only (do not copy it into skeleton §4):

| Skeleton word | block |
|---|---|
| `points` / `action` / `takeaway` / `caveat` / `missing` / `defs` / `toc` | `points` (`defs` written as two columns of short lines; `takeaway` is one line) |
| `prose` / `lead` | `prose` |
| `kpi` | `kpi` (1–4 items; the main one is named in `emphasis`) |
| `table` / `cast` | `table` (≤ 6 rows × ≤ 5 columns) |
| `bars` / `line` / `stack` / `pie` / `rank` / `visual` (data chart) | `chart` (native chart; see §8) |
| `compare` / `before-after` / `counter` | `compare` (two columns, left and right) |
| `steps` | `steps` (native step strip) |
| `timeline` | `timeline` |
| `diagram` / `arch-diagram` / `root-cause` / `framework` | `diagram` (four patterns: `steps` / `timeline` / `quadrant` / `hub`) |
| `image` / `background` / `draw` (already generated) | `image` (`bleed:true` for a full-bleed backdrop, `scrim` tunes the overlay) |
| `audio` / `video` | `media` (video must supply a `poster`) |
| `pull` / `quote` | `pull` / `quote` |
| `code` | `code` |
| `hint` / `ask` / `quiz` / `discuss` / `task` / `demo` / `poll` / `lines` / `handoff` | go into `notes` or the slide's `points`, never a standalone block |

**Every block has to be consumed by the page type's recipe.** For example `split-compare` only eats `compare / points / prose`; putting an `image` on it errors out rather than silently dropping content. One primary per slide, accent ≤ 1, warn ≤ 1 and cards ≤ 4 are checked twice — by the builder and by lint.

## 5. Page type → layout recipe

| recipe | Page types covered |
|---|---|
| `cover` | cover / team |
| `section` | act-divider / agenda / toc |
| `statement` | concept / verdict / problem / solution |
| `points` | points / definition / recap / caveat / next-steps |
| `kpi-hero` | kpi-hero / data-cards / data-contrast / traction |
| `table-showdown` | table-showdown / cast / action |
| `chart` | chart-line / chart-bars / chart-stack / results / experiment / breakdown / rank-list |
| `split-compare` | split-compare / before-after / counter-argument / competition |
| `diagram` | steps / timeline / arch-diagram / root-cause / framework / lifecycle-strip / policy-timeline |
| `image` | any page carrying `image` / `media` |
| `code` | code-walkthrough / terminal-log / demo |
| `closing` | closing / references / thanks / the-ask |

- Keep each deck to 6–8 recipes; pages sharing a recipe share one layout.
- `type:"custom"` is the escape hatch: every block gives `rect: [x, y, w, h]` (1280×720 px), at most 2 pages; lint still checks the safe area, in-layer overlap and the emphasis budget.
- When a skeleton page type is not in the table above, the builder picks a recipe from the blocks; but **the page-type names must still stay at 6–8** — do not lean on the fallback.

## 6. Coordinates, type sizes and whitespace

- Canvas: `960×540pt` (13.333×7.5in), `1px = 0.75pt`; every `x/y/width/height` is a string with a unit — bare numbers are forbidden.
- Four type tiers: primary 36pt (KPI 54–90pt) / title 25.5pt / body 18pt / note 10.5pt; footer 10.5pt minimum (the HTML 9px citation bar does not migrate).
- Page margin 42pt (56px); header → body, group gap and inner gap carry over Step 2's 28/24/12px conversion.
- Exactly one primary: only `key`, one `kpi` group's main item, or `pull` can be the primary; `title` is the second tier. KPI pages take the KPI group as primary by default and drop `key` to the title tier.
- Accent fill ≤ 1 per slide, warn mark ≤ 1 per slide; the emphasis must land on the primary.
- **Text capacity is a hard gate**: every text frame is `autoFit=none`, and the line count is estimated from the type size, box width and character width; if it does not fit it **errors out instead of shrinking the type**:
  `s7/points: text overflow need 5.2 lines, box …`. The fix is to split the block, move content into notes or cut words — you decide and log it in skeleton §6.

## 7. Build commands

```bash
# emit the batch only and review it by hand first (recommended for the first run)
node <skill dir>/assets/pptx/build.cjs <topic>-PPTX-src.json <topic>.pptx --emit-only

# actually build: close → delete the old file → create → batch(stdin) → close → verify transitions
node <skill dir>/assets/pptx/build.cjs <topic>-PPTX-src.json <topic>.pptx
```

Do not deliver after a successful build — go straight to step 6 (`06b-pptx.md`). The builder automatically:

- sets `slideWidth=960pt` / `slideHeight=540pt`, the theme fonts and the colours explicitly;
- gives every shape an explicit `id` (`10000 + slide*100 + slot`), `fill` and `line`, so later edits address `@id` instead of `[N]`, which drifts;
- writes tables with `;` as the row separator and quoted escapes; measures each row's height and sets font/fill per cell;
- computes `crop` (percentage) from an image's intrinsic size; a full-bleed backdrop is "cropped image + black scrim";
- writes the token string of `motion.transition` (or that slide's own `transition` override) on every slide and reads it back page by page after the build: if the **type** does not read back it deletes every transition and warns (it never silently swaps in a different effect); if only the duration or the direction/subtype fails to read back it keeps the effect, reports a WARN and says so plainly in the delivery note;
- runs `motionPolicyErrors` before the build: `discipline`, `why` / `transition_why`, and the expressive and animated-slide budgets all fail at this layer and never reach an officecli batch;
- on slides that declare `animation` it runs `add … --type animation` for each selected `shape` / `chart` in reading order — the command order is PowerPoint's click order.

## 8. Tables, charts, images, media

- **Tables**: native tables, ≤ 6 rows × ≤ 5 columns; `style=none`, `firstRow=false`, `bandedRows=false`, header filled with `panel`, borders `0.75pt rule`. Cell text uses body 18pt; row heights come from the capacity estimate, and if the total busts the box it errors out and names the row.
- **Charts**: native charts, 2–12 categories, 1–3 series, linear axis; `autotitledeleted=true`, `chartareafill=none`, `gridlines=false`, no legend for a single series. Colours are explicit (first series accent, the rest muted); category/series names may not contain `,` or `;`.
  - Log axes, waterfalls, dual units, fewer than 5 data points and similar cases that cannot be expressed reliably are **degraded to a native table or a simple bar chart** and explained in the QA report; v1 draws no charts by hand.
- **Images**: local PNG/JPEG/GIF; `fit=cover` crops proportionally, `fit=contain` centres with margins. A full-bleed backdrop uses `bleed:true`, `scrim` defaults to 0.55; raise it for a bright base image and lower it for a dark one — **body text must still be ≥ 4.5:1 after the scrim**.
- **Media**: the `media` element, `src` as a local path (the file gets embedded); video must supply a `poster` and is contained to the poster's aspect; audio uses a small square box. URLs are forbidden.
  - officecli's HTML screenshot path may not draw audio/video controls; trust `query media` and the result of opening it in PowerPoint.

## 9. Speaker notes

Skeleton §7's prompts go into `notes`, slide by slide:

```bash
officecli get <topic>.pptx "/slide[3]/notes" --json
```

- PPTX notes are **plain text**; `<strong>` / `<em>` tags are stripped and the words kept. Emphasis formatting exists only in the HTML presenter window.
- Numbers in the prompts are still bound by the source notes; notes are not a place to add facts.
- Step 8's two-window presenter layer **does not apply to PPTX**; use PowerPoint's own presenter view. Step 7's screen annotation does not apply either — use PowerPoint ink.

## 10. Known traps (ordered by how often they bite)

1. **A resident process holds the file**: `create` leaves a resident behind; `close`, then `rm`, then `create`. If deletion fails use `fs.rmSync(..., {maxRetries:5, retryDelay:200})`; the builder has this built in.
2. **A batch is atomic**: as soon as one command is rejected (an invalid page-turn token, an invalid effect×class pair, an animation hung on a picture) the **whole batch rolls back** and `officecli batch` exits non-zero. The builder now parses the `--json` result and prints the reason of the first 5 rejected commands instead of dumping a blob of raw JSON.
3. **`/shape[N]` drifts**: always address `@id`; ids are assigned at build time, so later edits must not look shapes up by index. Animation nodes hang off `@id` the same way (`/slide[2]/shape[@id=10203]/animation[1]`).
4. **Shapes inherit the theme colour by default**: every rect needs an explicit `fill` and `line=none`, or an accent1 outline/fill shows up.
5. **The transition duration hides in a p14 extension**: when `fade-400` does not read back as 400 it only reports a WARN (the effect stays as long as the type is there); only when the type itself fails to read back are all transitions deleted. Never hand-edit the XML.
6. **Table `data` splits rows on `;`**, not `\n`; cells containing commas must be quoted (the builder handles this).
7. **Image distortion**: `view issues` reports `picture_aspect_distorted`; compute `crop` from the aspect ratio (0–100 percentage), never stretch.
8. **Fonts**: use only fonts installed on the delivery machine and name `font.latin` / `font.ea` explicitly; `create --locale` fixes the language. With a missing font PowerPoint substitutes it and the layout may shift.
9. **A screenshot is not PowerPoint**: without PowerPoint on this machine `view screenshot` goes through officecli's HTML rendering path; it proves layout structure, not pixel parity with PowerPoint.
10. **`--grid` needs a headless browser**: when this machine has none, screenshot page by page with `--page N`, or several pages with `--page 1-N` into a vertical strip.
11. **An audio poster is 1×1**: use a square box for audio; video must supply a real poster or it gets flagged as distorted.
12. **The build spec is not a second truth**: when slide count / page types / numbers conflict with the skeleton or the source notes, fix `PPTX-src.json` and log one row in skeleton §6.
13. **Page-turn tokens are type-dependent**: `push-right` is legal, `circle-in` is rejected by the engine and rolls the whole batch back with it; `zoom-in` is accepted but reads back as `zoom` only. Write the delivery note for directions and subtypes from the read-back result — never assume they took effect.
14. **Pictures and tables cannot carry animation**: officecli's animation parents are `shape` and `chart` only; when `on` selects nothing the build fails outright — that is intentional, do not turn it into a silent skip.
15. **Deleting a slide's last animation leaves an empty `p:timing`**, and `validate` immediately reports incomplete content. To revoke an animation, change the spec and recompile — do not run `officecli remove` on the production file.
16. **58 transitions are not a palette**: under `calm` every expressive effect — and outside `story` every high-intensity animation — is rejected by `lib.cjs`; each non-fade page turn has to answer "what happened between these two slides". A reason that can be written goes into `why` / `transition_why`; one that cannot falls back to `fade-400`.
17. **`random` / `repeat` need a content reason**: the former serves "uncertainty itself" only, the latter works only under `story` with a `why`; "afraid of monotony" goes neither into the spec nor into the delivery note.

## 11. Output

Write the `.pptx` to the path named by `filename` in skeleton §1 (same directory as the skeleton by default). Go straight to step 6 when it is written — do not deliver first.

## 12. Re-editing after review

The `.pptx` is a compiled artifact and **the only truth is `<topic>-PPTX-src.json`** (slide count, page types, wording and numbers still follow the skeleton and the source notes). Anything the user wants changed after step 6's review — new wording, a layout tweak, one more line, a different page turn or animation — goes down the same one road:

1. land the change back in `PPTX-src.json` (when structure has to move, fix the skeleton first and log one row in skeleton §6);
2. recompile with `build.cjs`;
3. rerun step 6: the builder's own motion read-back + `lint.cjs` (including the animation-count and page-turn-type cross-check) + per-slide screenshots.

**Recompiling deletes the old file and builds the whole deck anew** (`close → rm → create → batch`), so:

- every change the user made by hand in PowerPoint / WPS is lost, including animations they added themselves, type sizes they changed and a slide they inserted;
- once the `.pptx` has been delivered, or when the user says outright "I have edited this one", **ask first**: (a) write the change back into the spec and recompile (recommended — the change stays covered by lint), or (b) make the minimal edits on this finished file only. Choosing (b) means no recompile, only `officecli set @id`-level spot edits, and you state plainly that this file is now out of sync with the spec and that when the animation counts disagree `lint` reports `none in the spec (edited outside the build spec?)`;
- when you are not sure whether the artifact has been touched, run `lint.cjs` once before deciding how to edit — its animation cross-check exists exactly for this case.
