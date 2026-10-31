---
name: human-led-ppt
description: Human-led, agent-assisted design system for single-file HTML presentations (primary track) and native PPTX delivery via officecli (compat track) — the user owns topic, style and wording, the agent owns evidence, structure and build discipline. Five steps (topic → style → evidence → skeleton → build), each leaving a reviewable file, plus optional ink-annotation and presenter-window layers. Use when asked for a PPT, slides, deck, coursework or pitch presentation, an HTML PPT deck, a native .pptx or editable PowerPoint, source notes, an evidence base or a build outline. Output opens offline with zero dependencies — 1280×720 canvas, thumbnail overview, keyboard/click/touch paging, inline SVG charts. 中文触发：人主导、Agent 辅助的单文件 HTML PPT 设计系统（主轨），兼容 officecli 原生 PPTX；做 PPT、课件、课堂汇报、答辩、路演、幻灯片、可编辑 PPT、pptx、PowerPoint、原生幻灯片、officecli、资料总结、骨架说明书、分页规格、骨架关键字、插入图片、满版背景、生成配图、音频、视频、播放器、证据链、来源追溯、屏幕批注、画笔、白板、黑板、上台讲、演讲者模式、提词、双屏。日本語トリガー：人主導・エージェント支援の単一ファイル HTML プレゼン設計システム（主軸）、officecli による編集可能な PPTX 互換；プレゼン資料、スライド、登壇資料、授業資料、発表、ピッチ、デッキ、編集可能な PPTX、PowerPoint、officecli、資料まとめ、骨子、構成案、ページ割り、語句の洗い出し、画像・音声・動画、全面の背景、生成画像、プレーヤー、エビデンスチェーン、出典、画面注記、ペン、手書き、ホワイトボード、黒板、発表者モード、トークスクリプト、2画面。
---

# Human-led PPT builder (HTML primary, PPTX compat)

A **human-led, agent-assisted** design system for single-file HTML decks (primary) and native PPTX delivery (compat): the user owns the topic, style and wording, the agent owns evidence, structure and build discipline. Five steps, each reading only its own reference; steps 7–8 are optional HTML layers. Core contract: **every number and claim that reaches the finished deck (HTML or PPTX) must trace to the source file; the skeleton is the build authority, not an inspiration draft.**

Language: `references/zh/` is the Chinese original (中文母本), `references/en/` and `references/ja/` are its English and Japanese mirrors — same content, so a revision touches all three. Work entirely inside the folder matching the user's language.

Version 2.0 (2026-10-31) · License: MIT, copyright Makitoid Wang (see `LICENSE`). Every `<…>` / `……` is a placeholder: fill it with real, sourced content, and never let a placeholder reach the finished deck.

## Workflow

Each step reads `<lang>/NN-*.md` (step 2 also opens `02-presets/<ID>.md`, where `<ID>` is the A–Q preset it chose); step 5 reads `05-build.md` for HTML or `05b-pptx.md` for PPTX; steps 5/7/8 additionally read their `assets/` files.

| Step | Produces | Gate (wait for the user) |
|---|---|---|
| 1 Topic & narrative | **target choice (HTML / PPTX / both)** + requirement block (chat; later skeleton §0) | topic, audience, duration, structure, credits, target |
| 2 Style direction | style decision block → skeleton §1 | chosen preset or custom; brand guideline if any |
| 3 Evidence base (if needed) | `<topic>-sources.md` | none |
| 4 Skeleton spec | `<topic>-HTML-PPT-skeleton.md` or `<topic>-PPTX-skeleton.md` | **required** — user reviews and approves before step 5 |
| 5 Build | HTML → `<topic>.html` (`05-build.md`); PPTX → `<topic>.pptx` + `<topic>-PPTX-src.json` (`05b-pptx.md`) | none |
| 6 Verify | verification result incl. untested items (`06-verify.md` / `06b-pptx.md`) | **ask first** — agent runs the checks, or the user checks |
| 7 Annotation (optional, HTML only) | the same `.html` with an ink layer | ask before adding it to a deck the user did not mention presenting |
| 8 Presenter mode (optional, HTML only) | the same `.html` plus a second window driven by skeleton §7 | the user must have reviewed §7 before it is built into the deck |

