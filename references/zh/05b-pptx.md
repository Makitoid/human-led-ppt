# 第 5 步（PPTX 轨道）· 构建原生 PPTX

> 只在本稿 `target` 含 `native-pptx` 时读本文件。HTML 轨道读 `05-build.md`；两条轨道共用第 1–4 步与同一份骨架、同一份资料总结。

目标：把已审核的骨架编译成一份**可在 PowerPoint / WPS / Keynote 里继续编辑**的 `.pptx`。原生形状、文字、表格、图表、图片、媒体、备注；切页动效来自 `motion.transition`，页内动效来自逐页的 `animation`（细则见 §4「动效」）。**不得**手写 OOXML，也不要逐条手敲 officecli 命令——所有几何、字号、留白由 `assets/pptx/build.cjs` 的版式库负责，动效也一样只从 spec 生成。

## 1. 进入前

1. 骨架已获用户确认（第 4 步卡点），§1 写明 `target` 含 `native-pptx`。
2. 已读 `04-skeleton.md` §1/§4/§7，以及本文件。
3. 资料总结在手边；`PPTX-src.json` 里每个数字都要能回指它。
4. 运行 officecli 可用性检查（见 §2）；缺失时直接引导用户安装。

## 2. officecli 可用性检查（先做，不要跳）

```bash
node <skill目录>/assets/pptx/detect-engine.cjs --json
```

所有环境统一使用 **officecli**。脚本只检查二进制是否可用，不识别 harness，不扫描宿主插件。缺失时立即向用户提供下面的安装指引，由用户安装二进制后再继续构建：

- Windows：`irm https://d.ai.officecli.ai/install.ps1 | iex`
- macOS / Linux：`curl -fsSL https://d.ai.officecli.ai/install.sh | bash`
- 或 `npm i -g @officecli/officecli` / `scoop install officecli` / `brew install officecli`
- **不要执行 `officecli install`**：它会顺带把 officecli 自己的 skills/MCP 装进所有检测到的 agent。只装二进制。
- 要求 `officecli --version >= 1.0.159`；装完重开 shell 或用完整路径验证。仍失败就停，不手写 OOXML。
- **动效要 1.0.160 起**：非 fade 的切页与所有页内动画只在 1.0.160 上实测过，`build.cjs` 在更低的版本上遇到它们会直接拒绝构建（升级二进制，或退回 `motion: "fade-400"` 并删掉每页 `animation`）。

## 3. 产物

| 文件 | 谁写 | 说明 |
|---|---|---|
| `<主题>-PPTX-src.json` | agent | 依骨架 §4 写的构建规格；可审、可 diff |
| `<主题>.pptx` | `build.cjs` | 成品；原生对象 |
| `<主题>.pptx.batch.json` | `build.cjs` | 实际执行的 officecli 命令，出问题时先看它 |
| `<主题>-PPTX-qa.md` | `lint.cjs --report` | 验收报告（第 6 步） |

`<主题>-PPTX-src.json` 是**构建工作文件**，不是第二真相；页数、页型、数字以骨架与资料总结为准。

## 4. `PPTX-src.json` 结构

```json
{
  "meta": {
    "title": "…", "author": "…", "lang": "zh-CN", "locale": "zh-CN",
    "skeleton": "<主题>-PPTX骨架.md", "slides": 12,
    "evidence_chain": "off",
    "numberWhitelist": ["2026"]
  },
  "theme": {
    "bg": "#FFFFFF", "panel": "#F2F4F7", "ink": "#1F2328", "muted": "#5A6472",
    "accent": "#0063B1", "accentInk": "#FFFFFF", "warn": "#B42318", "rule": "#D0D7DE",
    "font": { "latin": "Arial", "ea": "Microsoft YaHei" },
    "scale": { "claim": 48, "title": 34, "body": 24, "meta": 14 },
    "radius": 16
  },
  "motion": { "transition": "fade-400", "discipline": "calm" },
  "slides": [{
    "id": "s3", "type": "kpi-hero", "topic": "…", "title": "…", "key": "…",
    "blocks": [{ "kind": "kpi", "items": [{ "value": "-32", "unit": "%", "label": "…" }] }],
    "emphasis": { "role": "kpi", "index": 0, "tone": "accent" },
    "transition": "push-right-600",
    "transition_why": "从第二幕逐项拆成本推到第三幕的二选一结论，方向跟着论证走",
    "animation": { "on": "cards", "effect": "fade", "class": "entrance", "duration": 400 },
    "source": "机构 · 年份",
    "notes": "…"
  }]
}
```

