# Step 6 (PPTX track) · Verify and deliver

> Read this file only when this deck's `target` includes `native-pptx`. The HTML track reads `06-verify.md`.

Order: **ask first** → spec check → artifact read-back → rendered review → number audit → delivery. If any item fails, go back and fix it; never hand over unverified work as finished.

## 0. Ask the user who runs the check

As on the HTML track, the first thing this step does is ask:

> The deck is written. For this final check, do you want **me to run it myself** (I run `lint`, `validate` and `issues`, review the per-slide screenshots, and hand you the pass list and the untested items), or do you want to **check it yourself** (I run only the spec check and the static cross-check, and leave the artifact read-back and screenshots to you)?

- The user says the agent runs it → go through the whole flow below.
- The user says they will check it themselves → still run **§1's spec check** (skipping it is a dereliction); §2–§4 follow the user's wish, and say which ones were not run.
- The delivery note must separate "actually tested" from "verified by the user".

## 1. Spec check (independent of the artifact)

```bash
node <skill dir>/assets/pptx/lint.cjs <topic>-PPTX-src.json <topic>.pptx --spec-only \
  --skeleton <topic>-PPTX-skeleton.md --sources <topic>-sources.md --report <topic>-PPTX-qa.md
```

What it checks:

- schema, slide count, page-type count (≤ 8); the `motion.transition` and per-slide `transition` tokens (the type must be in the 58-value whitelist, the direction/subtype legal, duration and speed never coexisting); each slide's `animation` `on`/`class`/`effect`/`direction`/`trigger` matching the effect×class matrix, and template exit effects carrying no `duration`;
- **motion discipline** (`motionPolicyErrors` in `lib.cjs`): `motion.discipline` is only `calm` / `story`; the default is `fade-400`; a non-base page turn must state `motion.why` or `transition_why`; under `calm` no expressive page turn, no `exit` / `motion` animation and no `repeat`; expressive and animated-slide counts stay inside budget and never adjacent; each animation ≤800ms; any animation that is not `entrance` must carry a `why`;
- all 8 theme tokens present; body/note text ≥ 4.5:1 against both bg and panel; large text ≥ 3:1;
- four-tier type ratios ≥ 1.4, body ≥ 22px, notes ≥ 14px;
- exactly 1 primary per slide, accent fill ≤ 1, warn ≤ 1, peer cards ≤ 4;
- the capacity of every text frame (if it does not fit it errors out instead of shrinking the type);
- image / media / poster files exist;
- data blocks (kpi/table/chart/compare/quote) must carry `source`;
- reconciliation with skeleton §4: slide count and page-type sequence;
- number audit: numbers in data blocks must be findable in the source notes (`numberWhitelist` only holds years/section numbers).

## 2. Artifact read-back

```bash
node <skill dir>/assets/pptx/lint.cjs <topic>-PPTX-src.json <topic>.pptx \
  --skeleton <topic>-PPTX-skeleton.md --sources <topic>-sources.md --report <topic>-PPTX-qa.md
```

`lint.cjs` automatically runs:

- `officecli query ... slide/shape/picture/table/chart/notes`: slide count, unique ids, every element inside the canvas;
- every slide's `transition` cross-checked against the spec token: a mismatched **type** fails outright (the spec wants `push-right` but the artifact reads `fade`); only `transitionDuration` / `transitionSpeed` / a direction or subtype failing to read back is recorded as a warning (the engine silently drops some suffixes); when the spec declares `animation`, the per-slide counts are compared with `officecli query animation` and one missing fails;
- `officecli query animation --compact` spot-check: the read-back values of `effect class trigger duration direction`;
- `notes` exist on slides that carry a prompt;
- `officecli validate`: exit 0, or exit 2 with `success:true`; exit 2 is recorded as a warning only;
- `officecli view issues --json`: any of `low_contrast` / `picture_aspect_distorted` / `broken_part_ref` fails.

You can also spot-check by hand:

