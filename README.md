<h1 align="center"><img src="assets/banner.svg" alt="human-led-ppt — a human-led, agent-assisted design system for single-file HTML presentations" width="1280"></h1>

**English** · [中文](README_zh-cn.md) · [日本語](README_ja.md)

A **human-led, agent-assisted** design system for single-file HTML presentations: you own the topic, style and wording; the agent owns evidence, structure and build discipline. Five steps settle all of that first — each leaves a file you can review — and the build starts only after you approve the skeleton.

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg) ![Version 1.5](https://img.shields.io/badge/version-1.5-blue.svg) ![Dependencies: none](https://img.shields.io/badge/dependencies-none-brightgreen.svg)

## What it solves

This skill builds an HTML deck in five steps. A single skeleton document pins down topic, narrative, style, evidence and per-slide structure across those steps, each leaving a file you can read and correct; only the approved skeleton becomes HTML. So the result stays strictly under the author's control and intent — no invented numbers, no improvised layout, and none of the navigation your audience expects is missing.

Every number and claim that reaches the HTML has to trace back to the source file. That is the core contract, and it is what the five steps exist to enforce.

## The five steps, plus two optional layers

| Step | What it does | Produces |
|---|---|---|
| 1 Topic & narrative | settle the central question, audience, duration, slide count and act structure | requirement block |
| 2 Style direction | 9 temperament presets (Fluent / Material 3 / OpenAI / Claude / Liquid Glass / Notion / anime / academic / playful) and 8 layout templates (J–Q) | style decision block |
| 3 Evidence base *(optional)* | evidence-gated research of the sources: disputed, second-hand and unreachable items are all clearly flagged | `<topic>-sources.md` |
| 4 Skeleton spec | the build specification: act structure, per-slide **keywords** (three core — `type` / `key` / `sec` — are mandatory, the rest 5–11 chosen from a 51-word library; each deck declares the 12–24 it uses), implementation notes, and speaker prompts for every slide | `<topic>-HTML-PPT-skeleton.md` — **awaits your review, §7 included** |
| 5 Build | produce the single-file HTML strictly from the skeleton | `<topic>.html` |
| 6 Verify & deliver | static checks, browser assertions, number audit, delivery note | tested items + untested items |
| 7 Screen annotation *(optional)* | for presenting, teaching or reviewing live: pen, highlighter, two eraser modes, annotations kept per slide | the same `<topic>.html` plus one layer |
| 8 Presenter mode *(optional)* | a second window: a fixed top banner (clock, page counter, prev / next / reset) plus four magnetic cards — current slide, next slide, this page's prompt, all-slide overview — both windows paging in sync | the same `<topic>.html` plus one more layer |

Step 3 runs only if the topic needs external data or you ask for research. Both optional layers come after verification, and step 4 is the one gate that never gets skipped.

## What every deck ships with

1280×720 proportional canvas · `G` thumbnail overview · Space / arrows / `Home`·`End` / digit paging · click either half · touch swipe · URL-hash deep links · `F` fullscreen · `Q` shortcut panel (the optional layers register their own sections into it) · mobile portrait mask · counting numerals · reduced-motion support · one slide per printed page · **media transport** (drag-seek bar, `,` `.` nudge ±1s, `[` `]` rate, mute).

**Images are inlined as base64** (`.img-frame` + `<img>`). **Audio and video are files in the same folder as the `.html`**, so they have to be copied along with that folder.

## Install & use

Copy the `human-led-ppt/` folder into your skills directory, reload the session, then run `/human-led-ppt` — or just ask for a deck about your topic.

The five step documents exist as [English](references/en), [中文](references/zh) and [日本語](references/ja) mirrors.

## Optional features

- **Screen annotation** (`assets/ink-overlay.html`): a tool for simple ink annotations directly in the HTML deck.
- **Presenter mode** (`assets/presenter-overlay.html`): add this layer when you need to present to an audience.

## Feature showcase

![Finished deck](/pic/1.png)

![Annotation system](/pic/2.png)

![Deck overview](/pic/3.png)

![Presenter mode](/pic/4.png)


## Known limitations

- The style presets approximate a brand's look rather than quoting official design tokens. Check against the brand guideline before changing anything, and re-measure contrast after any colour tweak.
- Third-party skill names mentioned in the references are a 2026-09-25 marketplace snapshot that was neither installed nor read — re-verify and get user confirmation before use.
- Every example in the docs is a placeholder (`<…>` / `……`). Never let one reach a finished deck or copy an example figure.

## What's new in 1.5

- **Media: images, audio and video can all be inserted.** Images are inlined as base64 so the deck stays one file; audio and video sit in the `.html`'s own folder, with one shell-injected strip below the picture — play / pause, a volume slider that pulls up from the loudspeaker, a thick PowerPoint-style scrub bar, the time, the rate, and fullscreen for video, plus `K` / `,` `.` / `[` `]` / `M` on the keyboard. The source attaches only when that slide first appears, and a missing file explains itself under the card.
- **An audio card rests as a small loudspeaker** (≈36px); it unfolds on hover, `Tab` focus or the first tap, and nothing jumps.
- **The presenter window**: clicking fullscreen in a mirror tile fills **the audience window** and starts playing there, while the tile keeps its own picture and lights a “Video fullscreen” badge that trusts only what the audience window broadcasts; a cross-window `requestFullscreen` is usually refused, so a CSS take-over stands by. The window also drops from five tiles to four (the blackboard card is gone) and its stacking is now persisted, fixing an enlarged current-slide tile sinking behind its neighbours.
- **Annotation blackboard (`B`)**: one button turns the whole page into a dark board (`--ink-board` is fixed at `#1D2A26` and deliberately does not follow the deck's palette) and the palette switches to five chalk pens (all measured ≥4.5:1 against the board, separated by hue rather than lightness); the board is one shared sheet per deck and lives in the audience window.
- **Highlighter**: alpha is per surface — `.30` on slides, `.55` on the board (`.30` over a dark ground only reaches 1.8–2.3:1); the icon is redrawn as a solid body, a real cap gap, a chisel tip and a colour band, so at 17px it reads apart from the pen at a glance.
- **Three new skeleton keywords** define where the file goes: `image` (base64, in the HTML) / `audio` / `video` (sibling file) replace the ambiguous `media`; the library grows from 51 to 54 words.
- **The skill self-checks for overflow**: 05-build states the rule that the card's height must include the strip, and 06-verify measures every media page and proves with `elementFromPoint` that the strip is really clickable — both have to be true.
- **A few defects fixed**: with annotation on, `S` both exported a PNG and popped the presenter window; clicking a video's fullscreen while the deck was already fullscreen exited it instead; and the shell treated the ink layer's export `<a download>` as an ordinary link, popping a window and stealing focus.

Full history: [CHANGELOG.md](CHANGELOG.md).

## Credit and provenance

The layout-template system and the presenter mode of v1.2 onward were modelled on [**`lewislulu/html-ppt-skill`**](https://github.com/lewislulu/html-ppt-skill) ("HTML PPT Studio") — its way of organising a template (one `:root` token set plus a fixed menu of existing page types, with `--accent-ink` and image-container rules) and its two-window preview, magnetic cards, prompt card and timer. **The reference is to method and interaction design, not code: nothing was copied.** Every piece was rewritten against this skill's own constraints — single file, zero external dependencies, layers appended before `</body>` and assembled by `assemble.cjs`, prompt text owned by skeleton §7 — and window sync was rebuilt on `postMessage` because `BroadcastChannel` is unreliable across `file://` opaque origins.

## License

MIT — see [LICENSE](LICENSE). Copyright holder: Makitoid Wang.
