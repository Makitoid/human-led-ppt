# Step 4 · Agent-native skeleton (build spec)

Produce `<topic>-HTML-PPT-skeleton.md` or `<topic>-PPTX-skeleton.md`; for both formats, keep slide counts, types and figures aligned. The skeleton is the per-slide build specification; wait for user review when it is ready.

## File shape

```markdown
# PPT skeleton · <topic> (<narrative device>)

> This is a build spec for the agent, not speaker notes. Generate the finished deck strictly per §1 and §4 (the `target` in §1 decides HTML or native PPTX).
> Data may only be taken from `<topic>-sources.md`. **No number absent from that file may be invented**; if a slide needs new data, research and cite it first, then fill it in.

## §1 Build spec (YAML)
## §2 Narrative device        ← question chain / personas / house rules
## §3 Act structure           ← table + rendered page order + central question
## §4 Per-slide spec          ← declare the keyword set, then describe each slide by keyword
## §5 Implementation notes    ← agent checklist + self-check items
## §6 Changelog               ← append per revision; current state wins
## §7 Speaker prompts (optional) ← only when step 8 runs; last section, reviewed page by page
```

## §1 Build spec (YAML, field by field)

```yaml
deck:
  target: html-deck | native-pptx | both   # chosen in Step 1; decides which document steps 5/6 read
  format: single-file HTML | native PPTX   # matches target; write both when both
  filename: <topic>.html | <topic>.pptx    # per target; write both when both
  canvas: 16:9                      # HTML 1280×720; PPTX 960×540pt (13.333×7.5in)
  slides: <N>                       # must equal the number of entries in §3's rendered order
  language: <zh-CN | en>
  team_on_cover: <names>            # optional; include division of labour if that page exists
  navigation:                       # HTML-track hard requirement, see 05-build.md; PPTX uses PowerPoint's own
    - Space / → / ↓ / PageDown → next; ← / ↑ / PageUp → previous; Home / End → first/last
    - G → grid overview (thumbnail wall); F → fullscreen; digits 1-9 → jump; Esc → close overview
    - click left/right half of the screen to page; touch swipe
    - mobile portrait → show a "rotate to landscape" mask
  typography:
    cn: <font stack>                # from Step 2; PPTX names two installed fonts, latin + ea
    numbers: tabular-nums, hero numerals 72–120px
    min_body_px: 22
  hierarchy:                        # per-slide visual rank; the build implements this
    primary: per-slide (key | kpi | pull)   # exactly one primary per slide; keep one style per deck, never two in parallel on a slide
    scale: {claim: 48, title: 34, body: 24, meta: 14}   # adjacent ratio ≥ 1.4; KPI may run 72–120; PPTX 1px = 0.75pt
    accent_blocks_per_slide: 1      # accent fill cap
    warn_marks_per_slide: 1         # warn mark cap
  theme:
    light: {bg:"", panel:"", ink:"", muted:"", accent:"", warn:"", rule:""}
    dark: {…}                       # pick exactly one for the deck
    constraints: [<gradient fills, glassmorphism, stacked shadows, …>]
  charts: HTML inline SVG / pure CSS; PPTX native charts (2–12 categories, 1–3 series, linear axis), see 05b-pptx.md
  presenter: off | on (on = HTML runs step 8; PPTX is always off, §7 still goes into the native notes)
  footnotes: citation bar bottom-right of every slide, "source · year", HTML 9–11px; PPTX ≥ 10.5pt
  links: relative paths beside the .html only (subdirectories such as ./assets/ allowed); always target="_blank" rel="noopener"; external links http(s) only
  evidence_chain: off | on          # HTML serious decks add data-evidence="1"; PPTX uses a source footer + a sources page
  pptx:                             # only when target includes native-pptx
    engine: officecli | host-plugin # the conclusion of step 5's detect-engine.cjs; host-plugin names the plugin
    canvas: 16:9 (960×540pt)        # fixed; 4:3 and portrait are not supported
    fonts: {latin: <installed>, ea: <installed>}   # must be installed on the delivery machine
    motion: {transition: <a token, e.g. fade-400 / push-right-600 / morph>, discipline: calm | story, why: <one-sentence reason when not fade/cut>}
    animation: none | <slide>:<group>/<effect>/<class>[/why]   # per-slide opt-in, default none
    notes: from §7 (plain text, <strong>/<em> are stripped)
    evidence: <which slides the source footer covers + the sources page number>
  accessibility: ordered h1/h2 per slide; aria-live announcement on page change; body contrast ≥ 4.5:1
  motion: HTML entrance animation plays automatically on slide change, disabled under prefers-reduced-motion; PPTX page turns use a token string (default `fade-400`, changed only by the adjacent-page relation), in-page animation is declared per slide and off by default
```

