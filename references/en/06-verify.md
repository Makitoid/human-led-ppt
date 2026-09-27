# Step 6 · Verify and deliver

Order: static checks → live browser test → number audit → delivery. If anything fails, go back and fix it; never present unverified work as done.

## 1. Static checks

```bash
# zero external dependencies
grep -nEo '<(script|link|img|iframe)[^>]*(src|href)="(https?:)?//[^"]*"' <topic>.html
grep -n 'localStorage\|sessionStorage\|fetch(\|XMLHttpRequest' <topic>.html

# slide count matches the skeleton
grep -c 'class="slide"' <topic>.html        # vs skeleton §1 slides
grep -o 'data-i="[0-9]*"' <topic>.html      # contiguous, matching §3's rendered order

# every slide has a citation bar (cover/dividers may be exempt — say so in the skeleton)
grep -c 'class="foot"' <topic>.html

# the §4 reviewer-facing legend is human-only and must not leak into the deck (expect 0)
grep -c '⧉\|legend start' <topic>.html
```

Also confirm: `<meta name="viewport">` present; `#viewport/#stage/#overview/#aria/#rotate-mask` all exist; nothing from `.notes` renders visibly.

## 2. Live browser test

The embedded browser often cannot screenshot, so assert structure with `evaluate_script`. After every file edit, reload with a new `?v=N` — otherwise you are testing a cached copy.

```js
async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const key = k => document.dispatchEvent(new KeyboardEvent('keydown', {key:k, bubbles:true, cancelable:true}));
  const out = {total: window.__deck.total, hash: location.hash};
  // navigation
  key(' '); await sleep(450); out.afterSpace = window.__deck.index;
  key('ArrowLeft'); await sleep(450); out.afterLeft = window.__deck.index;
  key('End'); await sleep(450); out.afterEnd = window.__deck.index;
  key('Home'); await sleep(450);
  key('3'); await sleep(450); out.afterDigit3 = {idx: window.__deck.index, hash: location.hash};
  // click left/right half
  const r = document.getElementById('stage').getBoundingClientRect();
  document.body.dispatchEvent(new MouseEvent('click',{clientX:r.left+r.width*0.9, clientY:r.top+r.height*0.85, bubbles:true, cancelable:true}));
  await sleep(450); out.afterClickRight = window.__deck.index;
  // G overview
  key('g'); await sleep(200);
  const ov = document.getElementById('overview');
  out.overview = {open: ov.classList.contains('open'), thumbs: ov.querySelectorAll('.thumb').length,
                  scale: ov.querySelector('.thumb-slide')?.style.transform,
                  caps: [...ov.querySelectorAll('.capno')].map(e=>e.textContent)};
  ov.querySelectorAll('.thumb')[0].click(); await sleep(450);
  out.thumbJump = {idx: window.__deck.index, closed: !ov.classList.contains('open')};
  // per-slide overflow + minimum font size
  const bad = [];
  for (let i=0;i<window.__deck.total;i++){
    window.__deck.go(i); await sleep(120);
    const s = document.querySelectorAll('#stage > .slide')[i];
    if (s.scrollHeight > s.clientHeight + 2 || s.scrollWidth > s.clientWidth + 2)
      bad.push({i:i+1, overflow:[s.scrollHeight,s.clientHeight,s.scrollWidth,s.clientWidth].join('/')});
    // font floor applies to body text only; citation bars, kickers, chips and badges are small by design
    s.querySelectorAll('p,li,td,span').forEach(el=>{
      if (el.closest('.notes, .foot, .kicker, .srcline, .badge, .capno')) return;
      if (el.textContent.trim() && parseFloat(getComputedStyle(el).fontSize) < 21.5)
        bad.push({i:i+1, small:Math.round(parseFloat(getComputedStyle(el).fontSize))+'px', text:el.textContent.trim().slice(0,24)});
    });
  }
  out.problems = bad;
  out.stageTransform = document.getElementById('stage').style.transform;
  // portrait mask layout
  const m = document.getElementById('rotate-mask'); m.classList.add('show');
  out.mask = getComputedStyle(m).display; m.classList.remove('show');
  return JSON.stringify(out);
}
```

Deep link and print: opening `<topic>.html#s7` must land on slide 7; `Ctrl+P` should give one slide per page (if the embedded browser cannot render print, verify the `@media print` rules exist and state that print was not exercised).

Shortcut panel: a real `Q` keypress opens `#deckhelp` with at least the shell's own "paging & view" section; with the optional layers installed, `window.__deckHelp` must also carry the sections the ink and presenter layers registered. `Esc` closes it, every ink surface steps aside while it is open (the `#deckhelp.open ~ …` sibling selectors), clicking the panel must not page, and `Q` inside `?preview=N` must do nothing.

Contrast (mandatory for glass / low-contrast schemes):

```js
const lum = c => { const [r,g,b]=c.match(/\d+/g).map(Number).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}); return .2126*r+.7152*g+.0722*b; };
const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p); return ((x+.05)/(y+.05)).toFixed(2); };
// for each body element compare getComputedStyle(el).color against the nearest opaque ancestor's background-color
```

Mobile: resize to 390×844 portrait — the mask must appear; rotate to 844×390 — it must disappear and the canvas must fit.

Optional review pass with marketplace skills (user installs first): `vercel-labs-web-design-guidelines` for a UI/UX/a11y audit, `entur-accessibility` for WCAG 2.1 checks.

## 3. Number audit (never skip)

Walk **every number and claim on screen** back to a specific row of the source file:

- figure, unit, year and source all present and identical to the source file
- derived values say "derived from …" on screen; ⚠️ carries its divergence note; 🔍 reads "as cited in …"; ⛔ items appear zero times
- a corrected misreading is never repeated in its wrong form
- unsourced numbers, adjective-substituted evidence, estimates stated as findings → delete or fix
- Each §4 entry on that slide maps to the HTML, countably: how many `points`, how many `table` rows, how many `steps`, how many `defs`, which `code` lines. In skeleton but not HTML = missed; in HTML but not skeleton = invented

Resolve conflicts per `05-build.md`'s severity rules and sync skeleton plus source file.

## 4. Delivery note

The reply to the user contains:

- clickable links to all three files (HTML first), plus skeleton and source file
- slide count, summed duration, style name
- **what was actually tested**: navigation, G overview, click-half paging, hash, portrait mask, zero external requests, per-slide overflow, font floor, number audit
- **what was not tested and what was assumed**: e.g. print pagination not exercised, some source unreachable due to network, deep link verified on desktop only
- open decisions for the user (credits, whether to keep a given slide)
- which optional layer was enabled and the exception it brings (the ink layer's localStorage; the presenter layer's popup permission and non-printing prompts) — fill this in per `07-annotation.md` §7 and `08-presenter-mode.md` §9

Do not just say "done". The user judges from this whether they can go on stage.
