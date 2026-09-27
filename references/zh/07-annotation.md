# 第 7 步 · 屏幕批注（可选功能）

在成品 PPT 上叠一层实时笔迹：讲的人边说边在页面上画，翻页照常，笔迹跟着页走。**这是可选功能**——
当这份 PPT 要现场讲、上课用、当着人评审，或者用户说了"批注 / 画一下 / 白板 / annotate"时才提供。
只导出 PDF 或只发文件给人看的，就不加，并说明为什么没加。

## 1. 安装

整个功能是一个自包含块：`assets/ink-overlay.html`。

```bash
node assets/assemble.cjs deck.src.html deck.html --ink assets/ink-overlay.html
# 或者把该文件整段粘到成品 HTML 的 </body> 之前
```

它不改动 PPT 的 DOM、CSS 和 `deck-shell.js`。它依赖交互壳的 DOM 约定（`#viewport > #stage >
.slide.active`、`#overview`、`window.__deck.index`），`__deck` 不在时退回查 `.active` 下标。
交付前**只改文件里标出来的两个配置块**。

## 2. 配置块 1 · 主题（CSS）——工具条必须像从这份 PPT 里长出来的

叠加层只读 11 个自定义属性。把它们映射到这份 PPT 自己的 token 上；不要另造一套视觉，更不要拿
默认的暗青配色直接交付。

| Token | 映射到 | 说明 |
|---|---|---|
| `--ink-surface` | 本稿 `--panel`（或 `--bg`）加 alpha `.62–.70` | 亚克力底色，透明度决定页面透多少上来 |
| `--ink-tint` | 本稿 `--accent` 取 `.10–.15` | 只用于顶部渐变 |
| `--ink-line` / `--ink-hi` | 分隔线 + 顶部内高光 | 深色稿→白色 `.14–.18`；浅色→白色 `.6–.8`，**并且**要配一条暗内下沿（`--ink-lo`） |
| `--ink-lo` | 底部内暗线 | 深色→黑 `.25`；浅色→本稿最深墨色 `.08–.12` |
| `--ink-ink` | 本稿 `--ink`（正文主色） | 图标与文字 |
| `--ink-mut` | 本稿 `--muted` / `--faint` | 次要文字、滑杆轨道 |
| `--ink-accent` | 本稿 `--accent` | 选中态、`kbd` 徽标 |
| `--ink-on-bg` / `--ink-on-line` | `--accent` 的 `.18–.22` / `.55–.65` | 当前工具的按钮 |
| `--ink-warn` | 本稿 `--warn` | 状态条强调 |
| `--ink-blur` / `--ink-sat` | `26px` / `180%` | 页面本身纹理更花时把模糊调低 |
| `--ink-font` | 本稿的**辅助层**字体栈 | 绝不动正文和标题字体 |

明暗两套配方：

```css
/* 深色稿（--bg 近黑、文字浅） */
--ink-surface:rgba(17,27,24,.66); --ink-line:rgba(255,255,255,.15);
--ink-hi:rgba(255,255,255,.17);   --ink-lo:rgba(0,0,0,.28);  --ink-ink:#EAF1EC;

/* 浅色稿（纸白底、文字深） */
--ink-surface:rgba(255,255,255,.68); --ink-line:rgba(20,40,31,.14);
--ink-hi:rgba(255,255,255,.9);       --ink-lo:rgba(20,40,31,.10); --ink-ink:#14281F;
```

底线要测不要猜：`--ink-ink` 对 `--ink-surface` 合成到**它能压住的最亮东西**之上（工具条浮在页面上，
最坏情况是一张白色图表卡而不是 `--bg`）仍要 ≥ 4.5:1，因为标签只有 12–13px。跑 §7 的对比度探针。

## 3. 配置块 2 · PALETTE——五个颜色从这份 PPT 的配色里挑，第六个留给用户

`PALETTE` 是硬性笔色集合；第 6 块永远是用户自定义（虚线环、点开系统取色器、结果持久化）。按下面
的规则挑那五个：

1. **在笔迹真正落到的地方可读**——对本稿**主页面底色** ≥3:1。95% 的笔画画在它上面。
2. **其它表面只报告、不做硬门槛。** 每个候选也要对深色块和 `--accent` 填充打分并把比值列出来；
   若在本稿确实用到的某个表面上掉到约 2:1 以下，要么调它，要么在交付说明里把这个取舍写明白。
   动手前该知道的事实——一个色要同时对近白（`#F7F5F0`/`#FFFFFF`）和近黑墨色块都达到 3:1，它的相对
   亮度必须落在 **≈0.15–0.30**，而这条带子窄到装不下五个分得开的色相：12 个常用笔色只有 3 个过关，
   贪心拉开色相只剩 2 个。所以"双表面都过关"这个要求最多给一到两支"万能笔"，其余按主底色调。