`typography` / `hierarchy` / `theme` / `constraints` / `motion` are copied verbatim from Step 2's style decision block — do not reinvent them here. `hierarchy` is the build's first priority per page: settle the primary, then lay out the rest; a `scale` whose adjacent ratio falls below 1.4 fails outright. State the transition, duration, easing and in-page animation explicitly; the build follows them (the PPTX track has no easing curves to choose, only fast/med/slow and preset effects; the default is `fade-400` with in-page `none`, and a different page turn must be justified by the adjacent-page relation with the one-sentence reason written into `why`. Declare each slide's page turn and animation through §4's `transition` / `animation` keywords so they get reviewed together with the layout; under `calm` there is no expressive transition and no `exit` / `motion` animation — budgets are in `05b-pptx.md` §4). For a dark deck also confirm `deck-shell.css`'s `--ovl-bg / --ovl-ink / --ovl-card` (overview wall) were overridden to the same family.

## §2 Narrative device

Three things: the main method (e.g. problem intro → question → analysis → conclusion), the driving engine (the question chain; every slide advances at least one link), and the personas plus house rules (codename, role, one-line stance, and rules like "every number must say who measured it, which year, and how far the boundary runs").

Then one line of **tension curve**: `hook sX → build sX–sY → peak sZ → release sX–sY`. Exactly one peak per deck, in the second half; the hook no later than page 3; the release in the last 2–3 pages. A deck with no peak goes back to step 1 — do not improvise one inside the skeleton.

## §3 Act structure

| Act | Slides | Function | Tension | Time |
|---|---|---|---|---|

**Tension** may only read `low / mid / high`, and must satisfy: at least one `high` and at least one `low`; exactly one page is the peak and it is marked `high`; no two consecutive `high` pages, no three consecutive pages at the same level. Add one line under the table: `Peak: <one sentence>`.

Below the table, one line giving **the rendered page order**, e.g.
`1 cover / 2 act-divider / 3 kpi-hero / … / N references` — a plain-language name after the type is fine (`3 kpi-hero cold open`), but **whatever precedes it must be a `type` that exists in §4's page-type library**; "hook" and "cold open" as bare labels are not. Add the note "footer `NN / N` and `data-i` are renumbered in build order — never hand-write them". Then a standalone line with the **central question** (one for the whole deck).

Then one line of **answer change**: what the central question's answer becomes by the end of each act (`act 1: X → Y; act 2: Y → Z`). Merge acts whose answer does not change into their neighbour; the peak act must carry the biggest change of the deck.

## §4 Per-slide spec · pick the keywords, then fill the slide

There is more than one way to write a slide: a data-comparison slide runs on "figures + a chart", a teaching slide on "term + worked example + in-class quiz", a code slide on "snippet + line-by-line walkthrough", a defence slide on "method + evidence + limitation". So §4 is not one universal template — it is a **keyword library**. Three core keywords are mandatory on every slide; you then pick 5–8 more from the library per slide. **The order you write them in is the top-to-bottom build order of that slide.**

### Core three (mandatory on every slide)

| Keyword | Meaning | Constraint |
|---|---|---|
| `type` | Page type, see the page-type library below | Keep a deck to 6–8 types, otherwise you redraw a layout every slide |
| `key` | The slide's single claim | ≤ 8 words / ≤ 22 CJK chars, one per slide; renders as `.key` |
| `sec` | Time on this slide | Sum of `sec` across the deck ≈ the Step 1 budget; if it overshoots, drop keywords before cutting slides |

### Declare this deck's keyword set first

One line above the §4 slide entries, listing which keywords this deck uses (the core three included, 12–24 total; a single slide only ever uses 5–11 of them — this line is the deck-wide union, and it grows with the slide count):

```
keywords: type key sec topic title points data table compare bars emphasis ask hint
```

- **A keyword absent from this line may not appear on any slide in §4.** The build agent always faces one controlled vocabulary, never per-slide improvisation.
- Adding one mid-way: extend this line first, then log a §6 row "new keyword `xxx` (needed by s12)".
- Before adding, self-check: existing keywords that already express it win (a "小结" is `takeaway`, not a new `summary`). Once the deck is final, delete unused keywords from this line.
- **Trimming to fit the budget only ever removes words this deck genuinely never uses.** Words named by the hard constraints below are out of trimming scope: if a slide uses a strong colour it needs `emphasis`, if numbers span two or more keywords it needs `data`. Whether they are on this line is decided by the slides, not by the budget.

