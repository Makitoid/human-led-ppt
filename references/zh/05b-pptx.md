# 第 5 步（PPTX 轨道）· 构建原生 PPTX

> 只在本稿 `target` 含 `native-pptx` 时读本文件。HTML 轨道读 `05-build.md`；两条轨道共用第 1–4 步与同一份骨架、同一份资料总结。

目标：把已审核的骨架编译成一份**可在 PowerPoint / WPS / Keynote 里继续编辑**的 `.pptx`。原生形状、文字、表格、图表、图片、媒体、备注；切页统一 `fade` 0.4s；不加任何页内动画。**不要**手写 OOXML，也不要逐条手敲 officecli 命令——所有几何、字号、留白由 `assets/pptx/build.cjs` 的版式库负责。

## 1. 进入前

1. 骨架已获用户确认（第 4 步卡点），§1 写明 `target` 含 `native-pptx`。
2. 已读 `04-skeleton.md` §1/§4/§7，以及本文件。
3. 资料总结在手边；`PPTX-src.json` 里每个数字都要能回指它。
4. 运行一次引擎检测（见 §2），确认本条链路允许用 officecli。

## 2. 引擎路由（先做，不要跳）

```bash
node <skill目录>/assets/pptx/detect-engine.cjs --json
```

脚本按“本 skill 的安装路径 → 环境变量”识别宿主，扫描该宿主已装的 PPT 插件，再检查 `officecli`：

| 宿主 | 路由 |
|---|---|
| Claude Code / Codex / ZCode | 有 **PPTX 能力**的默认插件 → `host-plugin`；没有 → **回退 `officecli`**，并在对话里明确告知发生了回退 |
| DeepSeek Harness（dsh） | 有 PPTX 插件 → `host-plugin`；没有 → `officecli` |
| 其他（Qoder、Cursor、VS Code、仓库开发副本等） | `officecli`（强制） |

- `host-plugin`：用该插件的流程生成 PPTX。**本 skill 的 `lint.cjs` 不会跑在它的产物上**；只保证“骨架已审、内容不编造”，版式与对比度以插件自身能力为准，交付说明要降低验收承诺。
- `officecli` 缺失时，**先征得用户同意**再安装二进制：
  - Windows：`irm https://d.ai.officecli.ai/install.ps1 | iex`
  - macOS / Linux：`curl -fsSL https://d.ai.officecli.ai/install.sh | bash`
  - 或 `npm i -g @officecli/officecli` / `scoop install officecli` / `brew install officecli`
- **不要执行 `officecli install`**：它会顺带把 officecli 自己的 skills/MCP 装进所有检测到的 agent。只装二进制。
- 要求 `officecli --version >= 1.0.159`；装完重开 shell 或用完整路径验证。仍失败就停，不手写 OOXML。

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
    "numberWhitelist": ["2026"]
  },
  "theme": {
    "bg": "#FFFFFF", "panel": "#F2F4F7", "ink": "#1F2328", "muted": "#5A6472",
    "accent": "#0063B1", "accentInk": "#FFFFFF", "warn": "#B42318", "rule": "#D0D7DE",
    "font": { "latin": "Arial", "ea": "Microsoft YaHei" },
    "scale": { "claim": 48, "title": 34, "body": 24, "meta": 14 },
    "radius": 16
  },
  "motion": { "transition": "fade", "duration": 400 },
  "slides": [{
    "id": "s3", "type": "kpi-hero", "topic": "…", "title": "…", "key": "…",
    "blocks": [{ "kind": "kpi", "items": [{ "value": "-32", "unit": "%", "label": "…" }] }],
    "emphasis": { "role": "kpi", "index": 0, "tone": "accent" },
    "source": "机构 · 年份",
    "notes": "…"
  }]
}
```

- `theme` 直接抄第 2 步的风格决定块；`scale` 是 1280×720 的 px 值，构建时按 1px = 0.75pt 转成 pt（48/34/24/14 → 36/25.5/18/10.5pt），四档比例不变。
- `motion` 只能是 `{ "transition": "fade", "duration": 400 }`；其他值直接判错。
- `emphasis`：`role` 是 `key | kpi | title`，`tone` 是 `accent | warn`；只能落在该页的主语上。
- `source` 必填于含 `kpi` / `table` / `chart` / `compare` / `quote` 的页；会落到右下角页脚。
- `notes` 来自骨架 §7，纯文本；`<strong>` / `<em>` 由构建器剥掉，强调格式只在 HTML 演讲者窗保留。

### block kind（第一版只认这些）

`points` · `prose` · `kpi` · `table` · `chart` · `compare` · `steps` · `timeline` · `diagram` · `image` · `media` · `pull` · `quote` · `code`

骨架 56 词词库到 block 的映射只有这一份（不要抄进骨架 §4）：

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
- 每页写 `transition=fade-400`，构建后读回 `transitionDuration=400`；读不回就**删光所有切换**并在终端警告，绝不静默降级成 `fade-med`；
- 不写任何 `animation` 元素。

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

## 10. 已知坑（按踩坑频率）

1. **常驻进程占管**：`create` 会留一个 resident；先 `close` 再 `rm` 再 `create`。删除失败用 `fs.rmSync(..., {maxRetries:5, retryDelay:200})`；构建器已内置。
2. **batch 失败会整体不落盘**：先一次建齐所有 slide，再逐页填充；任一批失败就中止，不要 `--best-effort`。
3. **`/shape[N]` 会漂移**：一律用 `@id`；id 在构建时分配，后续修改不要按序号找。
4. **默认形状继承主题色**：每个 rect 都要显式 `fill` 与 `line=none`，否则会冒出 accent1 描边/底。
5. **切页时长藏在 p14 扩展里**：`transition=fade-400` 读回若不是 400，就删光切换；不要手改 XML。
6. **表格 `data` 用 `;` 分行**，不是 `\n`；含逗号的单元格要加引号（构建器已处理）。
7. **图片变形**：`view issues` 会报 `picture_aspect_distorted`；按宽高比算 `crop`（0–100 百分比），不要硬拉。
8. **字体**：只用交付机已装字体，显式写 `font.latin` / `font.ea`；`create --locale` 固定语言。缺字体时 PowerPoint 会替换，版式可能变。
9. **截图不是 PowerPoint**：本机没有 PowerPoint 时，`view screenshot` 走 officecli 的 HTML 渲染路径；它证明版式结构，不证明 PowerPoint 像素级一致。
10. **`--grid` 需要无头浏览器**：本机没有时用 `--page N` 逐页截，或多页 `--page 1-N` 出纵向长图。
11. **音频海报是 1×1**：音频请用方形盒；视频必须给真实 poster，否则会被判变形。
12. **构建规格不是第二真相**：页数/页型/数字与骨架、资料总结冲突时，改 `PPTX-src.json`，并在骨架 §6 记一行。

## 11. 产出

写入骨架 §1 `filename` 指定的 `.pptx` 路径（默认与骨架同目录）。写完立刻进第 6 步，不要先交付。