- `theme` 直接抄第 2 步的风格决定块；`scale` 是 1280×720 的 px 值，构建时按 1px = 0.75pt 转成 pt（48/34/24/14 → 36/25.5/18/10.5pt），四档比例不变。
- `emphasis`：`role` 是 `key | kpi | title`，`tone` 是 `accent | warn`；只能落在该页的主语上。
- `source` 必填于含 `kpi` / `table` / `chart` / `compare` / `quote` 的页；始终写入备注供追溯。只有作者明确同意且 `meta.evidence_chain: "on"` 时才绘制来源页脚。
- `notes` 来自骨架 §7，纯文本；`<strong>` / `<em>` 由构建器剥掉，强调格式只在 HTML 演讲者窗保留。

### 动效（`motion` 与逐页 `animation`）

动效是**演示纪律，不是版式**：它不改几何，只写 `p:transition` 与 `p:timing`。引擎能给的东西比第一版放出来的多，白名单以 officecli 自己的报错文本为准，写死在 `assets/pptx/lib.cjs`；但"引擎允许 58 种"和"这份稿子该用几种"是两件事，后者按 ppt-master 的动效规范收紧（默认 `fade-400`、页内动画默认关闭），由 `lib.cjs` 的 `motionPolicyErrors` 卡住。

**先选纪律，再选效果。** `motion.discipline` 只有两档：

| 档位 | 切页可用 | 页内动画 | 预算 |
|---|---|---|---|
| `calm`（默认） | base + directional + identity | 只允许 `entrance` / `emphasis` | 动画页 ≤ `max(1, ⌈页数/3⌉)`，不许相邻两页都动 |
| `story` | 再加 expressive | 四类全开 | 动画页 ≤ `⌈页数/2⌉`；expressive 切页 ≤ `max(2, ⌈页数×20%⌉)`，不许相邻 |

切页按**相邻两页的关系**选，不为变化而变化：

| 相邻两页的关系 | 用哪种 | 层级 |
|---|---|---|
| 同一节内的连续叙述 | `fade-400`（默认） | base |
| 不需要保留连续性的直接切换 | `none` / `cut-400` | base |
| 步骤、时间线、层级有明确推进方向 | `push-*` / `wipe-*` / `cover-*` / `pull-*` / `split-*` / `reveal-*` | directional |
| 同一对象跨页改变位置、尺寸或裁切 | `morph` | identity |
| 章节开场、关键揭示、明显状态边界 | 其余"华丽"库（`zoom` / `flip` / `cube` / `vortex` …） | expressive |

- **非 base 的效果必须写理由**：整份默认写在 `motion.why`，单页覆盖写在 `slides[].transition_why`，一句话说清"这两页之间发生了什么变化"。写不出理由就别换效果——`fade` / `cut` / `none` 不需要理由。
- **`random` 只在不确定性本身就是内容时用**（如随机抽样、随机故障），并在理由里说明；"怕单调"不是理由。
- **expressive 是标点，不是花样**：一节最多一次，且不能连着两页都用。剩下的页面回到 `fade`。

**切页 `motion.transition`**（整份默认）与 `slides[].transition`（单页覆盖）都用同一个令牌串：

```
类型[-方向或子类型][-速度 fast|med|slow | 毫秒]
fade-400 · push-right-600 · split-vertical-in · wipe-slow · morph · none
```

