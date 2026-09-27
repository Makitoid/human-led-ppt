<h1 align="center"><img src="assets/banner.svg" alt="human-led-ppt — a human-led, agent-assisted design system for single-file HTML presentations" width="1280"></h1>

**English** · [中文](README_zh-cn.md) · [日本語](README_ja.md)

A **human-led, agent-assisted** design system for single-file HTML presentations: you own the topic, style and wording; the agent owns evidence, structure and build discipline. Five steps settle all of that first — each leaves a file you can review — and the build starts only after you approve the skeleton.

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg) ![Version 1.4](https://img.shields.io/badge/version-1.4-blue.svg) ![Dependencies: none](https://img.shields.io/badge/dependencies-none-brightgreen.svg)

## What it solves

This skill builds an HTML deck in five steps. A single skeleton document pins down topic, narrative, style, evidence and per-slide structure across those steps, each leaving a file you can read and correct; only the approved skeleton becomes HTML. So the result stays strictly under the author's control and intent — no invented numbers, no improvised layout, and none of the navigation your audience expects is missing.

Every number and claim that reaches the HTML has to trace back to the source file. That is the core contract, and it is what the five steps exist to enforce.

## The five steps, plus two optional layers

| Step | What it does | Produces |
|---|---|---|
| 1 Topic & narrative | settle the central question, audience, duration, slide count and act structure | requirement block |
| 2 Style direction | 9 temperament presets (Fluent / Material 3 / OpenAI / Claude / Liquid Glass / Notion / anime / academic / playful) and 8 layout templates (J–Q); `02-style.md` is the index, and only the chosen preset's light **and** dark palette, type stack, motion and risks get read from `02-presets/X.md` | style decision block |
| 3 Evidence base *(optional)* | evidence-gated research: every figure carries year + source; ⚠️ disputed, 🔍 second-hand and ⛔ unreachable are all marked | `<topic>-sources.md` |
| 4 Skeleton spec | the build specification: act structure, per-slide **keywords** (three mandatory — `type` / `key` / `sec` — plus 5–11 per slide from a 51-word library; each deck declares the 12–24 it uses), implementation notes, and §7 speaker prompts | `<topic>-HTML-PPT-skeleton.md` — **awaits your review, §7 included** |
| 5 Build | produce the single-file HTML strictly from the skeleton | `<topic>.html` |
| 6 Verify & deliver | static checks, browser assertions, number audit, delivery note | tested items + untested items |
| 7 Screen annotation *(optional)* | for presenting, teaching or reviewing live: pen, highlighter, two eraser modes, annotations kept per slide | the same `<topic>.html` plus one layer |
| 8 Presenter mode *(optional)* | a second window: a fixed top banner (clock, page counter, prev / next / reset) plus four magnetic cards — current slide, next slide, this page's prompt, all-slide overview — both windows paging in sync | the same `<topic>.html` plus one more layer |

Step 3 runs only if the topic needs external data or you ask for research. Both optional layers come after verification, and step 4 is the one gate that never gets skipped.

## What every deck ships with

1280×720 proportional canvas · `G` thumbnail overview · Space / arrows / `Home`·`End` / digit paging · click either half · touch swipe · URL-hash deep links · `F` fullscreen · `Q` shortcut panel (the optional layers register their own sections into it) · mobile portrait mask · counting numerals · reduced-motion support · one slide per printed page.

Zero dependencies, zero network requests, and the core shell never touches `localStorage`. The deck opens from a bare `file://` path, offline.

## Install & use

Copy the `human-led-ppt/` folder into your skills directory, reload the session, then run `/human-led-ppt` — or just ask for a deck about your topic.

The five step documents exist as [English](references/en), [中文](references/zh) and [日本語](references/ja) mirrors; the agent works entirely inside the tree matching your language.

## The two optional layers

Both are **purely additive** — they never edit the slides — but each brings an exception worth knowing before you present:

- **Screen annotation** (`assets/ink-overlay.html`) stores strokes in the browser's `localStorage`, keyed by deck title, so a deck with it enabled is no longer "zero localStorage"; annotations stay out of print and PDF, and JSON export from the toolbar is your backup for another machine. The corner button is draggable (double-click resets it).
- **Presenter mode** (`assets/presenter-overlay.html`) keeps card layout in `localStorage` keyed by the deck URL — the prompts themselves live in the HTML's `notes`; it needs popup permission, and `N` raises an in-page prompt bar when the popup is blocked. Prompts never print, never reach the PDF, and are never visible in the audience window.
- Enabled together, the presenter window's current-slide card takes ink directly, and strokes sync across both windows in real time (last write wins, undo crosses windows too).
- A preview is the same file reopened with `?preview=N`, so entrance animations and count-ups inside a preview run once, at load.

## Feature showcase

![Finished deck](/pic/1.png)

![Annotation system](/pic/2.png)

![Deck overview](/pic/3.png)

![Presenter mode](/pic/4.png)


## Known limitations

- The style presets approximate a brand's look rather than quoting official design tokens. Check against the brand guideline before changing anything, and re-measure contrast after any colour tweak.
- Third-party skill names mentioned in the references are a 2026-09-25 marketplace snapshot that was neither installed nor read — re-verify and get user confirmation before use.
- Every example in the docs is a placeholder (`<…>` / `……`). Never let one reach a finished deck or copy an example figure.

## What's new in 1.4

- **Renamed `html-ppt` → `human-led-ppt`**, and the positioning — human-led, agent-assisted — is now stated the same way in `SKILL.md`, this README and the asset comments. The old name had been colliding with the upstream HTML PPT Studio, and `/html-ppt` now resolves to that one only.
- **Four on-stage features**: the annotation corner button is draggable and its icon set was re-cut so pen and highlighter no longer read alike at 17px; the presenter window's current-slide card takes ink directly, synced across windows by a revision protocol; the shell gained a `Q` shortcut panel that the optional layers register their sections into; and the presenter window is reshaped — timer and paging move into a fixed top banner, and a new fourth card is a wheel-scrollable, virtualized overview of all slides (layout key `pv.v2`).
- **README split three ways, changelog moved out.** This file is English-only now; the Chinese original moved to [`README_zh-cn.md`](README_zh-cn.md) and a full translation to [`README_ja.md`](README_ja.md), with a switcher at the top of each. The version history moved to [`CHANGELOG.md`](CHANGELOG.md) and its two mirrors, leaving each README a short release summary.
- **Japanese documentation mirror**: [`references/ja/`](references/ja) now carries the same eight step documents and the same 17 presets as the English and Chinese trees, structure for structure.

Full history: [CHANGELOG.md](CHANGELOG.md).

## Credit and provenance

The layout-template system and the presenter mode of v1.2 onward were modelled on [**`lewislulu/html-ppt-skill`**](https://github.com/lewislulu/html-ppt-skill) ("HTML PPT Studio") — its way of organising a template (one `:root` token set plus a fixed menu of existing page types, with `--accent-ink` and image-container rules) and its two-window preview, magnetic cards, prompt card and timer. **The reference is to method and interaction design, not code: nothing was copied.** Every piece was rewritten against this skill's own constraints — single file, zero external dependencies, layers appended before `</body>` and assembled by `assemble.cjs`, prompt text owned by skeleton §7 — and window sync was rebuilt on `postMessage` because `BroadcastChannel` is unreliable across `file://` opaque origins.

## License

MIT — see [LICENSE](LICENSE). Copyright holder: Makitoid Wang.
