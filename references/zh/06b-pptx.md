# 第 6 步（PPTX 轨道）· 自检与交付

> 只在本稿 `target` 含 `native-pptx` 时读本文件。HTML 轨道读 `06-verify.md`。

顺序：**先问一句** → 规格检查 → 成品回读 → 渲染复核 → 数字审计 → 交付。任何一项没过就回去改，不要把未验证的东西当完成品交出去。

## 0. 先问用户：自检由谁跑

和 HTML 轨道一样，进本步第一件事是问：

> 成品已经写完。这最后一轮自检，你要**我自己跑一遍**（我跑 `lint`、`validate`、`issues`，再逐页截图复核，把通过项与未验证项列给你），还是**你自己检查**（我只跑规格检查与静态核对，成品回读与截图留给你）？

- 用户说 agent 跑 → 走完下面全部流程。
- 用户说自己检查 → 仍要跑 **§1 规格检查**（不跑就是失职）；§2–§4 按用户要求执行，并说明哪些没跑。
- 交付说明必须区分“实测过”和“用户自己验”。

## 1. 规格检查（不依赖成品）

```bash
node <skill目录>/assets/pptx/lint.cjs <主题>-PPTX-src.json <主题>.pptx --spec-only \
  --skeleton <主题>-PPTX骨架.md --sources <主题>-资料总结.md --report <主题>-PPTX-qa.md
```

检查项：

- schema、页数、页型数量（≤8）；`motion.transition` 与逐页 `transition` 的令牌（类型必须在 58 个白名单里，方向/子类型合法，时长与速度不共存）；每页 `animation` 的 `on`/`class`/`effect`/`direction`/`trigger` 与效果×类别矩阵对得上，模板 exit 效果不得带 `duration`；
- **动效纪律**（`lib.cjs` 的 `motionPolicyErrors`）：`motion.discipline` 只能是 `calm` / `story`；默认 `fade-400`；非 base 的切页必须写 `motion.why` 或 `transition_why`；`calm` 下禁 expressive 切页、禁 `exit` / `motion` 动画、禁 `repeat`；expressive 页数与动画页数不得超预算、不得相邻；单条动画 ≤800ms；非 `entrance` 的动画必须写 `why`；
- 主题 8 个 token 齐全；正文/注释对 bg 与 panel 均 ≥4.5:1；大字 ≥3:1；
- 四档字号比例 ≥1.4，正文 ≥22px，注释 ≥14px；
- 每页恰好 1 个 primary、accent 填充 ≤1、warn ≤1、同级卡片 ≤4；
- 每个文本框的容量（放不下直接报错，不缩字）；
- 图片/媒体/海报文件存在；
- 数据块（kpi/table/chart/compare/quote）必须有 `source`；
- 与骨架 §4 对账：页数、页型序列；
- 数字审计：数据块里的数字必须能在资料总结里找到（`numberWhitelist` 只放年份/章节号）。

## 2. 成品回读

```bash
node <skill目录>/assets/pptx/lint.cjs <主题>-PPTX-src.json <主题>.pptx \
  --skeleton <主题>-PPTX骨架.md --sources <主题>-资料总结.md --report <主题>-PPTX-qa.md
```

`lint.cjs` 会自动跑：

- `officecli query ... slide/shape/picture/table/chart/notes`：页数、id 唯一、元素在画布内；
- 每页 `transition` 与 spec 令牌核对：**类型**不符直接失败（spec 要 `push-right` 成品却是 `fade` 就报错）；只有 `transitionDuration` / `transitionSpeed` / 方向或子类型读不回来记警告（引擎会静默丢弃部分后缀）；spec 声明了 `animation` 时逐页点数与 `officecli query animation` 比对，少一条就失败；
- `officecli query animation --compact` 抽查：`effect class trigger duration direction` 读回值；
- 有提示词的页 `notes` 存在；
- `officecli validate`：退出 0 或 2 且 `success:true`；退出 2 只记警告；
- `officecli view issues --json`：`low_contrast` / `picture_aspect_distorted` / `broken_part_ref` 任何一条即失败。

也可以手工抽查：

