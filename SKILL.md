---
name: human-led-ppt
description: Create human-led presentations with an approved per-slide skeleton and traceable evidence. Deliver offline HTML or editable native PPTX via the supported engine. Use for slides, PPT, pitch decks, source notes and presentation outlines; supports charts, diagrams, optional annotation and presenter mode. 中文：制作 PPT、幻灯片、HTML 演示、可编辑 PPTX、资料总结与骨架说明书。日本語：プレゼン、スライド、編集可能な PPTX、資料まとめ、骨子の作成。
---

# Human-led PPT

The user owns topic, style and wording. The agent owns evidence, structure and implementation. The approved skeleton is the build authority; every factual number and claim must trace to the source file.

Language: `references/zh/` is the Chinese original (中文母本), `references/en/` and `references/ja/` are its English and Japanese mirrors — same content, so a revision touches all three. Work entirely inside the folder matching the user's language.

Version 2.0.0 (2026-11-02) · License: MIT, copyright Makitoid Wang (see `LICENSE`).

## Workflow

Read only the current step’s reference in the chosen language. For step 2, open only the selected A–V preset; for steps 5–6, choose the HTML or PPTX reference. Reuse decisions and permissions already provided.

| Step | Reference | Output / gate |
|---|---|---|
| 1 Topic | `01-topic-brief.md` | Confirm target (HTML / PPTX / both), audience, timing and narrative using the fixed target-choice copy. Never choose for the user. |
| 2 Style | `02-style.md` + selected `02-presets/*.md` | Confirm style; record tokens, typography, motion and exclusions. No finished deck yet. |
| 3 Evidence, as needed | `03-research.md` | Source file. Research external facts when needed or requested; organise supplied material with citations otherwise. |
| 4 Skeleton | `04-skeleton.md` | Per-slide spec; **wait for approval before building**. If topic, style and material are given, start here. |
| 5 Build | `05-build.md` / `05b-pptx.md` | Assemble HTML or compile native PPTX from the approved skeleton. |
| 6 Verify | `06-verify.md` / `06b-pptx.md` | Confirm who runs final checks; static/spec checks remain required. Report tested and untested items. |
| 7 Annotation, optional | `07-annotation.md` | HTML ink and blackboard; ask before adding it when presenting was not requested. |
| 8 Presenter, optional | `08-presenter-mode.md` | HTML presenter layer; prompts come from reviewed skeleton §7. |

## Shared constraints

- **Evidence:** never invent figures, dates, sources or URLs. Mark disputed evidence ⚠️, second-hand evidence 🔍, inaccessible sources ⛔. Keep ⛔ out of the deck and disclose access failures. Replace example placeholders with real content.
- **Authority:** match page count, wording, numbers and keyword content to the skeleton. Follow minor imperfections and record them in §6; repair factual errors, contradictions and missing sources in the skeleton and source file together.
- **Narrative:** hook → build → one peak in the second half → release. Each act changes the central answer; resolve a flat narrative in step 1.
- **Hierarchy:** one primary per slide; four type tiers with adjacent ratios ≥1.4; accent-filled blocks ≤1, warn marks ≤1, peer cards ≤4. Emphasise the primary.
- **Readability:** information-bearing text, including muted text and citations, clears 4.5:1 on its actual surface; large text clears 3:1. Measure composited backgrounds. Never fade text with opacity.
- **Review:** no build while style is undecided or the skeleton unapproved. Prompts and generated-image briefs receive their specified review. Never claim checks that were not run.

## HTML implementation

- Assemble `assets/deck-shell.*` through `assets/assemble.cjs`; preserve navigation, overview, hash links, portrait mask, shortcuts and shell-owned media controls. Do not reimplement the shell or add duplicate controls.
- Inline images and backdrops. Keep audio, video and local linked files beside the HTML and include them in delivery; media uses `data-src`. Enable the evidence badge per deck with `evidence_chain: on`.
- Copy the kit and selected figure from `assets/visual-templates.html`: **21 templates (11 charts, 10 diagrams), four appearances**. Update labels, units, SVG title and geometry together using its formula; examples are not evidence.
- Motion defaults to crossfade, with in-slide reveals opt-in: one semantic group at a time, ≤800ms, no looping content or moving chrome. Honour `prefers-reduced-motion`; only an explicit preset may add ambient background drift.
- Links use relative sibling paths, http(s) or `#sN`; local files must exist. File/external links use `target="_blank" rel="noopener"`. Reject active schemes and paths escaping the delivery folder.
- Append optional overlays in ink → presenter order. Rewrite theme/copy config for the deck, preserve key ownership and storage protocols, and keep ← / → paging. Blackboard storage is shared across slides; presenter mode has four cards and no blackboard card.

## PPTX implementation

- Run `assets/pptx/detect-engine.cjs` first. Claude Code / Codex / ZCode / dsh use an installed host PPTX plugin, falling back to officecli if absent; other hosts use officecli. Obtain consent to install a missing binary; never run `officecli install`. Minimum: 1.0.159; non-fade transitions or element animation: 1.0.160.
- Compile `<topic>-PPTX-src.json` through `assets/pptx/build.cjs` and its recipes. Do not hand-edit OOXML or bypass the compiler with ad hoc commands.
- Default to `fade-400` and no element animation. Select `calm` / `story`, effect reasons and budgets from `05b-pptx.md` §4; `lib.cjs` enforces tokens and motion policy. Only shapes and charts animate; ≤6 elements per page.
- Verify with `lint.cjs`, officecli validate/issues and per-page rendering. Report read-back warnings and playback limits. Host-plugin output does not receive this compiler’s lint coverage.
- Rework updates sources/skeleton, then JSON, recompiles and rechecks. Rebuilding overwrites manual PowerPoint edits. After delivery, confirm whether to rebuild or make a minimal in-place edit, and disclose any resulting spec drift.

## Files and resources

Keep sources, skeleton and output in the user’s target directory (default: working directory). Localise filenames: `-sources.md` / `-资料总结.md` / `-資料まとめ.md`; `-HTML-PPT-skeleton.md` / `-HTML-PPT骨架.md` / `-HTML-PPT骨子.md`; or the corresponding `-PPTX-` skeleton. PPTX also delivers `-PPTX-src.json` and `-PPTX-qa.md`.

`references/zh/`, `references/en/` and `references/ja/` mirror each other, one document per step.

| Resource | Purpose |
|---|---|
| `assets/deck-shell.css / .js / .html` | HTML runtime and starting DOM |
| `assets/assemble.cjs` | Inline the shell and append selected overlays |
| `assets/visual-templates.html` | SVG gallery, shared CSS, appearances and geometry notes |
| `assets/ink-overlay.html` | Optional annotation and shared blackboard |
| `assets/presenter-overlay.html` | Optional presenter window, prompts and synchronisation |
| `assets/pptx/` | Engine routing, spec validation, recipes, compiler, lint and fixtures |

Detailed fields, commands, exceptions and checks belong to the step references. Read them on entering that step rather than duplicating them here.