### The reviewer-facing legend (right under the `keywords:` line · humans read it, the agent skips it)

The skeleton gets reviewed by someone who has never read this document. So immediately under the `keywords:` line, add a blockquote explaining every keyword **this deck actually declared**, one plain sentence each. **The two ⧉ marker lines are mandatory, copy them verbatim**; the middle runs through §4's families in A→F order, listing only the declared words, like this (three families shown — fill in the rest the same way):

```markdown
> ⧉ legend start · for human review only, steps 5/6/7/8 never read this
> **The keywords this deck uses** (they never appear in the PPT)
> Every slide: `type` page type · `key` the one sentence this slide says · `sec` how long
> A position: `topic` which section (the on-screen eyebrow) · `toc` agenda entry
> C data: `table` table · `kpi` hero numbers · `data` figure index (off-screen, for the audit)
> F delivery: `hint` notes only you can see · `ask` the question you throw out · `discuss` open discussion
> Keyword order on a slide = top-to-bottom order on screen. Spot a word missing from this table and cross it out — I declared it late.
> ⧉ legend end
```

Four rules:

- **Explain only the declared words.** 12 declared → 12 glosses. Do not paste the whole library into the skeleton — the full table lives in this document, not in every deck; a second copy is a second truth.
- One sentence per keyword, ≤ 20 characters where you can, plain speech: write "notes only you can see", not "speaker metadata". Mention the `.notes` / `.key` slot only when it changes what the reviewer sees.
- **This block is human-only material: the agent does not restate it, reconcile it or build from it.** When step 5 reads the skeleton, jump from `⧉ legend start` straight to `⧉ legend end` and read nothing between them — those lines are a copy of §4's library, and reading them burns context for nothing. If a meaning is needed, come back to this document. The block is a `>` quote, produces no DOM, and any of its words appearing in the finished HTML is a violation.
- Keep it in sync when the user edits the set; when legend and `keywords:` disagree, **`keywords:` wins** — step 6 does not chase this, step 4 fixes the legend.

### The keyword library (six families; `★` = commonly used)

**A Positioning — what this slide is**

| Keyword | What to write | Where it lands |
|---|---|---|
| `topic` ★ | Section / theme name this slide belongs to, ≤ 12 chars | The `.act` text inside `.kicker` |
| `act` | Act marker ("Act III") | Same line, before `topic` |
| `role` | Function in the narrative: hook / advance / bridge / close | Cross-checked against §3, never on screen; **mandatory on hook / peak / release pages** |
| `toc` | Table-of-contents or agenda entry | Agenda slides only |

**B Text — what the audience reads** (together these *are* the on-screen text; there is no separate on-screen field)

| Keyword | What to write | Where it lands |
|---|---|---|
| `title` ★ | Slide title | `<h2>` |
| `sub` | Subtitle / qualifier ("priced at 2024 tariffs") | Small line under the title |
| `points` ★ | Bullet list, 3–5 items, ≤ 20 chars each, one idea per item | `<ul>` |
| `prose` | Body paragraphs, ≤ 2; only when reading beats scanning (long narrative, an excerpt) | `<p>`, ≥ `min_body_px` |
| `lead` | Lead-in: one sentence saying why this slide exists | Between title and body |
| `defs` | Term definitions as `term = definition`, 2–4 | Definition card |
| `quote` | Someone else's words, always with speaker + source + year | Blockquote + citation bar |
| `pull` | Pull quote, the emotional anchor, at most one per slide | Large text block |
| `steps` | Numbered steps, 3–6, each starting with a verb | Step strip |
| `cast` | Who's who: name + role + one-line stance (case walkthroughs, a book's characters, team split) | Person card |

**C Data — what proves it** (every keyword here is bound by the evidence rule below)

