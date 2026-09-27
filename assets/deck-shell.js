/* human-led-ppt skill · generic deck interaction shell (no deps, no network, no localStorage)
 * Chinese prose lives in references/zh; code comments here are English for cross-language agents.
 *
 * DOM contract:
 *   <div id="viewport"><div id="stage"> <section class="slide">…</section> × N </div></div>
 *   <div id="overview" role="dialog" aria-label="Slide overview"></div>
 *   <div id="aria" aria-live="polite"></div>
 *   <div id="rotate-mask">…portrait hint…</div>
 *
 * Provides: proportional scaling · Space/←→/PageUp-Down/Home·End/1-9 paging · G overview wall ·
 *           F fullscreen · Q shortcut panel · click left/right half · touch swipe · URL hash deep links ·
 *           counting numerals · mobile portrait mask · reduced-motion · print
 *
 * Optional hooks:
 *   <span data-count="50" data-dec="1" data-pre="~" data-suf=" GWh"> → counts up when its slide opens
 *   .slide-head (or .kicker + h1/h2) → what the thumbnail and the aria announcement show
 *   ?preview=N      → headless single-slide mode for the presenter window's iframe
 *                     (no overview, no keyboard, no click paging, no hash writes;
 *                      slides change only on {type:'preview-goto', idx} postMessage)
 *   'deck:go'       → window event fired on every slide change, detail = {index, total};
 *                     add-ons (presenter overlay, ink layer) listen instead of wrapping go()
 *   window.__deckHelp → registry for the Q panel: each add-on pushes {title, rows:[[key, desc]]}
 *                     at load; the panel renders whatever is registered when it opens, so a
 *                     deck without an overlay simply shows fewer sections.
 */
