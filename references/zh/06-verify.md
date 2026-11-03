# 第 6 步 · 自检与交付

> `target` 含 `native-pptx` 时，本步改读 `06b-pptx.md`；下面只服务 HTML 主轨。

顺序：**先问一句** → 静态自检 → 浏览器实测 → 数字审计 → 交付。任何一项没过就回去改，未验证项须明确披露。

## 0. 先问用户：自检由谁跑

进入验收前确认检查归属，已有选择直接沿用。

- Agent 检查：执行静态核对、浏览器实测与数字审计。
- 用户自检：仍完成 §1 静态核对；其余按要求提供脚本、预期结果和未验证项。
- 交付说明区分 Agent 实测、用户自行验证与未验证项。

## 1. 静态自检

```bash
# 零外部依赖
grep -nEo '<(script|link|img|iframe)[^>]*(src|href)="(https?:)?//[^"]*"' <主题>.html
grep -n 'localStorage\|sessionStorage\|fetch(\|XMLHttpRequest' <主题>.html

# 页数与骨架一致
grep -c 'class="slide"' <主题>.html        # 对比骨架 §1 slides
grep -o 'data-i="[0-9]*"' <主题>.html      # 应连续且与渲染页码序列一致

# 每页都有引用条（封面/幕间页可豁免，但要在骨架里写明）
grep -c 'class="foot"' <主题>.html

# 骨架 §4 的词表注释只给人看，不许泄漏进成品（应为 0）
grep -c '⧉\|词表注释\|legend start' <主题>.html

# 链接协议：只允许 http(s)、#sN 和本地相对路径；下列危险协议应为 0（装配器也会拦）
grep -nEo '<a[^>]*href="(javascript|vbscript|data):' <主题>.html
```

数媒体图时不要对成品裸 grep `data-src`：内联进来的壳在自己的 JS 注释里就带着示例 `data-src="clip.mp4"`，那两行永远命中；改数 `#stage` 里的 `[data-mp]`，或者 grep `class="mp"`。

再确认：`<meta name="viewport">` 存在；`#viewport/#stage/#overview/#aria/#rotate-mask` 齐备；`.notes` 里的内容没有以可见形式出现在页面上。

## 2. 浏览器实测

内置浏览器常截不了图，用 `evaluate_script` 做结构断言；每次改完文件必须换 `?v=N` 重载，否则测的是缓存。

```js
async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const key = k => document.dispatchEvent(new KeyboardEvent('keydown', {key:k, bubbles:true, cancelable:true}));
  const out = {total: window.__deck.total, hash: location.hash};
  // 导航
  key(' '); await sleep(450); out.afterSpace = window.__deck.index;
  key('ArrowLeft'); await sleep(450); out.afterLeft = window.__deck.index;
  key('End'); await sleep(450); out.afterEnd = window.__deck.index;
  key('Home'); await sleep(450);
  key('3'); await sleep(450); out.afterDigit3 = {idx: window.__deck.index, hash: location.hash};
  // 点击左右半屏
  const r = document.getElementById('stage').getBoundingClientRect();
  document.body.dispatchEvent(new MouseEvent('click',{clientX:r.left+r.width*0.9, clientY:r.top+r.height*0.85, bubbles:true, cancelable:true}));
  await sleep(450); out.afterClickRight = window.__deck.index;
  // G 总览
  key('g'); await sleep(200);
  const ov = document.getElementById('overview');
  out.overview = {open: ov.classList.contains('open'), thumbs: ov.querySelectorAll('.thumb').length,
                  scale: ov.querySelector('.thumb-slide')?.style.transform,
                  caps: [...ov.querySelectorAll('.capno')].map(e=>e.textContent)};
  ov.querySelectorAll('.thumb')[0].click(); await sleep(450);
  out.thumbJump = {idx: window.__deck.index, closed: !ov.classList.contains('open')};
  // 逐页溢出 + 字号 + 缩放
  const bad = [];
  for (let i=0;i<window.__deck.total;i++){
    window.__deck.go(i); await sleep(120);
    const s = document.querySelectorAll('#stage > .slide')[i];
    if (s.scrollHeight > s.clientHeight + 2 || s.scrollWidth > s.clientWidth + 2)
      bad.push({i:i+1, sh:s.scrollHeight, ch:s.clientHeight, sw:s.scrollWidth, cw:s.clientWidth});
    // 字号下限只查正文类元素；引用条/标签/kicker 按设计就是小字，排除
    s.querySelectorAll('p,li,td,span').forEach(el=>{
      if (el.closest('.notes, .foot, .kicker, .srcline, .badge, .capno')) return;
      if (el.textContent.trim() && parseFloat(getComputedStyle(el).fontSize) < 21.5)
        bad.push({i:i+1, small:Math.round(parseFloat(getComputedStyle(el).fontSize))+'px', text:el.textContent.trim().slice(0,24)});
    });
  }
  out.problems = bad;
  out.stageTransform = document.getElementById('stage').style.transform;
  // 竖屏遮罩版式
  const m = document.getElementById('rotate-mask'); m.classList.add('show');
  out.mask = getComputedStyle(m).display; m.classList.remove('show');
  return JSON.stringify(out);
}
```