| Keyword | What to write | Where it lands |
|---|---|---|
| `data` ★ | This slide's figure **index**: `which keyword's which row → source · year`. **Never re-state the values** (that is a second truth and breaks picking rule 3); use it only when numbers span two or more keywords, and drop the line entirely when they live in one place | Audit anchor, not rendered directly |
| `table` ★ | Table: column names + 2–6 rows, stating each column's basis and unit | `<table>`, `tabular-nums` |
| `kpi` ★ | 1–4 hero numbers: value + unit + one line on "what it measures, and where its boundary sits" | 72–120px + `data-count` |
| `compare` ★ | Like-for-like comparison, two flavours: **quantitative** — each side's basis + the gap; **qualitative** — how two look-alikes are told apart (`dissolving ≠ melting`: one side gets a test, the other doesn't). Don't let "no numbers" leave you with no word | Two columns or a contrast bar |
| `bars` `line` `stack` `pie` | Bars (log scale across magnitudes) / line (indexed, start value folded into the x label) / stack or waterfall / composition | Inline SVG, label axes, units, years |
| `rank` | Ranking, Top N (N ≤ 6) | Rank strip |
| `timeline` | Timeline nodes: year + event + (optional figures) | Horizontal band |
| `formula` | Formula + meaning of every variable + one worked substitution | Formula block + variable table |
| `code` | Code snippet ≤ 12 lines, language named, the 1–2 lines that matter pointed out | `<pre>` + highlight class |

**D Visual — what it looks like**

| Keyword | What to write | Where it lands |
|---|---|---|
| `visual` ★ | Picture instruction: which chart, how axes are labelled, which block takes the warn colour | The build draws to it |
| `layout` ★ | Composition: columns, hierarchy, where the whitespace is ("left 40% title, right 60% chart") | Shapes `.slide-body` |
| `image` ★ | Photo / screenshot / illustration: content, licence, what the viewer must be able to see, **which block it lands in** ("full-height right column" / "small bottom-left"). **Inline it as base64 into the HTML** — the deck stays one offline file; a photo-scale file (>800KB) becomes a `visual` drawing instead. Two sources: a **web-searched** image has its origin + licence logged in the source file's "Candidate images" section, and this row just names "《file name》— licence/origin"; an **AI-generated** image uses the `draw` word instead — do not duplicate it here | `.img-frame` + `aspect-ratio` |
| `background` | **Full-bleed backdrop**: one image filling the whole page (third-party photo or generated) with text on top of it. State "whole page / cover or dividers only / which pages", origin and licence. **Only inline data: images are accepted** (`<section data-bg="data:image/…">`), with an optional `data-bg-scrim`; **keep it apart from `image`** — a backdrop is a ground, an illustration is a frame, so never drop a backdrop into the text flow as an `<img>`. A generated backdrop also starts as `draw` | `data-bg` + `data-bg-scrim` (the shell lays the ground and the scrim) |
| `draw` | **An AI-generated image**: write the generation prompt, aspect ratio, where it lands, and the rule that the user reviews it before generation. Also used when a searched image is switched to generated. **Put the prompt in the skeleton for the user to read before generating**; once approved, generate it and place it per `image` / `background` | declare `draw` → user approves → becomes `image` or `background` |
| `audio` | Audio: **file name (same folder as the html)**, content (what it is, which stretch matters). Never inlined | `.mp` player card (drag-seek / rate are generated by the shell) |
| `video` | Video: **file name (same folder as the html)**, content, what the viewer must be able to see. Never inlined | `.mp` player card |
| `link` | **Open a file**: visible text + relative path (same directory as the .html, may descend into `./assets/`) + one line on what the click shows. Only real local files, or a full http(s) URL; `#sN` is for in-deck jumps only. If you cannot name the file, do not write this word | `<a class="file-link" href="./file" target="_blank" rel="noopener">visible text</a>`; the assembler checks each file exists |
| `icon` | Icon semantics (an emoji is not an icon) | Inline SVG |
| `emphasis` ★ | The slide's single visual focal point: accent or warn, on which element | One strong colour per slide |
| `before-after` | Then vs now / patch vs fix / misreading vs correction | Two columns |
| `diagram` | Structure drawing: principle, architecture, flow, **attribution tree / 5-Why / fishbone** — which blocks, how they connect, arrow direction. Causal-chain nodes may be nouns (unlike `steps`, which demands verbs) | Inline SVG |
| `transition` | **This slide's page turn**: state "what relation it has to the previous slide" first, then the token — default `fade-400`; semantic advance takes `push-right-600` / `wipe-*`; the same object reshaping across pages takes `morph`; the fancy library only at an act opening or a key reveal, and it needs a one-sentence reason. Write it only when target includes native-pptx | `slides[].transition` + `transition_why` in `PPTX-src.json`; the HTML track ignores it |
| `animation` | **This slide's in-page animation**: which group moves (primary / title / content / cards / all) + class (`entrance` / `emphasis` / `exit` / `motion`) + a one-line job. Off by default; `exit` / `motion` only under story, with the reason in `why` | `slides[].animation` in `PPTX-src.json`; on the HTML track the shell owns the entrance animation and ignores this word |

