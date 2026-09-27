# Step 1 · Topic and narrative

Goal: settle "who is watching, what is being said, for how long, and how it is organised" before anything is built. This step is discussion only — no files are written (the conclusion can be pasted to the user for confirmation and later copied into skeleton §0).

## Five things to establish

Ask them all at once; do not drip-feed questions. For anything the user cannot answer, propose a concrete default and let them reply with only "change X".

1. **Topic and central question**: one sentence naming what the deck answers. The central question must be a question that can literally sit on one slide (e.g. "AI made intelligence cheap — what did it make expensive?"). A deck without one becomes a pile of material.
2. **Audience and setting**: class presentation / thesis defence / pitch / internal share / public talk. This decides information density, how much jargon gets explained, and whether a title/credit or division-of-labour page is needed.
3. **Duration and slide count**: minutes → slides. Rules of thumb: 40–60 s per narrative slide, 60–80 s per data-dense slide. 10 min ≈ 12–16 slides, 20 min ≈ 22–28. **Once agreed, write the count into skeleton §1 and do not exceed it during the build.**
4. **Structure and acts**: pick one pattern from the table below and give the slide range and duration per act.
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

## Requirement confirmation block (paste to the user)

```
Topic: <one line>
Central question: <the question that will appear on screen>
Audience/setting: <…>  Duration: <N> min → slide count: <M> (cover and sources included)
Structure: <three-act / conclusion-first / …>
  Act 1 s1–sX (function, duration)
  Act 2 …
  Act 3 …
Narrative device: <question chain / comparison / timeline>; personas: <none | codename list>
Must appear: <credits, division of labour, mandated data, mandated cases>
Must avoid: <…>  Material: user-supplied | needs web research | mixed
Output directory: <path>   File name: <topic>.html
```

Wait for confirmation before Step 2 (style). If the user says "you decide", fill the block above, paste it back as a record of the delegated decision, and continue.