```bash
officecli get <topic>.pptx "/slide[3]" --json          # transition / notes
officecli query <topic>.pptx animation --compact       # which elements the in-page animations hang on
officecli query <topic>.pptx media --compact           # is the media really embedded
officecli view <topic>.pptx outline                    # slide count and titles
```

Animation itself **cannot be verified from a screenshot** (a screenshot is a static frame); `query animation` only proves "the command was written and this is what reads back" — the delivery note must ask the user to run the deck once in PowerPoint for playback and click order.

## 3. Rendered review

```bash
officecli view <topic>.pptx screenshot --page 1 --out <topic>-shots/s1.png
officecli view <topic>.pptx screenshot --page 2 --out <topic>-shots/s2.png
# or one vertical strip in one go
officecli view <topic>.pptx screenshot --page 1-N --out <topic>-shots/all.png
```

- **Do not use `--grid`**: it needs a headless browser, and this machine has none.
- Look at each page and check:
  - the safe area on all four sides; no text cropped, no text running into the footer;
  - exactly one primary at first glance; the title visibly recedes;
  - accent in exactly one place, warn in exactly one place;
  - chart axes, units, years and data labels complete; table headers legible;
  - images undistorted; text still readable over a full-bleed backdrop after the scrim;
  - the bottom-right source present (data pages).
- A screenshot is officecli's HTML rendering path, not pixel-level proof from PowerPoint; that is the boundary of acceptance on this machine and the delivery must say so.

## 4. Number audit

Every number in a data block has to map to a line in the source notes; derived values say "derived from …", disputes carry ⚠️, second-hand carries 🔍. `lint.cjs`'s number audit can only check "did this string appear" — **whether the basis and the year are right still needs a human eye**.

## 5. Delivery note (template)

```text
Engine: officecli <version> (or: host plugin <name>, lower acceptance floor)
Artifacts: <topic>.pptx (N slides, M bytes); build spec <topic>-PPTX-src.json; QA <topic>-PPTX-qa.md
Tested: spec check / validate / issues / slide-count and page-type reconciliation / number audit / per-slide screenshots
Untested: the final look in PowerPoint (no PowerPoint on this machine; screenshots use officecli's HTML rendering path);
          please open it once in PowerPoint / WPS and confirm fonts and page turns.
Motion: page turns <spec token, e.g. fade-400; slide 6 push-right-600>; <K> in-page animations, spread over slides <list the page numbers>,
      click order follows reading order. Please page through it once in PowerPoint to confirm the playback — a screenshot shows no motion.
      Pictures and tables cannot carry animation (the engine supports shape/chart only).
Notes: slides 3, 5 and 7 carry speaker notes; PPTX notes are plain text, so emphasis from the HTML presenter window is not preserved.
Fonts: depend on <latin> / <ea> being installed on the delivery machine; a missing font gets substituted and the layout may shift.
Media: images / audio / video are embedded in the file; copy the single .pptx.
```

If `lint` reports warnings (for example the page-turn duration did not read back, the engine dropped a direction suffix, or a skeleton page type disagrees with the spec), list them one by one; never report a warning as a pass. Animation can only be proven "written in", never "good-looking" — that sentence has to appear in the delivery note; do not omit it.

## 6. Capability comparison with HTML

| Capability | HTML primary track | PPTX compatibility track |
|---|---|---|
| Size | one file, a few hundred KB | images/media inflate it; tens of MB is common |
| Agent iteration | plain text, saved and seen at once | edit the JSON, recompile — one extra step |
| Layout precision | CSS/SVG, pixel level | native objects, subject to fonts and PowerPoint layout |
| Aesthetic ceiling | higher: transparent overlays, non-standard grids, custom charts | constrained by the PowerPoint object model |
| Paging / overview / fullscreen | built in: G/F/keyboard/touch | whatever PowerPoint provides |
| Motion | CSS transitions + in-page keyframes, your own curves and durations, `prefers-reduced-motion` switches it all off | PowerPoint presets: 58 page turns with direction/duration, four in-page classes (entrance / exit / emphasis / motion path); no easing curves to choose, pictures and tables cannot carry animation |
| Screen annotation / blackboard | step 7's layer | none; use PowerPoint ink |
| Two-window presenter view | step 8's layer | none; use PowerPoint's presenter view |
| Deep links / portrait mask | yes | no |
| Media transport strip | built into the shell | PowerPoint native |
| Notes | `.notes` + emphasis in the presenter window | native notes, plain text |
| Editability | edit the source | native shapes/tables/charts are directly editable |
| Evidence-chain badge | interactive (enabled per deck) | static source footer + a sources page |

