> 本文件是第 2 步风格库里的 **F 套**。搭配建议、模板纪律与风格决定块见 `../02-style.md`；同目录放着其余 16 套。

## F. Notion（素净 / 文档感 / 信息密集）
- 观感：白底、暖灰文字、浅分隔线、彩色小标签，适合要点密集、清单型、复盘型内容。
- 浅色：bg `#FFFFFF`，side `#F7F6F3`，ink `#37352F`，muted `#787774`，line `#E9E9E7`；标签色 `#4B7399 / #D9730D / #DB3E6A / #9065B0 / #0F7B6C`
- 深色：bg `#191919`，side `#202020`，ink `#E6E6E4`，muted `#9B9B98`，line `#2F2F2F`；标签一律"亮色文字 + 同色系深色底"（例：文字 `#A9C6E0` 配底 `#1F3A52`；橙 `#E0A267`/底 `#4A2E15`；粉 `#E091AC`/底 `#4A1F30`；紫 `#BFA6DC`/底 `#33254A`；青 `#7FC9B8`/底 `#153A32`）——亮色直接写在深底上会糊，深色文字写在亮底上则对比不足
- 字体：`Inter,"Helvetica Neue","PingFang SC","Microsoft YaHei",sans-serif`；行高 1.6–1.7
- 规则：只用一种强调色 + 中性灰阶；表格与分栏线是主要视觉工具；禁止大色块
- 动效/切页：几乎不动——瞬时切换或 150ms 淡变；页内元素不做 stagger（信息密集页逐个冒出来会拖慢讲解节奏）。
- 借助 skill：`frontend-design`；交付前用 `vercel-labs-web-design-guidelines` 走一遍 UI 审查。（市场里的 `notion-*` 都是 Notion API / 信息图生成，与这套设计语言无关。）
