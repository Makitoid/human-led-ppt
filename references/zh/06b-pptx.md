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

- schema、页数、页型数量（≤8）、`motion` 只能是 fade/400；
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
- 每页 `transition=fade` 且 `transitionDuration=400`；缺失只警告（构建器可能已删光切换，交付说明要写“请自行添加”）；数值不对直接失败；
- 有提示词的页 `notes` 存在；
- `officecli validate`：退出 0 或 2 且 `success:true`；退出 2 只记警告；
- `officecli view issues --json`：`low_contrast` / `picture_aspect_distorted` / `broken_part_ref` 任何一条即失败。

也可以手工抽查：

```bash
officecli get <主题>.pptx "/slide[3]" --json          # transition / notes
officecli query <主题>.pptx media --compact           # 媒体是否真的嵌入
officecli view <主题>.pptx outline                    # 页数与标题
```

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
动效：仅切页 fade 0.4s；没有页内动画。要加动画请在 PowerPoint「动画」面板自行添加。
备注：第 3、5、7 页有演讲者备注；PPTX 备注是纯文本，HTML 演讲者窗里的强调格式不会保留。
字体：依赖交付机已装 <latin> / <ea>；缺字体会被替换，版式可能变。
媒体：图片/音视频已嵌入文件；拷走单个 .pptx 即可。
```

如果 `lint` 有 warning（例如没有切换、骨架页型与 spec 不一致），逐条写出来；不要把 warning 说成通过。

## 6. 与 HTML 的能力对照

| 能力 | HTML 主轨 | PPTX 兼容轨 |
|---|---|---|
| 体积 | 单文件几百 KB | 图片/媒体会撑大，几十 MB 常见 |
| Agent 迭代 | 纯文本，改完即看 | 改 JSON 后重编译，多一步 |
| 版式精度 | CSS/SVG 像素级 | 原生对象，受字体与 PowerPoint 排版影响 |
| 审美上限 | 更高：透明叠加、非标准网格、自定义图表 | 受 PowerPoint 对象模型约束 |
| 翻页/总览/全屏 | 内置 G/F/键盘/触屏 | PowerPoint 自带 |
| 屏幕批注 / 黑板 | 第 7 步叠加层 | 无；用 PowerPoint 墨迹 |
| 演讲者双窗 | 第 8 步叠加层 | 无；用 PowerPoint 演讲者视图 |
| 深链 / 竖屏遮罩 | 有 | 无 |
| 媒体播放条 | 壳内置 | PowerPoint 原生 |
| 备注 | `.notes` + 演讲者窗强调 | 原生备注，纯文本 |
| 可编辑性 | 需改源码 | 原生形状/表格/图表可直接改 |
| 证据链徽标 | 交互式（按稿开启） | 静态来源页脚 + 来源页 |

## 7. 已知限制（交付时按需披露）

- 不支持页内动画、Morph、自动旁白；切页只有 fade。
- 不支持任意旧 `.pptx` 的编辑/美化；本轨道只从骨架新建。
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
# transition 读不回 400 → 构建器删光切换并警告
```

全部按预期失败，才算这一轮改动可交付。