- 类型只能取 58 个白名单值（`fade cut dissolve circle diamond newsflash plus random wedge wipe push cover pull wheel zoom split blinds checker comb bars strips flash honeycomb vortex switch flip ripple glitter prism cube rotate orbit clock doors window shred ferris flythrough warp gallery conveyor pan reveal morph box fallOver drape curtains wind prestige fracture crush peelOff pageCurlDouble pageCurlSingle airplane origami none`）；拼错会被 `lib.cjs` 直接判错，因为 officecli 收到无效令牌会**整批回滚**。
- 时长和速度二选一：`fade-400` 走 p14 扩展的 `transitionDuration`，`fade-slow` 走 legacy `transitionSpeed`，同时给两个判错。
- 方向和子类型是**类型相关**的（`push-right` 合法，`circle-in` 无效）；构建后按读回结果报告偏差，不猜。
- `morph` 引擎能写能读，但匹配靠**上一页同名形状**，构建器给形状的是稳定 id 不是语义名，所以效果多半退化成普通切页 —— 用之前先在交付说明里降一档承诺。
- 老写法 `{ "transition": "fade", "duration": 400 }` 已取消，`lib.cjs` 会报错并提示改成 `"fade-400"`。

**页内 `animation`**（只有声明了的那几页有）：

```json
"animation": { "on": "content", "effect": "fade", "class": "entrance", "direction": "up", "duration": 400, "delay": 0, "trigger": "onClick" }
```

| 键 | 取值 | 说明 |
|---|---|---|
| `on` | `primary` / `title` / `content` / `cards` / `all` | 选哪些**已排版好的元素**挂动画：主语、标题（含主语）、正文层、卡片层、全部。满版背景与遮罩（`ground`）和角标页脚（`role:detail`）永远不会动 |
| `class` | `entrance` / `exit` / `emphasis` / `motion` | 四类，效果白名单按类分开：emphasis 只有 `spin grow bold wave fade`（+颜色类），entrance/exit 用 `appear fade fly zoom wipe bounce float split wheel swivel checkerboard blinds dissolve flash box circle diamond plus strips wedge random`，`contract floatOut sinkDown …` 这 16 个模板效果只能 `class=exit` |
| `trigger` | `onClick`（默认）/ `withPrevious` / `afterPrevious` | 一次点击出一条，就是讲课的节奏。`onClick` 时元素按阅读顺序（先上后左）排队 |
| `duration` / `delay` | 整数 ms | 模板 exit 效果保留 PowerPoint 自带时长，给了 `duration` 直接判错 |
| `direction` | `in out left right up down` | 只有方向类效果吃这个；读回会被归一成 `left/right/up/down` |
| `path` / `d` | `line arc circle diamond triangle square custom` | `class=motion` 用它取代 `effect`；`path=custom` 必须给 `d`（0..1 相对坐标，SVG-like） |
| `repeat` | 正整数 / `indefinite` | 只对 emphasis / motion 有意义；`calm` 下禁用，`story` 下要写 `why` |
| `why` | 一句话 | `class` 不是 `entrance` 时必填：说清这条动画承担什么沟通任务（重新夺回注意力 / 腾出位置 / 移动表达什么） |

- **页内动画逐页 opt-in**：`calm` 下只允许 `entrance`（按阅读顺序揭示）和 `emphasis`（让已可见的对象重新获得注意）；`exit` / `motion` 属于 `story`，且必须写 `why`。默认整页一次性出现。
- **预算**：`calm` 下带动画的页不超过三分之一，且不得相邻两页都动；`story` 下不超过一半。每页仍 ≤ 6 个元素、每次点击出一条，讲完一句话还没动完的效果要重写。
- **单条时长 ≤ 800ms**：超过 800ms 直接判错——动画跑得比讲解慢，就是拖累而不是强调。
- **背景、遮罩、页脚、眉标永远不动**（`ground` 与 `role:detail` 不进动画池）；封面 / 来源 / 感谢页通常保持静止，`lint` 会提醒。
- **只有"去掉/替换页内内容"才用 `exit`**：普通翻页已经会把整页移走；**只有运动本身承载意义**（因果、空间关系）才用 `motion` 路径，否则用 `entrance` / `emphasis`。
- **图片和表格挂不了动画**：officecli 只接受 `shape` 与 `chart` 作为动画父节点。图页要动效，就动它上面的文本/卡片；`on` 选不到任何可动画元素时构建直接失败，不会静默跳过。
- 每页 ≤ 6 个动画元素（= ≤ 6 次点击），超了就判错，让你回去砍内容或改 `trigger`。
- 与 HTML 主轨不同，这里**没有** `prefers-reduced-motion` 兜底，也没有 CSS 缓动曲线可挑；PowerPoint 的动画只有预设与快/慢/中。要真正的进场曲线就走 HTML 轨。

