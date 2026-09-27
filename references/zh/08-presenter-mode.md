# 第 8 步 · 演讲者模式（可选功能）

给讲的人开第二个窗口：顶部一条固定横幅装着**计时**与翻页按钮，左边是**正在放的这一页**和**下一页**的
等比预览，右边是**这一页的提示词**和**全部幻灯片的总览**。听众那一屏完全不受影响。**这是可选功能**——只有这份 PPT 真的要在台上讲、要连着讲十几页、
或者用户说了"演讲者模式 / 提词 / 双屏 / presenter / 备注看不见怎么办"时才提供。
纯发文件让人自己翻、或者只导 PDF 的，不加，并说明为什么没加。

顺序上它排在自检与交付（第 6 步）之后：先保证稿子本身站得住，再给演讲者加工具窗。

## 1. 安装

整个功能是一个自包含块：`assets/presenter-overlay.html`。

```bash
node assets/assemble.cjs deck.src.html deck.html --presenter assets/presenter-overlay.html

# 和第 7 步的批注叠加层同时用（顺序固定：先 ink 后 presenter）
node assets/assemble.cjs deck.src.html deck.html \
  --ink assets/ink-overlay.html --presenter assets/presenter-overlay.html
```

它不改动 PPT 的 DOM、CSS 和 `deck-shell.js`。装配器把整段原样拼到 `</body>` 之前，两个叠加层同时存在时
批注块先跑、演讲者块最后跑。交付前**只改文件里标出来的两个配置块**，其余一律别动。

依赖的是交互壳的两样东西：`#stage > .slide` 结构和 `window.__deck`。`__deck` 不在时叠加层不启用，
只往控制台写一行 `noShell`，页面照常放——不会因为加了它就多一个坏掉的按钮。

## 2. 两个窗口各管什么

**听众窗口**（正常那份 HTML）——键位一个都没被占用之外的改变：

| 键 | 作用 |
|---|---|
| `S` | 开/换演讲者窗口 |
| `N` | 在页面下方拉起**提词条**（弹窗被拦时的兜底，同一份提示词） |
| `Esc` | 关提词条 |

**演讲者窗口**——顶部一条固定横幅（已讲时长、`当前 / 总页数`、上一页 / 下一页 / 重置；它不是卡片、
不拖动、不记忆）加四张磁吸卡，抓标题栏拖动、抓右下角改变大小，位置按这份稿子的 URL 记住：

| 卡 | 内容 |
|---|---|
| 当前页 | 正在放的那一页，等比缩放，无闪烁 |
| 下一页 | 下一页；放到最后一页时显示"— 已是最后一页 —" |
| 提示词 | 骨架 §7 那一页的提示词（见 §5） |
| 总览 | 全部幻灯片的横向胶片条，每格都是 `?preview=N` 的等比缩略图；滚轮横扫、点击双窗同跳；只有视口附近的约 8 格真正挂载 iframe |

| 键 | 作用 |
|---|---|
| `← →` `↑ ↓` `空格` `PageUp/Down` | 翻页，**带动听众窗口一起翻** |
| `Home` `End` | 首页 / 末页 |
| 滚轮（总览上） | 横扫胶片条；点任意缩略图跳到那页（带动听众窗口） |
| `R` | 重置计时 |
| `Esc` | 关窗 |
| 底部"重置布局" | 清掉记住的位置，回到默认四卡 |

两个窗口是**双向**同步的：听众窗口翻页，演讲者卡的预览跟着走；演讲者窗口翻页，听众窗口也跟着走。

## 3. 预览是这份稿子自己，不是截图

演讲者卡里的画面是同一个 HTML 文件带 `?preview=N` 再开一遍。交互壳认得这个参数，会：

- 给 `<html>` 打 `data-preview="1"`，直接落到第 N 页；
- **不**构建总览、**不**写 `location.hash`、键盘/点击/触摸翻页全部失效——预览页被误点也不会把主讲页面带跑；
- 每次 `go()` 派发一个 `deck:go` 自定义事件，演讲者叠加层监听它来广播页码。

窗口之间只传数字，不重载 iframe（`preview-ready` 握手后才补一次定位，避免白闪）：

| 消息 | 方向 | 作用 |
|---|---|---|
| `deck-goto {idx}` | 听众窗 → 演讲者窗 | 预览跟翻 |
| `presenter-goto {idx}` | 演讲者窗 → 听众窗 | 反向翻页 |
| `presenter-open` | 演讲者窗 → 听众窗 | 握手：把当前页推过去，别让演讲者一开窗就看到第 1 页 |
| `preview-goto {idx}` | 演讲者窗 → 卡内 iframe | 换页不重载 |
| `preview-ready` | 卡内 iframe → 演讲者窗 | 上面那次补定位的触发 |
| `ink-cmd {cmd,on/ask/store…}` | 演讲者窗 ↔ 卡内 iframe | 批注遥控与笔迹包（见 §3.5） |
| `ink-state {on}` | 卡内 iframe → 演讲者窗 | 预览里的墨水层开关变了，按钮chip跟着变（只认当前页 iframe 发来的） |
| `ink-store {store,rev}` | 演讲者窗 ↔ 听众窗 | 笔迹整包中继，修订号新的才算数（见 §3.5） |