Step 3 runs only if the user asks for web research or the topic needs external data. If the user supplies material, reformat it into the source-file shape (keeping citations) and go to Step 4. If topic + style + material are already given, start at Step 4 — but never skip its review gate.

**HTML is the primary track.** PPTX is a compat delivery for people who must hand over a `.pptx`; it is built only after the same topic/style/evidence/skeleton gates. Never choose a target for the user — step 1 shows the fixed comparison block from `01-topic-brief.md` verbatim.

## Hard rules

1. **Never fabricate.** No invented number, year, source, citation or URL. Unverifiable → 🔍; disputed → ⚠️; page unreachable → tell the user it could not be accessed because of network conditions.
2. **Build to the skeleton.** Minor problem → follow the skeleton, note reality in §6. Serious problem (factual error, contradiction, unsourced figure) → fix it **and update skeleton and source file in the same pass**.
3. **Interaction features are mandatory (HTML track only)** (G overview, keyboard/click/touch paging, hash links, portrait mask, `Q` shortcut panel) and come from `assets/deck-shell.*` — inline them, never reimplement. The same applies to the media transport: the shell injects the control bar into every `[data-mp]` figure, so a deck never hand-writes `controls` or a bar of its own.
4. **Media placement is decided by the skeleton keyword (HTML track only).** `image` → base64 data URL inline in the HTML (the deck stays one file). `audio` / `video` → a sibling file next to the `.html`, named in `data-src`; never base64 them (≈⅓ larger, and `file://` first paint stalls while the string is decoded). The source is attached only when that slide first opens. Say so in the delivery note: this deck is no longer self-contained. PPTX embeds images/media into the `.pptx` through officecli.
5. **The ink layer never ships with its own defaults.** If step 7 runs, both config blocks in `assets/ink-overlay.html` are re-authored for this deck — theme tokens mapped onto the deck's palette, five pen colours derived and measured per `07-annotation.md` §2–§3. Its blackboard (`B`) shares one store across slides and must never be keyed per slide.
6. **The presenter layer never ships with its own wording, or with unreviewed prompts.** If step 8 runs, both config blocks in `assets/presenter-overlay.html` are re-authored for this deck (the prompt-card title, the `empty` line and `CANVAS` especially), and its prompts come from skeleton §7 only. The presenter window carries **four** cards — current, next, prompt, overview — and there is no blackboard tile: the blackboard is an audience-window feature raised with `B`.
7. **A layer that owns a key owns it completely.** Use `stopImmediatePropagation` on the window capture phase when two layers can both answer the same key — otherwise one keypress does two unrelated things. `←` / `→` always page, whatever has focus.
8. **Every step leaves a file.** Source notes, skeleton and HTML live in the same directory, for review and rework.
9. No HTML while style is still under discussion; no build before the skeleton is approved.
10. **One primary per slide, and contrast is measured.** Each slide has exactly one element that wins the first glance — `key`, a KPI group, or `pull`; `h2` is the second tier; at most one accent-filled block and one warn mark; peer cards cap at four with only one allowed to step forward. Every information-bearing text token (muted and citations included) clears 4.5:1 against the surface it actually sits on; a full-bleed backdrop is measured at its brightest point after the scrim; `opacity` is never used to recede text.
11. **The deck must carry an arc.** Hook → build → peak → release, with exactly one peak in the second half and every act changing the answer to the central question. A flat deck, or a deck with no peak, goes back to step 1; do not patch rhythm at build time.
12. **PPTX engine routing is not optional.** Run `assets/pptx/detect-engine.cjs` before any PPTX build. officecli is mandatory in every host except Claude Code / Codex / ZCode, which use an installed PPTX-capable plugin and fall back to officecli if none exists; DeepSeek Harness (dsh) checks for a plugin first, then officecli. Install the officecli **binary only** (never `officecli install`) with user consent, and verify `officecli --version >= 1.0.159`.
13. **PPTX goes through the compiler, never through hand-written OOXML or one-off CLI calls.** The build authority is `<topic>-PPTX-src.json` + `assets/pptx/build.cjs` + the recipe library; the output is native shapes/tables/charts/pictures/media/notes. Do not hand-edit the `.pptx` XML.
14. **The PPTX deck JSON is not a second truth.** Slide count, page types, numbers and wording must match the approved skeleton and source file. Any conflict is repaired in the skeleton/source first, then the JSON; record it in skeleton §6.
15. **PPTX motion is fade-only.** Every slide uses `fade` 400 ms; no per-element animation, no Morph, no auto-advance. If transition readback does not return fade/400, remove all transitions and tell the user to add them in PowerPoint — never silently ship a different speed.
16. **PPTX verification is structural plus rendered.** Run `assets/pptx/lint.cjs`, `officecli validate`, `officecli view issues`, and per-page screenshots. State honestly that screenshots use officecli's HTML render path when PowerPoint is absent; ask the user to open the file once. A host-plugin build does not run this lint and must be delivered with a lower verification claim.