> The motion keywords (`transition` / `animation`) are native-PPTX only; the HTML track follows the "animation and page turns" discipline in `05-build.md` and never writes these two words. Default is `fade-400` throughout with no in-page animation — change the effect only if you can say "what happened between these two slides".

> The media keywords divide by **file placement**: **images and backdrops are inlined** (`image` → `.img-frame` + `<img>`; `background` → `data-bg` filling the page), while **audio and video are sibling files** (`audio` / `video` → `.mp`, sitting next to the `.html`). A single-file HTML cannot carry tens of MB of media — base64 inflates it by another third and on `file://` the first paint waits for the whole data URL, so the deck simply will not open. The audio/video files therefore ship in the same folder as the `.html`; copy both, not just the html. Where they land on screen is still decided by `layout` and the keyword order — these words only declare "which media, which block, autoplay or not". The files opened by `link` are sibling files too — ship them with the `.html`; the assembler verifies each path and stops the build if one is missing.
>
> `draw` is the **one word for "the image is not in hand yet"**: it records only the prompt and the placement, and the user must see the prompt before generation; once generated it is rewritten as `image` (in the flow) or `background` (full-bleed). Images found by web search do not go through `draw` — they go straight into the source file's "Candidate images" section and are referenced by `image` / `background`.

**E Argument — how it convinces**

| Keyword | What to write | Where it lands |
|---|---|---|
| `missing` | **What should exist but does not**: the alarm nobody wired, the check that was never run, the hypothesis ruled out, the question left unanswered. Write "what is absent + what it cost" — this is half of every retro and a core move in teaching; do not shove it into `points` | Absence card, warn colour |
| `evidence` | What supports the claim, pointing at the specific row of `data` / `table` / `quote` | Cross-reference |
| `caveat` ★ | Limits and boundary conditions — "where this stops holding" | Small text + ⚠️ |
| `counter` | The strongest objection + how this slide answers it | Beside `evidence` |
| `analogy` | Analogy for an abstract mechanism (an analogy carries no data) | One line |
| `example` ★ | Concrete case or worked example: subject + situation + outcome | Case card |
| `takeaway` ★ | The one line the audience leaves with | Closing block |
| `action` ★ | Action items / next steps / fixes: who + what + by when, optionally "done looks like / current status", 2–4 rows. **Past 4 rows, or if a status column is needed, give the page to `table` instead — `action` and `table` never share a slide** (that is the same content written twice, which breaks picking rule 3) | Action list |
| `bridge` | How the next slide gets provoked (a question or a half-sentence); formerly named `transition`, a name now given over to the PPTX page-turn word | Near the footer |

**F Delivery — who says what**

| Keyword | What to write | Where it lands |
|---|---|---|
| `hint` ★ | Speaker note: what to stress, where people trip, how to answer the follow-up | `.notes` |
| `ask` | The question the host or speaker throws out | On screen **or** only in notes — pick one |
| `lines` | Persona dialogue (8–28 chars, no jargon explaining), **multi-persona decks only** | Persona capsule + dialogue |
| `demo` | Live action: steps + what should appear + fallback if it breaks | Demo slides |
| `quiz` | In-class question: prompt + answer + what it tests | Answer goes in `hint`, never on the slide |
| `task` | Hands-on task / homework: requirement + deliverable + deadline | Task card |
| `poll` | Show of hands / guess-then-reveal — **only when there is one right answer**, that is its line against `quiz` and `discuss` | Two beats |
| `discuss` | Open discussion / collecting views: the question + which answers you hope for + what you do with them. **No model answer; the speaker only gathers** | Discussion card, reactions land in `hint` |
| `handoff` | Passing to the next speaker | Split-author decks |

> Anticipated Q&A for a defence does not have its own keyword: write the question on that slide's `counter` and the answer in its `hint`.

### Starter sets by occasion (a starting sheet — still trim to what you actually use)

| Occasion | Keywords beyond the core three (`sec` is core, not repeated) |
|---|---|
| Teaching | `topic title sub defs example steps points visual layout emphasis quiz takeaway hint` |
| Data readout | `topic title kpi table compare bars data visual emphasis caveat takeaway action hint` |
| Defence / review | `topic title points data table compare evidence caveat takeaway action counter hint` |
| Tech talk | `topic title sub code diagram steps before-after demo example takeaway hint` |
| Pitch / persuasion | `topic title kpi quote pull points compare timeline image emphasis ask lines hint` |

**No personas → no `lines` / `role` / `handoff`.** Forcing dialogue into a single-voice deck just turns the one style above back into the only style.