### block kind（第一版只认这些）

`points` · `prose` · `kpi` · `table` · `chart` · `compare` · `steps` · `timeline` · `diagram` · `image` · `media` · `pull` · `quote` · `code`

骨架 58 词词库到 block 的映射只有这一份（不要抄进骨架 §4）：

| 骨架词 | block |
|---|---|
| `points` / `action` / `takeaway` / `caveat` / `missing` / `defs` / `toc` | `points`（`defs` 写成两列短句；`takeaway` 一条） |
| `prose` / `lead` | `prose` |
| `kpi` | `kpi`（1–4 项；主项在 `emphasis` 里指定） |
| `table` / `cast` | `table`（≤6 行 × ≤5 列） |
| `bars` / `line` / `stack` / `pie` / `rank` / `visual`（数据图） | `chart`（原生图表；见 §8） |
| `compare` / `before-after` / `counter` | `compare`（左右两栏） |
| `steps` | `steps`（原生步骤条） |
| `timeline` | `timeline` |
| `diagram` / `arch-diagram` / `root-cause` / `framework` | `diagram`（`steps` / `timeline` / `quadrant` / `hub` 四种 pattern） |
| `image` / `background` / `draw`（已生成） | `image`（`bleed:true` 为满版背景，`scrim` 调遮罩） |
| `audio` / `video` | `media`（视频必须给 `poster`） |
| `pull` / `quote` | `pull` / `quote` |
| `code` | `code` |
| `hint` / `ask` / `quiz` / `discuss` / `task` / `demo` / `poll` / `lines` / `handoff` | 进 `notes` 或页面 `points`，不单独成块 |

**每个 block 都必须被页型 recipe 消费。** 例如 `split-compare` 只吃 `compare / points / prose`；往它上面塞 `image` 会直接报错，而不是静默丢内容。每页一个主语、accent ≤1、warn ≤1、卡片 ≤4 由构建器与 lint 双重检查。

## 5. 页型 → 版式 recipe

| recipe | 覆盖页型 |
|---|---|
| `cover` | cover / team |
| `section` | act-divider / agenda / toc |
| `statement` | concept / verdict / problem / solution |
| `points` | points / definition / recap / caveat / next-steps |
| `kpi-hero` | kpi-hero / data-cards / data-contrast / traction |
| `table-showdown` | table-showdown / cast / action |
| `chart` | chart-line / chart-bars / chart-stack / results / experiment / breakdown / rank-list |
| `split-compare` | split-compare / before-after / counter-argument / competition |
| `diagram` | steps / timeline / arch-diagram / root-cause / framework / lifecycle-strip / policy-timeline |
| `image` | 任何承载 `image` / `media` 的页 |
| `code` | code-walkthrough / terminal-log / demo |
| `closing` | closing / references / thanks / the-ask |

- 每份稿子控制在 6–8 个 recipe；同 recipe 的页共用同一套版式。
- `type:"custom"` 是逃生口：每个 block 给 `rect: [x, y, w, h]`（1280×720 px），最多 2 页；lint 仍检查安全区、层内重叠与强调预算。
- 骨架页型不在上表时，构建器会按 block 自动选 recipe；但**页型名仍要控制在 6–8 种**，不要靠兜底。

## 6. 坐标、字号与留白

