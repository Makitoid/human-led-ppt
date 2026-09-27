# Step 3 · Evidence base

Run this step only when the user asks for web research, or when the topic needs external facts/data. Output: `<topic>-sources.md` (Chinese convention: `<主题>-资料总结.md`), the single data source for Steps 4 and 5.

## Evidence procedure

1. **Write a retrieval plan** from the Step 1 act structure: list the numbers needed (1–4 per slide), separating "must have a primary source" from "direction is enough, no figure".
2. **Find primary sources**: papers (arXiv / journal page), institutional reports (IEA / UNEP / UNU / gov.cn / ministry documents), company sustainability disclosures, official press releases. News media is a locator and a cross-check, never the final citation.
3. **Cross-validate**: every load-bearing number needs two independent sources. When they disagree, **record both**, state which boundary differs, and mark ⚠️ — the disagreement is itself presentable material.
4. **A page counts as verified only if it was opened**: use `WebFetch` to actually read it. If `WebSearch` snippets were the only evidence, mark 🔍. Paywalls, 403s and anti-bot blocks → mark 🔍 and write "read via <mirror>" or "second-hand support only".
5. **Say so when the network blocks you**: record `⛔ unreachable: <URL> (<symptom>)` in the source file and tell the user explicitly, "this could not be reached, so it is unverified". Never substitute a remembered figure, never drop it silently.
6. **Forbidden**: inventing numbers, DOIs, page numbers or URLs; presenting an estimate as a finding; adjectives ("staggering", "shocking") in place of evidence; repeating a debunked misreading in its debunked form (if you cite it, cite the correction too).

## Marker system (deck-wide, and visible in the HTML)

| Marker | Meaning | Slide handling |
|---|---|---|
| ⚠️ | disputed / unclear boundary / famously misread | must also state why it diverges, or carry the correction |
| 🔍 | second-hand, not verified at source | keep in the citation bar; wording "as cited in …" |
| ⛔ | unreachable, unverified | **must never reach the HTML**; stays in the source file only |
| (derived) | computed from other recorded data | the slide must say "we derived this from …" |

## Source-file template

```markdown
# <Topic> · source notes and data cards

> Purpose: preparation material for <occasion>.
> Collected: <YYYY-MM-DD>. Every figure carries **year + source**.
> ⚠️ disputed or boundary-unclear; 🔍 second-hand, not verified at source; ⛔ unreachable and unverified — do not cite.

## One-line map
<What the causal chain of this topic is, and the biggest methodological problem. 3–5 lines.>

## 1. <act / sub-topic>
| Object | Figure | Year | Source |
|---|---|---|---|
| <subject> | <figure with its unit> | <year> | <author or institution>, <locator> |
| <second subject> | <figure> | <year> | <source> |
| <contested value> | A says X, B says Y | <year> | ⚠️ state what the boundary difference is |

> Those rows are **format placeholders**. Replace every `<…>` with a value that carries a real source + year; never ship an example figure, and never let a bracket survive into the skeleton or the deck.

**Key points — where this gets mis-stated**:
1. <self-revision of a study / unit-conversion trap / a misreading and its correction>

## 2. … (one section per act, same shape)

## N. Conclusion ammunition for the deck
1. **Magnitude**: …  2. **Attribution**: …  3. **Uncertainty**: …  4. **Action**: …

## N+1. Unverified gaps (state the direction, never a figure)
<quantified cobalt/lithium/rare-earth disturbance, paywalled tonnage …>

## Source list
- <institution / paper / report, full name> (<year>): <URL>  <read status: verified first-hand | via <mirror> | ⚠️ origin page 403 | ⛔ unreachable>
```

## Writing rules

- Every number carries a **year**; when comparing across years, say whether it is stock or flow, point or range.
- Standardise units and show the conversion (MWh/GWh/TWh, gallons/litres, t/kt); keep the original unit on the slide with the conversion noted.
- Actively collect **misreadings and self-revisions** — they beat correct numbers for persuasion and make natural dispute slides.
- The "conclusion ammunition" section is for the speaker: at most four items, each a judgement rather than a figure.
- The source file, the skeleton and the HTML are three views of one fact set. If a figure changes at any later step, **update all three**.

## Before finishing

- [ ] Every number has source + year and points at a concrete URL or filename
- [ ] Load-bearing numbers have a second source, or are marked 🔍
- [ ] Every ⚠️ explains the disagreement and the safe wording
- [ ] No ⛔ item leaked into the skeleton or the HTML
- [ ] Unreachable links were reported to the user
