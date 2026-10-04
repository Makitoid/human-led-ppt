---
name: human-led-ppt
description: Human-led, agent-assisted design system for single-file HTML presentations — the user owns topic, style and wording, the agent owns evidence, structure and build discipline. Five steps (topic → style → evidence → skeleton → build), each leaving a reviewable file, plus optional ink-annotation and presenter-window layers. Use when asked for a PPT, slides, deck, coursework or pitch presentation, an HTML PPT deck, source notes, an evidence base or a build outline. Output opens offline with zero dependencies — 1280×720 canvas, thumbnail overview, keyboard/click/touch paging, inline SVG charts. 中文触发：人主导、Agent 辅助的单文件 HTML PPT 设计系统；做 PPT、课件、课堂汇报、答辩、路演、幻灯片、资料总结、骨架说明书、分页规格、骨架关键字、插入图片、音频、视频、播放器、屏幕批注、画笔、白板、黑板、上台讲、演讲者模式、提词、双屏。日本語トリガー：人主導・エージェント支援の単一ファイル HTML プレゼン設計システム；プレゼン資料、スライド、登壇資料、授業資料、発表、ピッチ、デッキ、資料まとめ、骨子、構成案、ページ割り、語句の洗い出し、画像・音声・動画、プレーヤー、画面注記、ペン、手書き、ホワイトボード、黒板、発表者モード、トークスクリプト、2画面。
---

# Human-led HTML PPT builder

A **human-led, agent-assisted** design system for single-file HTML decks: the user owns the topic, style and wording, the agent owns evidence, structure and build discipline. Five steps, each reading only its own reference; steps 7–8 are optional layers. Core contract: **every number and claim that reaches the HTML must trace to the source file; the skeleton is the build authority, not an inspiration draft.**

Language: `references/zh/` is the Chinese original (中文母本), `references/en/` and `references/ja/` are its English and Japanese mirrors — same content, so a revision touches all three. Work entirely inside the folder matching the user's language.

Version 1.5 (2026-10-04) · License: MIT, copyright Makitoid Wang (see `LICENSE`). Every `<…>` / `……` is a placeholder: fill it with real, sourced content, and never let a placeholder reach the finished deck.

## Workflow

Each step reads `<lang>/NN-*.md` (step 2 also opens `02-presets/<ID>.md`, where `<ID>` is the A–Q preset it chose); steps 5/7/8 additionally read their `assets/` files.

| Step | Produces | Gate (wait for the user) |
|---|---|---|
| 1 Topic & narrative | requirement block (chat; later skeleton §0) | topic, audience, duration, structure, credits |
| 2 Style direction | style decision block → skeleton §1 | chosen preset or custom; brand guideline if any |
| 3 Evidence base (if needed) | `<topic>-sources.md` | none |
| 4 Skeleton spec | `<topic>-HTML-PPT-skeleton.md` | **required** — user reviews and approves before step 5 |
| 5 Build | `<topic>.html` | none |
| 6 Verify | verification result incl. untested items | none |
| 7 Annotation (optional) | the same `.html` with an ink layer | ask before adding it to a deck the user did not mention presenting |
| 8 Presenter mode (optional) | the same `.html` plus a second window driven by skeleton §7 | the user must have reviewed §7 before it is built into the deck |

Step 3 runs only if the user asks for web research or the topic needs external data. If the user supplies material, reformat it into the source-file shape (keeping citations) and go to Step 4. If topic + style + material are already given, start at Step 4 — but never skip its review gate.

## Hard rules

1. **Never fabricate.** No invented number, year, source, citation or URL. Unverifiable → 🔍; disputed → ⚠️; page unreachable → tell the user it could not be accessed because of network conditions.
2. **Build to the skeleton.** Minor problem → follow the skeleton, note reality in §6. Serious problem (factual error, contradiction, unsourced figure) → fix it **and update skeleton and source file in the same pass**.
3. **Interaction features are mandatory** (G overview, keyboard/click/touch paging, hash links, portrait mask, `Q` shortcut panel) and come from `assets/deck-shell.*` — inline them, never reimplement. The same applies to the media transport: the shell injects the control bar into every `[data-mp]` figure, so a deck never hand-writes `controls` or a bar of its own.
4. **Media placement is decided by the skeleton keyword.** `image` → base64 data URL inline in the HTML (the deck stays one file). `audio` / `video` → a sibling file next to the `.html`, named in `data-src`; never base64 them (≈⅓ larger, and `file://` first paint stalls while the string is decoded). The source is attached only when that slide first opens. Say so in the delivery note: this deck is no longer self-contained.
5. **The ink layer never ships with its own defaults.** If step 7 runs, both config blocks in `assets/ink-overlay.html` are re-authored for this deck — theme tokens mapped onto the deck's palette, five pen colours derived and measured per `07-annotation.md` §2–§3. Its blackboard (`B`) shares one store across slides and must never be keyed per slide.
6. **The presenter layer never ships with its own wording, or with unreviewed prompts.** If step 8 runs, both config blocks in `assets/presenter-overlay.html` are re-authored for this deck (the prompt-card title, the `empty` line and `CANVAS` especially), and its prompts come from skeleton §7 only. The presenter window carries **four** cards — current, next, prompt, overview — and there is no blackboard tile: the blackboard is an audience-window feature raised with `B`.
7. **A layer that owns a key owns it completely.** Use `stopImmediatePropagation` on the window capture phase when two layers can both answer the same key — otherwise one keypress does two unrelated things. `←` / `→` always page, whatever has focus.
8. **Every step leaves a file.** Source notes, skeleton and HTML live in the same directory, for review and rework.
9. No HTML while style is still under discussion; no build before the skeleton is approved.

