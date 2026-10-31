<h1 align="center"><img src="assets/banner.svg" alt="human-led-ppt — a human-led, agent-assisted HTML-PPT design system with native PPTX compatibility" width="1280"></h1>

**English** · [中文](README_zh-cn.md) · [日本語](README_ja.md)

**A human-led, agent-assisted presentation design system. HTML is the primary track; native PPTX is compatibility delivery.** You own the topic, style and wording; the agent owns evidence, structure and build discipline. Five steps each leave a reviewable file, and the build starts only after you approve.

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg) ![Version 2.0](https://img.shields.io/badge/version-2.0-blue.svg) ![HTML dependencies: none](https://img.shields.io/badge/HTML%20dependencies-none-brightgreen.svg) ![PPTX engine: officecli](https://img.shields.io/badge/PPTX%20engine-officecli-blue)

> [!note]
> This project has moved to Codeberg for development. GitHub is kept only as a synchronized mirror.

## Why HTML is the primary track

- **Lightweight.** One `.html` file is usually a few hundred KB, opens offline on double-click, zero dependencies, zero install; anyone can open it.
- **Better for an agent to author.** Plain text, diffable, greppable, editable paragraph by paragraph; a revision takes seconds. PPTX is a binary package, so every change goes through a CLI/script and tracing a problem is more roundabout.
- **Higher aesthetic ceiling.** CSS/SVG does precise layout, transparent overlays, non-standard grids, custom charts and restrained motion that native PPT objects struggle with; with the same design language, the HTML version usually looks better.
- **Complete interaction.** Keyboard / click / touch paging, `G` thumbnail overview, `F` fullscreen, URL page memory, portrait mask; optional screen annotation (pen / highlighter / blackboard) and the presenter's two-window view.
- **Cheapest to revise and review.** Edit the HTML/CSS directly and review from a screenshot; no dragging shapes one at a time in PowerPoint.

So: **unless you have a hard `.pptx` delivery requirement, choose HTML by default.** Take the PPTX compatibility track only when the work must be handed in, must enter a corporate template, or someone else has to continue editing it.

## Two delivery forms

| Form | Fits | Output | Cost |
|---|---|---|---|
| **HTML deck (primary track)** | presenting live, class, review, annotating / two windows / overview needed | `<topic>.html`, one file | not a `.pptx`; cannot be edited shape by shape in PowerPoint |
| **Native PPTX (compatibility)** | handing in a file, entering a corporate template, someone else continuing | `<topic>.pptx` + `-PPTX-src.json` + `-PPTX-qa.md` | no overview / annotation / two windows / deep links; depends on the target machine's fonts; needs officecli |
| **Both** | presenting live and handing in a file | the two sets above | two placements per slide; build and verification roughly double |

Step 1 pastes the fixed comparison copy to the user verbatim and **never defaults on their behalf**. Both forms share one theme, source summary, narrative arc and skeleton; only steps 5–6 fork.

## The five steps, plus two optional layers (HTML primary track)

| Step | What it does | Produces |
|---|---|---|
| 1 Topic & narrative | **choose the delivery form first**; settle the central question, audience, duration, slide count, act structure and tension arc | requirement block |
| 2 Style direction | 9 temperament presets (Fluent / Material 3 / paper-neutral / editorial / Liquid Glass / doc-list / manga / academic / playful) and 13 templates (J–Q layouts + the five R–V complete systems) | style decision block |
| 3 Evidence base *(optional)* | evidence-gated research: disputed, second-hand and unreachable items are all clearly flagged | `<topic>-sources.md` |
| 4 Skeleton spec | act structure, per-slide **keywords** (three core — `type` / `key` / `sec` — plus 5–11 chosen from a 56-word library), implementation notes, speaker prompts | `<topic>-HTML-PPT-skeleton.md` or `<topic>-PPTX-skeleton.md` — **awaits your review** |
| 5 Build | HTML: one file strictly per the skeleton; PPTX: write `PPTX-src.json` from the skeleton, then compile native objects with the layout compiler | `<topic>.html` / `<topic>.pptx` |
| 6 Verify & deliver | HTML: static checks + browser test + number audit; PPTX: spec and artifact checks + validate + issues + per-slide screenshots | tested items + untested items |
| 7 Screen annotation *(optional, HTML)* | pen, highlighter, two eraser modes, annotations kept per slide | the same `<topic>.html` plus one layer |
| 8 Presenter mode *(optional, HTML)* | a second window: a timer banner plus four magnetic cards — current slide, next slide, this page's prompt, all-slide overview — both windows paging in sync | the same `<topic>.html` plus one more layer |

Step 3 runs only when the topic needs external data or you ask for research. Step 4 is the one gate that never gets skipped. Steps 7/8 serve HTML only; PPTX uses PowerPoint's own ink and presenter view, and §7's prompts still go into the native notes.

## PPTX compatibility track

### When to take it

The user explicitly wants a `.pptx`, must hand something in or be reviewed, must give the file to someone else to continue, or the organisation's process only accepts PowerPoint. **Do not** default to PPTX because the word "PPT" was used — let the user choose first.

### Engine rules (mandatory)

| Host | What to use |
|---|---|
| Claude Code / Codex / ZCode | the **PPTX capability plugin** already installed in that host; if there is none, **fall back to officecli** and say so clearly |
| DeepSeek Harness (dsh) | check for an installed PPTX plugin first; officecli if none |
| Anything else (Qoder, Cursor, VS Code, a repo copy, …) | **officecli is mandatory**; if missing, install the binary only |

- Install: Windows `irm https://d.ai.officecli.ai/install.ps1 | iex`; macOS/Linux `curl -fsSL https://d.ai.officecli.ai/install.sh | bash`; or `npm i -g @officecli/officecli` / `scoop install officecli` / `brew install officecli`.
- **Never run `officecli install`**: it also drops officecli's own skills/MCP into every agent it detects. Install the binary only, and verify `officecli --version >= 1.0.159`.
- Artifacts from the host-plugin route do not run this skill's `lint`, so the acceptance floor is lower; the delivery note must say so.

### Artifacts

```text
<topic>-PPTX-src.json    # per-slide spec written from the skeleton; reviewable, diffable
<topic>.pptx             # native shapes / text / tables / charts / images / media / notes
<topic>.pptx.batch.json  # the officecli commands actually executed; look here first when something breaks
<topic>-PPTX-qa.md       # verification report
```

### Build and verify

```bash
node <skill dir>/assets/pptx/detect-engine.cjs --json
node <skill dir>/assets/pptx/build.cjs <topic>-PPTX-src.json <topic>.pptx
node <skill dir>/assets/pptx/lint.cjs <topic>-PPTX-src.json <topic>.pptx \
  --skeleton <topic>-PPTX-skeleton.md --sources <topic>-sources.md --report <topic>-PPTX-qa.md
officecli validate <topic>.pptx
officecli view <topic>.pptx issues --json
officecli view <topic>.pptx screenshot --page 1 --out shots/s1.png
```

- 12 layout recipes cover cover, section, statement, points, KPI, table, chart, compare, diagram, image, code and closing; one primary per slide, four type tiers, accent ≤ 1, warn ≤ 1, cards ≤ 4.
- Text capacity is a hard gate: if it does not fit, the build errors out and **never shrinks the type**.
- Page turns are a uniform `fade` 400ms; **no in-page animation**. If 400ms cannot be read back, every transition is removed and the delivery note asks you to add them yourself.
- Images / audio / video are embedded in the `.pptx`; ≤ 2MB per image recommended.
- Without PowerPoint on this machine, screenshots go through officecli's HTML rendering path: they prove layout structure, not pixel parity with PowerPoint; the delivery will ask you to open it once.

## Install & use

Copy the `human-led-ppt/` folder into your skills directory, reload the session, then run `/human-led-ppt` — or just say:

- "make me an HTML deck about X" → HTML primary track
- "make me a PPT I have to hand in / an editable pptx" → PPTX compatibility track
- "I want both" → write one skeleton each first, then build them separately

The step documents exist as [English](references/en), [中文](references/zh) and [日本語](references/ja) mirrors; the PPTX track's `05b-pptx.md` / `06b-pptx.md` are mirrored in all three languages too.

## Capability comparison

| Capability | HTML primary track | PPTX compatibility track |
|---|---|---|
| Size | one file, a few hundred KB | images/media inflate it; tens of MB is common |
| Agent iteration | plain text, saved and seen at once | edit the JSON, recompile — one extra step |
| Layout precision | CSS/SVG, pixel level | native objects, subject to fonts and PowerPoint layout |
| Aesthetic ceiling | higher: transparent overlays, non-standard grids, custom charts | constrained by the PowerPoint object model |
| Paging / overview / fullscreen | built in: `G`/`F`/keyboard/touch | whatever PowerPoint provides |
| Screen annotation / blackboard | step 7's layer | none; use PowerPoint ink |
| Two-window presenter view | step 8's layer | none; use PowerPoint's presenter view |
| Deep links / portrait mask | yes | no |
| Media transport strip | built into the shell | PowerPoint native |
| Notes | `.notes` + emphasis in the presenter window | native notes, plain text |
| Editability | edit the source | native shapes/tables/charts are directly editable |
| Evidence chain | interactive badge (enabled per deck) | static source footer + a sources page |

## Feature showcase

![Finished deck](/pic/1.png)

![Annotation system](/pic/2.png)

![Deck overview](/pic/3.png)

![Presenter mode](/pic/4.png)

## Known limitations

- HTML style presets approximate a brand's look rather than quoting official design tokens; re-measure contrast after any colour change.
- Third-party skill names mentioned in the references are a 2026-10-14 marketplace snapshot that was neither installed nor read — re-verify and get user confirmation before use.
- Every example in the docs is a placeholder (`<…>` / `……`). Never copy an example figure, and never let a placeholder reach a finished artifact.
- The PPTX track's template / master route is not part of v1; do not promise "apply our corporate template".
- PPTX supports no in-page animation, Morph or auto-narration, and cannot edit an arbitrary existing `.pptx`; it only builds new from the skeleton.
- PPTX log axes, waterfalls and dual-unit charts degrade to a table or a simple bar chart.
- Without PowerPoint there is no pixel-level acceptance; screenshots only prove layout structure.

## What's new in 2.0

- **A native PPTX compatibility track**: `officecli` + a JSON per-slide spec + a layout compiler produce editable native shapes / tables / charts / images / media / notes; page turns are a uniform fade 0.4s with no in-page animation; checks before and after the build plus a per-slide screenshot review.
- **Redrawn banner**: a larger wordmark and human-led promise on the left, layered HTML slides and an editable native PPTX card on the right, with the five-step workflow and approval gate along the bottom.
- **HTML is still the primary track**: the README and step 1 both lead with HTML's advantages; the compatibility track is taken only when a `.pptx` is mandatory.
- **The README is rewritten in all three languages**: the structure is now "why HTML is primary → two delivery forms → five steps → PPTX compatibility track → install → comparison → limitations".

Full notes: [CHANGELOG.md](CHANGELOG.md).

## Credit and provenance

1. **Layout templates and presenter mode**: modelled on [**`lewislulu/html-ppt-skill`**](https://github.com/lewislulu/html-ppt-skill) ("HTML PPT Studio") — its way of organising a template (one `:root` token set plus a fixed menu of existing page types, with `--accent-ink` and image-container rules); the two-window preview, magnetic cards, prompt card and timer come from its presenter mode. **The reference is to method and interaction design, not code: nothing was copied.** Every piece was rewritten against this skill's own constraints — single file, zero external dependencies, layers appended before `</body>` and assembled by `assemble.cjs`, prompt text owned by skeleton §7 — and window sync was rebuilt on `postMessage` (with an `opener → parent` fallback) because `BroadcastChannel` is unreliable across `file://` opaque origins.
2. **The PPTX track's method**: modelled on [`hugohe3/ppt-master`](https://github.com/hugohe3/ppt-master) (MIT) — a locked design spec, a per-slide blueprint, compiling native objects, rendered review, and only a 0.4s fade for page turns by default. **None of its code was copied, and its SVG pipeline was not adopted.**
3. **PPTX tooling**: [OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) (Apache-2.0) — a single binary that reads and writes `.pptx` without Office installed.

## License

MIT — see [LICENSE](LICENSE). Copyright holder: Makitoid Wang.
