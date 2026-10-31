# Step 5 (PPTX track) · Build the native PPTX

> Read this file only when this deck's `target` includes `native-pptx`. The HTML track reads `05-build.md`; both tracks share steps 1–4, the same skeleton and the same source notes.

Goal: compile the approved skeleton into a `.pptx` that **stays editable in PowerPoint / WPS / Keynote**. Native shapes, text, tables, charts, images, media, notes; page turns are a uniform `fade` 0.4s; no in-page animation at all. **Do not** hand-write OOXML, and do not type officecli commands one by one — all geometry, type sizes and whitespace are the job of the layout library in `assets/pptx/build.cjs`.

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
  "motion": { "transition": "fade", "duration": 400 },
  "slides": [{
    "id": "s3", "type": "kpi-hero", "topic": "…", "title": "…", "key": "…",
    "blocks": [{ "kind": "kpi", "items": [{ "value": "-32", "unit": "%", "label": "…" }] }],
    "emphasis": { "role": "kpi", "index": 0, "tone": "accent" },
    "source": "institution · year",
    "notes": "…"
  }]
}
```

- `theme` is copied straight from Step 2's style decision block; `scale` holds the 1280×720 px values, converted to pt at build time by 1px = 0.75pt (48/34/24/14 → 36/25.5/18/10.5pt), with the four-tier ratios unchanged.
- `motion` may only be `{ "transition": "fade", "duration": 400 }`; any other value is rejected outright.
- `emphasis`: `role` is `key | kpi | title`, `tone` is `accent | warn`; it may only land on that slide's primary.
- `source` is mandatory on slides carrying `kpi` / `table` / `chart` / `compare` / `quote`; it lands in the bottom-right footer.
- `notes` comes from skeleton §7 and is plain text; `<strong>` / `<em>` are stripped by the builder — emphasis formatting survives only in the HTML presenter window.

### block kind (v1 accepts only these)

`points` · `prose` · `kpi` · `table` · `chart` · `compare` · `steps` · `timeline` · `diagram` · `image` · `media` · `pull` · `quote` · `code`

The skeleton's 56-word library maps to blocks in this one place only (do not copy it into skeleton §4):

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
- writes `transition=fade-400` on every slide and reads back `transitionDuration=400` after the build; if it cannot be read back it **deletes every transition** and warns in the terminal — it never silently degrades to `fade-med`;
- writes no `animation` element at all.

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
2. **A failed batch writes nothing at all**: create every slide in one pass, then fill page by page; if any batch fails, abort — never `--best-effort`.
3. **`/shape[N]` drifts**: always address `@id`; ids are assigned at build time, so later edits must not look shapes up by index.
4. **Shapes inherit the theme colour by default**: every rect needs an explicit `fill` and `line=none`, or an accent1 outline/fill shows up.
5. **The transition duration hides in a p14 extension**: if `transition=fade-400` does not read back as 400, delete every transition; never hand-edit the XML.
6. **Table `data` splits rows on `;`**, not `\n`; cells containing commas must be quoted (the builder handles this).
7. **Image distortion**: `view issues` reports `picture_aspect_distorted`; compute `crop` from the aspect ratio (0–100 percentage), never stretch.
8. **Fonts**: use only fonts installed on the delivery machine and name `font.latin` / `font.ea` explicitly; `create --locale` fixes the language. With a missing font PowerPoint substitutes it and the layout may shift.
9. **A screenshot is not PowerPoint**: without PowerPoint on this machine `view screenshot` goes through officecli's HTML rendering path; it proves layout structure, not pixel parity with PowerPoint.
10. **`--grid` needs a headless browser**: when this machine has none, screenshot page by page with `--page N`, or several pages with `--page 1-N` into a vertical strip.
11. **An audio poster is 1×1**: use a square box for audio; video must supply a real poster or it gets flagged as distorted.
12. **The build spec is not a second truth**: when slide count / page types / numbers conflict with the skeleton or the source notes, fix `PPTX-src.json` and log one row in skeleton §6.

## 11. Output

Write the `.pptx` to the path named by `filename` in skeleton §1 (same directory as the skeleton by default). Go straight to step 6 when it is written — do not deliver first.
