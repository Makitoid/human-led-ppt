# human-led-ppt v1.6

**中文** · [English](#english)

> 人主导、Agent 辅助的单文件 HTML PPT 设计系统——人定主题、风格与措辞，Agent 管证据、结构与构建纪律。

## 本次亮点

### 1 · 风格库从 17 套扩到 22 套

- 新增 **R 电子杂志**（提炼自 `op7418/guizang-ppt-skill`）：衬线大标题 + 非衬线正文 + 等宽元数据，5 套电子墨水配色（墨水经典 / 靛蓝瓷 / 森林墨 / 牛皮纸 / 沙丘），只许选一套、不许自定义 hex。
- 新增 **S Bold Signal / T Creative Voltage / U Terminal Green / V Notebook Tabs**（提炼自 `zarazhangrui/frontend-slides`，MIT © Zara Zhang）——四套自带色板与签名的完整风格。其 Swiss Modern、Paper & Ink 未纳入，避免与 A/H、C 重叠。
- 预设**去品牌化改名**：C OpenAI → 纸面中性、D Claude → 人文出版物、F Notion → 文档清单、G 二次元/动漫 → 漫画风。

### 2 · 满版背景（`background` 关键字）

`<section data-bg="data:image/…" data-bg-scrim="…">`，壳负责铺底与遮罩，内容抬到 `z-index:1`。**只接受内联 data: 图片**——deck 保持离线单文件，外链会被壳拒绝并点名该页。背景是"地"，与 `image` 的"框"分开。

### 3 · 图片模块与生成图（`draw` 关键字）

- 第 3 步新增「候选图片」一节：网页搜到的图下载后登记文件名 / 内容 / 来源 URL / 授权 / 建议落位，授权不明标 ⚠️。
- **AI 生成图**先把 prompt、画幅、落位写进骨架，**用户过目 prompt 后**再生成，再转写成 `image` 或 `background`。词库 54 → 56。

### 4 · 证据链默认隐藏、按需唤出

右下角证据链徽标逐页把 `.foot` 等来源现算成一枚 chip，**默认不显示**（不打印、不进截图），按 `E` 或点 Q 面板才出现，点徽标展开来源清单。只汇总作者写在页面上的来源，绝不编造。

### 5 · 播放条缩短

音频播放条展开后改为**居中窄条**（`min(100%,520px)`），不再铺满整卡，进度条更短、鼠标更好点。

### 6 · 自检先问用户

第 6 步开始的第一件事是问一句"自检我自己跑，还是你自己检查"，按回答决定是否执行断言脚本；静态自检两项都必跑。

### 7 · 推荐 skill 表复核

快照更新到 2026-10-14：`entur-accessibility` 已检索不到，改用 `boisenoise-antigravity-wcag-audit-patterns`；`cognitive-design` 更正为 `lyndonkl-cognitive-design`；其余条目经平台搜索确认在架。

## 安装与使用

把 `human-led-ppt/` 放进你的 skill 目录，重载会话，然后 `/human-led-ppt`，或者直接说"帮我做个关于 X 的 PPT"。

## 兼容性

- 自 v1.5 起接口（DOM 契约、`assemble.cjs`、叠加层装配方式）保持不变，旧稿无需改动。
- 本次仅新增关键字（`background` / `draw`）与预设，未删改既有词与预设编号。

## 三语同步

`references/zh|en|ja` 的 02–06、`SKILL.md`、三份 README、三份 CHANGELOG 与本说明同批更新。完整逐条记录见 [CHANGELOG_zh-cn.md](CHANGELOG_zh-cn.md)。

---

<a id="english"></a>

# human-led-ppt v1.6

[中文](#human-led-ppt-v16) · **English**

> A human-led, agent-assisted design system for single-file HTML decks — the user owns the topic, style and wording, the agent owns evidence, structure and build discipline.

## Highlights

### 1 · The style library grows from 17 to 22 presets

- New **R Electronic magazine** (distilled from `op7418/guizang-ppt-skill`): serif display + sans body + mono metadata, five e-ink palettes (Ink Classic / Indigo Porcelain / Forest Ink / Kraft Paper / Dune) — pick one, no custom hex.
- New **S Bold Signal / T Creative Voltage / U Terminal Green / V Notebook Tabs** (distilled from `zarazhangrui/frontend-slides`, MIT © Zara Zhang) — four complete systems with their own palettes and signatures. Its Swiss Modern and Paper & Ink are left out, to avoid overlapping A/H and C.
- **Presets drop their brand names**: C OpenAI → Paper-neutral, D Claude → Editorial, F Notion → Doc-list, G Anime → Manga.

### 2 · Full-bleed backdrop (the `background` keyword)

`<section data-bg="data:image/…" data-bg-scrim="…">`; the shell lays the ground and paints the scrim, and the content lifts to `z-index:1`. **Only inline data: images are accepted** — the deck stays one offline file, and an external URL is refused with the slide named. A backdrop is a ground, kept apart from `image`'s frame.

### 3 · Image module and generated images (the `draw` keyword)

- Step 3 gains a "Candidate images" section: web images are downloaded and registered (file / content / source URL / licence / placement), with unclear licences flagged ⚠️.
- **AI-generated images**: the prompt, aspect and placement go into the skeleton, the **user reviews the prompt first**, then it is generated and rewritten as `image` or `background`. The keyword library grows from 54 to 56.

### 4 · The evidence chain is hidden by default

The bottom-right badge recounts each page's `.foot` sources into one chip, **hidden by default** (never printed, never in a screenshot) and revealed by `E` or the Q panel; clicking expands the source list. It only gathers what the author wrote — nothing is fabricated.

### 5 · A shorter audio strip

The audio transport now unfolds into a **compact centred bar** (`min(100%,520px)`) instead of the full card width, so the scrub line is shorter and easier to aim at.

### 6 · The check asks first

The first thing step 6 does is ask "do you want me to run the check, or will you check yourself", and the answer decides whether the assertions run; the static checks always run.

### 7 · Recommended-skill table re-verified

Snapshot updated to 2026-10-14: `entur-accessibility` is no longer listed and is replaced with `boisenoise-antigravity-wcag-audit-patterns`; `cognitive-design` is corrected to `lyndonkl-cognitive-design`; the rest are confirmed present via the platform's search.

## Install & use

Drop `human-led-ppt/` into your skills directory, reload the session, then `/human-led-ppt`, or just say "build me a deck about X".

## Compatibility

- The interface (DOM contract, `assemble.cjs`, overlay assembly) is unchanged since v1.5 — existing decks need no edits.
- This release only adds keywords (`background` / `draw`) and presets; no existing keyword or preset ID was removed or renumbered.

## Three-language sync

`references/zh|en|ja/02–06`, `SKILL.md`, all three READMEs, all three CHANGELOGs and this note were updated in the same pass. Full, item-by-item notes: [CHANGELOG.md](CHANGELOG.md).
