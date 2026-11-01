# Step 1 · Topic and narrative

Goal: settle "who is watching, what is being said, for how long, and how it is organised" before anything is built. This step is discussion only — no files are written (the conclusion can be pasted to the user for confirmation and later copied into skeleton §0).

## Choose the delivery form first (fixed copy, paste verbatim to the user)

This skill's primary track is HTML; PPTX is compatibility delivery. **Do not default on the user's behalf** — copy the whole block below to them as-is (no abridging, no rewriting), and continue only after they have chosen:

```text
Before we start, choose the delivery form (there is no default here — you decide).
This skill's primary track is HTML; PPTX is compatibility delivery, so pick it only if you need a .pptx file.

A. HTML deck (this skill's primary track; recommended when the point is "to present")
   - Lightweight: one .html file, usually a few hundred KB, opens offline on double-click, zero dependencies, zero install;
   - Better for an agent to author: plain text, diffable, greppable, editable paragraph by paragraph; a revision takes seconds;
     PPTX is a binary package, so every change goes through a CLI/script and tracing a problem is more roundabout;
   - Higher aesthetic ceiling: CSS/SVG does precise layout, transparent overlays, non-standard grids,
     custom charts and restrained motion that native PPT objects struggle with; same design language, the HTML version usually looks better;
   - Exact 1280×720 layout; fonts, spacing and contrast verified page by page against this skill's hard constraints;
   - Built-in keyboard / click / touch paging, G thumbnail overview, F fullscreen, URL page memory, portrait mask;
   - Optional screen annotation (pen / highlighter / blackboard) and the presenter's two-window view (current page / next page / prompt / overview);
   - Media transport strip, counting numerals, one slide per printed page;
   - Cheap to revise: edit the HTML/CSS directly, screenshot it and review.
   - Cost: it is not a .pptx, cannot be edited shape by shape in PowerPoint, and any process that demands a .pptx will not accept it.

B. Native PPTX (.pptx; recommended when the point is "to hand in / someone else keeps editing")
   - Native shapes, text, tables, charts, images, media and notes, editable onward in PowerPoint / WPS / Keynote;
   - Each slide's notes are the speaker notes; page turns are selectable (uniform fade 0.4s by default, 58 other types available), in-page animation can be added page by page (images and tables cannot carry it);
   - Cost: no browser overview / annotation / two-window view / deep links / portrait mask; layout depends on the target machine's fonts;
     without PowerPoint on this machine, only structural checks + rendered-screenshot review are possible, and you have to open it once in PowerPoint for the final look.

C. Both
   - Build HTML and PPTX from the same skeleton; the design language matches, but every slide carries two sets of placement,
     so build and verification cost roughly doubles.

My recommendation: take A by default. Presenting live / class / review / needing annotation and two windows → A;
handing in work, entering a corporate template, someone else continuing → B; presenting live AND handing in a file → C.
```

Once the user has chosen, write `Delivery form: HTML | PPTX | both` into the requirement confirmation block below; the PPTX track switches to `05b-pptx.md` / `06b-pptx.md` from step 5 on.

## Five things to establish

Ask them all at once; do not drip-feed questions. For anything the user cannot answer, propose a concrete default and let them reply with only "change X".

1. **Topic and central question**: one sentence naming what the deck answers. The central question must be a question that can literally sit on one slide (e.g. "AI made intelligence cheap — what did it make expensive?"). A deck without one becomes a pile of material.
2. **Audience and setting**: class presentation / thesis defence / pitch / internal share / public talk. This decides information density, how much jargon gets explained, and whether a title/credit or division-of-labour page is needed.
3. **Duration and slide count**: minutes → slides. Rules of thumb: 40–60 s per narrative slide, 60–80 s per data-dense slide. 10 min ≈ 12–16 slides, 20 min ≈ 22–28. **Once agreed, write the count into skeleton §1 and do not exceed it during the build.**
4. **Structure and acts**: pick one pattern from the table below, give the slide range and duration per act, and fix which pages the four beats (hook / build / peak / release) land on.
5. **Material and credits**: existing data/documents/mandates? Signature, division of labour, appendix, source page required? Content that must appear or must be avoided?

## Choosing a narrative structure

| Pattern | Fits | Act skeleton |
|---|---|---|
| Problem intro → analysis → conclusion | class talks, argument-building (default recommendation) | cold open with a number/contrast → layered follow-up questions → positions converge + one open question |
| Conclusion first → three supports → action | pitches, defences, decision makers | one conclusion slide → evidence ×3 → risks and next steps |
| Timeline / evolution | history, technical surveys, retrospectives | starting point → turning point → present → fork |
| Side-by-side comparison | option selection, competitor, A vs B | portrait of each → same-basis comparison → when to pick which |
| Case series | experience sharing, teaching | case → extracted rule → what would you do |

For an interrogation-driven (focus-group) structure the engine is a question chain, and every slide advances it at least one link:
`what is the number → where does it come from → who produced it → does it hold with different boundaries → who pays the cost → is there a fix → is the trade worth it`

When different positions need different voices, use 2–3 codenames (e.g. ENG / LCA / POL): they appear on a rules slide and stay as a persistent bottom capsule. **The number of personas multiplies per-slide load — fewer is better.**

## Narrative arc (defined separately from structure)

Structure only answers "how many acts"; the arc answers "on which page the audience gets caught, and on which page they are persuaded". Every deck carries four beats, written into the requirement confirmation block:

| Beat | Job | Lands |
|---|---|---|
| hook | break the expectation: a contrast, a cost, a counter-intuitive number | first 20%, no later than page 3 |
| build | questions or evidence escalate, at least one step per page; a low point for breathing is allowed mid-way | the middle |
| peak | the strongest conclusion / the biggest cost / the biggest reversal | second half, **exactly one per deck** |
| release | back to the one line the audience can carry out, plus the boundary or the next step | last 2–3 pages |

- **No flat runs.** Three consecutive pages with the same function (all laying background, all reporting data, all drawing conclusions) is a pile of material: merge, reorder or cut.
- **Every act must change the answer to the central question.** By the end of the act the answer has moved from A to B — or the act says plainly "still unanswered, and here is where it is stuck". An act whose answer does not change merges into its neighbour.
- **The peak rests on evidence, not on volume.** A peak page stands on the hardest evidence or the biggest cost, never on a larger type size, a brighter colour or more motion.
- **Short decks still need hook and release.** ≤ 8 slides may skip a stand-alone build page, but never the hook or the release; a short deck with all four beats flat gets re-ordered too.
- **Time follows tension.** Give the peak page its full `sec`, squeeze transitions under 30 s; never spread the time evenly across pages.

## Requirement confirmation block (paste to the user)

```
Topic: <one line>
Central question: <the question that will appear on screen>
Audience/setting: <…>  Duration: <N> min → slide count: <M> (cover and sources included)
Delivery form: HTML | PPTX | both (chosen in the delivery-form question above; never defaulted for the user)
Structure: <three-act / conclusion-first / …>
  Act 1 s1–sX (function, duration)
  Act 2 …
  Act 3 …
Arc: hook sX (<one sentence>) → build sX–sY → peak sZ (<one sentence>) → release sX–sY
Narrative device: <question chain / comparison / timeline>; personas: <none | codename list>
Must appear: <credits, division of labour, mandated data, mandated cases>
Must avoid: <…>  Material: user-supplied | needs web research | mixed
Output directory: <path>   File name: HTML `<topic>.html`; PPTX `<topic>.pptx`; write both when both
```

Wait for confirmation before Step 2 (style). If the user says "you decide", fill the block above, paste it back as a record of the delegated decision, and continue.