深链与打印：直接访问 `<主题>.html#s7` 应落在第 7 页；`Ctrl+P` 预览应一页一纸（内置浏览器做不到时用 `@media print` 规则存在性核对，并说明未实测）。

快捷键面板：按真按键 `Q` 应弹出 `#deckhelp`，分区块里至少有壳那段「翻页与视图」；装了可选层的话，
`window.__deckHelp` 里还应有批注层和演讲者层注册的段落。`Esc` 关闭，面板打开时批注工具条与小按钮
全部隐藏（`#deckhelp.open ~ …` 的兄弟选择器），点面板空白处不翻页。`?preview=N` 里按 `Q` 应无反应。

对比度（尤其玻璃/低对比方案）：

```js
const lum = c => { const [r,g,b]=c.match(/\d+/g).map(Number).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}); return .2126*r+.7152*g+.0722*b; };
const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p); return ((x+.05)/(y+.05)).toFixed(2); };
// 对每个正文元素取 getComputedStyle(el).color 与其最近的不透明祖先 background-color 比对
```

移动端：把窗口收到 390×844 竖屏，遮罩应出现；转 844×390 应消失且画面完整缩放。

### 2.1 媒体（有 `image` / `audio` / `video` 时必跑）

```js
// 1) 结构：壳接管后长这样，且没有作者自带的 controls
const fig = document.querySelector('#stage .slide.active [data-mp]');
out.mp = {kind: fig.dataset.kind,
          hasBar: !!fig.querySelector('.mp-bar'),
          elClass: fig.querySelector('video,audio').className,   // 应含 mp-el
          controls: fig.querySelector('video,audio').controls,   // 必须 false
          dataSrcLeft: fig.querySelector('video,audio').hasAttribute('data-src')};  // 必须 false：已被摘走
// 2) 盒子被约束在卡片里：纯音频页**静止时只留一枚小喇叭瓷贴**（.mp 高度 <48px、宽度 ≈ 一枚按钮），
//    不该是一整块空白面板；鼠标移上去 / Tab 聚焦 / 触屏点一下（fig 上有 data-open="1"）才展开整条
out.audioBox = fig.getBoundingClientRect().height;
// 3) 走一遍该页：K 播放 → 播放按钮 aria-label 由「播放」变「暂停」→ 再按回「播放」
// 4) 翻页即停：离开这一页后 video.paused === true 且 currentTime === 0
// 5) ← → 永远翻页：焦点落在控制条按钮上时按 ArrowRight，页码仍要变
// 6) 容错分支：临时把某一页的 data-src 改成不存在的文件名，断言
//    fig.dataset.state === 'error'，且播放框**内**出现 .mp-missing（「视频未找到」/「音频未找到」），
//    画面与控制条让位（.mp-el / .mp-bar 为 display:none）；下方那层旧 .mp-note 已退役，查不到是正常的
// 7) 溢出自查（必查）：控制条在画面下方、是卡片的一部分，卡片不许顶破 .slide 的裁剪框
const s = fig.closest('.slide'), bar = fig.querySelector('.mp-bar');
const limit = s.clientHeight - parseFloat(getComputedStyle(s).paddingBottom);
const br = bar.getBoundingClientRect();
const hit = document.elementFromPoint(br.left + br.width / 2, br.top + br.height / 2);
out.overflow = {cardBottom: fig.offsetTop + fig.offsetHeight, limit,
                fits: fig.offsetTop + fig.offsetHeight <= limit,
                barReachable: !!(hit && hit.closest && hit.closest('.mp-bar'))};
//   两条都必须为 true：fits=false 说明卡片比这一页剩下的空间还高（条被裁在画布外），
//   barReachable=false 说明条在 DOM 里躺着但点不到——那等于没有播放器。壳不会替你夹住它，
//   这是构建错误，回去按 05-build 的"卡片高度含条"改尺寸。
//   进度条就在条里、常驻，所以对 .mp-track 的中点做同样的 elementFromPoint 也要命中它。
//   音频页要**先展开再量**：静止时 .mp-fold 是 display:none，条本来就不该命中——
//   那一步先 fig.setAttribute('data-open','1')，量完再摘掉；静止态另断言喇叭 .mp-mute 自己可点。
//   音频条展开后是**左对齐、向右长**的窄条：`.mp-bar` 从喇叭所在位置向右展开，左边缘不跳；
//   内容宽 416px（`min(100%,416px)`，即原来 520px 的 80%，外框约 438px）。量展开前后的
//   `getBoundingClientRect()`：left 差值应 ≤1px（向左展开会让它变成负值），宽度应落在 400–460；
//   居中展开时 left 会变成 (figWidth−barWidth)/2，直接判失败。
// 8) 音量与全屏：音量不是常驻滑杆——鼠标移到 .mp-mute 上（触屏则点一下）才弹出 .mp-volpop，**弹层必须与按钮零间隙相接**：给 wrap 打上 data-vol="1" 后，从 .mp-volwrap 顶边向上 0–6px 逐点 elementFromPoint，每一枪都要命中 .mp-volpop（命中落回 #stage 就说明中间有死区，鼠标永远抓不到滑杆，只能先点一下喇叭）；滑杆本身要对按钮水平居中（pop 中心与 wrap 中心之差 ≤ 1px），
//    上拉条 .mp-volr 拖动要连续改 el.volume（0–1 无级），拖到 0 即静音；鼠标单击喇叭是切静音。
//    稿子已经全屏（按过 F）时再点视频卡的 .mp-fs，应当嵌套进媒体全屏——按 Esc 回到稿子的全屏，
//    而不是直接掉回窗口。
// 9) 全屏的归属：正常窗口里视频卡查得到 .mp-fs，点了占住的是**这个窗口**。在 `?preview=N` 的 iframe
//    （演讲者窗的当前页卡）里同一个按钮也在、也点得动，但画面**不许**铺满演讲者窗：那条请求走
//    media-fs → presenter-media-fs 桥到听众窗，占屏幕的是听众窗，卡里还是全屏前那一页，
//    磁贴右上角亮「视频全屏中」badge（见 08-presenter-mode.md §3）。听众窗自己按 Esc / 翻离该页，
//    badge 要跟着灭——状态以听众窗为准，不是以卡为准。
// 10) 媒体遥控（装 --presenter 且有 [data-mp] 时）：在演讲者窗当前页卡里点 .mp-btn-play，
//     听众窗的 video/audio 必须真的 paused=false、currentTime 前进，卡里的图标/时间/进度同步跟；
//     反向点听众窗的条，卡里也要跟；拖卡里的 .mp-track，听众窗落到同一时间（±0.3s）。
//     卡里的音频元素不许有 src（不二次下载），视频元素必须 muted（演讲者窗不出声）。
//     换页后两边归零暂停。自动播放被拦时先真实点击听众窗一次再重跑。
```

