# 第 5 步 · 构建 HTML PPT

## 进入前

1. 骨架文件已获用户确认（第 4 步的卡点）。
2. 已读 `assets/deck-shell.css` 与 `assets/deck-shell.js`（**整段内联使用，不要重写一套导航逻辑**）。
3. 资料总结在手边，构建时逐页对照取数。
4. **读骨架时跳过 §4 开头的"词表注释"块**——从 `⧉ 词表注释 起` 直接跳到 `⧉ 词表注释 止`，中间一行都不读。那块是 §4 词库给人看的复制品，读它只是白烧上下文；真需要某个词的含义，回来查本说明书 §4 的表。页面上的 `- xxx: <!-- 注释 -->` 同理：只作对照，不产出 DOM。

## 冲突处理规则（最重要）

严格照骨架 + 资料总结构建，**不擅自加内容**。发现骨架有问题时：

- **轻微**（标题措辞、页内顺序、视觉细节、字段缺失但可推断）→ 照骨架做，做完在骨架 §6 变更记录里注明实际情况。
- **严重**（数字与资料总结冲突、数字无出处、页面主张自相矛盾、把已纠正的误读又写回去了、页数/时长明显失控）→ 自行修正，并**同步修改骨架与资料总结**，三份文件保持一致；在最终交付说明里明确告诉用户改了什么、为什么。
- 需要新数据 → 回第 3 步补来源并写进资料总结，再填进骨架和 HTML；不要凭记忆填。

## 装配方式

单文件：`<style>` 与 `<script>` 全部内联，零网络请求、零 localStorage。以 `assets/deck-shell.html` 为起手模板——它里面留了两个 SHELL 占位符（用注释符号包着）——用附带的装配脚本内联，脚本会全局替换、校验没有占位符残留，失败时只输出一行原因：

```bash
node <skill目录>/assets/assemble.cjs deck.src.html <主题>.html     # --css <文件> / --js <文件> 可覆盖默认路径

# 需要第 7、8 步的叠加层时，装配时一并挂上（顺序固定：先 ink 后 presenter）
node <skill目录>/assets/assemble.cjs deck.src.html <主题>.html \
  --ink <skill目录>/assets/ink-overlay.html \
  --presenter <skill目录>/assets/presenter-overlay.html

# --ink / --presenter 也可以只写开关名，默认取装配脚本同目录下的同名文件
node <skill目录>/assets/assemble.cjs deck.src.html <主题>.html --ink --presenter
```

典型流程：把 `deck-shell.html` 复制成 `deck.src.html`，把三张示例页换成骨架里的真实页面，补上自己的主题 CSS，再跑装配脚本生成 `<主题>.html`。保留那份可编辑副本——已经内联了交互壳的文件很难手改。不要手工复制粘贴 CSS/JS：只要有一处占位符没替换干净，成品会安静地丢掉导航功能。改交互壳本身是低频操作；真改了，先 `node --check assets/deck-shell.js` 抓语法错误。

叠加层**不要**手写进 `<body>`：两个文件都靠装配器整段拼到 `</body>` 之前（用 slice/join 而非 replace，因为叠加层里带 `$`）。启用演讲者模式时先读第 8 步——它要求改两个配置块，并且提示词只能来自骨架 §7。

## DOM 契约

```html
<body>
  <div id="viewport"><div id="stage">
    <section class="slide" data-i="1">
      <header class="slide-head">
        <p class="kicker"><span class="act">……第二幕 · 小节名……</span></p>
        <h2>……本页标题……</h2>
        <p class="key">……本页唯一主张……</p>
      </header>
      <div class="slide-body">……数据区……</div>
      <p class="foot">……来源 · 年份…… <a href="……" target="_blank" rel="noopener">↗</a></p>
      <aside class="notes">演讲者备注，不显示</aside>
    </section>
    …
  </div></div>
  <div id="overview" role="dialog" aria-label="页面总览"></div>
  <div id="aria" aria-live="polite"></div>
  <div id="rotate-mask"><div class="ico"></div><p>请横屏观看</p><p class="sm">旋转设备后即可正常浏览</p></div>
</body>
```

