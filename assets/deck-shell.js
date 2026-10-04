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
 *           counting numerals · mobile portrait mask · reduced-motion · print ·
 *           a media transport (scrub bar, 0.5×–2× rate) built around <video>/<audio>
 *
 * Optional hooks:
 *   <span data-count="50" data-dec="1" data-pre="~" data-suf=" GWh"> → counts up when its slide opens
 *   .slide-head (or .kicker + h1/h2) → what the thumbnail and the aria announcement show
 *   <figure data-mp><video data-src="clip.mp4"></video></figure>
 *                     → media slide. data-src is a SIBLING FILE path (audio/video live next to
 *                       the .html, never base64'd in — see references/(en|zh)/04-skeleton.md);
 *                       the shell injects the whole transport (one strip below the picture:
 *                       play, a pull-up volume slider on the loudspeaker, the thick scrub bar,
 *                       the time, the rate, and fullscreen for video), so never hand-write a
 *                       bar. The strip is part of the card, so the card's height must leave
 *                       room for it — 06-verify.md §2.1 asserts every control is reachable.
 *                       An AUDIO card folds to just the loudspeaker at rest and unfolds the
 *                       strip on hover, focus or tap (see [data-open] below the bar builder).
 *   ?preview=N      → headless single-slide mode for the presenter window's iframe
 *                     (no overview, no keyboard, no click paging, no hash writes;
 *                      slides change only on {type:'preview-goto', idx} postMessage);
 *                      a video's fullscreen button is still built there, but pressing it
 *                      asks the AUDIENCE window to take the screen ({type:'media-fs'} →
 *                      {type:'preview-media-fs'}) instead of filling the tool window
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

  /* ---------- media player ----------
     <figure data-mp><video data-src="clip.mp4"></video></figure>
     The shell injects the whole transport, so a deck never hand-writes a control bar. It
     exists because the two things a presenter needs on a projected slide are exactly the
     two a native control bar makes hard: a scrub bar you can drag with a trackpad, and a
     rate you can change without aiming at a tiny native menu. The source stays detached
     until the slide first opens — a 30 MB clip must not start downloading with the deck. */
  var MC = {
    zh: { play:'播放', pause:'暂停', mute:'静音', unmute:'取消静音', rate:'倍速', track:'播放进度',
          vol:'音量', fs:'全屏', exitFs:'退出全屏',
          err:'找不到媒体文件 <b>%s</b>', errNote:'音视频要放在这份 .html 所在的同一个文件夹里，文件名也要完全一致。' },
    ja: { play:'再生', pause:'一時停止', mute:'ミュート', unmute:'ミュート解除', rate:'再生速度', track:'再生位置',
          vol:'音量', fs:'全画面', exitFs:'全画面を終了',
          err:'メディアが見つかりません <b>%s</b>', errNote:'音声・動画は、この .html と同じフォルダーに置いてください。' },
    en: { play:'Play', pause:'Pause', mute:'Mute', unmute:'Unmute', rate:'Speed', track:'Seek',
          vol:'Volume', fs:'Fullscreen', exitFs:'Exit fullscreen',
          err:'Media file not found: <b>%s</b>', errNote:'Audio and video must sit in the same folder as this .html, with exactly the same file name.' }
  }[LANG];
  var RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];
  var players = [];
  /* the one player that currently owns the screen (real fullscreen or the CSS take-over):
     the presenter badge and the Escape key have to be able to ask for it */
  var screenBig = null;
  var MP_ICO = {
    play: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6.4 4.2v11.6a.7.7 0 0 0 1.08.6l8.6-5.8a.7.7 0 0 0 0-1.2l-8.6-5.8A.7.7 0 0 0 6.4 4.2z"/></svg>',
    pause: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="5" y="4" width="3.8" height="12" rx="1.1"/><rect x="11.2" y="4" width="3.8" height="12" rx="1.1"/></svg>',
    /* the loudspeaker is the PowerPoint cue that this card makes sound; three glyphs so the
       level reads at a glance, and the crossed one doubles as the mute state */
    vHigh: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.6 7.7h2.5L9.9 4.3v11.4L6.1 12.3H3.6z"/><path d="M12.2 7.4a3.7 3.7 0 0 1 0 5.2M14.6 5.2a7 7 0 0 1 0 9.6M17 3.2a10 10 0 0 1 0 13.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    vLow: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.6 7.7h2.5L9.9 4.3v11.4L6.1 12.3H3.6z"/><path d="M12.2 7.4a3.7 3.7 0 0 1 0 5.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    vMute: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.6 7.7h2.5L9.9 4.3v11.4L6.1 12.3H3.6z"/><path d="M12.6 7.6l4.2 4.8M16.8 7.6l-4.2 4.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    fs: '<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3.4 7.4V3.4h4M12.6 3.4h4v4M16.6 12.6v4h-4M7.4 16.6h-4v-4"/></svg>',
    fsExit: '<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7.6 3.4v4.2H3.4M16.6 7.6h-4.2V3.4M12.4 16.6v-4.2h4.2M3.4 12.4h4.2v4.2"/></svg>'
  };

  /* The card's height is the author's business, and a transport that has been pushed outside
     its slide is a build error, not something the shell should hide: 06-verify.md §2.1 asserts
     that every control is actually reachable with elementFromPoint. */
  function fmtTime(s) {
    if (!isFinite(s) || s < 0) s = 0;
    var m = Math.floor(s / 60), x = Math.floor(s % 60), p2 = function (n) { return (n < 10 ? '0' : '') + n; };
    if (m >= 60) return Math.floor(m / 60) + ':' + p2(m % 60) + ':' + p2(x);
    return m + ':' + p2(x);
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  /* the touch-only volume popover is an exclusive state: opening one closes the others, and
     tapping the picture or leaving the slide closes it too */
  function closeVols() {
    [].forEach.call(document.querySelectorAll('.mp-volwrap[data-vol]'), function (w) {
      w.removeAttribute('data-vol');
    });
  }
  /* ---------- audio cards fold to a loudspeaker ------------------------------
     An audio slide has no picture, so a full transport strip is the loudest thing
     on the page. At rest the card is just the speaker chip; the strip unfolds on
     hover and on keyboard focus (CSS), and — a touchscreen has neither — on the
     first tap, which sets [data-open] on the figure. Opening one closes the others,
     the same exclusivity the volume popover obeys. */
  function openAudio(f) {
    [].forEach.call(document.querySelectorAll('.mp[data-kind="audio"][data-open]'), function (o) {
      if (o !== f) o.removeAttribute('data-open');
    });
    f.setAttribute('data-open', '1');
  }
  /* capture on document, so it runs before any card's own handler: a touch that lands
     outside every audio card folds the strip back down. */
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') return;
    var t = e.target;
    if (t && t.closest && t.closest('.mp[data-kind="audio"]')) return;
    [].forEach.call(document.querySelectorAll('.mp[data-open]'), function (f) { f.removeAttribute('data-open'); });
  }, true);
  /* every click inside the transport must stop here: the deck pages on a click that
     reaches document, and a drag across the track is >60px, which is a swipe. */
  function isolateBar(bar) {
    ['click', 'dblclick', 'auxclick', 'pointerdown', 'pointerup', 'touchstart', 'touchmove', 'touchend']
      .forEach(function (t) { bar.addEventListener(t, function (e) { e.stopPropagation(); }, false); });
  }

  function buildPlayer(fig) {
    var el = fig.querySelector('video, audio');
    if (!el) return null;
    var isVideo = el.tagName === 'VIDEO', isAudio = !isVideo;
    /* Every video gets a fullscreen button — inside a ?preview=N tile too. What the button
       DOES depends on the window: the audience window takes the screen, a preview tile only
       ASKS for it and stays a mirror (see toggleFs / setBig). Without that split, clicking
       fullscreen in the 当前页 tile filled the PRESENTER window with the clip. */
    var canFs = isVideo;
    /* both windows build their players from the same DOM in the same order, so the index is a
       usable address across the presenter bridge */
    var pid = players.length;
    var src = el.getAttribute('data-src') || '';
    /* read the authored contract off the element, then take it away: from here on the
       element is the player's private state, and a stray data-* left behind is a second
       source of truth for the same value (data-in / data-out are stripped too — the
       segment feature was retired in 1.5, old decks just degrade to the full clip) */
    el.removeAttribute('data-src'); el.removeAttribute('data-in'); el.removeAttribute('data-out');
    var src0 = src;
    el.removeAttribute('src');
    el.preload = 'metadata';
    el.controls = false;
    el.setAttribute('playsinline', '');
    /* the shell, not the author, owns the element's box: .mp-el stretches it over the
       media row and letterboxes it, so a 4:3 clip in a 16:9 card still looks right */
    if (!/\bmp-el\b/.test(el.className)) el.className = (el.className ? el.className + ' ' : '') + 'mp-el';
    if (!/\bmp\b/.test(fig.className)) fig.className = (fig.className ? fig.className + ' ' : '') + 'mp';
    fig.setAttribute('data-kind', isVideo ? 'video' : 'audio');
    fig.setAttribute('data-label', el.getAttribute('data-label') || src0);

    var bar = document.createElement('div');
    bar.className = 'mp-bar';
    var bPlay = '<button class="mp-btn-play" type="button" aria-label="' + MC.play + '">' + MP_ICO.play + '</button>';
    var bVol = '<span class="mp-volwrap"><button class="mp-mute" type="button" aria-label="' + MC.mute +
        '" aria-pressed="false">' + MP_ICO.vHigh + '</button>' +
        '<span class="mp-volpop"><input class="mp-volr" type="range" min="0" max="1" step="0.01" value="1" aria-label="' + MC.vol + '"></span></span>';
    var bTail = '<div class="mp-track" role="slider" aria-label="' + MC.track + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
        '<i class="mp-buf"></i><i class="mp-play"></i><i class="mp-knob"></i></div>' +
        '<span class="mp-t"><b class="mp-cur">0:00</b><i>/</i><span class="mp-dur">0:00</span></span>' +
        '<button class="mp-rate" type="button" aria-label="' + MC.rate + '">1×</button>' +
        (canFs ? '<button class="mp-fs" type="button" aria-label="' + MC.fs + '">' + MP_ICO.fs + '</button>' : '');
    /* An audio card leads with the loudspeaker and folds the rest of the strip into .mp-fold,
       which is display:contents when open — one row, no extra box to size. A video card keeps
       play first, and has nothing to fold. */
    bar.innerHTML = isAudio ? bVol + '<span class="mp-fold">' + bPlay + bTail + '</span>'
                            : bPlay + bVol + bTail;
    fig.appendChild(bar);
    isolateBar(bar);

    var btnPlay = bar.querySelector('.mp-btn-play'), btnRate = bar.querySelector('.mp-rate'),
        volwrap = bar.querySelector('.mp-volwrap'), btnMute = bar.querySelector('.mp-mute'),
        btnFs = bar.querySelector('.mp-fs'), volr = bar.querySelector('.mp-volr'),
        track = bar.querySelector('.mp-track'),
        curEl = bar.querySelector('.mp-cur'), durEl = bar.querySelector('.mp-dur'),
        bufEl = track.querySelector('.mp-buf'), fillEl = track.querySelector('.mp-play'),
        knob = track.querySelector('.mp-knob');
    var dur = 0, rate = 1, drag = false, loaded = false;

    var pct = function (t) { return dur > 0 ? Math.max(0, Math.min(100, (t / dur) * 100)) : 0; };

    function paintVol() {
      var v = el.muted ? 0 : el.volume;
      volr.value = v;
      btnMute.innerHTML = v === 0 ? MP_ICO.vMute : (v < .5 ? MP_ICO.vLow : MP_ICO.vHigh);
      btnMute.setAttribute('aria-label', v === 0 ? MC.unmute : MC.mute);
      btnMute.setAttribute('aria-pressed', v === 0 ? 'true' : 'false');
    }
    /* ---------- "big": the clip covering the screen -------------------------------
       Two mechanisms, one state. requestFullscreen() is what a click in the audience
       window gets you. The CSS take-over ([data-takeover]) is what is left when
       fullscreen cannot be granted — and that is the normal outcome for a request arriving
       over the presenter bridge: the audience document is not focused and has no user
       activation of its own, so the browser refuses it. Both give the same picture, so the
       presenter window can still hand the clip the audience screen.
       Inside a ?preview=N tile neither runs: `big` is only a mirror of the audience state,
       kept so the tile's own button flips its icon. */
    var big = false, realFs = false;
    function fsRoot() { return document.fullscreenElement || document.webkitFullscreenElement; }
    function paintFs() {
      if (!btnFs) return;
      btnFs.innerHTML = big ? MP_ICO.fsExit : MP_ICO.fs;
      btnFs.setAttribute('aria-label', big ? MC.exitFs : MC.fs);
    }
    /* #stage is transformed, and a transformed ancestor is the containing block of a fixed
       descendant: the take-over box has to be described in canvas units, not screen units. */
    function layoutBig() {
      var r = stage.getBoundingClientRect(), k = r.width / W;
      if (!k) return;
      var st = document.documentElement.style;
      st.setProperty('--mpfs-l', (-r.left / k) + 'px');
      st.setProperty('--mpfs-t', (-r.top / k) + 'px');
      st.setProperty('--mpfs-w', (Math.max(1, window.innerWidth) / k) + 'px');
      st.setProperty('--mpfs-h', (Math.max(1, window.innerHeight) / k) + 'px');
    }
    function report() {
      if (previewMode) return;
      /* The audience window is the one holding the screen, whatever put it there — its own
         button, a double click, Escape or a page turn all land here, so the presenter's badge
         can never drift from what the room is actually looking at. */
      try { window.postMessage({ type: 'audience-media-fs', id: pid, on: big }, '*'); } catch (e) {}
    }
    function setBig(on) {
      on = !!on;
      if (on === big) return;
      big = on;
      paintFs();
      if (!previewMode) {
        if (on) {
          /* The deck itself may already be fullscreen (F). Do not exit it and then ask — Chrome
             refuses a request that lands while an exit is still in flight. requestFullscreen
             nests: the clip takes the screen and Escape comes back to the deck's fullscreen. */
          fig.setAttribute('data-takeover', '1');
          layoutBig();
          screenBig = fig;
          reqFs();
        } else {
          var was = realFs;
          realFs = false;
          fig.removeAttribute('data-takeover');
          if (screenBig === fig) screenBig = null;
          if (was) exitFs();
        }
      }
      report();
    }
    function onFsChange() {
      if (fsRoot() === fig) {
        /* fullscreen really was granted: the :fullscreen rules carry the look from here, and the
           take-over attribute has to go, or Escape would leave the card stretched anyway */
        if (!realFs) { realFs = true; fig.removeAttribute('data-takeover'); }
      } else if (realFs) {
        realFs = false;
        setBig(false);                     /* the browser took the screen back (Escape) */
      }
      paintFs();
    }
    function exitFs() {
      var ex = document.exitFullscreen || document.webkitExitFullscreen;
      if (!ex) return;
      try { var pr = ex.call(document); if (pr && pr.catch) pr.catch(function () {}); } catch (err) {}
    }
    function reqFs() {
      var ex = fsRoot();
      /* Legacy webkit has no nesting, so if the deck is already fullscreen there the only way
         in is out and back in. The standard API nests instead: the clip takes the screen and
         Escape comes back to the deck's fullscreen rather than dropping both at once. */
      if (ex && ex !== fig && !fig.requestFullscreen) { exitFs(); setTimeout(reqFs, 260); return; }
      var rq = fig.requestFullscreen || fig.webkitRequestFullscreen;
      if (!rq) return;
      /* rejection is the expected path for a mirrored request: the take-over stays on */
      try { var pr = rq.call(fig); if (pr && pr.catch) pr.catch(function () {}); } catch (err) {}
    }
    function toggleFs() {
      if (previewMode) {
        /* A tile is a mirror, not the stage: it cannot and must not fill the presenter window.
           The ask goes up to the presenter layer, which drives the audience window and puts a
           badge on the tile — the picture inside this iframe does not change. */
        try { window.parent && window.parent.postMessage({ type: 'media-fs', id: pid, on: !big }, '*'); } catch (e) {}
        return;
      }
      if (big) { setBig(false); return; }
      attach(); play();
      setBig(true);
    }

    function sync() {
      if (isFinite(el.duration) && el.duration > 0) dur = el.duration;
      var t = el.currentTime || 0;
      curEl.textContent = fmtTime(t);
      durEl.textContent = fmtTime(dur);
      var p = pct(t);
      fillEl.style.width = p + '%';
      knob.style.left = p + '%';
      track.setAttribute('aria-valuenow', Math.round(p));
      track.setAttribute('aria-valuetext', fmtTime(t) + ' / ' + fmtTime(dur));
      try {
        if (el.buffered && el.buffered.length)
          bufEl.style.width = pct(el.buffered.end(el.buffered.length - 1)) + '%';
      } catch (err) {}
    }

    function seekTo(t) {
      if (dur > 0) t = Math.max(0, Math.min(dur, t));
      el.currentTime = t; sync();
    }
    function play() { var r = el.play(); if (r && r.catch) r.catch(function () {}); }
    function toggle() { if (el.paused) { attach(); play(); } else el.pause(); }
    function attach() {
      if (loaded || !src0) return;
      loaded = true;
      el.src = src0;                       /* deferred: see the header note */
    }
    function cycleRate(d) {
      var i = RATES.indexOf(rate); if (i < 0) i = 2;
      i = (i + d + RATES.length) % RATES.length;
      rate = RATES[i];
      if ('playbackRate' in el) el.playbackRate = rate;
      btnRate.textContent = (rate % 1 === 0 ? String(rate) : String(rate).replace(/^0/, '')) + '×';
    }
    function paintPlay() {
      btnPlay.innerHTML = el.paused ? MP_ICO.play : MP_ICO.pause;
      btnPlay.setAttribute('aria-label', el.paused ? MC.play : MC.pause);
    }
    function resetToStart() { try { el.currentTime = 0; } catch (e) {} }

    el.addEventListener('loadedmetadata', function () {
      if (isFinite(el.duration) && el.duration > 0) dur = el.duration;
      sync();
    });
    el.addEventListener('durationchange', sync);
    el.addEventListener('play', paintPlay);
    el.addEventListener('pause', paintPlay);
    el.addEventListener('ended', paintPlay);
    el.addEventListener('timeupdate', sync);
    el.addEventListener('volumechange', paintVol);
    /* the whole reason audio/video are sibling files: this is the state a user hits when
       they copy the .html somewhere and forget the folder. Say so, don't fail silently. */
    el.addEventListener('error', function () {
      fig.setAttribute('data-state', 'error');
      if (fig.querySelector('.mp-note')) return;
      var n = document.createElement('p');
      n.className = 'mp-note';
      n.innerHTML = MC.err.replace('%s', esc(src0)) + '<br>' + MC.errNote;
      fig.appendChild(n);
    });

    /* --- track: drag to scrub --- */
    function tAt(e) {
      var r = track.getBoundingClientRect();
      if (!r.width) return 0;
      return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * (dur || 0);
    }
    track.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      drag = true;
      try { track.setPointerCapture(e.pointerId); } catch (err) {}
      seekTo(tAt(e));
    });
    track.addEventListener('pointermove', function (e) {
      if (drag) seekTo(tAt(e));
    });
    track.addEventListener('pointerup', function () { drag = false; });
    track.addEventListener('pointercancel', function () { drag = false; });
    track.addEventListener('keydown', function (e) { e.stopPropagation(); });

    btnPlay.addEventListener('click', function () { toggle(); });
    btnRate.addEventListener('click', function () { cycleRate(1); });
    btnMute.addEventListener('click', function () {
      if (el.muted || el.volume === 0) { el.muted = false; if (el.volume === 0) el.volume = .8; }
      else el.muted = true;
    });
    volr.addEventListener('input', function () {
      var v = Math.max(0, Math.min(1, parseFloat(volr.value) || 0));
      el.volume = v;
      el.muted = v === 0;                    /* dragging all the way down is the mute gesture */
    });
    if (btnFs) btnFs.addEventListener('click', function () { toggleFs(); });
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    /* Escape in a real fullscreen is the browser's, and onFsChange reports it. Escape over a
       take-over is ours: hand the screen back before the deck's own handler sees the key. */
    window.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !big || realFs) return;
      e.stopPropagation();
      setBig(false);
    }, true);
    window.addEventListener('resize', function () { if (big && !realFs) layoutBig(); });
    /* A mouse gets the pull-up volume slider from :hover; a touchscreen has no hover, so
       tapping the loudspeaker toggles the same popover. The tap must not also mute — that is
       what dragging the slider down to zero is for. */
    btnMute.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      e.preventDefault();
      var open = volwrap.getAttribute('data-vol') === '1';
      closeVols();
      if (!open) volwrap.setAttribute('data-vol', '1');
    });
    /* A collapsed audio card must answer the first touch with the strip, not with mute: the
       capture listener on the figure runs before any button inside it and stops the tap there.
       A pointer that is not a touch never reaches this — :hover already unfolded the strip. */
    if (isAudio) {
      fig.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' || fig.getAttribute('data-open') === '1') return;
        e.preventDefault(); e.stopPropagation();
        openAudio(fig);
      }, true);
    }
    /* clicking the frame is the most natural play gesture, and the deck pages on a bare
       click — so this one listener both stops the page turn and toggles playback. */
    fig.addEventListener('click', function (e) {
      if (e.target !== el) return;
      e.stopPropagation();
      closeVols();
      toggle();
    });
    fig.addEventListener('dblclick', function (e) {
      if (!canFs || e.target !== el) return;
      e.stopPropagation();
      toggleFs();
      if (el.paused) { attach(); play(); }   /* the two clicks of a double click toggled twice */
    });

    var p = {
      el: el, fig: fig, id: pid, attach: attach, toggle: toggle, play: play, sync: sync,
      seek: seekTo, rate: cycleRate,
      /* the presenter bridge, from the audience side: take the screen back, or give it up.
         A card that is not on stage cannot take the screen — the tile and the audience are
         meant to be looking at the same page, and if they are not, something is already wrong. */
      screen: function (on) {
        if (previewMode) return;
        if (on) {
          if (fig.closest && fig.closest('.slide') !== slides[cur]) return;
          attach(); play();
        }
        setBig(!!on);
      },
      /* from the tile side: mirror the audience state onto this button, nothing else */
      mirror: function (on) { if (previewMode) setBig(!!on); },
      get big() { return big; },
      /* leaving the slide stops playback and rewinds, so coming back shows a fresh
         frame instead of a frozen one that looks like a broken deck */
      leave: function () {
        if (!el.paused) el.pause();
        resetToStart();
        volwrap.removeAttribute('data-vol');
        fig.removeAttribute('data-open');
        if (big) setBig(false);            /* nested: this lands back on the deck's fullscreen */
      }
    };
    players.push(p);
    paintPlay(); paintVol(); sync();
    return p;
  }

  [].forEach.call(document.querySelectorAll('[data-mp]'), function (f) { buildPlayer(f); });

  /* ---------- the presenter bridge for video fullscreen ------------------------
     A tile in the presenter window cannot take a screen it does not own, so the request
     arrives here as a message and this window — the one the room is looking at — does the
     taking. The tile that asked keeps showing the page it showed before: it is a mirror, and
     the badge on its card is the only thing that changes. Both directions share the message
     types documented in §3 of references/(en|zh|ja)/08-presenter-mode.md. */
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || typeof d.id !== 'number') return;
    var p = players[d.id];
    if (!p) return;
    if (previewMode) { if (d.type === 'preview-media-fs') p.mirror(d.on); }
    else if (d.type === 'presenter-media-fs') p.screen(d.on);
  });

  function bigPlayerId() {
    if (!screenBig) return -1;
    for (var i = 0; i < players.length; i++) {
      if (players[i].fig === screenBig && players[i].big) return i;
    }
    return -1;
  }
  /* attach the source only once the slide has actually been shown */
  function attachIn(slide) {
    [].forEach.call(slide.querySelectorAll('[data-mp]'), function (f) {
      [].forEach.call(players, function (p) { if (p.fig === f) p.attach(); });
    });
  }
  function leaveAll(slide) {
    [].forEach.call(slide.querySelectorAll('[data-mp]'), function (f) {
      [].forEach.call(players, function (p) { if (p.fig === f) p.leave(); });
    });
  }
  function playerIn(slide) {
    var hit = null;
    [].forEach.call(slide.querySelectorAll('[data-mp]'), function (f) {
      if (hit) return;
      [].forEach.call(players, function (p) { if (p.fig === f) hit = p; });
    });
    return hit;
  }

  /* Media keys are claimed in the CAPTURE phase on window, before the ink layer's own
     capture listener (the shell is inlined first, so it registers first). While focus sits
     inside a transport the keys below belong to the media and must not reach the ink layer
     either, which would read M as "highlighter" and [ / ] as "pen width". stopImmediatePropagation()
     covers both because it stops the LATER listeners on the SAME node (window), not just
     propagation down the tree.

     ← and → are deliberately NOT in this list. Paging keys always page, whatever has focus:
     once you click play, trapping the arrows would strand the presenter on one slide. The ink
     layer obeys the same rule (see references/(en|zh)/07-annotation.md §4), and a deck that
     needs to scrub by keyboard has , / . for a one-second nudge and a draggable track. */
  window.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key;
    if (k === 'k' || k === 'K') {                       /* global: play/pause this slide */
      var pl = cur >= 0 ? playerIn(slides[cur]) : null;
      if (pl) { e.preventDefault(); e.stopImmediatePropagation(); pl.toggle(); }
      return;
    }
    var t = e.target, host = t && t.closest ? t.closest('[data-mp]') : null;
    if (!host) return;
    var p = null;
    [].forEach.call(players, function (q) { if (q.fig === host) p = q; });
    if (!p) return;
    var e2 = p.el, done = true;
    if (k === ' ' || k === 'Enter') p.toggle()
    else if (k === ',') p.seek((e2.currentTime || 0) - 1);
    else if (k === '.') p.seek((e2.currentTime || 0) + 1);
    else if (k === '[') p.rate(-1);
    else if (k === ']') p.rate(1);
    else if (k === 'm' || k === 'M') btnMuteClick(p);
    else done = false;
    if (done) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
  function btnMuteClick(p) {
    var b = p.fig.querySelector('.mp-mute');
    if (b) b.click();
  }

  if (!previewMode) window.__deckHelp.push({
    title: { zh: '媒体播放', ja: 'メディア再生', en: 'Media' }[LANG],
    rows: [
      ['K', { zh: '播放 / 暂停本页媒体（不用先聚焦）', ja: 'このページの媒体的再生 / 一時停止（フォーカス不要）', en: 'play / pause this slide’s media (no focus needed)' }[LANG]],
      ['双击画面', { zh: '视频全屏（Esc 退回上一级全屏）；在演讲者窗的当前页卡里点全屏 = 听众窗全屏，卡片画面不动', ja: '画面をダブルクリックで全画面（Esc は一つ前の全画面へ）。発表者ウィンドウの現在ページのカードで全画面にすると、聴衆側だけが全画面になりカードはそのまま', en: 'double-click the picture for fullscreen (Escape steps back one level); from the presenter window’s current-slide card it is the AUDIENCE screen that goes fullscreen — the card does not move' }[LANG]],
      ['音频卡', { zh: '平时只留一枚小喇叭：鼠标移上去 / Tab 聚焦 / 触屏点一下才展开播放条', ja: '普段はスピーカーのアイコンだけ。ホバー / Tab / タップで再生バーが開く', en: 'rests as a small loudspeaker; hover, Tab or a tap unfolds the strip' }[LANG]],
      ['喇叭', { zh: '鼠标移上去 / 触屏点一下：上拉音量条；单击 = 静音', ja: 'ホバー / タップ：音量バーを上に。クリックでミュート', en: 'hover or tap: the volume slider pulls up; a click mutes' }[LANG]],
      ['Tab', { zh: '把焦点送进控制条，下面这些键才归媒体', ja: '操作バーにフォーカス（以下のキーはメディアのもの）', en: 'move focus into the bar — the keys below belong to the media only then' }[LANG]],
      ['Space · Enter', { zh: '聚焦控制条时：播放 / 暂停', ja: 'バー聚焦時：再生 / 一時停止', en: 'bar focused: play / pause' }[LANG]],
      [', · .', { zh: '聚焦控制条时：微调 ±1 秒', ja: 'バー聚焦時：±1 秒', en: 'bar focused: nudge ±1s' }[LANG]],
      ['[ · ]', { zh: '聚焦控制条时：降速 / 加速（0.5×–2×）', ja: 'バー聚焦時：減速 / 加速（0.5×–2×）', en: 'bar focused: slower / faster (0.5×–2×)' }[LANG]],
      ['M', { zh: '聚焦控制条时：静音（批注开着时它是荧光笔）', ja: 'バー聚焦時：ミュート（注記中は蛍光ペン）', en: 'bar focused: mute (the ink layer keeps M otherwise)' }[LANG]],
      ['← →', { zh: '始终翻页（不放给媒体）', ja: '常にページ送り（メディアには奪わせない）', en: 'always pages — never given to the media' }[LANG]]
    ]
  });

  /* ---------- paging ---------- */
  function go(n, skipHash) {
    n = Math.max(0, Math.min(N - 1, n));
    if (n === cur) return;
    if (cur >= 0) {
      var old = slides[cur];
      leaveAll(old);                       /* audio must not keep talking behind the next slide */
      old.classList.remove('active');
      old.classList.add('leaving');
      (function (el) { setTimeout(function () { el.classList.remove('leaving'); }, 340); })(old);
    }
    cur = n;
    var s = slides[cur];
    s.classList.add('active');
    attachIn(s);
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
      /* a thumbnail is a picture of the slide, not a second player: the deep clone would
         otherwise carry the injected bar and the media element along, and a control bar in
         a thumbnail answers to nothing (it reads as a broken player, and screen readers
         find four dead buttons per media page). Swap both for one static chip, and drop
         data-mp so every [data-mp] left in the document is a live player. */
      [].forEach.call(clone.querySelectorAll('[data-mp]'), function (f) {
        [].forEach.call(f.querySelectorAll('.mp-bar, .mp-track'), function (dead) {
          if (dead.parentNode) dead.parentNode.removeChild(dead);
        });
        var chip = document.createElement('div');
        chip.className = 'mp-ph';
        chip.setAttribute('aria-hidden', 'true');
        var el = f.querySelector('video, audio');
        if (el) el.parentNode.replaceChild(chip, el); else f.appendChild(chip);
        f.removeAttribute('data-mp');
      });
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
    /* while a media card holds the screen, the deck stands down: paging out from under a
       fullscreen clip is the one thing nobody wants. Escape is handled by the browser — and
       by the card's own capture handler when the screen was taken by the CSS take-over. */
    var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    if ((fsEl && fsEl.classList && fsEl.classList.contains('mp')) || screenBig) return;
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
    /* a[download] is a download, not navigation: the ink layer builds one in code to export
       a PNG. window.open() on a megabyte-long data: URL is not a download, it is a popup
       holding the whole image — so let the browser do what download="" means. */
    if (a.hasAttribute('download')) return;
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
                    /* -1 unless a clip owns this window's screen; the presenter badge reads it */
                    get mediaBig() { return bigPlayerId(); },
                    openOverview: openOverview, closeOverview: closeOverview,
                    toggleHelp: toggleHelp, get helpOpen() { return helpOpen(); } };
})();