第 7 条是这一版新增的必查项，它对**每一个**媒体页都要跑一遍（`for` 循环遍历 `#stage [data-mp]` 即可）。
窄窗口里 `#rotate-mask` 会盖住整屏，`elementFromPoint` 一律返回它——那不是 bug，是测试环境：
先把窗口拉宽（或临时 `mask.classList.remove('show')`）再判 `barReachable`。

源文件要**真的和 HTML 放在一起**再测——`file://` 下路径不对就是第 6 条那个容错分支，两件事一起验完。
内联图片另测一条：`img.complete === true && img.naturalWidth > 0`，并确认 `img.src` 以 `data:image/` 开头。

### 2.2 满版背景 与 证据链（有 `background` 关键字、或要看证据链时跑）

```js
// 背景：壳把 data-bg 内联进 style.backgroundImage；属性保留（作者 CSS 靠它抬层），值在文件里仍只有一份
const bg = document.querySelector('#stage .slide[data-i="1"]');
out.bg = {attrKept: bg.hasAttribute('data-bg'),   // 应为 true：属性保留
          style: /^url\("data:image\//.test(bg.style.backgroundImage)};   // 应为 true：已内联
// 内容抬层：这一页的正文容器 z-index 要 > 0，否则被遮罩盖住、字看不见
const body = bg.querySelector('.slide-body');
out.bgContent = parseFloat(getComputedStyle(body).zIndex) >= 1;
// 遮罩存在（::after 有 background-image 渐变），且对比度达标留给第 3 节数字审计按正文色量

// 证据链：**按稿开启**——骨架 §1 写了 evidence_chain: on 的稿子，构建时给 <html>/<body> 加了 data-evidence="1"，才会建徽标
const evDecl = document.documentElement.getAttribute('data-evidence') || document.body.getAttribute('data-evidence') || '';
out.evDeclared = /^(1|on|yes|true)$/i.test(evDecl);          // 这份稿子有没有开
const ev = document.getElementById('evidence');
out.ev = ev ? {exists:true, visible:getComputedStyle(ev).visibility, text:ev.textContent.trim().slice(0,20)}
            : {exists:false};                                // 未开启时应为 {exists:false}
// 开了的稿子：徽标可见、计数 > 0（前提是这一页写了 .foot）；没开的稿子 ev 必须为 null，右下角干净
if (ev) { ev.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})); await sleep(60); }
out.evOpen = ev && {open: ev.getAttribute('data-open')==='1', rows: ev.querySelectorAll('.ev-list li').length,
           matchesFoot: (()=>{const f=document.querySelector('#stage .slide.active .foot');
                              return !f || ev.textContent.indexOf(f.textContent.replace(/↗|\s+/g,' ').trim().slice(0,8))>=0;})()};
// 打印不出现：@media print 规则含 #evidence
```

