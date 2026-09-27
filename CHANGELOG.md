# Changelog

**English** · [中文](CHANGELOG_zh-cn.md) · [日本語](CHANGELOG_ja.md)

The full version history lives here; the README keeps only a short summary of the latest release — see [README.md](README.md).

## v1.4 (2026-09-27)

- **Renamed `html-ppt` → `human-led-ppt`, and the positioning statement now leads**: this skill had
  been colliding with the upstream HTML PPT Studio installed under `.qoder/skills/` (also named
  `html-ppt`), so `/html-ppt` was ambiguous. The two are now distinct, and the old name resolves to
  the upstream one only. The positioning is stated consistently as a **human-led, agent-assisted
  design system for single-file HTML decks** — you own the topic, style and wording, the agent owns
  evidence, structure and build discipline — in `SKILL.md`'s `description` and its opening paragraph,
  in README's title line, and in the five brand comments under `assets/` plus the presenter popup's
  window name.
- **README's English section now mirrors the Chinese one**: it used to be prose paragraphs against
  the Chinese tables. It now carries the same eight-row "five steps, plus two optional layers" table
  (Step / What it does / Produces), and the three exceptions the optional layers bring are bullets
  rather than one long sentence, mirroring the Chinese one for one.
- **Four on-stage features (appended in this round, verified end to end on a real deck)**:
  ① **The annotation corner button is draggable, and the icon set is re-cut**: the corner button keeps
  its original slim pen glyph but can now be dragged — past 6px it parks and the position is
  remembered per deck under the `.fab` key, double-click resets it, a plain click still starts
  annotation. The toolbar's on/off button carries a **⏻ power glyph** (its action *is* closing the
  layer) and never takes the selected-state frame. The pen and highlighter icons were redrawn apart
  from each other — pen = slim diagonal body with a wavy stroke under the tip; highlighter = a
  self-drawn narrow 45° barrel with a cap divider, a chisel nib and a translucent band underneath —
  so they read apart at 17px. `assets/icon.svg` stays the skill's logo and is not embedded in the UI.
  ② **Annotate inside the presenter window**: the preview iframe already *is* the deck, so the fix
  only opens `pointer-events` on the current-slide card, adds an "Annotate" chip in the card header
  that drives the ink layer inside that iframe — no engine is copied and no second store exists.
  Strokes sync across windows via a revision protocol (`ink:change` / `ink-store` / `ink-cmd`),
  **last write wins**, and undo crosses windows too (a remote takeover becomes one `k:'*'` undo
  step). After each stroke the iframe hands the keyboard back with `parent.focus()`. The next-slide
  card stays inert.
  ③ **The `Q` shortcut panel**: the shell gains a `#deckhelp` dialog seeded with its own
  "paging & view" section; the ink and presenter layers push their key sections into
  `window.__deckHelp` at load, and the panel renders whatever is registered when it opens — a deck
  without the optional layers simply shows fewer sections. `Esc` closes it, every ink surface steps
  aside while it is open (sibling selectors), and it stays out of print.
  ④ **The presenter window is reshaped — fixed top banner plus an all-slide overview card**: the
  timer, page counter and prev / next / reset buttons leave the card system and become a full-width
  52px banner pinned to the top of the presenter window (element ids unchanged, so the wiring and
  the docs' self-check keep working). The freed bottom-left slot holds a new fourth magnetic card:
  every slide as a horizontal filmstrip of `?preview=N` iframe thumbnails, **virtualized** — only
  items near the strip's viewport are mounted (cap 8, the farthest evicted first) and the rest show
  page number + title. The wheel scrolls the strip, a click jumps both windows, the current entry
  carries an accent outline and is kept in view. Card-layout storage bumps `pv.v1` → `pv.v2` (the
  card set changed; old layouts reset once). The presenter's message handler now accepts `ink-state`
  from the current-slide iframe only — overview thumbnails carry the ink layer too when both
  overlays are installed.
- **README split three ways, and the version history moved out of it.** `README.md` is English-only now
  and leads with the positioning, the eight-row step table, what every deck ships with, install and use,
  the two optional layers, known limitations and the current release; the Chinese original moved to
  `README_zh-cn.md`, and a full Japanese translation was added as `README_ja.md`, each carrying a
  language switcher at the top. The v1.2–v1.4 history (about 60% of the old README) moved into
  `CHANGELOG.md` plus `CHANGELOG_zh-cn.md` / `CHANGELOG_ja.md`, leaving each README a short release
  summary. While splitting, the English side's missing `v1.2` heading was restored — its v1.2 entries
  had been sitting under the v1.3 heading, contradicting the Chinese side.
- **`references/ja/`, a full Japanese mirror of the step documents.** The same eight step documents and
  the same 17 files in `02-presets/` as `references/{zh,en}/`, structure for structure and without
  summarising; `SKILL.md` gained Japanese trigger words in its `description`, the `資料まとめ` /
  `HTML-PPT骨子` filename suffixes, and a Language line that now names all three trees.
- **The runtime chrome speaks Japanese too**: the shell (`Q` panel, slide announcement), the ink layer
  (toolbar, hint, help dialog, export file names) and the presenter window each gained a third string
  table, and the language pick became a zh / ja / en route off `<html lang>`, falling back to the
  browser language. Japanese wording follows the documentation canon (発表者ウィンドウ / 聴衆 / 筆跡 /
  注記). ja / zh / en test decks were run side by side: the Japanese chrome renders end to end, and
  the Chinese and English strings are unchanged.

## v1.3 (2026-09-26)

- **Step 4 §4: from one fixed field list to a keyword library with a per-deck declared set.**
  Each slide used to be written with exactly `type / key / data / visual / ask / lines / hint / sec`
  — eight words grown out of one deck archetype (multi-persona, question-chain, data comparison),
  so a teaching slide, a code slide and a defence slide had no vocabulary at all. Now the core three
  (`type` `key` `sec`) are mandatory and the rest come from **six families, 51 keywords**, 5–11 per
  slide: A positioning (`topic` `act` `role` `toc`), B text (`title` `sub` `points` `prose` `lead`
  `defs` `quote` `pull` `steps` `cast`), C data (`data` `table` `kpi` `compare` `bars` `line` `stack`
  `pie` `rank` `timeline` `formula` `code`), D visual (`visual` `layout` `media` `icon` `emphasis`
  `before-after` `diagram`), E argument (`missing` `evidence` `caveat` `counter` `analogy` `example`
  `takeaway` `action` `transition`), F delivery (`hint` `ask` `lines` `demo` `quiz` `task` `poll`
  `discuss` `handoff`). Every keyword states which DOM slot it renders into, and §5 copies that
  mapping table so the build still never has to guess.
- **The discipline is the declaration.** One `keywords: …` line above §4 lists the 12–24 words this
  deck uses (the deck-wide union; a slide still uses 5–11); a keyword outside that line may not
  appear on any slide, and adding one logs a §6 row. Five starter sets (teaching / data readout /
  defence / tech talk / pitch) serve as a copy sheet. Explicit rule: no personas → no `lines` /
  `role` / `handoff`.
- **Page-type library grew to 6 groups, ~56 types** (structural / data / argument / teaching /
  technical / research-and-pitch), still capped at 6–8 per deck, with at most 2 coined types. This
  also closes a pre-existing naming clash: layout templates J–Q each ship an "suits page types" hint
  in a different vocabulary (`stat-highlight` / `section-divider` / `big-quote` / `pros-cons` /
  `process-steps`). §4 now states those are capability notes, that §4 is the deck's one vocabulary,
  that the chosen names go into the keyword declaration, and that synonyms must not coexist.
- **Worked examples went from 1 to 3**: a data comparison page (with trailing `<!-- -->` glosses on
  every line), a persona-free concept page and a persona-free code page — one declared set, three
  completely different keyword fills.
- **A reviewer-facing legend that the agent is told to skip.** Skeletons get reviewed by people who
  never read this document, so §4 must open with a `>` block glossing, in plain speech, every keyword
  *this* deck declared — nobody has to look up `kpi` or `caveat` to review a draft. It costs no
  context: the block is fenced by the literal markers `⧉ 词表注释 起 / 止` (`⧉ legend start / end`),
  rule 4 of `05-build.md`'s "Before starting" tells the build agent to jump from one marker to the
  other and read nothing between (it is a copy of §4's library), and `06-verify.md` gained a grep
  proving it never leaks into the HTML. Where legend and `keywords:` disagree, `keywords:` wins.
- **A second pass after stress-testing the library** (three scenarios the doc never exemplified —
  an incident retro, a book club, a grade-4 science lesson — five slides each): ① added `missing`
  (what should exist but does not — the unwired alarm, the ruled-out hypothesis, a concept's negation;
  previously only `points` could take it); ② `compare` widened to **qualitative** distinctions
  (`dissolving ≠ melting`), which have no gap value to write; ③ added `discuss` for gathering audience
  views with no model answer (`quiz` and `poll` both demand one); ④ `action` gained "done looks like /
  current status" and a rule that past 4 rows the page belongs to `table`, never both — the old wording
  made a compliant slide impossible; ⑤ deleted `qa` (a near-verbatim duplicate of `hint`) and `claim`
  (self-defined as "expansion of `key`"); ⑥ `data` became an **index** (`which keyword's row → source`)
  instead of a re-typed value card; ⑦ the declared-set budget moved 10–16 → 12–24, with constraint
  dependants (`emphasis`, `data`) explicitly exempt from compression; ⑧ new picking rule 6 — `points`
  is not a fallback; ⑨ page types gained `cast` / `timeline` / `discuss`, and the pitch type `ask` was
  renamed `the-ask` because it meant the opposite of the keyword `ask`; ⑩ §3's own sample page order
  named "hook" and "cold open", types that do not exist in the library — it now requires real `type`
  names.
- **The evidence rule now follows numbers, not field names.** Any figure appearing in any keyword
  (including benchmark output inside `code`, and figures quoted in passing by `example` / `quote` /
  `counter` / `analogy`) needs value / unit / year / source and a matchable line in the source file;
  a `data` card is added only when numbers span two or more keywords. Updated in step with
  `05-build.md` (density), `06-verify.md` (per-slide reconciliation now counts `points`, `table` rows
  and `steps`) and `08-presenter-mode.md` (prompt figures). The core contract is unchanged.

- **Context optimisation (item 4, same round)** — duplicates and filler only, no information removed.
  ① `SKILL.md`'s `description` went from 1231 to 728 characters. It sits in the context of **every turn**
  whether or not this skill is used, so it is the one constant cost: the capability summary and both
  trigger lists stay, the detail inventories (paging keys, badge system) go — they already live in 04/05.
  ② `SKILL.md` body 9198 → 7232 bytes: the `en/…` / `zh/…` cell repeated in all eight workflow rows
  collapsed into one line ("each step reads `<lang>/NN-*.md`"), the 17-line prose resource inventory
  became an 8-row table, and the trap counts (10/8/8 — actually 12 in `05-build.md`) were dropped
  rather than corrected: a number you can count by opening the file only goes stale in an index.
  ③ **Step 2 restructured**: `02-style.md` went from 33KB to a 12.8KB index plus the 1.4KB preset you
  picked (58% less), with the 17 presets and templates split into `references/{zh,en}/02-presets/`.
  The blocks were cut mechanically on `### A.`–`### Q.` and are byte-for-byte unchanged apart from a
  one-line header pointing back at the index. Step 2 now reads ~14KB instead of 33KB.
  ④ Steps 04–08 were deliberately **left alone**: a cross-file duplication audit found only five
  repeated passages (526 characters total), all of them verification-script helpers that each step
  needs because each step loads exactly one document. That repetition is design, not noise — cutting
  it would cut rules.

## v1.2 (2026-09-25)

- **New step 8 · Presenter mode (optional)**: `assets/presenter-overlay.html` plus
  `references/{zh,en}/08-presenter-mode.md`. `S` in the audience window pops a separate presenter
  window with four magnetic cards (current / next / prompt / timer); both windows page in sync and
  card positions and sizes are remembered per deck URL. When the popup is blocked, `N` raises an
  in-page prompt bar instead. Supporting changes: `deck-shell.js` gained a `?preview=N` preview mode
  (`data-preview`, no overview, no hash, all paging input swallowed) and a `deck:go` event;
  `assemble.cjs` gained `--presenter`, usable alongside `--ink` in the fixed order ink → presenter.
- **Step 2 gained the layout-template catalogue (J–Q, 8 templates)**: each with a light **and** dark
  palette, a page-type list and the narratives it suits; every palette ratio is measured (worst case
  4.60:1). Plus the **five template disciplines** — colour only in `:root`, text on accent fills goes
  through `--accent-ink` rather than a literal, one theme = one look, compose existing page types
  (≤ 8) instead of inventing them, and every image is framed.
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