- 画布：`960×540pt`（13.333×7.5in），`1px = 0.75pt`；所有 `x/y/width/height` 都写成带单位字符串，禁止裸数字。
- 四档字号：主语 36pt（KPI 54–90pt）/ 标题 25.5pt / 正文 18pt / 注释 10.5pt；页脚最小 10.5pt（HTML 的 9px 引用条不迁移）。
- 页边 42pt（56px）；页头到正文、组间、组内沿用第 2 步的 28/24/12px 换算。
- 主语只能一个：能当主语的只有 `key`、一组 `kpi` 的主项、`pull`；`title` 是第二级。KPI 页默认以 KPI 组为主语，`key` 降为标题档。
- accent 填充 ≤1 处/页、warn 标记 ≤1 处/页；强调必须落在主语上。
- **文字容量是硬闸门**：所有文本帧 `autoFit=none`，按字号、框宽与字符宽度估算行数；放不下就**报错不缩字**：
  `s7/points: text overflow need 5.2 lines, box …`。处理方式是拆块、移进备注或删字，由你决定并写进骨架 §6。

## 7. 构建命令

```bash
# 只生成 batch，先人工审一遍（推荐第一次这么做）
node <skill目录>/assets/pptx/build.cjs <主题>-PPTX-src.json <主题>.pptx --emit-only

# 真正构建：close → 删旧文件 → create → batch(stdin) → close → 校验切页
node <skill目录>/assets/pptx/build.cjs <主题>-PPTX-src.json <主题>.pptx
```

构建成功后先别交付，直接进第 6 步（`06b-pptx.md`）。构建器会自动：

- 显式设置 `slideWidth=960pt` / `slideHeight=540pt`、主题字体与颜色；
- 每个形状显式给 `id`（`10000 + slide*100 + slot`）、`fill`、`line`，后续修改走 `@id` 而不是会漂移的 `[N]`；
- 表格用 `;` 分行、引号转义；逐行算高、逐单元格设字体/填充；
- 图片按固有宽高算 `crop`（百分比），满版背景用「裁剪图片 + 黑色 scrim」；
- 每页写 `motion.transition`（或该页 `transition` 覆盖）的令牌串，构建后逐页读回：**类型**读不回来就删光所有切换并警告（绝不静默换成别的效果）；只有时长或方向/子类型读不回，保留效果、报 WARN 并在交付说明里写清；
- 构建前先过 `motionPolicyErrors`：`discipline`、`why` / `transition_why`、expressive 与动画页预算都在这一层判错，不会带进 officecli 批次；
- 声明了 `animation` 的页，按阅读顺序给选中的 `shape` / `chart` 逐个 `add … --type animation`，命令顺序就是 PowerPoint 的点击顺序。

## 8. 表格、图表、图片、媒体

- **表格**：原生表格，≤6 行 × ≤5 列；`style=none`、`firstRow=false`、`bandedRows=false`，表头填充 `panel`、边框 `0.75pt rule`。单元格文本用正文档 18pt；行高由容量估算决定，总和超出框就报错并指出行号。
- **图表**：原生图表，2–12 类别、1–3 序列、线性轴；`autotitledeleted=true`、`chartareafill=none`、`gridlines=false`、单序列无图例。颜色显式给（第一序列 accent，其余 muted）；类别/序列名不能含 `,` 或 `;`。
  - 对数轴、瀑布、双单位、<5 个数据点等无法可靠表达时，**降级为原生表格或简单条形图**并在 QA 报告里说明；第一版不手绘图表。
- **图片**：本地 PNG/JPEG/GIF；`fit=cover` 按比例裁剪，`fit=contain` 居中留边。满版背景用 `bleed:true`，`scrim` 默认 0.55；底图偏亮时调高，偏暗时调低，**遮罩后正文仍要 ≥4.5:1**。
- **媒体**：`media` 元素，`src` 用本地路径（会嵌入文件）；视频必须给 `poster`，按海报比例 contain；音频用方形小盒。禁止 URL。
  - officecli 的 HTML 截图路径可能不画出音频/视频控件；以 `query media` 与 PowerPoint 打开结果为准。

## 9. 演讲者备注