> 证据显示只取决于作者的明确同意，与稿件是否严肃无关。未确认或拒绝时 `evidence_chain: off`，`out.ev.exists` 必须为 false；明确同意并开启时才检查徽标可见。没有切换热键。

三条探针坑（实测踩过，写脚本前先读）：

- 媒体选择器要限定在 `#stage` 里。`[data-mp]` 现在**只匹配活着的播放器**；总览缩略图里放的是静态
  `.mp-ph` 片（黑块加一个播放字形，没有控制条、没有媒体元素）。数出来是预期的两倍，说明你在测旧构建。
- 传输条作用域的键（`, . [ ] M Space Enter`）必须**打在条内的控件上**，例如
  `fig.querySelector('.mp-btn-play').dispatchEvent(new KeyboardEvent('keydown',{key:']',bubbles:true,cancelable:true}))`。
  在 `document` 上合成的 keydown，其 `target === document`，`target.closest('[data-mp]')` 是 null，壳按
  设计忽略它——于是你"测出"一条死快捷键，而真实按键其实是好的。全局的媒体键只有 `K`。另外：浏览器面板
  丢掉系统焦点时，真实按键会被无声丢弃——先重新聚焦，或改用元素上的 dispatch。
- `file://` 下内置浏览器会剥掉查询串，`?preview=N`（以及本文其他地方用的 `?v=N` 缓存位）根本到不了页面；
  预览模式要走 `http://localhost` 测，或者把演讲者窗打开一次。**目录名**含中文时内置浏览器可能加载失败
  （测试稿放 ASCII 目录），但 `data-src` **文件名**里的中文和空格是好的，已实测通过，不需要手工 URL 编码。