(function () {
  'use strict';

  var W = 1280, H = 720;
  var stage = document.getElementById('stage');
  var slides = [].slice.call(document.querySelectorAll('#stage > .slide'));
  var N = slides.length, cur = -1, ovOpen = false;
  var overview = document.getElementById('overview');
  var aria = document.getElementById('aria');
  var mask = document.getElementById('rotate-mask');
  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  /* Preview mode: "?preview=7" renders slide 7 alone, with no chrome, no keyboard,
     no hash writes. It exists so the presenter window can show pixel-perfect
     previews by loading THIS deck file in an <iframe> — same CSS, same fonts,
     same 1280x720 canvas, so a preview cannot drift from the audience view.
     Navigation inside a live iframe happens by postMessage, never by reloading. */
  var pvMatch = /[?&]preview=(\d+)/.exec(location.search || '');
  var previewMode = false, previewIdx = -1;
  if (pvMatch) {
    previewIdx = parseInt(pvMatch[1], 10) - 1;
    previewMode = previewIdx >= 0 && previewIdx < N;
    if (previewMode) {
      document.documentElement.setAttribute('data-preview', '1');
      document.documentElement.style.overflow = 'hidden';
    }
  }

  if (!stage || !N) { console.warn('[deck-shell] #stage or .slide not found'); return; }

  /* ---------- Q: keyboard shortcut panel ----------
     One dialog for the whole deck. The shell owns the element and its own section;
     add-ons push theirs into window.__deckHelp when they load, and the panel renders
     whatever is registered at the moment it opens — late sections appear for free. */
  var LANG = (function () {
    var l = (document.documentElement.lang || (navigator.language || '')).toLowerCase();
    return /^zh/.test(l) ? 'zh' : /^ja/.test(l) ? 'ja' : 'en';
  })();
  /* runtime strings for the shell's own chrome (Q panel + slide announcement).
     Add a language by adding a block; the three stay key-for-key identical. */
  var CH = {
    zh: {
      panel: '键盘快捷键', sec: '翻页与视图', foot: '按 Q 或 Esc 关闭',
      keysArrows: '← → ↑ ↓ · 空格', page: '翻页', firstLast: '第一页 / 最后一页',
      jump: '直达第 N 页', overview: '总览墙（全部缩略图）', fullscreen: '全屏',
      thisPanel: '本面板', dismiss: '关闭浮层', ariaSlide: '第 %d 页：'
    },
    ja: {
      panel: 'キーボードショートカット', sec: 'ページ送りとビュー', foot: 'Q または Esc で閉じる',
      keysArrows: '← → ↑ ↓ · スペース', page: 'ページ送り', firstLast: '最初 / 最後のページ',
      jump: 'N ページへジャンプ', overview: '総覧ウォール（全サムネイル）', fullscreen: 'フルスクリーン',
      thisPanel: 'このパネル', dismiss: 'オーバーレイを閉じる', ariaSlide: 'スライド %d：'
    },
    en: {
      panel: 'Keyboard shortcuts', sec: 'Paging & view', foot: 'press Q or Esc to close',
      keysArrows: '← → ↑ ↓ · Space', page: 'page', firstLast: 'first / last slide',
      jump: 'jump to slide N', overview: 'overview wall', fullscreen: 'fullscreen',
      thisPanel: 'this panel', dismiss: 'dismiss overlay', ariaSlide: 'Slide %d: '
    }
  }[LANG];
  window.__deckHelp = [{
    title: CH.sec,
    rows: [
      [CH.keysArrows, CH.page],
      ['PageUp / PageDown', CH.page],
      ['Home / End', CH.firstLast],
      ['1 – 9', CH.jump],
      ['G', CH.overview],
      ['F', CH.fullscreen],
      ['Q', CH.thisPanel],
      ['Esc', CH.dismiss]
    ]
  }];
  var helpEl = null;
  /* mirrors the #deckhelp block in assets/deck-shell.css — only used when a deck ships
     an older inlined copy of that file. Fix the CSS, do not extend this string. */
  var DECKHELP_FB_CSS = [
    '#deckhelp{position:fixed;inset:0;z-index:60;display:none;overflow:auto;padding:40px;',
    '  background:var(--ovl-bg,rgba(10,12,11,.94));color:var(--ovl-ink,var(--ink,#E8ECE8))}',
    '#deckhelp.open{display:flex}',
    '#deckhelp .dh{margin:auto;width:min(760px,94vw);max-height:86vh;overflow:auto;border-radius:14px;padding:18px 24px 16px;',
    '  background:var(--panel,#181C21);border:1px solid var(--rule,rgba(128,128,128,.35));color:inherit}',
    '#deckhelp h3{margin:0 0 12px;font-size:19px;color:var(--accent,#4A90D9)}',
    '#deckhelp .dh-t{margin:0 0 8px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.65}',
    '#deckhelp .dh-sec{margin:0 0 14px}',
    '#deckhelp .dh-g{display:grid;grid-template-columns:1fr 1fr;gap:6px 30px}',
    '#deckhelp .dh-r{display:flex;justify-content:space-between;align-items:baseline;gap:12px;',
    '  border-bottom:1px dashed var(--rule,rgba(128,128,128,.3));padding-bottom:5px;font-size:13.5px}',
    '#deckhelp .dh-r span{opacity:.85;text-align:right}',
    '#deckhelp kbd{font-weight:700;font-size:12px;color:var(--bg,#111);background:var(--accent,#4A90D9);',
    '  border-radius:5px;padding:1px 7px;white-space:nowrap}',
    '#deckhelp .dh-f{margin:6px 0 0;padding-top:10px;font-size:12px;opacity:.6}',
    '@media print{#deckhelp{display:none !important}}'
  ].join('\n');
  function helpOpen() { return !!(helpEl && helpEl.classList.contains('open')); }
  function renderHelp() {
    var card = document.createElement('div');
    card.className = 'dh';
    var h = document.createElement('h3');
    h.textContent = CH.panel;
    card.appendChild(h);
    window.__deckHelp.forEach(function (sec) {
      var g = document.createElement('div'); g.className = 'dh-sec';
      var t = document.createElement('p'); t.className = 'dh-t'; t.textContent = sec.title;
      var grid = document.createElement('div'); grid.className = 'dh-g';
      (sec.rows || []).forEach(function (r) {
        var row = document.createElement('div'); row.className = 'dh-r';
        var k = document.createElement('kbd'); k.textContent = r[0];
        var d = document.createElement('span'); d.textContent = r[1];
        row.appendChild(k); row.appendChild(d); grid.appendChild(row);
      });
      g.appendChild(t); g.appendChild(grid); card.appendChild(g);
    });
    var foot = document.createElement('p');
    foot.className = 'dh-f';
    foot.textContent = CH.foot;
    card.appendChild(foot);
    helpEl.innerHTML = '';
    helpEl.appendChild(card);
  }
  function toggleHelp(v) {
    if (!helpEl) return;
    var open = (v === undefined) ? !helpOpen() : !!v;
    if (open) { if (ovOpen) closeOverview(); renderHelp(); }
    helpEl.classList.toggle('open', open);
  }
  if (!previewMode) {
    helpEl = document.createElement('div');
    helpEl.id = 'deckhelp';
    helpEl.setAttribute('role', 'dialog');
    helpEl.setAttribute('aria-label', CH.panel);
    /* appended now, before any add-on mounts its own elements — the ink layer hides
       its surfaces via `#deckhelp.open ~ …` sibling selectors, which need this order */
    document.body.appendChild(helpEl);
    helpEl.addEventListener('click', function (e) { if (!e.target.closest('.dh')) toggleHelp(false); });
    /* A deck whose inlined shell CSS predates the Q panel would otherwise drop the
       dialog into the document flow: a bare strip of left-aligned text. Detect that
       and inject a minimal fallback so the feature is never silently broken — then
       fix the real source by re-inlining assets/deck-shell.css. */
    try {
      if (getComputedStyle(helpEl).position !== 'fixed') {
        var fb = document.createElement('style');
        fb.id = 'deckhelp-fb';
        fb.textContent = DECKHELP_FB_CSS;
        document.head.appendChild(fb);
        console.warn('[deck-shell] #deckhelp 无样式：本稿内联的 deck-shell.css 是旧版，请重新内联 assets/deck-shell.css（已注入兜底样式）');
      }
    } catch (err) {}
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  // Thumbnail caption: act/section label (.kicker or .act) + slide claim (h1/h2), joined with " · "
  function captionOf(s) {
    var k = s.querySelector('.kicker') || s.querySelector('.act');
    var h = s.querySelector('h1, h2');
    var a = k ? k.textContent.replace(/\s+/g, ' ').trim() : '';
    var b = h ? h.textContent.replace(/\s+/g, ' ').trim() : '';
    return (a && b ? a + ' · ' + b : (a || b)).slice(0, 46);
  }
  function scale() {
    var w = window.innerWidth || document.documentElement.clientWidth || W;
    var h = window.innerHeight || document.documentElement.clientHeight || H;
    var s = Math.min(w / W, h / H);
    return (isFinite(s) && s > 0) ? s : 1;
  }

  /* ---------- scaling ---------- */
  function fit() {
    var s = scale();
    stage.style.transform = 'scale(' + s + ')';
    stage.style.left = ((window.innerWidth - W * s) / 2) + 'px';
    stage.style.top = ((window.innerHeight - H * s) / 2) + 'px';
  }

  /* ---------- portrait mask (portrait AND narrow/coarse viewport, so a slim desktop window is not bothered) ---------- */
  function portrait() { return window.innerHeight > window.innerWidth; }
  function coarse() {
    return !!(window.matchMedia && (window.matchMedia('(pointer: coarse)').matches ||
           window.matchMedia('(hover: none)').matches));
  }
  function syncMask() {
    if (!mask) return;
    if (previewMode) { mask.classList.remove('show'); return; }
    var show = portrait() && (coarse() || Math.min(window.innerWidth, window.innerHeight) < 600);
    mask.classList.toggle('show', show);
  }

  /* ---------- counting numerals ---------- */
  function runCounters(slide) {
    if (reduce.matches) return;
    [].forEach.call(slide.querySelectorAll('[data-count]'), function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      var pre = el.getAttribute('data-pre') || '', suf = el.getAttribute('data-suf') || '';
      var dur = parseInt(el.getAttribute('data-dur') || '750', 10);
      if (!isFinite(target)) return;
      var fmt = function (v) { return pre + v.toFixed(dec) + suf; };
      if (el._raf) { cancelAnimationFrame(el._raf); el._raf = null; }
      var t0 = null;
      function frame(ts) {
        if (t0 === null) t0 = ts;
        var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(target * e);
        if (k < 1) { el._raf = requestAnimationFrame(frame); }
        else { el.textContent = fmt(target); el._raf = null; }
      }
      el.textContent = fmt(0);
      el._raf = requestAnimationFrame(frame);
      // rAF pauses in background tabs: fall back to the final value
      setTimeout(function () {
        if (el._raf) { cancelAnimationFrame(el._raf); el._raf = null; }
        el.textContent = fmt(target);
      }, dur + 150);
    });
  }

  /* ---------- paging ---------- */
  function go(n, skipHash) {
    n = Math.max(0, Math.min(N - 1, n));
    if (n === cur) return;
    if (cur >= 0) {
      var old = slides[cur];
      old.classList.remove('active');
      old.classList.add('leaving');
      (function (el) { setTimeout(function () { el.classList.remove('leaving'); }, 340); })(old);
    }
    cur = n;
    var s = slides[cur];
    s.classList.add('active');
    runCounters(s);
    if (aria) {
      var h = s.querySelector('h1, h2');
      aria.textContent = CH.ariaSlide.replace('%d', cur + 1)
                       + (h ? h.textContent.trim() : '');
    }
    if (overview) {
      [].forEach.call(overview.querySelectorAll('.thumb'), function (t, i) {
        t.classList.toggle('here', i === cur);
      });
    }
    if (!skipHash && !previewMode && location.hash !== '#s' + (cur + 1)) {
      history.replaceState(null, '', '#s' + (cur + 1));
    }
    // Tell any add-on (presenter overlay, ink layer) where we landed.
    try {
      window.dispatchEvent(new CustomEvent('deck:go', { detail: { index: cur, total: N } }));
    } catch (err) {}
  }
  function fromHash() {
    var m = /^#s(\d+)$/.exec(location.hash);
    if (m) { var n = parseInt(m[1], 10) - 1; if (n >= 0 && n < N && n !== cur) go(n, true); }
    else if (cur < 0) go(0, true);
  }

  /* ---------- G overview ---------- */
  function buildOverview() {
    if (!overview) return;
    slides.forEach(function (s, i) {
      var th = document.createElement('div');
      th.className = 'thumb'; th.setAttribute('data-go', i);
      var frame = document.createElement('div'); frame.className = 'frame';
      var clone = s.cloneNode(true);
      clone.classList.remove('active', 'leaving');
      clone.classList.add('thumb-slide');
      clone.style.transform = 'scale(0)';        // width unknown yet; measure() fills it in
      frame.appendChild(clone);
      var no = document.createElement('p'); no.className = 'capno';
      no.textContent = pad2(i + 1) + ' · ' + captionOf(s);
      th.appendChild(frame); th.appendChild(no);
      th.addEventListener('click', function () { closeOverview(); go(i); });
      overview.appendChild(th);
    });
  }
  function measure() {
    if (!overview) return;
    [].forEach.call(overview.querySelectorAll('#overview .frame'), function (f) {
      var sl = f.querySelector('.thumb-slide');
      if (!sl) return;
      var k = f.clientWidth / W;
      sl.style.transform = 'scale(' + k + ')';
      sl.style.transformOrigin = 'top left';
    });
  }
  function openOverview() { if (!overview) return; ovOpen = true; overview.classList.add('open'); measure(); }
  function closeOverview() { if (!overview) return; ovOpen = false; overview.classList.remove('open'); }

  /* ---------- events ---------- */
  window.addEventListener('resize', function () { fit(); syncMask(); if (ovOpen) measure(); });
  window.addEventListener('orientationchange', function () { fit(); syncMask(); });
  window.addEventListener('hashchange', fromHash);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) syncMask(); });
  if (reduce.addEventListener) {
    try { reduce.addEventListener('change', function () { fit(); }); } catch (err) {}
  }

  document.addEventListener('keydown', function (e) {
    if (previewMode) return;                 // a preview iframe is driven by postMessage only
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'g' || e.key === 'G') { ovOpen ? closeOverview() : openOverview(); return; }
    if (e.key === 'q' || e.key === 'Q') { e.preventDefault(); toggleHelp(); return; }
    if (e.key === 'Escape') {
      if (helpOpen()) { toggleHelp(false); return; }
      if (ovOpen) closeOverview();
      return;
    }
    if (ovOpen) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
      return;
    }
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown': case 'Enter':
        e.preventDefault(); go(cur + 1); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
        e.preventDefault(); go(cur - 1); break;
      case 'Home': e.preventDefault(); go(0); break;
      case 'End': e.preventDefault(); go(N - 1); break;
      case 'f': case 'F':
        if (document.fullscreenElement) { document.exitFullscreen(); }
        else if (document.documentElement.requestFullscreen) { document.documentElement.requestFullscreen(); }
        break;
      default:
        if (/^[1-9]$/.test(e.key)) { var n = parseInt(e.key, 10) - 1; if (n < N) go(n); }
    }
  });

  // touch swipe
  var tx = null, ty = null;
  document.addEventListener('touchstart', function (e) {
    if (previewMode) return;
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (tx === null || ovOpen || previewMode) { tx = ty = null; return; }
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? go(cur + 1) : go(cur - 1); }
    tx = ty = null;
  }, { passive: true });

  // always open links in a new tab (embedded previewers ignore target="_blank") and never page
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    e.preventDefault(); e.stopPropagation();
    var w = window.open(href, '_blank', 'noopener');
    if (!w) location.href = href;
  }, true);

  // click paging: right half → next, left half → previous
  document.addEventListener('click', function (e) {
    if (previewMode || ovOpen || e.defaultPrevented) return;
    if (e.target && e.target.closest && (e.target.closest('#overview') || e.target.closest('#deckhelp') || e.target.closest('a') || e.target.closest('button'))) return;
    var r = stage.getBoundingClientRect();
    (e.clientX - r.left) > r.width / 2 ? go(cur + 1) : go(cur - 1);
  });

  /* ---------- boot ---------- */
  if (!previewMode) buildOverview();
  fit(); syncMask();
  if (previewMode) {
    go(previewIdx, true);
    // The presenter window keeps previews alive and just tells them which slide
    // to show: no reload, no white flash between pages.
    window.addEventListener('message', function (e) {
      var d = e.data;
      if (!d || d.type !== 'preview-goto') return;
      var n = parseInt(d.idx, 10);
      if (isFinite(n) && n >= 0 && n < N) go(n, true);
    });
    try { window.parent && window.parent.postMessage({ type: 'preview-ready' }, '*'); } catch (err) {}
  } else {
    fromHash();
    if (cur < 0) go(0, true);
  }
  requestAnimationFrame(function () { fit(); measure(); syncMask(); });
  window.addEventListener('load', function () { fit(); measure(); syncMask(); });
  window.__deck = { go: go, get index() { return cur; }, get total() { return N },
                    get preview() { return previewMode; },
                    openOverview: openOverview, closeOverview: closeOverview,
                    toggleHelp: toggleHelp, get helpOpen() { return helpOpen(); } };
})();