### Picking rules

1. The core three are mandatory; pick the rest by page type, 5–11 keywords per slide in total.
2. Keyword order = top-to-bottom slide order; the build lays out DOM in that order.
3. One idea, one keyword: `points` **or** `prose`, not both; if you used `table`, don't re-copy those numbers into `data`; `takeaway` must not restate `key`.
4. Drop unused keyword lines entirely — no blanks, no "none".
5. `type` sets the default keyword combo for that page — **slides sharing a `type` share the same remaining keywords**. Eight names serve as both a keyword and a page type (`toc` `steps` `quiz` `task` `demo` `before-after` `caveat` `timeline`): in the `- type:` slot it is the page type, in a `- name:` slot it is the keyword's content, and seeing both on one slide is normal (`- type: steps` plus `- steps: 1./2./3.`). Rule 5 governs the second one.
6. **`points` is not a fallback.** Absent things go in `missing`, telling-two-things-apart goes in `compare`, a list past four rows or with a status column goes in `table`, audience voices go in `discuss` — ask "is there a word for this" before "can I bullet it". Dump everything into `points` and the expanded library might as well still be eight fields.

### Page-type library (`type` values, grouped by occasion)

- **Structural**: cover / toc / agenda / act-divider / two-column / cast / verdict / closing / references / thanks / team
- **Data**: data-contrast / data-cards / kpi-hero / table-showdown / chart-line / chart-bars / chart-stack / rank-list / breakdown
- **Argument**: split-compare / evidence-grid / case / counter-argument / caveat / framework / root-cause / next-steps / timeline / policy-timeline / lifecycle-strip / before-after
- **Teaching**: concept / definition / example-worked / steps / diagram-explain / quiz / task / discuss / recap
- **Technical**: arch-diagram / code-walkthrough / terminal-log / demo / pitfall / changelog / roadmap
- **Research & pitch**: related-work / method / experiment / results / ablation / limitation / contribution / problem / solution / market / traction / business-model / competition / the-ask

A slide genuinely fits no existing type → coin one, but it must enter §3 and the keyword declaration too, and a deck may coin at most 2.

**When step 2's template list uses different names**: each layout template J–Q ships its own "suits page types" hint under another vocabulary (`stat-highlight` ≈ `kpi-hero`, `section-divider` ≈ `act-divider`, `big-quote` ≈ the slide carrying `pull`, `pros-cons` ≈ `split-compare`, `process-steps` ≈ `steps`). Those names only say what that template lays out well. **§4 is the one vocabulary for this deck**: once the template is picked, write the chosen `type` names into the keyword declaration and don't mix synonyms (`kpi-hero` and `stat-highlight` in the same document is two truths), and log the renaming as one §6 row.

### How a slide looks

The first example carries trailing comments (`<!-- -->`) so someone meeting this vocabulary for the first time can read across. Writing them is optional — the reviewer-facing legend already explains the set once, so the last two examples show the compact form a real skeleton uses. **A comment never becomes HTML.**

```markdown
### s6 · Layer 3: unit cost is not total cost (comparison)
- type: split-compare            <!-- page type: same basis, two sides -->
- topic: Lifecycle cost           <!-- which section; renders as the eyebrow -->
- key: Cheaper per unit is not cheaper in total   <!-- the slide's one claim -->
- compare:                        <!-- all of this slide's numbers live here -->
  | Basis | What it counts | Ours | Comparator | source · year |
  |---|---|---|---|---|
  | Hardware only | Purchase price | <per-unit figure> | <figure> | <institution> · <year> |
  | Full lifecycle | Hardware + power + ops | <scale gap> | <figure> | derived from the row above — **label on screen as "we derived this from <basis>"** |
- bars: one main bar feeding three stacks of different height (low / mixed / high), y axis "¥/kWh·yr", x axis naming the three bases   <!-- which chart -->
- emphasis: the tallest post-reversal stack takes warn, everything else panel   <!-- where the slide's one strong colour goes -->
- ask: so "who is cheaper" depends on which stretch we count?   <!-- the question you throw out -->
- lines:                         <!-- persona dialogue; delete both lines in a single-voice deck -->
  - A: <8–28 chars, states a fact>
  - B: <8–28 chars, reframes it>
- hint: only the boundary moves here, don't open the tariff question; if pressed on the basis, jump to appendix s18   <!-- visible to the speaker only -->
- sec: 60s                       <!-- how long -->
```