## 7. Known limitations (disclose as needed at delivery)

- **The motion capability comes from the engine; the boundary is drawn by discipline**: officecli can write 58 page turns (including `morph`) and four classes of in-page animation (entrance / exit / emphasis / motion path, with click triggers and delays). This track does not enable auto-narration / auto-recording; `morph` can be written but matches on same-named shapes, so in practice it mostly degrades into a plain page turn.
- In-page animation hangs only on `shape` and `chart`: **pictures, tables and media cannot carry it**; there are no CSS easing curves to choose, only PowerPoint presets and fast/med/slow.
- The playback of an animation cannot be verified on this machine (a screenshot is a static frame); `query animation` only proves it was written in.
- No editing or beautifying an arbitrary existing `.pptx`; this track only builds new from a skeleton (the recompile-after-review contract is `05b-pptx.md` §12).
- The template/master route is not part of v1; do not promise "apply our corporate template".
- Log axes, waterfalls and dual-unit charts degrade to a table or a simple bar chart.
- Without PowerPoint there is no pixel-level acceptance; screenshots only prove layout structure.
- Artifacts from the host-plugin route do not run this skill's lint, so the acceptance floor is lower.

## 8. Negative tests (rerun after any builder change)

```bash
# text overflow → build fails, naming need/hold
# unknown block → build fails, naming slide/block
# block unsupported by the page type → build fails (e.g. split-compare + image)
# missing image/media → build fails, naming the path
# low-contrast theme → lint fails with the ratio
# number absent from the source notes → lint fails, naming slide and number
# page-turn type does not read back → the builder deletes every transition and warns; only duration/direction missing → keep the effect and WARN
# unknown transition type (e.g. bogus-400) → lib errors out; mixing duration and speed (fade-fast-400) → lib errors out
# direction suffixes are type-specific: fade-up is accepted but reads back as fade (the builder warns per slide); circle-in / wipe-in are rejected by the engine → the whole batch rolls back and the build names the rejected commands
# the old motion object {transition:"fade",duration:400} → lib errors out and suggests changing it to "fade-400"
# an expressive page turn under calm (honeycomb-400 / cube) → lib errors out (story unlocks it)
# a push-right / morph / expressive page turn without transition_why → lib errors out; a deck-level non-fade turn without motion.why → same
# under calm: exit/motion animation, repeat, an animation over 800ms, or more than 1/3 animated slides or two adjacent ones → lib errors out
# an animation with class=emphasis/exit/motion and no why → lib errors out
# effect×class mismatch (spin + entrance / contract + entrance) → lib errors out
# a template exit effect carrying duration → lib errors out
# on selects no animatable element (e.g. on:content on a pure table page with no text) → build fails, no silent skip
# more than 6 animations on one slide → build fails
# deleting a slide's last animation by hand → officecli validate reports p:timing incomplete (so revoking an animation means editing the spec and recompiling)
```

Only when every one of these fails as expected is the change deliverable.

## 9. When the review says "not approved"

Step 0 asked who runs the check; whoever found the problem, the fix goes down the one road of `05b-pptx.md` §12: **edit `<topic>-PPTX-src.json` → recompile → rerun §1–§4** — never edit the artifact file.

- One round fixes only the places the user named; afterwards report the old and new QA reports side by side, and do not reorder the whole deck on the side.
- When the user has already touched this file in PowerPoint / WPS, **ask first** whether to "write the change back into the spec and recompile" or "spot-edit the artifact" — recompiling deletes the old and builds new, taking the user's hand-made animations with it (see §12).
- If only a number or the wording changed, fix the source notes and the skeleton first, then the spec; the wrong order creates a second truth.