骨架 §7 的提示词按页写进 `notes`：

```bash
officecli get <主题>.pptx "/slide[3]/notes" --json
```

- PPTX 备注是**纯文本**；`<strong>` / `<em>` 标签会被剥掉，保留文字。强调格式只在 HTML 演讲者窗里有。
- 提示词里的数字仍受资料总结约束；备注不是新增事实的地方。
- 第 8 步的演讲者双窗**不适用于 PPTX**；用 PowerPoint 自带的演讲者视图。第 7 步屏幕批注也不适用，用 PowerPoint 墨迹。

## 10. 维护注意事项

1. 构建器按 close → 删除旧文件 → create 处理 resident；删除用最多 5 次、间隔 200ms 重试。
2. batch 为原子操作，任一拒绝都会整批回滚；解析 JSON 并报告前 5 条失败原因。
3. 使用稳定 `@id`，不使用会漂移的 `/shape[N]`；动画同样挂在 id 下。
4. 每个形状显式设置 fill / line，避免继承主题色。
5. 时长只在 p14 扩展时可能读不回：仅后缀偏差报 WARN；类型读不回才移除全部切页。
6. 表格 data 用分号分行，含逗号的单元格加引号，交由构建器转义。
7. 按固有比例计算 0–100% crop；`picture_aspect_distorted` 必须修复。
8. 只用交付机已装字体，明确 `font.latin` / `font.ea` 与 create locale；缺字体会替换。
9. 无 PowerPoint 时截图来自 HTML 渲染，只证明结构，不证明像素一致。
10. `--grid` 需要无头浏览器；不可用时逐页或用 `--page 1-N` 长图。
11. 音频海报为 1×1，使用方形盒；视频必须提供真实 poster。
12. JSON 与骨架/资料冲突时同步修正，并记录骨架 §6，不建立第二份事实。
13. 方向/子类型依赖类型；如 `push-right` 有效、`circle-in` 被拒、`zoom-in` 可能只读回 zoom。以读回为准。
14. 动画只挂 shape / chart；图片、表格、媒体不可挂，on 选空时构建失败。
15. 直接删最后一条动画会留下空 `p:timing`；撤动画应改 spec 重编，不对成品 remove。
16. 按 §4 选择 calm / story 与效果预算；非 base 切页说明 why / transition_why，无理由用 fade-400。
17. random 只表达不确定性；repeat 仅 story 且有 why，不能为避免单调而用。

## 11. 产出

写入骨架 §1 `filename` 指定的 `.pptx` 路径（默认与骨架同目录）。写完立刻进第 6 步，不要先交付。

## 12. 审查通过后的再次编辑

`.pptx` 是编译产物，**唯一真相是 `<主题>-PPTX-src.json`**（页数、页型、文字、数字仍以骨架与资料总结为准）。第 6 步复审后用户要改任何东西——换措辞、调版式、加一句、改切页或动画——都走同一条路：

1. 把改动落回 `PPTX-src.json`（需要动结构时先改骨架，并在骨架 §6 记一行）；
2. `build.cjs` 重编译；
3. 重新跑第 6 步：构建器自己的动效读回 + `lint.cjs`（含动画数量与切页类型核对）+ 逐页截图。

**重编译是删旧文件后整份新建**（`close → rm → create → batch`），所以：

- 用户在 PowerPoint / WPS 里手工做的任何改动都会丢，包括手动加的动画、改过的字号、插进去的一页；
- 交付出 `.pptx` 之后、或用户明说"我在这份上改过了"，**先问**：是要 (a) 把改动回写进 spec 再重编译（推荐，改动能被 lint 覆盖），还是 (b) 只在这份成品上做最小改动。选 (b) 时不再重编译，只做 `officecli set @id` 级别的点改，并如实说明这份文件从此与 spec 不同步、动画数量对不上时 `lint` 会报 `none in the spec (edited outside the build spec?)`；
- 不确定成品有没有被动过时，先跑一次 `lint.cjs` 再决定改法——它的动画核对就是为这种情况准备的。