```markdown
### s11 · What "marginal cost → 0" actually means (concept · no personas)
- type: concept
- topic: Three keywords
- key: It is copying that got free, not producing
- title: Marginal cost tending to zero
- defs:
  - marginal cost = what one more unit adds
  - copying cost = what handing the thing away again costs
- example: one model weight: training <figure>, calls 2–1,000,000 together <figure> — matches the "inference cost" row in the source file
- points:
  - "got cheaper" is the second one
  - the first did not get cheaper
  - conflate them and the conclusion is wrong
- visual: left-tall right-flat step chart: one tall column (training), a bar hugging the floor (copying), x axis "the Nth copy"
- quiz: ask live "what is the marginal cost of one slide deck" — tests whether the two costs stay separate; answer here only: <one line>
- hint: most will amortise training into "every copy"; when asked, name the basis first, then give both numbers
- sec: 90s
```

```markdown
### s14 · Why one click jumps the page (code · no personas)
- type: code-walkthrough
- topic: Three known traps
- key: Custom clickables must be excluded from the click test
- title: One line of stopPropagation
- code: the click test in `deck-shell.js`, JS, read lines 44 and 46 only
- steps:
  1. the shell treats each screen half as a page turn
  2. the term chip's click bubbles up to body
  3. so clicking a term turns the page
- before-after: before — clicking a term jumps ahead / after — it stays put, only empty space turns pages
- takeaway: anything clickable in an overlay has to swallow the event
- hint: don't run code live, play a 3-second capture; if asked "why not pointer-events" — "that kills text selection too"
- sec: 75s
```

Three slides off one declared set, filled with completely different keywords: the data slide uses `compare` / `bars`, the concept slide `defs` / `example` / `quiz`, the code slide `code` / `steps` / `before-after`. That is exactly why the set gets declared per deck.

Every `<…>` above is a placeholder: fill it from the source file, and never leave a bracket or an invented figure in the skeleton.

### Hard constraints per slide

- **The evidence rule follows the numbers, not the field name.** Anywhere a number appears in any keyword — `table` `kpi` `compare` `rank` `timeline` `formula`, benchmark output inside `code`, and figures quoted in passing by `example` `quote` `counter` `analogy` — it needs all four of value / unit / year / source, matchable to a line in the source file; derived values say "derived from …"; disputed gets ⚠️; second-hand says "via …" and gets 🔍. When numbers span two or more keywords, add a `data` line indexing them for the audit — "which keyword's which row → source", never a re-typing of the values; when they live in one place, don't.
- At most 4 numbers per slide; the rest go into `hint`. Genuinely need more → split the slide, or fold same-basis figures into one `table` row.
- Prefer comparison over prose; `visual` / `layout` / `diagram` must name the chart, the axis labels, the column widths and which block takes warn — "add a chart" or "make it clean" is not an instruction.
- **Exactly one primary per slide.** `key` / one `kpi` group / `pull` — only one may be the primary; two of the largest type sizes, two accent fills or two equally loud cards on one page = primaries fighting, rewrite the slide.
- **The title is the second tier.** `title` must not share size and weight with the primary, and must not outgrow it; only pages with no `key` (cover / divider / references / thanks) may let the title be the primary.
- **`emphasis` lands only on the primary**, and names which element plus accent or warn. One strong colour per page; a second colour of equal strength is no focus, and an emphasis on a 12px caption is no emphasis.
- **Equal peers, ≤ 4 cards.** Same-tier cards share one size, padding, radius and colour; to single one out, step it up one notch or give it the accent and recede the rest. Three or more equal peers → `table` / `compare` or split the slide.
- **Four-tier scale**: primary 48–60 (KPI 72–120) / title 34 / body 22–24 / note 12–15, adjacent ratio ≥ 1.4; a large-type preset scales the whole ladder by the same factor; a `24 / 22 / 20` ladder has no hierarchy and is rejected.
- **Rhythm must not flatten**: three consecutive pages with the same `role` (all building or all concluding) means the arc has collapsed — go back to §3. `role` is mandatory on hook / peak / release pages.
- Sum of `sec` must sit near the Step 1 time budget; overshoot by dropping keywords first, then slides.

> **PPTX track**: the single keyword → block kind mapping lives in `05b-pptx.md` §4; this section's "Where it lands" column is the HTML DOM slots and the PPTX build never reads it. There is one copy of the mapping — do not paste it into the skeleton.

## §5 Implementation notes