## File naming

In the user's target directory (default: working directory). Chinese and Japanese decks use their own suffixes.

- `<topic>-sources.md` / `<主题>-资料总结.md` / `<トピック>-資料まとめ.md` — evidence and data cards
- `<topic>-HTML-PPT-skeleton.md` / `<主题>-HTML-PPT骨架.md` — the HTML build spec (primary track)
- `<topic>-PPTX-skeleton.md` / `<主题>-PPTX骨架.md` / `<トピック>-PPTX骨子.md` — the PPTX build spec
- `<topic>.html` / `<主题>.html` / `<トピック>.html` — the HTML deck
- `<topic>-PPTX-src.json` — the editable PPTX page spec (agent-authored from the skeleton)
- `<topic>.pptx` — the native PowerPoint deck
- `<topic>-PPTX-qa.md` — the PPTX verification report

## Resources

`references/zh/`, `references/en/` and `references/ja/` mirror each other, one document per step.

| Step | File | Inside |
|---|---|---|
| 1 | `01-topic-brief.md` | the fixed **target-choice block (HTML / PPTX / both; HTML is the primary track)**; what to ask; five narrative structures; **the mandatory tension arc (hook → build → peak → release)**; requirement block |
| 2 | `02-style.md` + one `02-presets/*.md` | index of 9 temperament presets (A–I) + 13 templates (J–V: layout templates J–Q, plus five full systems R–V — electronic magazine and four lifted from `frontend-slides`), the helper design skill per style, the custom route, deck-level floors **and the hierarchy ladder (one primary, four-tier type scale, accent/warn budget, contrast floor)**, the style decision block; each preset file holds light **and** dark palettes, signature elements, type stack, motion and risks — open only the one you choose |
| 3 | `03-research.md` | evidence procedure; ⚠️/🔍/⛔ marker system; source-file template; unreachable links |
| 4 | `04-skeleton.md` | skeleton §1–§7; §1 gains `target`, an optional `pptx:` block (engine / 960×540pt / installed fonts / fade-only motion / notes) and a `hierarchy` block (one primary, four-tier scale, accent/warn caps) and §3 a tension column; §4 is a **keyword library** (core 3 + six families — positioning / text / data / visual / argument / delivery, 56 words) with a declared per-deck subset, page types and worked examples; per-slide hard constraints enforce one primary, a second-tier title, ≤4 peer cards and emphasis on the primary; the media keywords state **where the file goes** — `image` (framed, inlined), `background` (full-bleed backdrop on `data-bg`), `audio` / `video` (sibling files), plus `draw` (an image to be generated: prompt recorded here, shown to the user before generating); **§4's head legend is human-only (`⧉`-delimited) — steps 5–8 must not read it**; §7 speaker prompts and their review wording; PPTX mapping lives only in `05b-pptx.md` |
| 5 | `05-build.md` (HTML) · `05b-pptx.md` (PPTX) | HTML: assembly; DOM contract; **the hierarchy implementation (primary / title / support / detail, four fixed font sizes, accent budget, whitespace, contrast and opacity rules)**; the media section (base64 image vs sibling audio/video); required-feature table; chart/badge/capsule rules; motion; known traps; conflict severity. PPTX: engine routing, `PPTX-src.json`, 12 layout recipes, keyword→block mapping, text-capacity gate, native table/chart/picture/media/notes, fade-only transitions, officecli build discipline and traps |
| 6 | `06-verify.md` (HTML) · `06b-pptx.md` (PPTX) | HTML: static greps; browser assertion script; **a per-page hierarchy and contrast sweep (single primary, type ratios, accent budget, every text leaf against its real background)**; media and blackboard assertions; number audit; delivery wording. PPTX: spec + file lint, skeleton cross-check, number audit, `validate` / `issues`, per-page screenshots, delivery wording, HTML↔PPTX capability table, limits |
| 7 | `07-annotation.md` | **HTML only** — ink layer; skipped for PPTX (use PowerPoint ink) |
| 8 | `08-presenter-mode.md` | **HTML only** — presenter window; skipped for PPTX (use PowerPoint presenter view; §7 notes are still written) |