```bash
officecli get <主题>.pptx "/slide[3]" --json          # transition / notes
officecli query <主题>.pptx animation --compact        # 页内动画挂在哪些元素上
officecli query <主题>.pptx media --compact           # 媒体是否真的嵌入
officecli view <主题>.pptx outline                    # 页数与标题
```

动画本身**无法用截图验收**（截图是静态帧）；`query animation` 只能证明「命令写进去了、读回是什么」，播放效果与点击顺序必须在交付说明里请用户在 PowerPoint 里翻一遍。

## 3. 渲染复核

```bash
officecli view <主题>.pptx screenshot --page 1 --out <主题>-shots/s1.png
officecli view <主题>.pptx screenshot --page 2 --out <主题>-shots/s2.png
# 或一次出纵向长图
officecli view <主题>.pptx screenshot --page 1-N --out <主题>-shots/all.png
```

- **不要用 `--grid`**：它需要无头浏览器，本机没有。
- 逐页看图，检查：
  - 四边安全区；文字没有被裁、没有压到页脚；
  - 第一眼只有一个主语；标题明显退后；
  - accent 只有一处，warn 只有一处；
  - 图表轴、单位、年份、数据标签齐；表格表头清楚；
  - 图片没有变形；满版背景遮罩后字仍能读；
  - 右下角来源存在（数据页）。
- 截图是 officecli 的 HTML 渲染路径，不是 PowerPoint 像素级证明；这是本机验收的边界，交付时要说清。

## 4. 数字审计

数据块里的每个数字都要能在资料总结里对应到行；推算值写“据…推算”，有分歧贴 ⚠️，二手转引贴 🔍。`lint.cjs` 的数字审计只能查“有没有出现过”，**口径与年份是否写对仍要人看**。

## 5. 交付说明（模板）

```text
引擎：officecli <版本>（或：宿主插件 <名字>，验收下限更低）
产物：<主题>.pptx（N 页，M 字节目录）；构建规格 <主题>-PPTX-src.json；QA <主题>-PPTX-qa.md
已实测：规格检查 / validate / issues / 页数与页型对账 / 数字审计 / 逐页截图
未验证：PowerPoint 里的最终观感（本机没有 PowerPoint，截图走 officecli 的 HTML 渲染路径）；
        请你在 PowerPoint / WPS 里打开一次，确认字体与切页。
动效：切页 <spec 令牌，如 fade-400；第 6 页 push-right-600>；页内动画 <K> 条，分布在第 <列页码> 页，
      点击顺序按阅读顺序。播放效果请在 PowerPoint 里实际翻一次确认，截图看不出动效。
      图片和表格挂不了动画（引擎只支持 shape/chart）。
备注：第 3、5、7 页有演讲者备注；PPTX 备注是纯文本，HTML 演讲者窗里的强调格式不会保留。
字体：依赖交付机已装 <latin> / <ea>；缺字体会被替换，版式可能变。
媒体：图片/音视频已嵌入文件；拷走单个 .pptx 即可。
```

如果 `lint` 有 warning（例如切页时长没读回、方向后缀被引擎丢弃、骨架页型与 spec 不一致），逐条写出来；不要把 warning 说成通过。动画只能证明"写进去了"，不能证明"好看"——这句要写在交付说明里，不要省略。

## 6. 与 HTML 的能力对照

| 能力 | HTML 主轨 | PPTX 兼容轨 |
|---|---|---|
| 体积 | 单文件几百 KB | 图片/媒体会撑大，几十 MB 常见 |
| Agent 迭代 | 纯文本，改完即看 | 改 JSON 后重编译，多一步 |
| 版式精度 | CSS/SVG 像素级 | 原生对象，受字体与 PowerPoint 排版影响 |
| 审美上限 | 更高：透明叠加、非标准网格、自定义图表 | 受 PowerPoint 对象模型约束 |
| 翻页/总览/全屏 | 内置 G/F/键盘/触屏 | PowerPoint 自带 |
| 动效 | CSS 过渡 + 页内 keyframes，曲线与时长自定，`prefers-reduced-motion` 可整体关闭 | PowerPoint 预设：切页 58 种带方向/时长，页内四类（进场/退场/强调/路径）；没有缓动曲线可挑，图片与表格挂不上动画 |
| 屏幕批注 / 黑板 | 第 7 步叠加层 | 无；用 PowerPoint 墨迹 |
| 演讲者双窗 | 第 8 步叠加层 | 无；用 PowerPoint 演讲者视图 |
| 深链 / 竖屏遮罩 | 有 | 无 |
| 媒体播放条 | 壳内置 | PowerPoint 原生 |
| 备注 | `.notes` + 演讲者窗强调 | 原生备注，纯文本 |
| 可编辑性 | 需改源码 | 原生形状/表格/图表可直接改 |
| 证据链徽标 | 交互式（按稿开启） | 静态来源页脚 + 来源页 |