演讲者窗找听众窗用的是 `window.opener`，没有 opener 时退到 `window.parent`（`parent===window` 时不算）。
这样同一个文件既能弹窗也能被嵌进别的东西里，同步都不断。

## 3.5 批注联动（稿子同时装了第 7 步才有）

演讲者窗里**可以直接批注**：预览 iframe 就是这份稿子自己，里面的墨水层是同一个引擎——不复制引擎，
不另立存储。装配时：

- 只放开**当前页卡**的 `pointer-events`（`#c-cur .pbody iframe{pointer-events:auto}`），下一页卡保持
  `pointer-events:none`，预览仍不可点翻页；
- 当前页卡头部多一枚「批注」chip（`COPY.inkBtn / inkBtnOn`），点了向卡内 iframe 发
  `ink-cmd{cmd:'on'}`；预览里墨水层自己开关后回一条 `ink-state`，chip 跟着变。用户直接点预览里那个
  小瓷贴按钮也行，两条路都汇到同一个状态；
- 笔迹同步用 ink 层的修订号协议（见第 7 步 §5）：谁 `save()` 谁广播，对端只在修订号更新时整包接管，
  且回显被修订号挡住，**最后写入者胜**。听众窗画的笔迹、演讲者窗画的笔迹、撤销（含跨窗 `Ctrl+Z`）
  两边始终一致；
- 预览里画完一笔后墨水层会 `parent.focus()` 把键盘交还演讲者窗，← → 立刻能翻页。

**已知限制**（写进交付说明）：预览 iframe 不重载，所以笔迹在演讲者窗**开窗那一刻**的页面上同步，
之后新画的线靠消息走，不靠刷新；`localStorage` 双方都会写，极端并发（两边同一瞬间各画一笔）按
修订号取舍，最后画的那笔赢——这是设计而不是 bug。

## 4. 配置块 1 · COPY——文案要为这份稿子重写

文件顶部第一处可改的东西，中英日三套。语言按 `<html lang>` 自动挑（无 lang 时退回浏览器语言）。**必须**过一遍的是这三条：

- `cardPrompt`（默认"提示词"）——这张卡在台上一直被看见，写成讲者自己的说法；
- `empty`（"（这一页还没有提示词 — 见骨架 §7）"）——漏写提示词时全场都能看到这句，别让它带着占位味出厂；
- `hintDrag`——不想让讲的人动卡片，就把这句删掉并留着默认布局。

`blocked` 是弹窗被拦时的提示，同时也是兜底路径的说明；改语言时保持两句结构（先说怎么办，再说备选）。

## 5. 配置块 2 · CANVAS + TOKEN_MAP——画布和颜色都从这份稿子取

- `CANVAS` 必须等于本稿的逻辑画布（交互壳默认 1280×720）。预览卡的缩放就是
  `min(卡宽/CANVAS.w, 卡高/CANVAS.h)`，写错就是等比错，画布不是 1280×720 的稿子必须改这里。
- `TOKEN_MAP` 只读七个属性：`--bg --panel --ink --muted --accent --warn --rule`。其中
  `--panel/--muted/--warn/--rule` 在起始模板里**本来就没有**，缺了会退到内置配方并往控制台写
  `tokenMiss`。想让客户那套颜色一路带进演讲者窗，就在骨架第 2 步的 `:root` 里把四个补齐。

配色跟随是"读同一个 `:root`"，所以演讲者窗永远不会和稿子长得不一样；明暗由 `--bg` 的相对亮度
（阈值 0.22）自动选配方。

**底线仍然是测，不是猜。** 叠加层内置了 4.5:1 守卫：`--ink/--muted/--accent/--warn` 对**卡片底色**
（`--panel`，缺省走明暗默认）实测不足 4.5:1 时，那一个颜色退回默认值，并把
`--accent #F0D9E4→#1F4FD8` 这样的条目写进控制台。提示词正文 19px、卡标题 11px，都是小字，
4.5:1 是硬线；稿子选了个淡粉当强调色时，宁可退回默认蓝，也不要在台上出现看不见的强调。

用两套真实配方实测过的比值（起点色 / 卡片底色 → 对比度）：

| 场景 | ink | accent | warn | muted |
|---|---|---|---|---|
| 浅色稿（`#FFFFFF` 卡） | 19.44 | 6.22 | 5.93 | 6.40 |
| 深色稿（`#181C21` 卡） | 14.20 | 9.57 | 7.44 | 6.50 |