### 2.3 批注 / 黑板（装了第 7 步时）

- `A` 开批注后，方向键 / 空格 / 数字键仍照常翻页；
- `B` 进黑板：`body` 带 `board`、整页换成那块深底黑板、状态条出现、调色板换成那套粉笔色（每支笔对
  `#1D2A26` 都 ≥4.5:1，逐色比值见 `07-annotation.md` §6.1），荧光笔色带在黑板上按 `.55` 透明度画，
  因而在深底上过 3:1；
  **黑板笔迹翻页后仍在**（同一份数据，不是每页一份），**回到幻灯片时黑板笔迹不外泄、幻灯片笔迹原样还在**；
- `X` 只清当前这一面（黑板上按 X 不会连带清掉某一页的批注）；
- 批注开着时按 `S` 只导出 PNG，**不会**顺带弹出演讲者窗（两层的 `S` 必须互斥，见 `07-annotation.md` §8）；
- 演讲者窗（若同装）：窗里**恰好四张** `.pcard`（`c-cur` `c-nxt` `c-pmt` `c-ovw`），没有一张是黑板，
  也没有任何 iframe 带着 `board=1`；把某张卡改大或拖开、松手（mouseup）后它必须仍盖在邻居上面
  （`parseInt(card.style.zIndex,10)` 变大、不掉回 `z-index:auto`），刷新后这个前后次序还在——
  `z` 和 x/y/w/h 一起存在布局记录 `pv.v2|` 里。

### 2.4 视觉层级与对比度（逐页必跑）