3. **22px 下要分得开。** 比较候选要同时看色相和明度；只差饱和度的两个色点根本分不出来。
4. **不要把本稿的 `--accent` 或 `--warn` 当笔色**——批注会和它本来要指的高亮元素融在一起。
5. 近白只允许出现在深色稿，近黑只允许出现在浅色稿；两种模式都发的稿子去掉极端色，留中间调。

给候选打分，别靠眼睛：

```js
const lum = h => { const c = h.replace('#','').match(/../g).map(x => { let v = parseInt(x,16)/255;
  return v <= .03928 ? v/12.92 : Math.pow((v+.055)/1.055, 2.4); }); return .2126*c[0]+.7152*c[1]+.0722*c[2]; };
const ratio = (a,b) => { const [x,y] = [lum(a),lum(b)].sort((p,q)=>q-p); return +((x+.05)/(y+.05)).toFixed(2); };
// CSS 自定义属性里本来就是十六进制，直接按 hex 解析；拿 /\d+/g 当 rgb 解析器喂 "#F7F5F0"
// 会凭空造出一个颜色，然后整张表都错而不出声。
const surfaces = { bg:'#F7F5F0', card:'#FFFFFF', dark:'#14281F' };   // 从本稿读，别猜
const candidates = { red:'#C0392B', orange:'#B75E17', gold:'#8A6D1B', lime:'#4F7A12', teal:'#0E7A72',
                     green:'#1E7B4F', pink:'#B0306B', blue:'#2B5FA8', purple:'#8E3B8E', slate:'#4A5A6A' };
const table = Object.entries(candidates).map(([n,c]) => ({ n, c,
  worstBg:  Math.min(...[surfaces.bg].map(s => Math.max(ratio(c,s), 1/ratio(c,s)))),   // 硬门槛
  worstAll: Math.min(...Object.values(surfaces).map(s => Math.max(ratio(c,s), 1/ratio(c,s)))) }));
// 先取 worstBg ≥ 3，再两两拉开色相，最后把整张表打印出来
```

交付时把选中的五色连同它对每个表面的实测比值一起报出来——和数字审计同一套证据标准。

## 4. 谁拦谁（这一步弄错就会把 PPT 弄坏）

| 对象 | 机制 | 原因 |
|---|---|---|
| 批注画布 | `window` 捕获阶段 `stopImmediatePropagation`（click/dblclick/touch） | 原稿"点半屏翻页"和"滑动翻页"挂在 `document` 上；画布自己没有 click 处理器，掐断传播是安全的 |
| 键盘 | **什么都不拦**——方向键、空格、PageUp/Down、Home/End、1–9 在批注时照常翻页 | 讲课要边画边翻；只有 `Esc` 和工具键归批注层 |
| 工具条、两个浮层、提示条、快捷键卡、状态条 | 在**每个元素自己身上** `stopPropagation()` | 在 window 捕获层拦会连自己的 click 处理器一起废掉；`stopPropagation` 只影响其它节点，同节点处理器照跑，所以注册顺序无关 |
| 触摸画线 | 画布上 `touch-action:none` | 否则浏览器把手势当成滚动/缩放，画两笔就跳页 |

块末尾的 `isolate()` 负责第三行——以后新增任何批注界面都要加进去，否则点它会翻页。

## 5. 数据模型（别"顺手优化"掉）

- 笔迹是**数据**不是像素：`{t:'p'|'m'|'x', c, w, pr, pts:[[nx,ny,pressure],…]}`。`nx,ny` 相对
  `#stage` 归一化，所以换窗口尺寸、换投影仪都能映射回页面上同一个位置，线宽跟着缩放而不是糊掉。
- 永远从数据重绘（`draw()`），撤销、清空、缩放、切页、导出 PNG 因此都是免费的。撤销是按页快照栈，
  上限 80 条。
- **墨迹橡皮也存成一条笔迹**（`t:'x'`），用 `destination-out` 按数组顺序画在它要擦的墨之上。因此
  擦除结果能扛住缩放和撤销，并且一次擦除整体可删。**笔画橡皮**则是删掉命中的那条（并跳过 `x`
  条目，避免"擦掉一块橡皮"这种说不清的操作）。