再拿一份故意做坏的稿子（`--accent:#F0D9E4`、`--warn:#FFF2C8`、`--muted:#EDEDEB` 压在白卡上）验证守卫：
三个全部被拦下并回落到 `#1F4FD8 / #8A5A00 / #5C5F66`，回落后的最低比值 5.93。守卫只在**开窗那一刻**
算一次，所以它挡得住出厂时的错色，挡不住中途改色——改完配色要重开一次窗。

## 6. 提示词卡里放什么

内容只有一个来源：骨架 §7（见 `04-skeleton.md`）。落地方式是把 §7 那一页的提示词原样放进该页的
`<aside class="notes">…</aside>`。这张卡不吃 `data-count`、不吃 `hint`，只吃 notes 的 HTML，
因此 §7 定的排版标记在这里就是视觉效果：

| 标记 | 渲染 | 用途 |
|---|---|---|
| `<strong>` | 警示色 | 必须说出口的关键词、数字 |
| `<em>` | 强调色 | 抛问、停顿、动作提示 |
| `<code>` | 等宽底片 | 术语、字段名、命令 |

规矩还是骨架那三条：给信号不给逐字稿、150–300 字、口语照读；数字仍然受第 6 步数字审计约束，
提示词里出现一个骨架该页哪个条目都没有的数字（不管它原本写在 `data`、`table` 还是 `formula` 里），跟页面上出现一样算违规。notes 在听众窗口永远不显示，
也永远不打印——这条差异要在交付说明里写清楚。

## 7. 自检：这些断言要真跑过

内置浏览器经常拦弹窗（`window.open` 返回 null），这**不是**功能的错：先用 `press_key` 之类真实按键试一次，
被拦就走 `blocked` 分支验证兜底。要在自动化里测同步，就把 `window.open` 换成一个转发 `postMessage` 的
替身（iframe 承载），两条消息路径跑的还是同一份代码。

```js
async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const key = k => document.dispatchEvent(new KeyboardEvent('keydown', {key:k, bubbles:true, cancelable:true}));
  const out = {};
  // 1) 兜底提词条：开、点它不给翻页、跟着翻页走、Esc 关
  key('n'); await sleep(250);
  const dr = document.getElementById('pv-drawer');
  out.drawer = {open: dr.classList.contains('open'), idx: dr.querySelector('.pv-idx').textContent};
  const before = window.__deck.index;
  dr.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true}));
  await sleep(350);
  out.clickDoesNotPage = window.__deck.index === before;
  key('Escape'); await sleep(200); out.escCloses = !dr.classList.contains('open');
  // 2) 壳层回归：总览、数字直达、hash 都还在
  key('g'); await sleep(300);
  out.overview = document.getElementById('overview').querySelectorAll('.thumb').length;
  key('g'); await sleep(250);
  key('3'); await sleep(450); out.digit3 = {idx: window.__deck.index, hash: location.hash};
  // 3) 演讲者窗内容：把捕获到的 HTML 塞进 srcdoc iframe，等 2.5s 再读
  const f = document.getElementById('pvtest'), d = f.contentDocument, w = f.contentWindow;
  out.errs = w.__errs;                                     // 必须为空
  out.cards = [...d.querySelectorAll('.pcard')].map(c => c.id + ' ' + c.style.left + ' ' + c.style.top);
  out.iframeSrcs = [...d.querySelectorAll('iframe')].map(i => (i.getAttribute('src')||'').split('?')[1]);
  out.prompt = d.getElementById('pmt-body').innerHTML;      // §7 的 strong/em/code 要还在
  out.nxtAtEnd = d.getElementById('m-nxt').textContent;     // 末页应是 END
  // 4) 双向同步：听众窗翻页 → 卡片跟着走；演讲者窗点按钮 → 听众窗跟着走
  key('ArrowRight'); await sleep(700); out.hostToCard = window.__deck.index + ' / ' + d.getElementById('t-count').textContent;
  d.getElementById('b-prev').click(); await sleep(700); out.cardToHost = window.__deck.index;
  // 5) 布局：拖一张卡 → localStorage 有 pv.v2|<deckUrl> → 关窗重开位置还在
  out.lsKey = Object.keys(w.localStorage).find(k => k.indexOf('pv.v2|') === 0);
  // 6) 总览：横幅固定、胶片条虚拟化、点击双窗同跳
  out.bannerH = d.getElementById('banner').offsetHeight;           // 52；#banner 不是 .pcard
  const strip = d.getElementById('ovw-strip');
  strip.dispatchEvent(new WheelEvent('wheel', {deltaY: 1200, bubbles: true, cancelable: true}));
  await sleep(300); out.ovw = {moved: strip.scrollLeft > 0, mounted: strip.querySelectorAll('iframe').length}; // 挂载 ≤ 8
  d.querySelector('.ovw-item[data-i="5"]').click(); await sleep(700); out.thumbJump = window.__deck.index; // 必须是 5
  return JSON.stringify(out);
}
```