这一节查四件事：每页是不是只有一个主语、字号阶梯有没有拉开、accent 有没有超预算、所有文字在**实际背景**上是否达标。它替代"看起来还行"的目检。

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
    const leaves = [...s.querySelectorAll('*')].filter(el => vis(el) && !el.closest('.notes') && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
    const items = leaves.map(el => ({ el, fs: parseFloat(getComputedStyle(el).fontSize), text: el.textContent.trim().slice(0, 18) }));
    const sorted = [...items].sort((a,b) => b.fs - a.fs);
    const topFs = sorted[0] ? sorted[0].fs : 0;
    const top = sorted.filter(x => Math.abs(x.fs - topFs) <= 1);
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

判读（任一不满足就回去改，按指标验收）：

- **主语**：`primaryCandidates` 应为 `1`；`primaryCandidates` 在 `2–4` 之间时，只有 `kpiTop === true` 且 `accentBlocks === 1` 才算过（一组 KPI 里有一张明显是主角）。其他情况一律按"两个最大字号并列"重排。
- **阶梯**：`topSecond ≥ 1.4`、`topBody ≥ 1.5`（封面 / 幕间 / 来源 / 致谢这类无 `key` 的页以 `h2` 为主语时 `topBody ≥ 1.4`）。低于说明标题 / 正文在往上挤，层级没拉开。
- **强调预算**：`accentBlocks ≤ 1`。大于 1 说明 accent 从"定位"变成了"底色"；为 `null` 说明 `:root` 没声明 `--accent`，先补令牌再重跑。
- **对比度**：`lowContrast` 必须为空；`unknownBg` 不为空说明文字压在图片或渐变上，脚本量不了，按"遮罩后最亮处"人工测一次并写进交付说明。
- **令牌自检**：`--muted` 对 `--bg` 与 `--panel` 各测一次 ≥4.5:1，`--accent-ink` 对 `--accent` ≥4.5:1。页面里出现 `opacity`/`rgba()` 文字色，按合成色重算，不按令牌值算。
- **灰度目检**：给 `#stage` 临时加 `filter:grayscale(1)`，逐页看主语是否仍是第一眼可辨；去掉颜色就分不出主次的页，回去改字号 / 字重 / 位置。这一项截图不了就写"未实测"，不要默认通过。

### 2.5 链接（有 `link` 关键字、引用条或来源页时跑）

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

- 每条 `fileLinks`：`samePage` 必须为 `true`（点文件链接不翻页），`blank` 与 `noopener` 必须为 `true`。
- `jumps` 的 `index` 必须等于 `#sN` 里的 N−1；跳完记得 `window.__deck.go(0)` 回首页。
- 静态侧：`grep -nEo '<a[^>]*href="(javascript|vbscript|data):' <主题>.html` 必须为 0 行；`href` 是相对路径的，确认目标文件就在 `.html` 同目录（装配时 `linkErrors` 已经查过一次，这里再核交付文件夹里确实有它）。
- 真机再点一次本地链接：浏览器新开一处显示该文件，演示稿本身没有被替换；打不开就说明 `target` 漏了或文件没跟着拷。

## 3. 数字审计（不可跳过）

逐页把 HTML 上出现的**每一个数字和主张**回指到资料总结的具体行：

- 数字、单位、年份、来源四要素齐备且与资料总结一致
- 推算值页面上写了"据…推算"；⚠️ 有分歧说明；🔍 措辞是"据…转引"；⛔ 条目一次都没出现
- 被纠正过的误读没有被按错误版本复述
- 无来源的数字、形容词化断言（"惊人""遥遥领先"）、把估算写成定论 → 一律删改
- 骨架 §4 该页的每个关键字条目与 HTML 一一对应，可数：`points` 几条、`table` 几行、`steps` 几步、`defs` 几条、`code` 看哪两行。骨架有而 HTML 没有 = 漏做；HTML 有而骨架没有 = 擅自加内容

发现冲突按 `05-build.md` 的分级处理，并同步骨架与资料总结。

## 4. 交付说明

给用户的回复包含：

- 三个文件的可点击链接（HTML / 骨架 / 资料总结），HTML 放最前
- 页数、时长合计、风格名
- **实测通过项**：导航、G 总览、点击半屏、hash、竖屏遮罩、零外部请求、逐页无溢出、字号下限、**逐页单一主语 / 字号阶梯 / accent 预算 / 全文字对比度**、数字审计
- **有媒体时**：音视频文件名清单 + "要连同文件夹一起拷走"这句提醒；图片是内联的所以不受影响
- **有 `link` 时**：列出每个本地链接的文件名，并说明它必须和 `.html` 放在同一文件夹一起交付；外链单独标出
- **未验证项与假设**：例如打印分页未实测、某来源因网络不可达未核实、深链只在桌面验证
- 需要用户拍板的点（如署名、是否保留某页）
- 启用了哪个可选层，以及它带来的例外（批注层的 localStorage / 演讲者层的弹窗权限与不打印提示词）——细节按 `07-annotation.md` §7、`08-presenter-mode.md` §9 补
- **证据链**：默认不显示，先询问作者，明确同意后才开启；开启时按页汇总真实来源，点击展开，无切换热键。
- **背景图**：若用了 `background`，说明背景已内联进 HTML（不产生外部文件），是 `image` 之外的另一类图
- **自检归属**：写清这一轮是"agent 实测通过"还是"脚本已交付、由用户自行验证"（见本步第 0 节）

不要只说"已完成"。用户要靠这段判断能不能直接上台。
