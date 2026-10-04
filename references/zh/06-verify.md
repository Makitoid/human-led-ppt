# 第 6 步 · 自检与交付

顺序：静态自检 → 浏览器实测 → 数字审计 → 交付。任何一项没过就回去改，不要把未验证的东西当完成品交出去。

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
//    fig.dataset.state === 'error' 且 fig.querySelector('.mp-note') 有文案（人话，不是报错码）
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
// 8) 音量与全屏：音量不是常驻滑杆——鼠标移到 .mp-mute 上（触屏则点一下）才弹出 .mp-volpop，
//    上拉条 .mp-volr 拖动要连续改 el.volume（0–1 无级），拖到 0 即静音；鼠标单击喇叭是切静音。
//    稿子已经全屏（按过 F）时再点视频卡的 .mp-fs，应当嵌套进媒体全屏——按 Esc 回到稿子的全屏，
//    而不是直接掉回窗口。
// 9) 全屏的归属：正常窗口里视频卡查得到 .mp-fs，点了占住的是**这个窗口**。在 `?preview=N` 的 iframe
//    （演讲者窗的当前页卡）里同一个按钮也在、也点得动，但画面**不许**铺满演讲者窗：那条请求走
//    media-fs → presenter-media-fs 桥到听众窗，占屏幕的是听众窗，卡里还是全屏前那一页，
//    磁贴右上角亮「视频全屏中」badge（见 08-presenter-mode.md §3）。听众窗自己按 Esc / 翻离该页，
//    badge 要跟着灭——状态以听众窗为准，不是以卡为准。
```

第 7 条是这一版新增的必查项，它对**每一个**媒体页都要跑一遍（`for` 循环遍历 `#stage [data-mp]` 即可）。
窄窗口里 `#rotate-mask` 会盖住整屏，`elementFromPoint` 一律返回它——那不是 bug，是测试环境：
先把窗口拉宽（或临时 `mask.classList.remove('show')`）再判 `barReachable`。

源文件要**真的和 HTML 放在一起**再测——`file://` 下路径不对就是第 6 条那个容错分支，两件事一起验完。
内联图片另测一条：`img.complete === true && img.naturalWidth > 0`，并确认 `img.src` 以 `data:image/` 开头。

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

### 2.2 批注 / 黑板（装了第 7 步时）

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
- **实测通过项**：导航、G 总览、点击半屏、hash、竖屏遮罩、零外部请求、逐页无溢出、字号下限、数字审计
- **有媒体时**：音视频文件名清单 + "要连同文件夹一起拷走"这句提醒；图片是内联的所以不受影响
- **未验证项与假设**：例如打印分页未实测、某来源因网络不可达未核实、深链只在桌面验证
- 需要用户拍板的点（如署名、是否保留某页）
- 启用了哪个可选层，以及它带来的例外（批注层的 localStorage / 演讲者层的弹窗权限与不打印提示词）——细节按 `07-annotation.md` §7、`08-presenter-mode.md` §9 补

不要只说"已完成"。用户要靠这段判断能不能直接上台。
