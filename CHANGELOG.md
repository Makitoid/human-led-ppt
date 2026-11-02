# Changelog

**English** · [中文](CHANGELOG_zh-cn.md) · [日本語](CHANGELOG_ja.md)

## v2.0.0 (2026-11-02)

- Expanded the gallery to 21 templates (11 charts, 10 diagrams) and four appearances: rounded, outline, blueprint and editorial. Added filters, search, light/dark previews and code copying with unique SVG ids.
- Condensed all three README/changelog versions, the skill entry and constraint references. Standardised wording while preserving fields, review requirements and verification code.

## v2.0.0b2 (2026-11-01)

- Added `calm` / `story` motion policy and `why` / `transition_why` to PPTX. Default: `fade-400`, with in-slide animation opt-in; `lib.cjs` validates effects, reasons and budgets before building.
- Aligned HTML layout, motion and link rules. Local links open a new tab; assembly checks file existence and allowed schemes.
- Added the initial SVG gallery (five charts, four diagrams) and updated all three build/verification guides.

## v2.0.0b1 (2026-10-31)

- Added native PPTX delivery: JSON slide specs, 12 layout recipes, native objects and notes, checks before/after compilation and per-slide rendering.
- Enabled 58 transition tokens and four animation classes. Non-fade transitions and element animation require officecli 1.0.160; the builder reports atomic batch rollback and motion read-back drift.
- Defined engine routing, binary-only installation and spec → rebuild → verify rework. Rebuilding overwrites manual edits. HTML remains primary; the user chooses delivery format.
- Redrew the banner and updated all three documentation/README versions.

## v1.6.1 (2026-10-23)

- Audio controls unfold rightwards from the speaker, with a 416px content width, fixing pointer drift from centred expansion.
- Presenter controls now operate audience playback, seek, rate, mute and volume, with mirrored state. Video follows muted; audio sounds only in the audience window.
- Strengthened single-primary hierarchy, four type tiers, emphasis budgets, composited contrast and narrative-arc checks across all three languages.

## v1.6 (2026-10-14)

- Expanded styles from 17 to 22 with editorial style R and four complete systems S–V; renamed C/D/F/G without brand labels.
- Added `background` and `draw`, taking the keyword library to 56. Image source/licence records go in source notes; generation briefs require review.
- Made evidence badges opt-in per deck and moved missing-media notices inside the player. Audio controls used centred 520px expansion here, revised in v1.6.1.
- Added the final-check ownership prompt and synchronised style baselines, presenter protocols and three-language references.

## v1.5.1 (2026-10-11)

- Made `#aria` an off-screen live region: announcements remain accessible without visible text.
- Fixed volume-slider centring and hover dead zones; added alignment and reachability assertions.
- Switched annotation surfaces to solid `--ink-surface`; retained but stopped reading `--ink-tint`, with matching three-language token tables.

## v1.5 (2026-10-04)

- Added embedded images, sibling audio/video and lazy media loading; `image` / `audio` / `video` replace `media`, expanding the library to 54. Audio rests folded; controls provide volume, rate, seek, fullscreen and missing-file notices.
- Added an audience-only shared blackboard and surface-specific highlighter opacity (.30 on slides / .55 on board). Presenter mode now has four cards with persistent stacking order.
- Fixed the S export/popup conflict, download-link handling, nested fullscreen, 4:3 video overflow and audio-card sizing. Overview media became static placeholders.
- Added focus-scoped media keys, remote fullscreen, transport reachability and preview probes; left/right arrows always page.

## v1.4 (2026-09-27)

- Renamed `html-ppt` to `human-led-ppt`, added the human-led positioning and banner, and split README/changelogs by language.
- Added a draggable annotation button, annotation inside presenter mode, Q shortcuts, a timer banner and an overview card.
- Added full Japanese references and Japanese runtime copy.

## v1.3 (2026-09-26)

- Introduced six keyword families with 51 words. Every slide requires type/key/sec; declare 12–24 words per deck and use 5–11 per slide.
- Expanded page types to six groups, around 56 types; keep 6–8 per deck, at most two custom types. Resolved J–Q naming conflicts.
- Added comparison, concept and code examples. Figures trace from their actual fields, cross-field figures use a data index, and glossary notes are human-review-only.

## v1.2 (2026-09-25)

- Added presenter windows with bidirectional paging, remembered layout and N prompt fallback, plus eight light/dark templates J–Q.
- Added skeleton §7 prompts and presenter: off | on; reviewed prompts are copied into .notes.
- Documented assembly, accent-ink, image frames and overlays; optional --ink / --presenter paths now use bundled defaults with verification. Aligned step numbering.

## Credit and provenance

Layout and presenter interactions reference [HTML PPT Studio](https://github.com/lewislulu/html-ppt-skill). Design and methods informed the implementation; code was rewritten for this skill’s offline, assembly and prompt contracts. Full credits: [README](README.md#credits-and-license).