类名约定（壳依赖）：`.slide` 必须是 `#stage` 的直接子元素；`.slide-head`（或 `.kicker` + `h1/h2`）决定总览缩略图露出什么；`.notes` 自动隐藏；`<span data-count="50" data-dec="1" data-pre="~" data-suf=" GWh">` 进页时从 0 递增。

`.notes` 的内容就是骨架 §7 那一页的提示词，**逐字搬过来**（`<strong>` / `<em>` / `<code>` 保留，演讲者窗的提示词卡只吃这一处）。没启用演讲者模式时它仍然是备注，听众窗口不显示、也不打印。

## 必做功能清单（骨架 §1 navigation 的落地）

| 功能 | 由谁提供 |
|---|---|
| 1280×720 等比缩放，resize 重算，居中 | deck-shell（`fit()`） |
| 空格 / → / ↓ / PageDown 下一页，← / ↑ / PageUp 上一页，Home / End，数字键 1–9 跳转 | deck-shell |
| **G 键缩略图总览墙**（当前页高亮，点缩略图跳转，总览内 ←→ 可切页，Esc 关闭） | deck-shell |
| **点击屏幕左/右半区翻页**，点链接与总览时不翻页 | deck-shell |
| 触屏左右滑动 | deck-shell |
| URL hash 记忆页码（`#s5`），刷新/前进后退可回到该页 | deck-shell |
| F 全屏 | deck-shell |
| **Q 键快捷键面板**（分区块列出本稿全部键位：壳自带一段，批注层/演讲者层加载时各自往 `window.__deckHelp` push 自己那段；面板打开时按当时注册表渲染） | deck-shell |
| **移动端竖屏遮罩**（窄屏 + 竖屏时提示转横屏，转屏即消失） | deck-shell |
| 数字递增动画 + 后台标签页兜底落终值 | deck-shell |
| `prefers-reduced-motion` 全局关闭动效 | deck-shell |
| `@media print` 一页一纸 | deck-shell |

自己补充的部分：`.slide` 的内布局、页型版式、图表、徽标、胶囊、引用条样式。

## 页面视觉规范

- **强调底上的字**：任何用 `--accent` 当底的块（徽标、胶囊、色带、封面大字），文字色一律走 `var(--accent-ink)`，**不许**硬写 `#fff` / `#000`——写死的那一次就是 1.01:1 的隐形文字（见第 2 步模板纪律）。
- **图片**：一律包在带 `aspect-ratio` + `object-fit` 的容器里（`.img-frame` 之类），裸 `<img>` 不许出现；深底压浅图配 scrim，必须看全的图用 `contain` 并在容器里给底色。
- **密度**：每页 ≤ 4 个数字；一页一个主张（`key`）；其余进 `.notes`。页面上出现的每个数字，都必须能在该页 §4 里承载它的某个关键字中找到出处（`table` / `kpi` / `compare` / `formula` / `code` …）——关键字库与选词规则见 `04-skeleton.md` §4。
- **字号**：正文 ≥ 骨架里 `min_body_px`（默认 22px）；关键数字 72–120px 且 `tabular-nums`；引用条 9–11px 但对比度仍要能读。
- **引用条**：每页右下角「来源 · 年份」；⚠️ / 🔍 徽标紧贴数值，样式统一成两枚小徽标，并在来源页解释含义。
- **角色胶囊**：底部常驻；某角色"说话"时该胶囊描边 + 名字前加 `›`；一页最多两人说话。
- **图表**：内联 SVG / 纯 CSS。常用五种——对数条形（跨量级对比）、指数折线（2024=100，两线共起点，起点值并入 x 轴标签避免压线，图内注明"中间为线性示意走势"）、瀑布/台阶（自我修订叙事）、冰山对比（直接 vs 间接）、生命周期带（横向多段挂数据卡，问题段用 warn 色）。
- **图表文字**：统一加白色描边光晕（`paint-order:stroke;stroke:<bg>;stroke-width:4px`）避免被线压住；坐标轴、单位、年份都要标全；估算/推算值在图内写明。

