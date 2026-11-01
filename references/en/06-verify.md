# Step 6 · Verify and deliver

> When `target` includes `native-pptx`, this step reads `06b-pptx.md` instead; everything below serves the HTML primary track only.

Order: **ask first** → static checks → live browser test → number audit → delivery. If anything fails, go back and fix it; never present unverified work as done.

## 0. Ask the user who runs the check (do not skip this)

The **first thing** step 6 does is ask the user one question:

> The deck is written. For this final check, do you want me to **run it myself** (I execute the assertions below and hand you the pass list and the untested items), or do you want to **check it yourself** (I do the static cross-check only and leave the assertion scripts for you to rerun)?

- The user wants the agent to run it → go through the whole flow below (static + live browser + number audit).
- The user wants to check it themselves → still do **section 1's static checks** (zero-dependency, page count, placeholder leakage — skipping those is a dereliction), and let the live test and the number audit follow the user's wish: if they want to see it, hand them the script and the expected values; if they want to run it, hand them the script.
- Either way, the **delivery note states which items were live-tested and which the user is verifying**, and never claims an untested item as passed.

**Do not run it by default**: some users want to walk it themselves, and racing ahead blocks them. This question is a fixed action of this step.

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

# link schemes: only http(s), #sN and local relative paths are allowed; the active schemes below must be 0 (the assembler blocks them too)
grep -nEo '<a[^>]*href="(javascript|vbscript|data):' <topic>.html
```

Do not grep a built deck for `data-src` and count the hits: the inlined shell's own JS comments carry the markup example `data-src="clip.mp4"`, so those two comment lines always match. Count media figures inside `#stage`, or grep `class="mp"` instead.

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

### 2.1 Media (mandatory when there is `image` / `audio` / `video`)

