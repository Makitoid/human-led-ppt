# 第 2 步 · 风格方向

目标：定下一套可执行的设计决定，写进骨架 §1 的 `typography` / `theme` / `motion` / `禁止` 字段。**先讨论后落笔，本步不产出 HTML。**

## 先问三件事

1. 气质：给 2–3 个形容词或一张参考图（"像经济学人""像苹果发布会""像课堂笔记"）。
2. 主色：品牌色、院系 VI、或"你选"。有品牌规范时必须先索取，不要猜。
3. 禁区：明确不想要什么（渐变、玻璃、卡通、emoji、彩色图表、衬线字……）。

明暗不用单独问——每套预设都有浅 / 深两套色板，按场合选一套写进骨架（同一 deck **不得混用**）：课堂投影优先浅色，暗场 / 发布会 / 代码与数据密集优先深色。用户说"你决定"时，挑一套最贴主题的，说明理由，并留"随时可换"的余地。

## 每种风格的配套设计 skill

分两类：

- **通用设计类 skill（本机若已装可直接调用）** — `frontend-design`（视觉方向、字体搭配、避免模板脸）、`material-3`（Google Material Design 3 / Material You 令牌、组件、自适应布局、expressive 主题）。
- **市场候选（市场里有、本机未装）** — 只用下面的 canonicalName 精确指名，且**先让用户安装并确认**再调用（第三方 skill 会执行代码、改文件）。推荐前用平台自带的 skill 搜索复核上架情况；下表是 2026-09-25 的快照，未安装、未读正文。

| 预设 | 主力 skill | 还能用 |
|---|---|---|
| A Fluent Design 2 | `fluent-design`（bingfoon）— Windows 11 设计语言、Mica/Acrylic 材质、WinUI 3 控件规格、排版层级、布局模式、Dark Mode、辅助功能、Electron 适配 | `frontend-design` |
| B Material Design 3 | `material-3` | `web-animation-design`（expressive 动效） |
| C OpenAI | `frontend-design` | `agrimsingh-bringhurst-typography`（《排版风格要素》原则，明确覆盖幻灯片） |
| D Claude | `frontend-design` | `majiayu000-brand-typography-systems`（模块化比例、衬线/无衬线决策框架、WCAG 字体规则） |
| E Liquid Glass | `majiayu000-axiom-liquid-glass` — WWDC 2025 液态玻璃设计原则、API 模式、视觉伪影调试与性能/评审清单（偏 Swift，当作**设计**权威，CSS 自己推导） | `frontend-design` |
| F Notion | `frontend-design` | `vercel-labs-web-design-guidelines`（UI 审查） |
| G 二次元 | `frontend-design`（市场无对应的网页风格 skill） | `animation-shader` 仅当你要做赛璐珞**插画**而非 UI |
| H 学术 | `agrimsingh-bringhurst-typography` | `entur-accessibility`（WCAG 2.1）；真要交 LaTeX/Beamer 时才用 `astoreyai-latex-check` |
| I 趣味 | `frontend-design` | `web-animation-design`（弹簧/过冲时间曲线） |
| 任意 · 动效细节 | `web-animation-design` — 缓动、时长、弹簧、stagger、页面切换、微交互、`prefers-reduced-motion`、动画性能 | — |
| 任意 · 交付前 | `vercel-labs-web-design-guidelines`（UI/UX/无障碍审查）、`entur-accessibility`（WCAG 2.1 对比度与语义） | `cognitive-design`（格式塔分组、前注意处理、认知负荷），数据密集 deck 尤其有用 |

与本 skill **功能重叠**、可能抢同一类请求的市场 skill：`frontendslides`（零依赖动画 HTML 演示）、`ppt-visual-designer`（Block 风格 PPT 视觉策略）、`doc2slides`、`image-to-editable-ppt-slide`。不要悄悄串起来用；用户问替代方案时再提。


## 预设风格库

预设分两族：**A–I 气质预设**（定色板、字体、动效的整体调性），**J–Q 版式模板**（定一屏的信息结构、强调手法和签名件）。成熟做法是**一个 deck 选 1 个气质 + 1 个版式**：气质给 token，版式给骨架；只选一个也行，但别两个都要——两套签名件叠在一页上就是噪声。

> 下面是**可用起手值**，不是官方设计令牌：除 Material 3 / Liquid Glass 有对应 skill 可查规范外，其余是对品牌观感的合理近似。定稿前用 `frontend-design` 复核，或问用户有无品牌规范；色值按题材微调，别无脑照抄。
>
> **对比度已实测**（正文 ≥ 4.5:1，大字号数字 / 标题 ≥ 3:1，用 `06-verify.md` 的 ratio 脚本量过），改色后必须重量：品牌色（OpenAI `#10A37F`、Fluent `#0078D4`、Notion 灰标签）直接当正文色通常只有 2–3:1，一律给加深版，原色只做大字号图形。
**索引**：选定后**只打开那一个文件**读完整色板（浅 + 深）、签名件、字体栈、动效与风险，不要读其余 16 个。