另外三条单独确认：

- **预览页独立可用**：直接访问 `deck.html?preview=2`，应落在第 2 页、`data-preview="1"`、
  键盘鼠标全不翻页、`#overview` 是空的、不写 hash。
- **零外部请求**：叠加层和生成的演讲者文档都不许出现 `//` 开头的资源；`list_network_requests` 应该只有
  这一个 HTML 文件（和它自己 iframe 的那几次 `?preview=N`）。
- **对比度**：按 §5 那张表复测一次本稿的实际配色，尤其 `--accent` 被稿子改过颜色的情况；
  被守卫换色就要在交付说明里点名，让用户决定是改稿子的配色还是接受默认色。
- **批注联动**（同装第 7 步时）：演讲者窗的「批注」chip 点下去，卡内 iframe 的 `body` 应有
  `inking` 类；在预览画布里落一笔（pointer 事件打到它的 `#inkc` 上），听众窗的 store 应多出同一条；
  听众窗 `undo()` 后预览画布像素归零（`getImageData` 采样）；画完一笔后直接在演讲者窗按 ← →，
  应立即翻页（焦点已交还，不用先点一下别处）。

## 8. 已知的坑

- **`file://` 的来源**。演讲者文档写进一个 `about:blank` 弹窗（`document.write`），所以它继承稿子的来源；
  换成 `window.open('presenter.html')` 之类的绝对路径，在 `file://` 下就是跨来源，`postMessage` 和
  `localStorage` 都会翻车。**别"顺手清理"成绝对 URL。**
- **不用 `BroadcastChannel`**。`file://` 页面常被判为不透明来源，通道时通时不通。这里全部走显式
  `postMessage`，弹窗和被嵌两种情况都覆盖（§3 的 opener/parent 回落）。
- **`localStorage` 只放卡片布局**，键是 `pv.v2|<去参数的稿子 URL>`。这是本 skill 里唯一碰存储的地方，
  交付说明要写明；换电脑或换目录，布局回默认，提示词一个字都不丢（它在 HTML 里）。
- **布局键是分版本的**：`pv.v1` → `pv.v2` 随卡片集合的变化一起走（计时卡出、总览卡进）；旧布局被忽略一次
  回到默认几何，残留的旧键不会再被读取，留着即可。
- **总览是虚拟化的**：同时最多挂载约 8 个缩略图 iframe（只挂条带视口附近的），其余格子显示页码 + 标题
  占位；缩略图里的笔迹只反映挂载那一刻的存储，长稿开窗会多出至多 8 次同文件 `?preview=N` 加载。
- **弹窗被拦是常态**。浏览器拦、投影软件拦、某些企业浏览器一律拦。所以 `N` 提词条不是锦上添花，
  是被拦之后唯一能让讲者看到提示词的路；`blocked` 文案必须写清楚两条路。
- **点叠加层不给翻页**。交互壳把"点左右半屏"当翻页。演讲者相关的每一个可点元素（提词条、通知条）
  都要 `stopPropagation`，新加控件时照做，否则用户一点提词条就跳页。
- **`CANVAS` 和骨架不一致** = 预览尺寸错、还"看起来像糊了"。改画布时两处一起改。
- **翻页不重载 iframe**。所以预览页的入场动画、`data-count` 递增只在第一次加载时跑一次。
  要每页都跑动效的稿子，把这条当作已知限制写进交付说明，别去加延时重载——那是用闪烁换动效。
- **两个叠加层同时装**时，`Esc` 由批注层关气泡菜单、由演讲者层关提词条，互不干扰；`S`/`N` 只有演讲者层用。
  批注层占的是 `Z`/`Y`。

## 9. 交付说明里要多写的几句

在第 6 步那份说明之外，补上：

- 演讲者模式的开法（`S` 弹窗，`N` 提词条兜底），以及**本次是否真的验证过弹窗**——被自动化环境拦掉时，
  要说"弹窗路径按拦截分支验证，双窗口同步用 `postMessage` 转发等价验证"，不要含糊成"已测"；
- 提示词来自骨架 §7，已经过用户审核；未启用时要写"未启用演讲者模式"；
- 演讲者层自己的 localStorage 只有卡片布局（`pv.v2|`）；同装第 7 步时预览里的墨水层会写它自己的
  `ink.v1*` 键（归批注层管），两边同键同源、按修订号同步；
- 同装第 7 步时写明：演讲者窗可直接批注，双窗笔迹"最后写入者胜"，预览不重载、同步走消息不走刷新；
- 提示词不打印、不进 PDF，`notes` 在听众窗口永远不可见。
