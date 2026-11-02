# Human-led PPT 2.0.0

2026-11-02 · Stable release / 正式版

## 中文

Human-led PPT 2.0.0 正式发布。本次大版本保留「人主导、骨架先审核、证据可追溯」的工作流，将离线 HTML 演示与可编辑原生 PPTX 纳入统一的创作与验收流程。

- **原生 PPTX 交付**：新增 JSON 页面规格、12 套版式配方、原生对象与演讲者备注，配套构建前后检查、逐页渲染与回修流程。用户可选择 HTML、PPTX 或两者。
- **21 种可复用图表与图示**：包含 11 种图表和 10 种图示，提供圆角卡片、极简线框、工程蓝图、编辑风四套外观。离线模板库支持分类、搜索、明暗预览及带唯一 SVG id 的代码复制。
- **有约束的动效**：PPTX 提供 `calm` / `story` 动效纪律，默认 `fade-400`，页内动画按需启用，并在构建前检查效果、理由与预算。支持 58 种切页令牌与四类页内动画。
- **更统一的 HTML 构建规则**：明确版面层级、对比度、留白与动效要求；同目录文件链接另开标签，装配时检查本地文件与允许的协议。
- **三语文档整理**：精简中文、英文与日文 README、更新日志、技能入口和步骤指南，保留字段、审核条件与校验代码，减少重复说明。
- **多语言发布包**：发布脚本支持完整包与中、英、日单语包，校验版本一致性并回读 ZIP 文件清单。

使用说明：HTML 仍为主轨。PPTX 的 officecli 路径最低要求 1.0.159；非 fade 切页与元素动画要求 1.0.160。重新编译 PPTX 会覆盖 PowerPoint 中的手工修改，请保留并更新源规格。不同播放器的动效表现仍需实际播放确认。

## English

Human-led PPT 2.0.0 is now stable. This major release brings offline HTML presentations and editable native PPTX into a shared creation and verification workflow, while retaining human ownership, skeleton approval before building, and traceable evidence.

- **Native PPTX delivery**: JSON slide specs, 12 layout recipes, native objects and speaker notes, with checks before and after compilation, per-slide rendering and a defined rework workflow. Choose HTML, PPTX or both.
- **21 reusable charts and diagrams**: 11 charts and 10 diagrams in four appearances: rounded cards, minimal outlines, engineering blueprints and editorial. The offline gallery includes filters, search, light/dark previews and code copying with unique SVG ids.
- **Motion with explicit limits**: PPTX offers `calm` / `story` policies, defaults to `fade-400`, and makes element animation opt-in. Effects, reasons and budgets are validated before building. Includes 58 transition tokens and four animation classes.
- **Consistent HTML build rules**: Clearer hierarchy, contrast, spacing and motion requirements. Sibling-file links open a new tab; assembly checks local targets and allowed schemes.
- **Streamlined documentation in three languages**: Condensed Chinese, English and Japanese READMEs, changelogs, skill entry and step guides, preserving fields, approval gates and verification code while reducing duplication.
- **Multilingual release packaging**: The release script supports a full package and Chinese, English and Japanese variants, checks version consistency and reads back ZIP entry lists.

Usage notes: HTML remains the primary track. The officecli path for PPTX requires at least 1.0.159; non-fade transitions and element animations require 1.0.160. Recompiling PPTX overwrites manual PowerPoint edits, so retain and update the source spec. Motion still needs playback checks in the target viewer.