## File naming

In the user's target directory (default: working directory). Chinese and Japanese decks use their own suffixes.

- `<topic>-sources.md` / `<主题>-资料总结.md` / `<トピック>-資料まとめ.md` — evidence and data cards
- `<topic>-HTML-PPT-skeleton.md` / `<主题>-HTML-PPT骨架.md` / `<トピック>-HTML-PPT骨子.md` — the build spec
- `<topic>.html` / `<主题>.html` / `<トピック>.html` — the deck

## Resources

`references/zh/`, `references/en/` and `references/ja/` mirror each other, one document per step.

| Step | File | Inside |
|---|---|---|
| 1 | `01-topic-brief.md` | what to ask; five narrative structures; requirement block |
| 2 | `02-style.md` + one `02-presets/*.md` | index of 9 temperament presets (A–I) + 8 layout templates (J–Q), the helper design skill per style, the custom route, deck-level floors and the style decision block; each preset file holds light **and** dark palettes, signature elements, type stack, motion and risks — open only the one you choose |
| 3 | `03-research.md` | evidence procedure; ⚠️/🔍/⛔ marker system; source-file template; unreachable links |
| 4 | `04-skeleton.md` | skeleton §1–§7; §4 is a **keyword library** (core 3 + six families — positioning / text / data / visual / argument / delivery, 54 words) with a declared per-deck subset, page types and worked examples; the media keywords `image` / `audio` / `video` each state **where the file goes**; **§4's head legend is human-only (`⧉`-delimited) — steps 5–8 must not read it**; §7 speaker prompts and their review wording |
| 5 | `05-build.md` | assembly; DOM contract; the media section (base64 image vs sibling audio/video); required-feature table; chart/badge/capsule rules; motion; known traps; conflict severity |
| 6 | `06-verify.md` | static greps; browser assertion script; media and blackboard assertions; contrast script; number audit; delivery wording |
| 7 | `07-annotation.md` | ink layer — theme-token→pen mapping (light + dark); gestures; data model; the blackboard; verification script; paid-for traps; limits to disclose |
| 8 | `08-presenter-mode.md` | presenter window — what each window owns; `?preview=N`; the sync protocol; both config blocks; the four magnetic cards and their persisted stacking order (`z`); mirrored video fullscreen (a tile hands it to the audience window) and its badge; the 4.5:1 guard on inherited colours; assertion script; paid-for traps; limits to disclose |

`assets/` — inline or assemble, never rewrite:

- `assets/deck-shell.css` / `.js` / `.html` — scaling, transitions, overview wall, paging, fullscreen, hash links, counting numerals, portrait mask, reduced-motion, print; the `Q` shortcut panel (add-ons register sections via `window.__deckHelp`); the media transport (play/pause, seek, `,`/`.` nudge, rate, mute, deferred source, missing-file note, an audio strip that rests folded into a loudspeaker); video fullscreen (real, or a CSS take-over for cross-window requests); and `?preview=N` mode (`data-preview`: no overview, no hash, input swallowed — a tile asks the audience window for the screen). `deck-shell.html` is the starting template: three placeholder slides plus two shell tokens.
- `assets/ink-overlay.html` / `assets/presenter-overlay.html` — the two optional layers in full (CSS + DOM + JS), self-contained and additive; re-author their config blocks per deck, leave the rest alone.
- `assets/assemble.cjs` — `node assets/assemble.cjs deck.src.html deck.html [--ink] [--presenter]` inlines the shell and appends the layers (fixed order: ink, then presenter; bare flags default to the sibling files); global replace with residue and failure checks.