| 代号 | 名字与气质 | 适合 | 文件 |
|---|---|---|---|
| A | Fluent Design 2 · 分层深度 + 亚克力背板 + 细描边卡片，秩序感强 | 政策、数据、正式汇报 | `02-presets/A-fluent.md` |
| B | Material Design 3 · 色调面 + 明确角色色，组件感强 | 流程、方法论、教学 | `02-presets/B-material-3.md` |
| C | OpenAI · 纸面中性底 + 极细分隔线 + 大量留白 | 技术综述、严肃议题 | `02-presets/C-openai.md` |
| D | Claude · 奶油底 + 陶土色强调 + 衬线标题，出版物气质 | 人文、教育、观点型、访谈式叙事 | `02-presets/D-claude.md` |
| E | Liquid Glass · 半透明折射 + 高光边缘，发布会气质 | 展示型（**投影风险高**：低对比 + 细字会糊） | `02-presets/E-liquid-glass.md` |
| F | Notion · 白底暖灰 + 浅分隔线 + 彩色小标签 | 要点密集、清单型、复盘型 | `02-presets/F-notion.md` |
| G | 二次元 / 动漫 · 高饱和强调 + 粗描边卡片 + 网点速度线 | 科普、社团、面向学生（**禁用受版权保护的角色形象**） | `02-presets/G-anime.md` |
| H | 学术 / 论文 · 纸感底 + 衬线标题 + 严格图表规范 | 论文答辩、组会、技术评审 | `02-presets/H-academic.md` |
| I | 趣味 / 玩乐 · 糖果色块 + 超大圆角 + 内联 SVG 表情几何 | 破冰、活动、低龄、内部轻松场 | `02-presets/I-playful.md` |

## 版式模板库（J–Q）

与气质预设**正交**：先定气质（A–I），再决定要不要叠一个模板。同样只读选中的那一个文件。

| 代号 | 名字与气质 | 默认搭档 | 一条硬限制 | 文件 |
|---|---|---|---|---|
| J | 白底杂志 / 图文卡 · 6 色顶栏 + 大标题 + 焦点胶囊 | D 或 C | 渐变字只给 ≤10 个大字，正文用渐变直接判废 | `02-presets/J-white-magazine.md` |
| K | 奶油蓝图 / 硬描边架构 · 纸底 + 蓝图网格 + 2px 描边 | H 或 A | 每页卡片 ≤4 张，否则成格子纸 | `02-presets/K-cream-blueprint.md` |
| L | 暗底终端 / 诚实评测 · 近黑蓝 + 扫描线 + `$ prompt` 标题 | C 或 M | 网格/扫描线/发光同页只开两件；等宽中文禁做正文 | `02-presets/L-dark-terminal.md` |
| M | 开发者暗紫渐变 · GitHub 深色 + 紫蓝环境光 + 三段渐变字 | C | `--accent` 是紫色，其上文字必须走 accent-ink | `02-presets/M-purple-gradient.md` |
| N | 红黄警示 · 红黑警示纹 + 删除线大标题 + 三级卡片 | F 或 A | 红色只表风险等级，普通强调交给 ink 加粗 | `02-presets/N-red-amber.md` |
| O | 一页一色极简 · 整页单色相 + 160px 级标题 | 任意预设的字体栈 | 数据密集页直接淘汰；相邻页色相不得互补 | `02-presets/O-one-colour.md` |
| P | 路演 VC · 超大 KPI + 一条牵引曲线 | A 或 C | 每个 KPI 必须回资料总结取数 | `02-presets/P-vc-roadshow.md` |
| Q | 马卡龙卡片 · 三个模糊光斑 + 衬线斜体标题 + 圆角卡 | I（降一档） | 本表色差最紧（accent 4.81 / warn 4.60），改色必复测 | `02-presets/Q-macaron.md` |
## 模板五条纪律（从成熟模板体系里提炼，套任何预设都成立）

