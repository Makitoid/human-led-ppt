> 本文件是第 2 步风格库里的 **C 套**。搭配建议、模板纪律与风格决定块见 `../02-style.md`；同目录放着其余 16 套。

## C. OpenAI（克制 / 中性 / 技术权威）
- 观感：接近纸面的中性底 + 极细分隔线 + 大量留白，几乎无装饰，让数字自己说话。适合技术综述、严肃议题。
- 浅色：bg `#F7F7F5`，panel `#FFFFFF`，ink `#0D0D0D`，muted `#676767`，rule `#E5E5E3`，accent `#0A6E56`（正文可用，5.8:1）；品牌原色 `#10A37F` 只有 2.98:1，**仅用于大字号图形与色块**
- 深色：bg `#0E0E0E`，panel `#171717`，elevated `#1F1F1F`，ink `#ECECEC`，muted `#A0A0A0`，rule `#2A2A2A`，accent `#1FCB9F`
- 字体：`Söhne,Inter,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif`；标题可用等宽（`"JetBrains Mono",ui-monospace`）做技术感
- 规则：无阴影、圆角 ≤ 6px；图表只用单色 + 一条强调色；靠字号层级和留白分区
- 动效/切页：全场只用交叉淡变（350ms），无位移、无缩放；数字递增是唯一允许的"表演"。越克制越像官方。
- 借助 skill：`frontend-design`；需要为字号层级找依据时用 `agrimsingh-bringhurst-typography`。