- 每页一个数组（`p0`、`p1`…）；落笔瞬间就锁定页号，所以画到一半按 → 不会把这一笔漏到下一页。
- 存储键：`ink.v1|<页面标题>` 存笔迹，`.size` 存两支笔各自的粗细，`.color` 存自定义色，`.hint`
  存一次性提示，`.fab` 存右下角小按钮拖拽后的位置。用标题而不是路径，改文件名不丢批注。全部包在
  `try/catch` 里：写不进去时功能照常，状态条提示用户去导出 JSON。
- **跨窗同步（第 8 步）**：同一份文件在演讲者窗的 `?preview=N` iframe 里还会再跑一个墨水层实例。
  每次 `save()` 带**修订号**广播（本窗 `ink:change` 事件 / 预览里走 `parent.postMessage` 的
  `ink-cmd`），对端只在修订号更新时整包接管，且**不再转发**——回显靠修订号挡住，最后写入者胜。
  远端接管会成为一条 `k:'*'` 的撤销步：在听众窗 `Ctrl+Z` 能撤掉演讲者窗里画的那笔，反之亦然。

## 6. 功能清单（写进交付说明用）

`A` 或右下角按钮开关批注 · 钢笔 · 荧光笔 · 橡皮 · 5 色 + 1 自定义 · 再点当前工具弹它自己的小窗
（两支笔是滑杆 + 数字，橡皮是两种模式） · `[` `]` 微调当前笔 · `C` 循环换色 · 任意工具下右键拖动
= 临时擦除 · `Ctrl+Z` / `Ctrl+Shift+Z` · `X` 清空本页（可撤销） · `V` 隐藏而非删除 · `S` 导出本页
笔迹 PNG · JSON 导出/导入做备份 · `?` 快捷键卡 · `Q` 壳的快捷键面板（本层键位已注册进去）。
手写笔压感改变粗细，鼠标与手指等宽。

**右下角小按钮**：保持原来那枚细斜笔字形，**可拖拽挪位**（>6px 判定为拖拽，位置按 `.fab` 键记住；
**双击**清掉记住的位置回默认右下角；单击仍是开批注）。工具栏里的**开/关按钮用 ⏻（电源/关机符号）**——它的动作就是
"关掉批注这一层"，图形要说清点击会发生什么；它**不带选中态高亮**（`.on` 只给"当前选中的工具"和切换可见性
的按钮，⏻ 不是被选中的东西，别给它加蓝框）。**钢笔与荧光笔的图标剪影刻意拉开**：钢笔 = 细斜笔身 +
笔尖下一道波浪线；荧光笔 = 本 skill 自绘的细笔身（45° 斜置、笔身宽只有 3 单位）+ 帽身分界 + 斜切头
+ 底下一条半透明高亮带，靠"有没有色带"区分。17px 下要一眼可辨，别改回两个近似的笔形，也别把笔身
加粗回去。`assets/icon.svg` 仍是 skill 自己的标识文件，只是不再塞进工具栏。

**演讲者窗里批注**（需同装第 8 步）：预览 iframe 本身就是这份稿子，当前页卡的 `pointer-events`
放开、演讲者窗卡片上有一枚「批注」按钮开/关墨水层；在预览里画的笔迹实时同步回听众窗（见 §5 的
修订号协议），反之亦然。落笔结束后把焦点交还演讲者窗（`parent.focus()`），← → 立刻可翻页。

## 7. 验收（必做——下面那些坑都是这样发现的）

静态检查：

```bash
grep -c 'id="inkc"\|id="inkbar"\|id="inkpop"\|id="inkmenu"' deck.html      # 应为 4
grep -n 'PALETTE = \|SIZE = \|L = /^zh' deck.html                            # 两个配置块在位
grep -n 'localStorage' deck.html                                             # 只应出现在批注块内
```

浏览器实测，用内置浏览器的 `evaluate_script`。至少断言：