```js
// 1) structure: after the shell takes over it looks like this, and carries no author-made controls
const fig = document.querySelector('#stage .slide.active [data-mp]');
out.mp = {kind: fig.dataset.kind,
          hasBar: !!fig.querySelector('.mp-bar'),
          elClass: fig.querySelector('video,audio').className,   // should contain mp-el
          controls: fig.querySelector('video,audio').controls,   // must be false
          dataSrcLeft: fig.querySelector('video,audio').hasAttribute('data-src')};  // must be false: already removed
// 2) the box is constrained inside the card: an audio-only page **rests as one small loudspeaker chip** (.mp under 48px tall,
//    roughly one button wide), not a whole blank panel; the full strip unfolds only on hover / Tab focus / a touchscreen tap
//    (data-open="1" on fig)
out.audioBox = fig.getBoundingClientRect().height;
// 3) walk the slide: K plays → the play button's aria-label flips play → pause → press again to get play
// 4) paging stops it: after leaving the slide, video.paused === true and currentTime === 0
// 5) ← → always page: with focus on a transport-bar button, press ArrowRight and the slide index must still change
// 6) fault branch: temporarily point one slide's data-src at a file that does not exist, then assert
//    fig.dataset.state === 'error', and a .mp-missing appears INSIDE the player box ("Video not found" / "Audio not found"),
//    with the picture and the bar stepping aside (.mp-el / .mp-bar are display:none); the old .mp-note under the card is retired
// 7) overflow self-check (mandatory): the bar sits below the picture, part of the card — the card must not break .slide's clip box
const s = fig.closest('.slide'), bar = fig.querySelector('.mp-bar');
const limit = s.clientHeight - parseFloat(getComputedStyle(s).paddingBottom);
const br = bar.getBoundingClientRect();
const hit = document.elementFromPoint(br.left + br.width / 2, br.top + br.height / 2);
out.overflow = {cardBottom: fig.offsetTop + fig.offsetHeight, limit,
                fits: fig.offsetTop + fig.offsetHeight <= limit,
                barReachable: !!(hit && hit.closest && hit.closest('.mp-bar'))};
//   both must be true: fits=false means the card is taller than the space left on this slide (the bar is clipped outside the canvas),
//   barReachable=false means the bar sits in the DOM but cannot be clicked — that is the same as having no player. The shell will not
//   clamp it for you; this is a build error, go back and resize per 05-build's "card height includes the bar".
//   the scrub bar .mp-track lives inside the strip and is always on, so running the same elementFromPoint on its midpoint must hit it too.
//   an audio page must be **unfolded before it is measured**: at rest .mp-fold is display:none, so the bar is not meant to be hit —
//   set fig.setAttribute('data-open','1') for that step and remove it once measured; in the resting state assert instead that the
//   loudspeaker .mp-mute is itself clickable.
//   Unfolded, the audio strip is a **left-aligned, right-growing** narrow bar: `.mp-bar` starts at the loudspeaker's position and
//   grows to the right, its left edge does not jump; the content is 416px wide (`min(100%,416px)`, i.e. 80% of the former width,
//   about 438px outer). Measure `getBoundingClientRect()` before and after unfolding: the left edge may shift by ≤1px (leftward
//   unfolding would make it negative) and the width must land in 400–460; a centred bar puts left at (figWidth−barWidth)/2, which
//   fails outright.
// 8) volume and fullscreen: volume is not a permanent slider — hovering .mp-mute (or tapping it on a touchscreen) pulls up .mp-volpop.
//    The popover must meet the button with ZERO gap: set data-vol="1" on the wrap, then elementFromPoint every 2px upward from the
//    wrap top edge for 0–6px — every probe has to land on .mp-volpop. A probe that falls back to #stage means there is a dead band,
//    a mouse can never grab the slider, and the only way in is tapping the loudspeaker first (that is the bug this guards). The slider
//    must also sit centred on the button: |pop centre − wrap centre| ≤ 1px. Then keep dragging
//    its slider .mp-volr changes el.volume continuously (0–1, no steps); dragging to 0 mutes, and a mouse click on the loudspeaker toggles mute;
//    with the deck already fullscreen (F), clicking the video card's .mp-fs must nest into media fullscreen — Escape comes back to the deck's fullscreen,
//    not straight down to the window.
// 9) fullscreen ownership: in a normal window the video card exposes .mp-fs, and what it fills is **this window**. Inside a `?preview=N` iframe
//    (the presenter's current-slide tile) the same button is there and clickable too, but the picture must **not** fill the presenter window:
//    that request crosses the media-fs → presenter-media-fs bridge to the audience window, the audience window takes the screen, the tile still
//    shows the page as it was before fullscreen, and a "Video fullscreen" badge lights up at the top-right of the tile (see 08-presenter-mode.md §3).
//    When the audience window itself presses Esc or pages away, the badge must go out with it — the state belongs to the audience window, not to the tile.
// 10) media remote control (with --presenter and [data-mp] present): click .mp-btn-play in the presenter's current-slide card and the
//     audience window's video/audio must really read paused=false with currentTime advancing, while the tile's icon / time / progress
//     follow; operating the audience window's own strip must move the tile too; dragging the tile's .mp-track must land the audience
//     window on the same time (±0.3s). The tile's audio element must carry no src (no second download) and its video element must be
//     muted (no sound from the presenter window). After a page change both sides reset to zero and pause. If autoplay is blocked,
//     give the audience window one real click and run it again.
```

Check 7 is the new mandatory item in this version, and it must run for **every** media slide (a `for` loop over `#stage [data-mp]` is enough). In a narrow window `#rotate-mask` covers the whole screen and `elementFromPoint` always returns it — that is the test environment, not a bug: widen the window first (or temporarily `mask.classList.remove('show')`) before judging `barReachable`.

The source files must **really sit next to the HTML** when you test — on `file://` a wrong path *is* the fault branch from check 6, so one pass verifies both.
Inlined images get their own check: `img.complete === true && img.naturalWidth > 0`, plus confirm that `img.src` starts with `data:image/`.

Three probe traps, hit in a live session — read them before writing the script:

- Scope media selectors to `#stage`. `[data-mp]` now matches **live players only**; the overview
  thumbnails hold a static `.mp-ph` chip instead (a black box with a play glyph — no bar, no media
  element). If counting players gives double the expected number, you are looking at an old build.
- Transport-scoped keys (`, . [ ] M Space Enter`) must be dispatched **on a control inside the bar**,
  e.g. `fig.querySelector('.mp-btn-play').dispatchEvent(new KeyboardEvent('keydown',{key:']',bubbles:true,cancelable:true}))`.
  A synthetic keydown on `document` has `target === document`, so `target.closest('[data-mp]')` is
  null and the shell correctly ignores it — you "measure" a dead shortcut that works fine for a real
  key press. `K` is the only global media key. Also: if the browser panel has lost OS focus, real
  key presses are silently dropped — re-focus, or dispatch on the element.
