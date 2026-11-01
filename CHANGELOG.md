# Changelog

**English** · [中文](CHANGELOG_zh-cn.md) · [日本語](CHANGELOG_ja.md)

## v2.0.0b2 (2026-11-01)

- **PPTX motion gained a design discipline**: following [`hugohe3/ppt-master`](https://github.com/hugohe3/ppt-master) (MIT) — `fade-400` by default, in-page animation off by default, page turns chosen from the adjacent-page relation — the spec now carries `motion.discipline` (`calm` / `story`), `motion.why`, `slides[].transition_why` and `animation.why`. `calm` allows only base (fade / cut / none), directional (push / wipe / cover / pull / split / reveal) and identity (morph); expressive effects, `exit` / `motion` animation, `repeat` and any entrance over 800ms are rejected. Animated slides cap at a third of the deck and never sit next to each other; expressive page turns cap at 20% and never sit next to each other. Page-turn tokens are still validated verbatim against officecli 1.0.160's 58-value whitelist.
- **Build and verification follow**: `lib.cjs` gains `motionPolicyErrors`, which stops a spec that breaks the discipline before officecli sees a command; `lint.cjs` adds a discipline line to the QA report; `fixtures/demo.json` gains a `transition_why` and keeps serving as the motion read-back smoke deck.
- **Trilingual docs**: `05b-pptx.md` gains "pick the discipline first", the adjacent-page relation table and the budget table; `06b-pptx.md` gains the matching checks and negative examples; `04-skeleton.md` §1 turns `pptx.motion` into discipline + why, and §4 gains the `transition` / `animation` motion keywords (the old narrative `transition` word is renamed `bridge`).

- **The HTML track adopts ppt-master's design norms**: `05-build.md` gains a layout baseline (page closure, text roles, leading, density by viewing distance, contrast and semantic encoding, line breaks, alignment, visual weight, boundary strength, containers, titles/chrome), and motion becomes the same discipline as PPTX (crossfade default, page turn by adjacent-page relation, in-page motion opt-in, one semantic group, 200–800ms, no loops, chrome static); `06-verify.md` gains a link audit and a "2.5 Links" browser probe.
- **HTML hyperlinks open files in the deck's folder**: skeleton §4 gains the `link` keyword (visible text + relative path + `target="_blank" rel="noopener"`) and §1 a `links:` policy; the shell intercepts only http(s) (a new tab even in embedded previewers), leaves local files to native browser navigation without paging, and refuses `javascript:` / `vbscript:` / `data:`; `assemble.cjs` checks every linked file exists and stops the build when one is missing; `.file-link` is styled by the shell (accent underline + ↗).

## v2.0.0b1 (2026-10-31)

- **Native PPTX compat track**: `officecli` + a JSON page spec + a layout compiler producing editable native shapes / tables / charts / pictures / media / notes; page turns default to a uniform `fade` 0.4s, can be overridden per slide to one of 58 effects, and per-slide in-page animation is declared per page; double checks before and after the build (spec + reading the artifact back), plus `validate` / `issues` / per-page screenshot review.
- **PPTX motion opened up from "fade only" to optional**: the page-turn token is `type[-direction][-speed|ms]` (`fade-400` / `push-right-600` / `split-vertical-in` / `morph` / `none`); per-slide `animation` supports the four kinds — entrance, exit, emphasis and custom motion path — queued in reading order with one item released per click. The whitelist is taken verbatim from officecli's error text; pictures, tables and media cannot carry animation (their only parents are `shape` / `chart`), ≤ 6 per page. The old `{transition:"fade",duration:400}` spelling now errors and tells you to change it to `"fade-400"`. Transitions beyond fade and every in-page animation are verified only on officecli 1.0.160, so the builder refuses them on anything lower (a `fade-400` deck still builds).
- **Build and verification hardened to match**: `build.cjs` parses `officecli batch --json` and, if any command is refused, reports the first 5 reasons (the batch is atomic — reading only the exit code used to mistake a rollback for success); when the page-turn type still cannot be read back all transitions are removed, and only when the duration or direction suffix is dropped by the engine does it become a WARN; `lint.cjs` counts the animations per slide and warns when the finished file carries an animation that is not in the spec.
- **The rework-after-review contract is written into the docs**: the finished file is a compiled artifact and the only source of truth is `<topic>-PPTX-src.json`; if step 6 does not pass, edit the spec → recompile → re-verify. Recompiling deletes the old file and creates a new one, so anything the user hand-added in PowerPoint (including manual animations) is overwritten; once the file is delivered, ask first whether to "write back to the spec and recompile" or "make a small change on the finished file" (`05b-pptx.md` §12, `06b-pptx.md` §9).
- **Redrawn banner**: a larger wordmark and human-led promise on the left, layered HTML slides and an editable native PPTX card on the right, with the five-step workflow and approval gate along the bottom; same paper/ink-teal/amber palette, no gradients or web fonts.
- **HTML remains the primary track**: step 1 shows a fixed comparison block and lets the user choose HTML / PPTX / both — no silent default; the README leads with HTML's lightness, agent-friendliness and higher aesthetic ceiling.
- **Engine routing**: officecli is mandatory; Claude Code / Codex / ZCode prefer an installed host PPTX plugin and fall back to officecli; DeepSeek Harness checks for a plugin first; install the officecli binary only, never `officecli install`.
- **New files**: `assets/pptx/{detect-engine,lib,recipes,build,lint}.cjs`, `assets/pptx/fixtures/`, `references/zh|en|ja/05b-pptx.md` and `06b-pptx.md`; skeleton §1 gains `target` and a `pptx:` block.
- **Three-language README rewrite**: the structure is now "why HTML first → two delivery forms → five steps → PPTX compat track → install → capability table → limits".
- **Trilingual sync**: `references/zh|en|ja` 01 / 02 / 03 / 04 / 05 / 06 / 07 / 08, the new 05b / 06b, `SKILL.md`, all three READMEs and this changelog.

## v1.6.1 (2026-10-23)

Fixes around presenter mode, the audio strip, and visual hierarchy.

- **The audio strip unfolds to the right and is a further 20% shorter**: the unfolded bar grows to the right from the loudspeaker's position, its left edge does not jump, and the content is 416px wide (80% of the former 520px, about 438px outer). A centred unfold pushed the buttons out from under the pointer; that is fixed in the same pass.
- **The presenter window can remote-control media**: play / seek / rate / mute / volume in the presenter window's current-slide card act on the audience window's copy instead; the audience window broadcasts `paused/currentTime/duration/rate/muted/volume` back roughly every 250ms and the card's progress bar and icons follow. A video follows frame by frame, muted, inside the card, audio makes no sound in the presenter window, and operating the audience window itself moves the card too. Five new messages: `media-cmd` / `presenter-media-cmd` / `presenter-media-req` / `audience-media-state` / `preview-media-state`; the assertions live in the 05 / 06 / 08 docs.
- **Visual hierarchy is now a constraint, not a taste call**: each slide has exactly one primary (`key`, a KPI group, or `pull`), the `h2` is fixed at 34px on those pages, a four-tier ladder (48–60 / 34 / 22–24 / 12–15) replaces ad-hoc sizing, at most one accent-filled block and one warn mark are allowed, and peer card grids cap at four with only one card permitted to step forward. The rules live in 02-style, 04-skeleton and 05-build; a grayscale check catches a hierarchy that hangs on colour alone.
- **Contrast is measured for every text token**: `--muted` must clear 4.5:1 against both `--bg` and `--panel`, accent-as-text and accent-fill text are both measured, scrimmed backdrops are measured at their brightest point, and `opacity` is banned as a way to recede text. `06-verify` gains a per-page sweep that reports every failing text leaf and every surface it cannot measure.
- **The narrative must carry an arc**: step 1 now requires hook → build → peak → release; skeleton §3 gains a tension column (low / mid / high) with no two consecutive highs and no three pages at one level; every act must change the answer to the central question; hook / peak / release pages declare `role`; a deck with no peak goes back to step 1.
- **Three-language sync**: `references/zh|en|ja/01, 02, 04, 05, 06, 08`, `SKILL.md`, all three READMEs and this changelog were updated in the same pass.

## v1.6 (2026-10-14)

- **The style library grows from 17 to 22 presets.**
  - **R Electronic magazine** (distilled from `op7418/guizang-ppt-skill`): serif display + sans body + mono metadata, five e-ink palettes (Ink Classic / Indigo Porcelain / Forest Ink / Kraft Paper / Dune) — pick one, no custom hex.
  - **S Bold Signal / T Creative Voltage / U Terminal Green / V Notebook Tabs** (distilled from `zarazhangrui/frontend-slides`, MIT © Zara Zhang): four complete systems, each with its own palette, type and signatures. Its Swiss Modern and Paper & Ink are left out — they overlap A/H and C.
  - **C/D/F/G lose their brand names**: OpenAI → Paper-neutral, Claude → Editorial, Notion → Doc-list, Anime → Manga.
- **New `background` keyword (full-bleed backdrop)**: `<section data-bg="data:image/…" data-bg-scrim="…">`, the shell lays the ground and paints the scrim and the content lifts to `z-index:1`. **Only inline data: images are accepted** — the deck stays one offline file, and an external URL is refused with the slide named. A backdrop is a ground, kept apart from `image`'s frame.
- **Step 3 gains an image module**: a new "Image assets" / "Candidate images" section — web images are downloaded and registered (file / content / source URL / licence / placement), unclear licences flagged ⚠️, external hot-links disallowed.
- **New `draw` keyword (generated image)**: the AI prompt, aspect and placement go into the skeleton, the **user reviews the prompt first**, then it is generated and rewritten as `image` or `background`. The keyword library grows from 54 to 56.
- **The evidence chain is a per-deck choice, not a hotkey**: the bottom-right badge is decided while writing — skeleton §1 `evidence_chain: on` on a serious deck (defence / research / data report / review) makes the build set `data-evidence="1"` on `<html>`/`<body>` and the shell builds a visible badge; a casual deck writes nothing and the corner stays clean. It recounts each page's `.foot` sources into one chip, a click lists them, and it never fabricates.
- **A missing-media message moved inside the player box**: when a video/audio file cannot be loaded, the box itself says "Video not found" / "Audio not found" (`data-state="error"` hides the picture and the bar, leaving `.mp-missing`) instead of a note under the card; the longer "put the file next to the .html" hint moves to `title`.
- **A shorter audio strip**: the audio transport now unfolds into a **compact centred bar** (`min(100%,520px)`) instead of the full card width, so the scrub line is shorter and easier to aim at.
- **Step 6 asks first**: the first thing step 6 does is ask "do you want me to run the check, or will you check yourself", and the answer decides whether the assertions run; the static checks always run. The SKILL workflow table's step-6 gate now reads "ask first".
- **Recommended-skill table re-verified on 2026-10-14**: `entur-accessibility` is no longer listed, replaced with `boisenoise-antigravity-wcag-audit-patterns`; `cognitive-design` corrected to `lyndonkl-cognitive-design`; the rest confirmed present via the platform's search.
- **Three-language sync**: `references/zh|en|ja/02–06`, `SKILL.md`, all three READMEs and this changelog were updated in the same pass.

## v1.5.1 (2026-10-11)

Three fixes, all found while presenting a real deck rather than in review.

- **The page-turn announcement no longer paints on the slide.** The shell writes "Slide N: …" into `#aria` for screen readers, but nothing ever hid it, so the sentence sat in the top-left corner of every deck. `#aria` is now a proper off-screen live region (1px, `clip-path: inset(50%)`, moved out of the viewport) — still announced, never visible.
- **The volume slider is centred, and its popover reaches the button with zero gap.** Two separate bugs made it unusable with a mouse: a `writing-mode: vertical` range parks its thumb on the inline edge, so the handle read as off-centre inside the popover; and the popover floated 8px above the loudspeaker, so crossing that gap dropped `:hover`, closed the popover mid-travel and left the slider ungrabbable — the workaround people found was tapping the loudspeaker first, which pins it open via `[data-vol]`. The slider is now a horizontal range rotated `-90deg` (value still grows upward) and the popover sits at `bottom: 100%`, with the visual lift moved into `padding-bottom`, so continuity is structural rather than hover-dependent.
- **The annotation toolbar is one flat colour.** It used to stack a top tint gradient and a fractal-noise sheet on the acrylic base; on light decks the gradient read as a dirty band across the bar. `--ink-surface` now carries the whole colour, and `--ink-tint` is retired — still declared so decks assembled before this change keep parsing, but no longer read.
- **Docs kept honest**: `07-annotation` reads ten custom properties instead of eleven (zh / en / ja), and `06-verify` gained the assertions that would have caught the volume bug — set `data-vol="1"`, then `elementFromPoint` every 2px upward from the button’s top edge and every probe must land on `.mp-volpop` (falling back to `#stage` means there is a dead band), plus `|pop centre − wrap centre| ≤ 1px`.

## v1.5 (2026-10-04)

- **Media: images, audio and video, all three done in one round.**
  - **Images are inlined as base64** (`.img-frame` + `<img>`), so the deck stays one file and still opens after you copy it somewhere.
  - **Audio and video ship as sibling files next to the `.html`**: the shell scans `[data-mp]`, injects the transport bar and **defers attaching the source until that slide first appears**, so the opening never downloads 30 MB for a slide that was never played. **Do not base64 them either**: it grows the file by roughly a third, and on `file://` the browser has to finish decoding that string before the first frame.
  - **One strip** below the picture carries it all: play / pause, a **continuous volume that pulls up from the loudspeaker** (dragging to zero mutes), a **thick PowerPoint-style scrub bar** you can drag, the time, a `0.5×–2×` rate, and **fullscreen** for video; the keyboard adds `,` `.` nudge ±1s, `[` `]` rate and `M` mute, and clicking the picture plays. **There is no "select a segment and loop"** — it was tried, judged unnecessary, and cut this round.
  - **Keys do not overreach**: `K` is the global play/pause for the slide's media; the other media keys apply only while focus sits inside the transport (then `M` is mute, not the highlighter, and `[` `]` is the rate, not pen width); **`←` `→` always page**, so leaving the slide pauses it and rewinds to zero.
  - **An audio card rests as a small loudspeaker** (≈36px); the strip unfolds on hover, `Tab` focus or the first tap, and folds back when a touch lands outside the card or the slide is left.
  - **A video in a presenter-window mirror tile can go fullscreen too**: clicking fullscreen inside the tile makes **the audience window itself** fill the screen and start playing; the tile's picture does not change and a "Video fullscreen" badge lights up in its corner. The audience window holds the truth, so the badge never desyncs. A cross-window `requestFullscreen` is usually refused, so the shell also keeps a CSS take-over as a fallback.
  - **A missing file says it in human words**: under the card it writes "media file X not found — audio and video must sit in the same folder as this .html".
- **Three new skeleton keywords**: `image` / `audio` / `video` define **where the file goes** (the old ambiguous `media` word is retired); every row states its landing spot, `.img-frame` or `.mp`, and word order plus `layout` decide where it sits on the page. The library grows from 51 to 54 words.
- **Annotation blackboard (`B`)**: the whole page becomes a dark blackboard with the slides folded away, writing goes straight onto the board, and `B` brings you back. The surface is `--ink-board` (`#1D2A26`), **deliberately not derived from the deck palette**; the palette switches automatically to a chalk set (`#FF8F87` / `#FFD86B` / `#7FE3D6` / `#F2F5F1` / `#9EC6FF`, all measured ≥4.5:1 against the board; on this dark ground every pen separates by hue rather than lightness). The board is **one shared storage key, not split per page** — keying it per page would carry the writing away on every page turn. It lives in the audience window only; the presenter window no longer carries a fifth board tile.
- **Highlighter**: its alpha is **per surface** — `.30` on slides, `.55` on the board (`.30` over a dark ground only reaches 1.8–2.3:1, too little); the icon is redrawn as a solid body, a real gap between cap and body, a chisel tip and a colour band under the tip, so at 17px the two are told apart at a glance.
- **Fixed the `S` key conflict left by 1.4**: with annotation on, `S` exported a PNG **and** popped the presenter window. The ink layer now uproots its own keys on the capture phase, so with annotation on `S` only exports and you press `A` or the bubble first to open the presenter window.
- **Fixed the link fallback**: the shell's "every link opens in a new tab via `window.open`" also swallowed the ink layer's export `<a download>` — popping a new window holding a multi-MB `data:` URL and stealing focus. The shell now lets the `download` attribute through.
- **Fixed nested fullscreen**: with the deck already fullscreen, clicking the video's fullscreen used to exit and then request, which Chrome refuses, so the button looked like it "exits fullscreen". It now calls `requestFullscreen` on the card directly, so `Esc` returns to the deck's fullscreen, and the shell stands down from every paging key while a media card owns the screen.
- **The presenter window is four tiles now, with its stacking fixed**: the fifth 「blackboard」 card is gone. Cards used to be raised only while dragged or resized and dropped back on mouseup, so enlarging 「Current」 sank it under its neighbours; stacking is now persisted and bumps on mousedown.
- **Three media problems found and fixed in this round's own testing**: a `4:3` clip overflowed the card at its intrinsic size; an audio-only page's blank panel collapsed to the strip's own height; and the overview wall's full-page clone gave every media thumbnail a dead control bar plus a second media element (a screen reader met 16 fake buttons) — now a static placeholder, so `[data-mp]` counts live players only.
- **Overflow is caught by the skill, not clamped by the shell**: a runtime clamp was built first and rejected — it hides a build error. Instead 05-build states the rule (**the card's height must include the strip**) and 06-verify measures every media page's height and proves with `elementFromPoint` that the strip is really clickable.
- **The `Q` shortcut panel now lists the media keys**: it gained `M`, says that `,` `.` `[` `]` `M` `Space` need focus inside the transport, and marks `K` as the one global media key.
- **Three probe traps written into the verification step**: scope media selectors to `#stage`; dispatch transport-scoped keys **on a control inside the bar** (a synthetic event fired at `document` has no `[data-mp]` ancestor, and the shell ignores it by design); on `file://` the built-in browser strips the query string, so test preview mode over `http://localhost` or by opening the presenter window once. Two build-side traps as well: the thumbnail chip belongs to the shell, so never author styles for it; and every slide that reuses an inlined image adds a second copy of the base64 (a 366 KB screenshot is a 488 KB string).
- **Three-language sync**: `references/zh|en|ja/05–08`, `SKILL.md`, all three README files and this changelog were updated in the same pass.

## v1.4 (2026-09-27)

- **Renamed `html-ppt` → `human-led-ppt`, and the slogan is now the positioning**: a human-led,
  agent-assisted design system for single-file HTML PPT.
- **README's English side now matches the Chinese one**: it used to be prose paragraphs; it is now in sync.
- **Four on-stage features (appended in this round, verified end to end on a real deck)**:

  ① **The annotation corner button is draggable, and the icon semantics are re-cut**: the annotation
  button can now be moved, and the toolbar's on/off button became a ⏻ power glyph.

  ② **Annotate directly inside the presenter window**: strokes sync across windows through the
  revision-number protocol, so annotation works in presenter mode.

  ③ **The `Q` shortcut panel**: a shortcut panel was added — press `Q` and a sheet opens listing every
  shortcut this HTML-PPT has.

  ④ **The presenter window is reshaped**: the timer and the control buttons became a fixed top banner.
  An all-slide overview tile was added.

- **README slimmed down**: `README.md` keeps English only, and the changelog was split out in the same pass.

- **A banner at the head of the README**: `assets/banner.svg`.

- **`references/ja/`, a full Japanese mirror of the step documents**: the skill documentation now exists in Japanese.

- **The runtime text gained a third language**: Japanese support was added to the runtime.

## v1.3 (2026-09-26)

- **The keyword set was optimised**:
  the core three (`type` `key` `sec`) are mandatory and the rest are 5–11 words per slide picked from
  **six families, 51 keywords** — A positioning, B text, C data, D visual, E argument, F delivery and
  interaction, 51 in all.

- **The declared set**: one `keywords: …` line above §4 lists the 12–24 words this deck uses; five
  **starter sets** (teaching / data readout / defence / tech talk / pitch) serve as a copy sheet.

- **Page-type library grew to 6 groups, ~56 types** (structural / data / argument / teaching /
  technical / research-and-pitch), still capped at 6–8 per deck, with at most 2 coined types.

- **Closed a pre-existing naming clash**: fixed the "suits page types" list each layout template J–Q
  carries; synonyms must not coexist in one deck, and a rename is logged in §6.

- **Worked examples went from 1 to 3**: a data comparison page, a persona-free concept page and a
  persona-free code page — one declared set, three completely different keyword fills.

- **The evidence rule now follows numbers, not field names.** Any figure appearing in any keyword
  (including benchmark output inside `code`, and figures quoted in passing by `example` / `quote` /
  `counter` / `analogy`) needs value / unit / year / source and a matchable line in the source file;
  a `data` card is added only when numbers span two or more keywords. Updated in step with
  `05-build.md` (density), `06-verify.md` (per-slide reconciliation now counts `points`, `table` rows
  and `steps`) and `08-presenter-mode.md` (prompt figures). The core contract is unchanged.

- **The keyword legend**: §4 opens with a `>` block glossing, in plain speech, the keywords this deck
  declared. Where the legend and the `keywords:` line disagree, `keywords:` wins; worked example 1 also
  carries trailing `<!-- -->` glosses per keyword, which likewise produce no DOM.

- **Context optimisation (item 4, same round)**: the skill's structure was optimised and slimmed,
  reducing the size of the skill.

## v1.2 (2026-09-25)

- **New step 8 · Presenter mode (optional)**: `assets/presenter-overlay.html` plus
  `references/{zh,en}/08-presenter-mode.md`. `S` in the audience window pops a separate presenter
  window with four magnetic cards (current / next / prompt / timer); both windows page in sync and
  card positions and sizes are remembered per deck URL. When the popup is blocked, `N` raises an
  in-page prompt bar instead.

- **Step 2 gained the layout-template catalogue (J–Q, 8 templates)**: each with a light **and** dark
  palette, a page-type list and the narratives it suits.

- **Skeleton gained §7 · Speaker prompts (optional)**: generated by the agent from each page's §4
  fields and listed **at the very end of the skeleton document**; only after the user reviews and
  edits it does step 5 move each page's text verbatim into `<aside class="notes">`. §1 gained a
  `presenter: off | on` switch.

- **Step 5** picked up the assembly example for both layers, the `.notes` ← §7 landing rule, the
  text-on-accent and image-container requirements, and traps 11 (overlay clicks must
  `stopPropagation`) and 12 (`?preview=N` belongs to the shell — leave it alone).
- **Step 6's delivery note** now includes which optional layer was enabled and the exception it brings.
- **More forgiving assembler flags**: `--ink` / `--presenter` may be written bare and then default to the
  overlay file sitting next to the script. Previously a missing path silently skipped that layer and still
  reported `OK`, producing a deck without it; both spellings now yield byte-identical output.
- **Fixed a numbering conflict**: the README used to call the ink layer "step 6", contradicting
  SKILL.md's workflow table. Both now read 5 build / 6 verify / 7 annotation / 8 presenter mode.

## Credit and provenance

The two additions in v1.2 — presenter mode and the layout-template catalogue — were modelled on
**[`lewislulu/html-ppt-skill`](https://github.com/lewislulu/html-ppt-skill)** ("HTML PPT Studio").
The way its design templates are organised — one template = one `:root` token set plus a fixed menu of
existing page types, with `--accent-ink` and image-container rules — comes from its template system;
the two-window preview, magnetic cards, prompt card and timer interaction model comes from its presenter
mode. **The reference is to method and interaction design, not code: nothing was copied.** Every piece
was rewritten against this skill's own constraints — single file, zero external dependencies, layers may
only be appended before `</body>` and assembled by `assemble.cjs`, and prompt text remains owned by
skeleton §7. Window sync was rebuilt on `postMessage` (with an `opener → parent` fallback) instead of
`BroadcastChannel`, because `BroadcastChannel` is unreliable across `file://` opaque origins.