```js
// 开关批注、任何批注界面都不翻页、键盘翻页照常
const ink = window.InkOverlay, bar = document.getElementById('inkbar');
const click = el => el.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true}));
const key = k => document.body.dispatchEvent(new KeyboardEvent('keydown', {key:k, bubbles:true, cancelable:true}));
const page = () => ink.page();
click(document.getElementById('inkfab'));                       // 页码必须不变
key('ArrowRight'); key(' '); key('5');                          // 必须照常翻页
[...bar.querySelectorAll('button')].forEach(click);             // 页码必须不变
// 粗细：钢笔与荧光笔量程不同、各自记住
ink.tool('p'); const p1 = ink.size('p'); ink.setSize('m', ink.size('m') + 8);
// 橡皮：墨迹只擦经过的部分，笔画删整条，两者都可撤销
// 几何：工具条高 <60（单行）、浮层中心偏差 ≤2px 且在其按钮上方 10px
// FAB：瓷贴图标在位、可拖拽记忆、双击复位、单击仍开批注
const fab = document.getElementById('inkfab');
!!fab.querySelector('svg rect[fill="#14281F"]');                 // skill 瓷贴图标
fab.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true, clientX:…, clientY:…, pointerId:1, button:0, isPrimary:true}));
//   → pointermove 拖出 >6px → pointerup；断言 style.left/top 变了、`ink.v1.fab|<标题>` 写入、没开批注；
//     再 click() 断言批注开了（拖拽不吃掉点击）
// 跨窗撤销：演讲者窗里画一笔 → 本窗 store 多一条 → undo() → 两边像素都归零（见第 8 步 §7）
```

笔迹本身要采像素证明，别只看数据：

```js
const cv = document.getElementById('inkc'), ctx = cv.getContext('2d');
const D = cv.width / innerWidth;                     // dpr！getImageData 用的是设备像素
const r = document.getElementById('stage').getBoundingClientRect();
const band = (fx, fy) => { const x = Math.round((r.left + fx*r.width)*D), y = Math.round((r.top + fy*r.height)*D);
  let run = 0, best = 0;
  for (let i = y - 30; i < y + 30; i++) { if (i < 0 || i >= cv.height) continue;
    if (ctx.getImageData(x, i, 1, 1).data[3] > 40) { run++; best = Math.max(best, run); } else run = 0; }
  return best; };
// 期望 band ≈ 粗细 × (舞台宽 / 1280)，再加每边约 1px 抗锯齿
```

然后重载确认笔迹回来了，并在交付前清掉自己的测试数据（`localStorage` 键 + 内存里的 store）——
用户打开的必须是一份干净的稿子。

## 8. 已经踩过并付过账的坑

1. `backdrop-filter`（和 `filter` 一样）会**让祖先成为 `position:fixed` 后代的包含块**。把浮层嵌在
   亚克力工具条里，它的 `left/bottom` 就从工具条左上角算起——实测偏 28px、高出 293px。浮层必须放
   在 body 层级。
2. 居中的定宽条（`left:50%` + `translateX(-50%)`）**可用宽度只有半个视口**。加上
   `flex-wrap:nowrap` 它不会溢出而是被挤扁（753px 的内容被压成 528px）。要写 `width:max-content`。
3. 把按钮从已样式化的容器里搬出去，**浏览器默认按钮灰底会直接露出来**。新作用域里要把
   `background/border/color/font` 整套重写一遍。
4. 隐藏标签页里 `requestAnimationFrame` 是暂停的：缩放后的重绘必须同步做（本块注册在
   `deck-shell.js` 之后，`fit()` 已经算完），并留一个 `redraw()` 出口给测试。
5. 冒泡到 `document` 的点击就是原稿的翻页处理器——每个批注界面都要 `isolate`。
6. `file://` 上 `navigate` 会把 `?v=N` 和 `#hash` 整个剥掉；而且 `hashchange`、`MutationObserver`、
   class 变更都是异步的：要在**下一次工具调用**里读，别在同一个脚本里同步读。
7. 测试脚本自己的状态会漂移：一次点遍所有按钮会把最后的工具/可见性留在末态，后面断言全被污染。
   每组测量前先打印 `InkOverlay.eraser()/pop()/page()`。
8. `getImageData` 的坐标是设备像素（要乘 `cv.width / innerWidth`），而且采样点掉出画布外会读到全
   透明——这种情况要返回 `OUT` 而不是假装是 0。

## 9. 交付时必须说明的边界

- 笔迹**不进打印和 PDF**（`@media print` 里是有意隐藏的）。要"页面 + 笔迹"合成一张图只能配合截图；
  在页内合成需要 html2canvas，会破坏零依赖前提。
- 存储按浏览器配置和源隔离；`file://` 下所有本地文件共用一个桶。清站点数据、换电脑、换浏览器都会
  丢批注 → 用 JSON 导出。
- PNG 导出只有笔迹层，透明底，尺寸等于视口。
- 手机上交互壳的竖屏遮罩会盖住一切；批注是给上台讲的人用的功能。