- On `file://` the built-in browser strips the query string, so `?preview=N` (and the `?v=N`
  cache-buster used elsewhere in this document) never reach the page; test preview mode over
  `http://localhost`, or open the presenter window once. A CJK **directory** path may fail to load in
  the built-in browser (keep the test deck in an ASCII directory) — but CJK and spaces inside a
  `data-src` **file name** are fine and were verified working, with no manual URL-encoding.

### 2.2 Full-bleed backdrop and evidence chain (when a `background` keyword is used, or the evidence chain is wanted)

```js
// backdrop: the shell inlines data-bg into style.backgroundImage; the attribute is kept (the author's CSS needs it to lift the content), and the value still lives in the file only once
const bg = document.querySelector('#stage .slide[data-i="1"]');
out.bg = {attrKept: bg.hasAttribute('data-bg'),   // must be true — the attribute is kept
          style: /^url\("data:image\//.test(bg.style.backgroundImage)};   // must be true — inlined
// content lifted: this page's text block must have z-index > 0, or the scrim hides it
const body = bg.querySelector('.slide-body');
out.bgContent = parseFloat(getComputedStyle(body).zIndex) >= 1;
// the scrim exists (::after carries a gradient); its contrast is the number audit's job in §3

// evidence chain: this is a PER-DECK choice — a deck whose skeleton §1 says evidence_chain: on gets data-evidence="1" on <html>/<body> at build time, and only then is the badge built
const evDecl = document.documentElement.getAttribute('data-evidence') || document.body.getAttribute('data-evidence') || '';
out.evDeclared = /^(1|on|yes|true)$/i.test(evDecl);          // did this deck opt in?
const ev = document.getElementById('evidence');
out.ev = ev ? {exists:true, visible:getComputedStyle(ev).visibility, text:ev.textContent.trim().slice(0,20)}
            : {exists:false};                                // a deck that did not opt in MUST be {exists:false}
// an opted-in deck: the badge is visible and counts > 0 (given this page wrote a .foot); a plain deck: ev is null, the corner is empty
if (ev) { ev.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})); await sleep(60); }
out.evOpen = ev && {open: ev.getAttribute('data-open')==='1', rows: ev.querySelectorAll('.ev-list li').length,
           matchesFoot: (()=>{const f=document.querySelector('#stage .slide.active .foot');
                              return !f || ev.textContent.indexOf(f.textContent.replace(/↗|\s+/g,' ').trim().slice(0,8))>=0;})()};
// not printed: the @media print rule includes #evidence
```

> Skip this whole subsection when there is no `background` keyword and the deck did not opt into the chain. The chain is **not a hotkey and not always-on** — it is decided while writing: a serious deck (defence / research / data report / review) writes `evidence_chain: on` (`out.ev.exists` is true and visible); a casual deck writes nothing (`out.ev.exists` MUST be false, the corner clean). A chain appearing on a plain deck, or any toggle hotkey, means this version's design was reverted.

### 2.3 Annotation / blackboard (when step 7 is installed)

- With annotation opened by `A`, the arrow keys / space / digits still page as usual;
- `B` enters the blackboard: `body` carries `board`, the page becomes the dark board, the status pill appears, the palette switches to the chalk set (every pen ≥4.5:1 against `#1D2A26`; per-colour values are documented in `07-annotation.md` §6.1), and the board's highlighter band is drawn at `.55` alpha so it clears 3:1 on the dark ground;
  **board ink survives paging** (one shared body, not one per page), and **returning to the slides does not leak board ink onto them while the slides' own ink is untouched**;