`assets/` — inline or assemble, never rewrite:

- `assets/deck-shell.css` / `.js` / `.html` — scaling, transitions, overview wall, paging, fullscreen, hash links, counting numerals, portrait mask, reduced-motion, print; the `Q` shortcut panel (add-ons register sections via `window.__deckHelp`); the full-bleed **backdrop layer** (`data-bg` / `data-bg-scrim` → `background` keyword, inline data: images only); the **evidence-chain badge** (built **per deck**, not per keystroke — only when the deck declares `data-evidence="1"`, i.e. skeleton §1 `evidence_chain: on` for a serious deck; the chip is recounted per slide from the sources the author wrote and a click lists them); the media transport (play/pause, seek, `,`/`.` nudge, rate, mute, deferred source, and a missing file that says "Video/Audio not found" **inside the player box**; an audio strip that rests folded into a loudspeaker and unfolds **rightwards from that speaker** into a compact bar capped at 416px — 80% of the old 520px line, never the full card width); video fullscreen (real, or a CSS take-over for cross-window requests); and `?preview=N` mode (`data-preview`: no overview, no hash, input swallowed — a tile asks the audience window for the screen and **remote-controls its media transport**). `deck-shell.html` is the starting template: three placeholder slides plus two shell tokens.
- `assets/ink-overlay.html` / `assets/presenter-overlay.html` — the two optional layers in full (CSS + DOM + JS), self-contained and additive; re-author their config blocks per deck, leave the rest alone.
- `assets/assemble.cjs` — `node assets/assemble.cjs deck.src.html deck.html [--ink] [--presenter]` inlines the shell and appends the layers (fixed order: ink, then presenter; bare flags default to the sibling files); global replace with residue and failure checks.
- `assets/pptx/` — the PPTX compiler: `detect-engine.cjs` (host/plugin/officecli routing), `lib.cjs` (units, text capacity, contrast, crop, ids, spec validation), `recipes.cjs` (12 layout recipes + page-type mapping), `build.cjs` (spec → officecli batch → `.pptx`, fade-only transitions), `lint.cjs` (spec + file + skeleton + number audit + QA report), `fixtures/` (6-page smoke deck). Never hand-edit the generated `.pptx` XML; fix the spec/recipe and rebuild.
