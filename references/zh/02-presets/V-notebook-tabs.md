> 本文件是第 2 步风格库里的 **V 套**。搭配建议、模板纪律与风格决定块见 `../02-style.md`；同目录放着其余 21 套。

## V. Notebook Tabs（编辑风 / 有序 / 团队分享）
- 观感：奶油纸卡片 + 左侧活页孔 + 右侧彩色索引标签，像一本摊开的活页本。干净、轻盈、不压迫，适合团队内部分享、复盘、培训课件、清单密集的稿子。提炼自 `zarazhangrui/frontend-slides` 的 Notebook Tabs（MIT，© Zara Zhang）。
- 浅色（默认）：bg `#FBF9F4`，panel `#FFFFFF`，ink `#1F1D1A`，muted `#6E6A61`，rule `#E7E1D5`，accent `#B23A48`（正文可用，5.2:1）；标签色（≤4 种）`#B23A48` / `#1D6FB8` / `#2E7D5B` / `#B0720A`，均按正文级加深
- 深色：bg `#1B1917`，panel `#232120`，ink `#F1EDE4`，muted `#A9A397`，rule `#332F2B`，accent `#E0757F`，标签色在上列基础上提亮（如 `#E0757F` / `#6FB3E6` / `#6FCFA0` / `#E0A64B`）
- 字体：标题 `"Bodoni Moda","Noto Serif SC",Georgia,serif`（衬线，编辑气质）；正文 `"DM Sans","PingFang SC","Microsoft YaHei",sans-serif`
- 形状：卡片圆角 8px + 极轻投影；左侧一排小圆孔（`radial-gradient` 或内联 SVG）；右侧标签做成从卡片边缘探出的彩色书签，写这一页属于哪一节
- 动效/切页：切页淡变 + 6px 上浮 300ms；标签页依次"抽出"（`translateX` 小位移 + 淡入，间隔 90ms）；reduced-motion 全关
- 借助 skill：`frontend-design`；交付前用 `vercel-labs-web-design-guidelines` 走一遍 UI 审查
- 风险：标签色最多 4 种、每页最多挂 1–2 个，多了就成便利贴墙；衬线中文小字号发虚，标签用非衬线。