## 动画与切页

按骨架 §1 `motion` 字段实现（第 2 步每套预设都给了建议）：

- **切页**：壳默认是交叉淡变（进 `.45s` / 出 `.3s`）。要换成硬切+白闪、左右位移、折射淡入时，只改 `.slide` / `.slide.active` / `.slide.leaving` 的 `opacity` + `transform` 过渡，**不要用 `display` 做切页动画**（总览缩略图靠 `#overview .frame .slide{display:block}` 复原，用 display 会让缩略图变空白）。
- **页内**：条形 `width:0→终值`；折线 `stroke-dashoffset` 描线；卡片 `riseIn` 逐个上浮（间隔 0.2–0.35s）；数字递增用 `data-count`。
- 全部随切页自动播放、不依赖点击；重进某页要重播该页动画（deck-shell 的 `runCounters` 已按此处理，CSS 动画靠 `.active` 类重挂）。
- 每页动画元素 ≤ 6 个；`prefers-reduced-motion` 时整体关闭（壳已内置，自定义 `@keyframes` 别写 `!important` 覆盖它）。

## 链接

引用条、来源页、正文 `srcline` 一律 `target="_blank" rel="noopener"`；deck-shell 已用 JS 兜底 `window.open`（内嵌预览器会忽略 target），且点链接不触发翻页。拿不到可验证 URL 的条目**不给链接**，并在资料总结里说明原因（付费墙 / 已下架 / 网络不可达）。

## 已知坑

1. **别自己算缩放**：`fit()` 已处理 `scale` + 居中偏移（`transform-origin:0 0`）。若把 `#stage` 改成 `translate(-50%,-50%)` 方案，点击左右半屏的判定会跟着错。
2. **别给 `.slide` 写 `display:none`**：总览靠 `#overview .frame .slide{display:block}` 复原缩略图，用 `display` 隐藏页面会让缩略图变空白。用 `opacity + visibility`。
3. **覆盖壳的变量**：在 `:root` 里重写 `--bg/--ink/--accent/--ovl-bg/--ovl-ink/--ovl-card`，别在壳的 CSS 里硬改颜色。
4. **点击翻页误触**：任何自定义按钮/可点元素都要在壳的点击判定之外（壳已排除 `a`、`button`、`#overview`）。
5. **rAF 被暂停**：后台标签页里数字动画会卡住，壳里有 `setTimeout` 兜底；自己写动画时也要留终值兜底。
6. **竖屏遮罩判定**：壳里是"竖屏 + （粗指针 或 短边 < 600px）"，桌面把窗口拉成竖条不会误弹；测试时给 `#rotate-mask` 加 `.show` 看版式即可。
7. **中文字体回退**：拉丁字体栈必须配中文栈（`"PingFang SC","Microsoft YaHei"` 等），否则标题会回退成宋体。
8. **深色主题**：把写死的色值全部清干净（含图表填充、徽标、总览背板），否则切深色会残留浅色斑块。
9. **打印**：`@media print` 里必须复位 `#stage` 的 transform 与定位，否则只打印第一页。
10. **移动端**：`<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">` 必写；壳已 `overflow:hidden`，别在 `body` 上再加滚动。
11. **叠加层的点击**：演讲者/批注相关的任何可点元素都要 `stopPropagation`——壳把屏幕左右两半的点击当翻页，冒泡上去就是"一点提词条就跳页"。
12. **`?preview=N` 是壳的能力，不是页面自己的**：启用了第 8 步就别去改它——`data-preview` 页不建总览、不写 hash、吃掉所有翻页输入。改画布尺寸时，`assets/presenter-overlay.html` 里的 `CANVAS` 要跟着骨架一起改，否则预览"看起来像糊了"。

## 产出

写入骨架 §1 `filename` 指定的路径（默认与骨架同目录）。写完立刻进第 6 步自检，不要先交付。
