> 本文件是第 2 步风格库里的 **K 套**。搭配建议、模板纪律与风格决定块见 `../02-style.md`；同目录放着其余 16 套。

## K. 奶油蓝图 / 硬描边架构（工程 · 可打印 · 零渐变）
- 观感：奶油纸底 + 48px 蓝图网格（低透明）+ 2px 硬描边卡片 + 单一锈红强调。像一份能贴墙上的 README。
- 签名件：① 网格底纹（`background-image:linear-gradient`，只给封面/架构页）② 右侧锈红 insight 竖条标注块
- 默认搭档：H 学术的图表规范，或 A Fluent 的秩序感
- 浅色：bg `#F0EAE0`，panel `#F7F3EA`，ink `#1C1A16`(14.52)，muted `#5A554C`(6.18)，accent `#B5392A`(4.90)，warn `#7A5A12`(5.32)，rule `#C9BFAE`，accent-ink `#FFFFFF`(5.86)
- 深色：bg `#14171A`，panel `#1C2126`，ink `#E7E3D9`(14.04)，muted `#A3A79F`(7.36)，accent `#E4705D`(5.80)，warn `#E0B95C`(9.65)，rule `#2C333A`，accent-ink `#0B0B0B`(6.35)
- 字体：正文 `Inter,"PingFang SC",sans-serif`；图内标注与代号一律等宽；大数字用 Playfair 类衬线
- 适配页型：arch-diagram / flow / process-steps / table / verdict
- 动效：折线 `stroke-dashoffset` 描线、方框 `opacity` 淡入；**零阴影、零圆角或 2px、零渐变**
- 风险：描边 2px 在投影仪上比 1px 稳，但卡片一多就成格子纸——每页卡片 ≤ 4 张；深色底上网格透明要砍一半