## 7. 已知限制（交付时按需披露）

- **动效能力是引擎给的，边界是纪律划的**：officecli 能写 58 种切页（含 `morph`）与四类页内动画（进场/退场/强调/路径，含点击触发与延迟）。本轨道不开自动旁白/自动录制；`morph` 能写但靠同名形状匹配，实际多半退化成普通切页。
- 页内动画只能挂在 `shape` 与 `chart` 上：**图片、表格、媒体挂不上**；没有 CSS 缓动曲线可选，只有 PowerPoint 预设与 fast/med/slow。
- 动画的播放效果无法在本机验收（截图是静态帧），`query animation` 只证明写了进去。
- 不支持任意旧 `.pptx` 的编辑/美化；本轨道只从骨架新建（复审后重编的契约见 `05b-pptx.md` §12）。
- 模板/母版路线尚未纳入第一版；不要承诺“套用单位模板”。
- 对数轴、瀑布、双单位图表会降级为表格或简单条形图。
- 没有 PowerPoint 时无法做像素级验收；截图只证明版式结构。
- 宿主插件路线的产物不跑本 skill 的 lint，验收下限更低。

## 8. 负例（改构建器后必须重跑）

```bash
# 文字超框 → 构建失败并指出 need/hold
# 未知 block → 构建失败并指出页/块
# 页型不支持的 block → 构建失败（例如 split-compare + image）
# 缺图片/媒体 → 构建失败并指出路径
# 低对比 theme → lint 失败并给出比值
# 数字不在资料总结 → lint 失败并指出页与数字
# 切页类型读不回 → 构建器删光切换并警告；只有时长/方向读不回 → 保留效果并 WARN
# 未知切页类型（如 bogus-400）→ lib 判错；混用时长与速度（fade-fast-400）→ lib 判错
# 方向后缀是类型相关的：fade-up 被引擎接受但读回只剩 fade（构建器逐页 WARN）；circle-in / wipe-in 被引擎拒绝 → 整批回滚、构建失败并打印被拒命令
# 老 motion 对象 {transition:"fade",duration:400} → lib 判错并提示改成 "fade-400"
# calm 下用 honeycomb-400 / cube 等 expressive 切页 → lib 判错（story 才解锁）
# push-right / morph / expressive 切页缺 transition_why → lib 判错；deck 级非 fade 缺 motion.why → 同上
# calm 下出现 exit/motion 动画、repeat、>800ms 动画、动画页超过 1/3 或相邻 → lib 判错
# animation class=emphasis/exit/motion 缺 why → lib 判错
# 效果×类别不匹配（spin + entrance / contract + entrance）→ lib 判错
# 模板 exit 效果带 duration → lib 判错
# on 选不到可动画元素（如纯表格页用 on:content 且无文本）→ 构建失败，不静默跳过
# 每页动画 > 6 → 构建失败
# 手工删掉某页最后一个动画 → officecli validate 报 p:timing incomplete（所以撤动画要改 spec 重编）
```

全部按预期失败，才算这一轮改动可交付。

## 9. 复审判「不通过」之后

第 0 步问过由谁检查；不管是谁查出的问题，回修都走 `05b-pptx.md` §12 那一条路：**改 `<主题>-PPTX-src.json` → 重编译 → 重新跑 §1–§4**，不改成品文件。

- 一轮只回修用户点名的那几处；改完把新旧 QA 报告对照着报，不要顺手重排全稿。
- 用户已经在 PowerPoint / WPS 里动过这份文件时，**先问**要「回写 spec 重编」还是「在成品上点改」——重编译是删旧建新，会连用户手工加的动画一起没（详见 §12）。
- 只是数字或措辞变了，先改资料总结与骨架，再改 spec；顺序反了就会造出第二真相。
