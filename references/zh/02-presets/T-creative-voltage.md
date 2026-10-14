> 本文件是第 2 步风格库里的 **T 套**。搭配建议、模板纪律与风格决定块见 `../02-style.md`；同目录放着其余 21 套。

## T. Creative Voltage（活力 / 复古现代 / 品牌叙事）
- 观感：电光蓝大色块 + 霓虹黄点缀 + 半调网点纹理，活力、有节奏、偏品牌叙事。适合产品发布、创意展示、创业 demo。提炼自 `zarazhangrui/frontend-slides` 的 Creative Voltage（MIT，© Zara Zhang）。
- 浅色：bg（电光蓝）`#0066FF`，panel（深色块）`#0A1A3F`，ink `#FFFFFF`，muted `#C7D6FF`，rule `rgba(255,255,255,.28)`，accent（霓虹黄，仅上深底／电光蓝）`#D4FF00`——`#D4FF00` 在 `#0066FF` 上约 4.8:1、在 `#0A1A3F` 上约 14:1，**别把霓虹黄放到白底上**（≈1.1:1，等于隐形）
- 深色（默认更稳的用法）：bg `#0A1A3F`，panel `#12234D`，ink `#F2F5FF`，muted `#9FB2E0`，rule `rgba(255,255,255,.18)`，accent `#D4FF00`
- 字体：标题 `"Syne","Noto Sans SC",sans-serif` 700–800；元数据／标签 `"Space Mono",ui-monospace`；正文 `"PingFang SC","Microsoft YaHei",sans-serif`
- 形状：直角或 ≤ 6px；斜切色块与大号徽章做签名件；半调网点（`radial-gradient` 小点阵）当纹理，铺在色块边缘而非整页
- 动效/切页：切页位移动画（横向 24px 滑入 + 淡变，280ms）；网点层做 10s 缓慢位移；标签用 stagger 依次亮起；reduced-motion 全关
- 借助 skill：`frontend-design`；节奏与 stagger 查 `web-animation-design`
- 风险：电光蓝整页铺满在投影仪上偏亮、易糊字；正文区的面积要收，蓝只当底／块，正文宁可用深色 panel 承载。