- `X` clears only the current surface (pressing it on the board does not wipe any slide's ink);
- with annotation on, `S` exports a PNG and does **not** also pop the presenter window (the two layers' `S` must be mutually exclusive, see `07-annotation.md` §8);
- presenter window (if installed alongside): exactly four `.pcard` tiles (`c-cur` `c-nxt` `c-pmt` `c-ovw`), none of them a board and no iframe carrying `board=1`; resize or drag a card, and after **mouseup** it must stay raised above the neighbours it crossed (`parseInt(card.style.zIndex,10)` grew, no fallback to `z-index:auto`), and that front-to-back order must survive a reload, because `z` is stored in the layout record `pv.v2|` together with x/y/w/h.

Optional review pass with marketplace skills (user installs first): `vercel-labs-web-design-guidelines` for a UI/UX/a11y audit, `entur-accessibility` for WCAG 2.1 checks.

### 2.4 Visual hierarchy and contrast (every slide)

This section checks four things: whether each slide has exactly one primary, whether the type ladder is spread, whether the accent stayed inside budget, and whether all text clears contrast against its **actual background**. It replaces the "looks fine to me" eyeball pass.

```js
async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const slides = [...document.querySelectorAll('#stage > .slide')];
  const vis = el => { const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden' && el.getClientRects().length > 0; };
  const rgb = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(Number); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}; };
  const lum = c => { const f = v => { v/=255; return v<=.03928 ? v/12.92 : Math.pow((v+.055)/1.055,2.4); }; return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b); };
  const ratio = (a,b) => { const x=lum(a), y=lum(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
  const bgOf = el => { let n = el; while (n) { const cs = getComputedStyle(n); const c = rgb(cs.backgroundColor); if (c && c.a > .99) return c; if (cs.backgroundImage !== 'none') return null; n = n.parentElement; } const c = rgb(getComputedStyle(document.documentElement).backgroundColor); return c && c.a > .99 ? c : {r:255,g:255,b:255,a:1}; };
  const probe = document.createElement('i');
  probe.style.cssText = 'position:fixed;left:-9999px;width:1px;height:1px';
  probe.style.background = 'var(--accent)';
  document.body.appendChild(probe);
  const accentRaw = getComputedStyle(probe).backgroundColor;
  const accentParsed = rgb(accentRaw);
  const accent = accentParsed && accentParsed.a > 0 ? accentRaw : null;
  probe.remove();
  const report = [];
  for (let i = 0; i < slides.length; i++) {
    window.__deck.go(i); await sleep(450);
    const s = slides[i];
    // leaf elements that actually carry visible text; .notes never counts
    const leaves = [...s.querySelectorAll('*')].filter(el => vis(el) && !el.closest('.notes') && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
    const items = leaves.map(el => ({ el, fs: parseFloat(getComputedStyle(el).fontSize), text: el.textContent.trim().slice(0, 18) }));
    const sorted = [...items].sort((a,b) => b.fs - a.fs);
    const topFs = sorted[0] ? sorted[0].fs : 0;
    const top = sorted.filter(x => Math.abs(x.fs - topFs) <= 1);
    // group the largest-size elements by the primary containers they sit in: a KPI group counts as one primary
    const topGroups = [...new Set(top.map(x => x.el.closest('h1,h2,h3,.key,.pull,.kpi,[data-kpi]') || x.el))];
    const kpiTop = topGroups.length > 1 && topGroups.every(el => el.matches('.kpi,[data-kpi]') || el.closest('.kpi,[data-kpi]'));
    const second = sorted.find(x => x.fs < topFs - 1);
    const body = sorted.find(x => x.fs <= 28 && x.fs >= 20);
    const accentBlocks = accent ? [...s.querySelectorAll('*')].filter(el => vis(el) && getComputedStyle(el).backgroundColor === accent && el.getBoundingClientRect().width * el.getBoundingClientRect().height > 3000).length : null;
    const lowContrast = [], unknownBg = [];
    for (const it of items) {
      const cs = getComputedStyle(it.el);
      if (parseFloat(cs.opacity) < .85) { lowContrast.push({ text: it.text, why: 'opacity ' + cs.opacity }); continue; }
      const fg = rgb(cs.color), bg = bgOf(it.el);
      if (!fg) continue;
      if (!bg) { unknownBg.push(it.text); continue; }
      const need = (it.fs >= 24 || (it.fs >= 18.66 && parseInt(cs.fontWeight) >= 700)) ? 3 : 4.5;
      const r = ratio(fg, bg);
      if (r < need) lowContrast.push({ text: it.text, fs: it.fs, ratio: +r.toFixed(2), need });
    }
    report.push({ page: i + 1, topFs, primaryCandidates: topGroups.length, kpiTop,
      primaryText: topGroups.map(el => el.textContent.trim().slice(0, 18)),
      topSecond: second ? +(topFs / second.fs).toFixed(2) : null,
      topBody: body ? +(topFs / body.fs).toFixed(2) : null,
      accentBlocks, lowContrast, unknownBg });
  }
  window.__deck.go(0);
  return JSON.stringify(report);
}
```

Reading the report (any miss goes back for a fix; "looks fine to me" is not a pass):

- **Primary**: `primaryCandidates` must be `1`; when it lands in `2–4`, it only passes if `kpiTop === true` and `accentBlocks === 1` (one number in the group is clearly the lead). Anything else is "two largest sizes side by side" and needs a re-layout.
- **Ladder**: `topSecond ≥ 1.4` and `topBody ≥ 1.5` (`topBody ≥ 1.4` on pages with no `key` — cover / divider / references / thanks — where `h2` is the primary). Below that, titles and body are crowding up and the hierarchy never opened.
- **Accent budget**: `accentBlocks ≤ 1`. Above 1, accent has stopped locating and become a page ground; `null` means `:root` never declared `--accent` — add the token and rerun.
- **Contrast**: `lowContrast` must be empty; a non-empty `unknownBg` means text sits on an image or gradient the script cannot measure — measure it by hand at the "brightest point after the scrim" and write the result into the delivery note.
- **Token checks**: `--muted` against `--bg` and against `--panel` once each, ≥ 4.5:1; `--accent-ink` against `--accent` ≥ 4.5:1. Any `opacity` / `rgba()` text colour on the page is recomputed on the composite colour, not on the token value.
- **Grayscale pass**: temporarily add `filter:grayscale(1)` to `#stage` and go page by page — the primary must still be the first thing found. A page that loses its hierarchy without colour goes back for a size / weight / position change. If it cannot be screenshotted, write "not tested"; never default to pass.

### 2.5 Links (run when there is a `link` keyword, a citation bar or a sources page)

```js
async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const out = { fileLinks: [], jumps: [] };
  for (const a of document.querySelectorAll('#stage a.file-link')) {
    const before = window.__deck.index;
    // stop the browser's own navigation for the probe; we are testing "does it page?"
    a.addEventListener('click', e => e.preventDefault(), { once: true, capture: true });
    a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await sleep(80);
    out.fileLinks.push({
      href: a.getAttribute('href'),
      samePage: window.__deck.index === before,
      blank: a.target === '_blank',
      noopener: /(^|\s)noopener(\s|$)/.test(a.rel || ''),
    });
  }
  const jump = document.querySelector('#stage a[href^="#s"]');
  if (jump) { jump.click(); await sleep(450); out.jumps.push({ href: jump.getAttribute('href'), index: window.__deck.index }); }
  return JSON.stringify(out);
}
```

- Every `fileLinks` entry: `samePage` must be `true` (a file link does not page), and `blank` plus `noopener` must both be `true`.
- A `jumps` `index` must equal N−1 from the `#sN`; after the jump, `window.__deck.go(0)` back to the first slide.
- Static side: `grep -nEo '<a[^>]*href="(javascript|vbscript|data):' <topic>.html` must return 0 lines; for every `href` that is a relative path, confirm the target file sits in the same directory as the `.html` (assembly's `linkErrors` checked once already — here you confirm the delivery folder really holds it).
- Click a local link once more on a real machine: the browser opens the file somewhere new and the deck itself is not replaced; if it does not open, `target` is missing or the file was not copied along.

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
- **what was actually tested**: navigation, G overview, click-half paging, hash, portrait mask, zero external requests, per-slide overflow, font floor, **per-slide single primary / type ladder / accent budget / full-text contrast**, number audit
- **when there is media**: the list of audio/video file names plus the reminder that they must be copied along with the folder; images are inlined, so they are unaffected
- **when `link` is used**: list the file name of every local link and say each must ship in the same folder as the `.html`; call out external links separately
- **what was not tested and what was assumed**: e.g. print pagination not exercised, some source unreachable due to network, deep link verified on desktop only
- open decisions for the user (credits, whether to keep a given slide)
- which optional layer was enabled and the exception it brings (the ink layer's localStorage; the presenter layer's popup permission and non-printing prompts) — fill this in per `07-annotation.md` §7 and `08-presenter-mode.md` §9
- **Evidence chain**: tell the user it is **per deck** — a serious deck (defence / research / data report) has it, a casual deck has nothing in that corner; when present it gathers this page's footnote and a click lists the sources. There is no toggle hotkey.
- **Backdrop**: if `background` was used, say the backdrop is inlined into the HTML (no external file) and is a different kind of image from `image`
- **Who ran the check**: state whether this round was "agent live-tested" or "scripts handed over, verified by the user" (see section 0)

Do not just say "done". The user judges from this whether they can go on stage.