1. **颜色只住在 `:root`。** 页面 CSS 里除渐变端点外不应出现字面色值：`color:var(--ink)`、`background:var(--panel)`、`border:1px solid var(--rule)`。写死一处，换主题/换明暗就会漏一处（`05-build.md` 已知坑 8 就是这么来的）。
2. **accent 上的文字用 `--accent-ink`，永不写死 `#fff`/`#000`。** 强调色跨度可以近白到近黑，同一个字面值在不同主题下从 17:1 掉到 1:1（见 O 的实测）。每套模板都给了两套明暗各自的 accent-ink 与比值。
3. **一套主题 = 一套观感，一个 deck = 一套明暗。** 不许"封面用暗紫渐变、正文用奶油蓝图"。气质预设出 token，版式模板出骨架，签名件 ≤ 2/页。
4. **不发明新版式，先组合已有页型。** 页型名（`type`）控制在 6–8 种并复用；第 9 种版式出现前先问是不是某页只是内容太多。每页重画一套版式 = 总览墙认不出结构 + 构建必错。
5. **图片一律装框。** 框（`aspect-ratio` + `object-fit:cover`）决定比例与裁切，`<img>` 只负责填满——这样换任何尺寸的照片都不会顶版面。截图、图表、logo 一律 `object-fit:contain`（裁掉的就是信息）；满版照片压一层底部渐变遮罩（`linear-gradient(180deg,transparent 42%,rgba(8,10,20,.72))`）保证白字可读；框下一行 12–14px 图注。**没有装框的裸 `<img>` 不上页**。

## 自定义路线

用户自己设计时，按预设的字段结构逐项确认（观感 / 浅色板 / 深色板 / 字体 / 形状 / 规则 / 动效 / 风险），并调用 `frontend-design` 做视觉决策（配色关系、字体搭配、避免模板脸）；组件规范按需调用 `material-3`。用户给参考截图时，先量色值与字号层级再定案，不要凭印象。**"模板五条纪律"对自定义同样成立**：色值全进 `:root`、accent 上配 `--accent-ink` 并实测、只选一套明暗、页型 ≤ 8 种、图片装框。

## 无论选哪套，deck 级硬要求

- 教室后排可读：正文 ≥ 22px（建议 24px），关键数字 72–120px，`font-variant-numeric: tabular-nums`
- 正文对比度 ≥ 4.5:1；引用条等辅助文字 ≥ 9–11px 且仍可读
- 每页一个视觉焦点；一页最多 4 个数字
- 图表用内联 SVG / 纯 CSS，不引入外部图表库
- **只用一套明暗主题**：选定后把 `deck-shell.css` 里 `--ovl-bg / --ovl-ink / --ovl-card`（总览墙）和 `--bg/--ink/--accent` 一并覆盖成同色系；深色主题必须清干净所有写死色值（图表填充、徽标、描边、总览墙），否则切深色会残留浅色斑块
- **`:root` 里同时声明 `--accent-ink`**（写在 accent 填充块/徽标/胶囊上的文字色），并按 `06-verify.md` 的脚本实测 ≥ 4.5:1；页面 CSS 只允许 `var(...)`，除渐变端点外不写字面色值
- **签名件 ≤ 2 个/页**（第 2 步模板库里选定的那两个）；页型种类 ≤ 8 且必须复用；裸 `<img>` 不上页，一律走装框规则（模板纪律 5）
- 深色底不要用纯黑 `#000` + 纯白字（投影仪上会晕光），用带色相的深灰并给正文降一档亮度
- 动效一律随切页自动播放、不依赖点击；`prefers-reduced-motion: reduce` 时整体关闭（壳已内置）
- 明确写一条 `禁止` 清单（例：渐变填充、玻璃拟态、阴影堆叠、emoji 装饰、图片轮播），除非用户主动要

## 输出：风格决定块

```
风格：<气质预设 A–I 或自定义名> + <版式模板 J–Q 或"不额外套">，理由：<一句话>
明暗：浅色 | 深色
theme: {bg, panel, ink, muted, accent, accent-ink, warn, rule}   ← 直接写进骨架 §1
字体：标题 <stack>；正文 <stack>；数字 <stack>
形状：圆角 <n>px；阴影 <无 | 规格>；分隔 <1px rule | 留白>
签名件：<本页型族允许的 ≤2 个装饰件，如"页顶彩条 + 焦点胶囊">
装饰：<允许什么>  禁止：<清单>
motion：切页 <交叉淡变 | 硬切+白闪 | 位移动画 | 折射淡入>（<时长>ms，<easing>）；
        页内 <stagger 间隔 | 生长动画 | 递增数字>；reduced-motion 时全关
页型清单：<从骨架 §4 实际会用到的 6–8 种 type>
借助的 skill：<frontend-design | material-3 | fluent-design | majiayu000-axiom-liquid-glass | agrimsingh-bringhurst-typography | web-animation-design | …>（市场 skill 需先由用户安装确认）
风险提示：<如 Liquid Glass 的投影对比度 / 二次元描边在投影仪发脏 / Q 的 accent 只比 4.5 线高一点>
```

用户点头后进第 3 步（资料）或直接第 4 步（骨架）。
