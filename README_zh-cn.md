<h1 align="center"><img src="assets/banner.svg" alt="human-led-ppt —— 以人为主导、AI 为辅助的 HTML-PPT 设计系统，兼容原生 PPTX" width="1280"></h1>

[English](README.md) · **中文** · [日本語](README_ja.md)

**人主导、Agent 辅助的演示设计 skill。** 你决定主题、风格与措辞，Agent 负责证据、结构与构建。HTML 为主轨，支持原生 PPTX；骨架经你审核后才开始构建。

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg) ![Version 2.0.0](https://img.shields.io/badge/version-2.0.0-blue.svg) ![HTML dependencies: none](https://img.shields.io/badge/HTML%20dependencies-none-brightgreen.svg) ![PPTX engine: officecli](https://img.shields.io/badge/PPTX%20engine-officecli-blue)

> [!note]
> 本项目已经迁移到 Codeberg 开发。GitHub 只作为副本同步。

## 安装与使用

将 `human-led-ppt/` 放入 skill 目录，重载会话后调用 `/human-led-ppt`，或直接描述需求：

- “做一份关于 X 的 HTML 演示，面向 Y，讲 10 分钟。”
- “做一份可编辑的 PPTX。”
- “HTML 和 PPTX 两份都要。”

## 选择交付形态

| 形态         | 适合                               | 交付                                     |
| ------------ | ---------------------------------- | ---------------------------------------- |
| HTML（主轨） | 离线演示、交互、批注与双窗         | `.html`；音视频及本地链接文件需一同交付  |
| PPTX（兼容） | 提交文件、在 PowerPoint 中继续编辑 | `.pptx`、`-PPTX-src.json`、`-PPTX-qa.md` |
| 两份         | 同时需要演示与可编辑文件           | 共用资料，分别维护骨架、构建与验收       |

第 1 步由你选择，Agent 不代选。HTML 图片内联、无需外部库；PPTX 使用本机字体，效果受 PowerPoint 环境影响。

## 工作流程

| 步骤           | 内容与产出                                 |
| -------------- | ------------------------------------------ |
| 1 主题         | 确认形态、受众、时长与叙事                 |
| 2 风格         | 从 22 套预设 / 模板中选择，形成风格决定块  |
| 3 资料（按需） | 汇总证据、数字、来源与未核实项             |
| 4 骨架         | 逐页规格与提示词；**审核通过后才能构建**   |
| 5 构建         | 按骨架装配 HTML，或编译原生 PPTX           |
| 6 验收         | 确认检查方式，核对结构、数字与渲染结果     |
| 7–8 可选层     | HTML 批注 / 黑板、演讲者双窗；提示词需审核 |

## 图表与演示能力

- **21 种 SVG 模板**：11 种图表、10 种图示；[打开模板库](assets/visual-templates.html)。
- **4 套外观**：圆角卡片、极简线框、工程蓝图、编辑风；支持搜索、分类、明暗预览和代码复制。
- **HTML 导航**：键盘 / 点击 / 触屏翻页，`G` 总览、`F` 全屏、`Q` 快捷键、页码记忆。
- **可选能力**：媒体播放、按稿开启的证据链、批注与演讲者模式。

## PPTX 使用边界

- 先运行 `assets/pptx/detect-engine.cjs`：Claude Code / Codex / ZCode / dsh 优先检查宿主 PPTX 插件，无则回退 officecli；其他宿主使用 officecli。
- officecli 最低 `1.0.159`；非 fade 切页和页内动画需 `1.0.160`。只安装二进制，不运行 `officecli install`。
- 由 `PPTX-src.json` 编译原生对象；重编译会覆盖 PowerPoint 手工修改，交付后的改稿先确认处理方式。
- 不支持任意旧 PPTX 的美化或企业母版套用；复杂图表可能降级。没有 PowerPoint 时，截图不代表像素或播放效果一致。

## 文档

[技能入口](SKILL.md) · [中文约束](references/zh/02-style.md) · [更新日志](CHANGELOG_zh-cn.md)

完整步骤位于 `references/zh/`；[English](references/en) 和 [日本語](references/ja) 为对应版本。

## 效果预览

![演示效果](pic/1.png)
![演示效果](pic/2.png)
![演示效果](pic/3.png)
![演示效果](pic/4.png)

## 致谢与许可

版式与演讲者交互参考 [HTML PPT Studio](https://github.com/lewislulu/html-ppt-skill)，PPTX 方法参考 [ppt-master](https://github.com/hugohe3/ppt-master)（MIT）；仅借鉴设计与方法，未复制代码。R 风格参考 [guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill)，S–V 参考 [frontend-slides](https://github.com/zarazhangrui/frontend-slides)（MIT，© Zara Zhang）。PPTX 工具为 [OfficeCLI](https://github.com/iOfficeAI/OfficeCLI)（Apache-2.0）。

本项目采用 [MIT](LICENSE)，© Makitoid Wang。