A numbered list the build step executes: DOM skeleton and class names, **the keyword → DOM slot map** (which element each declared keyword renders into — copy it from the "Where it lands" column of the §4 library so the build never has to guess; any coined keyword gets its own slot written here), **where §1 `hierarchy` lands** (primary → `.key` / the `.kpi` main number / `.pull`; title → `h2`; support → `.slide-body`; detail → `.kicker` / captions / `.foot`; exactly one primary per slide), data-presentation priority, persona-capsule visibility rules (only if `lines` / `handoff` made the set), how ⚠️/🔍 badges are used and where they are explained (the sources page), prohibitions (unsourced numbers, adjectives instead of evidence, estimates stated as findings, repeating a corrected misreading, two largest type sizes side by side), scaling and print, and **output plus self-check** (per slide: every number findable in the source file; navigation and keyboard work; no external requests; the known-tricky slide is worded correctly).

**When `target` includes `native-pptx`**: that DOM-slot list is replaced by `05b-pptx.md` §4/§5's **block kind + recipe** form — each slide states `type`, `key`, `blocks`, `source` and `notes`, and no HTML class names; slide count, page types and numbers still follow this skeleton.

## §6 Changelog

Append `change | note` rows with a date. Record ad-hoc user edits too (a slide added, a title changed, a chart reformatted), marked "current state wins". Whenever skeleton and HTML disagree, fix the skeleton.

## §7 Speaker prompts (optional · last section, made for review)

**Written only when step 8 (presenter mode) is enabled.** These are the lines the presenter window's prompt card will show. The agent generates them from each slide's `key` / its number-bearing keywords / `hint` / `ask` / `lines` in §4 and puts them **at the very end of the skeleton document**; only after the user has edited and approved them does step 5 move them verbatim into each slide's `<aside class="notes">` (hidden from the audience with `display:none`, never printed on the slide).

Three rules — break any one and rewrite:

1. **Signals, not a transcript.** Bold the core word (`<strong>`), mark the turn with `<em>`, and give each transition its own short paragraph (1–3 sentences). A version you could read aloud verbatim is useless — nobody reads on stage.
2. **150–300 characters per slide.** Below that you stall mid-sentence; above that you cannot scan it in time. Check against step 1's time budget: 2–3 minutes per slide is the comfortable rate.
3. **Speak, don't write.** "consequently" → "so", "the aforementioned solution" → "this approach", "will be optimised" → "we tuned it". Read it out loud once; if it sounds like talk, it passes.

Numbers stay under the source-file contract: every figure appearing in a prompt must have a matching source in whichever §4 keyword carries it on that slide (`data` / `table` / `kpi` / `compare` / `formula` …), and derived / ⚠️ / 🔍 wording has to be said out loud there too ("we computed this from X — the boundary is arguable"). **§7 is not a place to add new facts.**

```markdown
### s6 prompt (maps to §4 s6 · sec 60s)
- open: so on <strong>unit price</strong> alone we are 2.1× cheaper — which is exactly the claim today takes apart.
- turn: <em>move the boundary to the whole lifecycle</em>: the left bar counts hardware only, and once power and ops go in, the order flips.
- ask: so "who is cheaper" depends on which stretch we count.
- handoff (into s7): how is that boundary drawn? Next slide gives the rule.
```

Those four fields are the format: **open / turn / ask / handoff**, 1–2 short paragraphs each, 150–300 characters total. At build time they become `<p>` paragraphs inside that slide's `.notes`; in the card `<strong>` renders in the warn colour and `<em>` in the accent colour (see `08-presenter-mode.md`).

Nothing follows §7. If step 8 is not used, omit the section entirely and note "presenter mode not enabled" once in §6.

**The PPTX track** takes each slide's prompt from §7 too and writes it into the native notes; but the notes are **plain text** — `<strong>` / `<em>` are stripped and only the words remain. Step 8's two-window presenter layer serves HTML only; PPTX uses PowerPoint's built-in presenter view.

## Review gate (end of this step)

Send the user the skeleton path with a 3–5 line guide: slide count and total time, what each act does, which slides are hooks or dispute slides, which figures are derived or carry ⚠️/🔍, and the 2–3 things needing their call (e.g. "keep the news-hook slide?", "two personas or three?"). Say one more thing in the guide: **the "reviewer-facing legend" block at the top of §4 is their glossary — skim it before reading slide by slide, and any word it fails to explain is a gap in that block**. **If §7 exists, call it out separately in the guide: the speaker prompts start at line X of the skeleton — please check whether each one sounds like something you would actually say**, because only the presenter can fix that wording.

**Wait for approval or edits before Step 5.** Apply their edits into the skeleton file — not just into chat — and update the source file too when a figure changes.
