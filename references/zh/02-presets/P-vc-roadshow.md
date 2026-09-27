> 本文件是第 2 步风格库里的 **P 套**。搭配建议、模板纪律与风格决定块见 `../02-style.md`；同目录放着其余 16 套。

## P. 路演 VC（ traction · 大数字 · 融与不讲）
- 观感：白底 + 海军蓝→紫的低透明渐变只出现在标题与 CTA + 超大 KPI + 一条牵引曲线。
- 签名件：① 每幕一张"里程碑横轴"（NOW/NEXT/LATER）② KPI 四联卡，数字 96–120px、delta 用 warn/绿小标
- 默认搭档：A Fluent 或 C OpenAI
- 浅色：bg `#FFFFFF`，panel `#F8FAFC`，ink `#0B1220`(18.72)，muted `#46536B`(7.75)，accent `#1F4FD8`(6.63)，warn `#8A5A00`(5.93)，rule `#E3E8F0`，accent-ink `#FFFFFF`(6.63)
- 深色：bg `#0B1020`，panel `#141B2E`，ink `#EEF2FA`(16.87)，muted `#A6B0C4`(8.68)，accent `#7FA7FF`(8.00)，warn `#E8C05C`(10.93)，rule `#222C44`，accent-ink `#0B0B0B`(8.32)
- 字体：`Inter,"PingFang SC",sans-serif` 700 标题；数字一律 `tabular-nums`
- 适配页型：kpi-grid / roadmap / chart-line / comparison / team / ask
- 动效：数字递增（壳的 `data-count`）+ 曲线描线 + 卡片淡入；**位移型进场不要**
- 风险：这套最容易掩盖空洞——每个 KPI 必须回资料总结取数，无来源的"市场万亿"一律删；渐变只允许出现在标题/CTA 底色，正文区域保持纯 panel
