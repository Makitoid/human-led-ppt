> 本文件是第 2 步风格库里的 **S 套**。搭配建议、模板纪律与风格决定块见 `../02-style.md`；同目录放着其余 21 套。

## S. Bold Signal（自信 / 高冲击 / 主题演讲）
- 观感：深炭底压亮橙焦点卡 + 超大章节编号（01/02/03），一眼让人坐直。适合主题演讲、有结论要甩出来的汇报、向领导述职。提炼自 `zarazhangrui/frontend-slides` 的 Bold Signal（MIT，© Zara Zhang）。
- 浅色（若必须用亮场）：bg `#F4F1EC`，panel `#FFFFFF`，ink `#141414`，muted `#63615C`，rule `#E1DDD5`，accent `#C2410C`（正文可用，5.4:1——亮橙 `#FF5722` 只有 2.7:1，**仅限 ≤10 个大字与色块**）
- 深色：bg `#1A1A1A`，panel `#242424`，elevated `#2E2E2E`，ink `#F5F3EF`，muted `#A6A29B`，rule `#33322F`，accent（橙卡底）`#FF5722`、其上一律走 `--accent-ink`（配 `#1A1A1A` 时约 5.3:1，可用）
- 字体：标题 `"Archivo Black","Noto Sans SC",sans-serif` 900 字重；正文／小标题 `"Space Grotesk","PingFang SC","Microsoft YaHei",sans-serif`
- 形状：圆角 10–14px；橙色卡片做焦点（一页至多一张）；章节编号用超大字号（120px+）压角；无渐变、无玻璃
- 动效/切页：切页硬切 + 120ms 白闪；焦点卡在进场时 `scale .92→1` 弹入（`cubic-bezier(.34,1.56,.64,1)`），编号用 `data-count` 递增；每页动画元素 ≤ 5
- 借助 skill：`frontend-design`；动效曲线查 `web-animation-design`
- 风险：橙色是**唯一**强色，别再多开第二色（会变成集市）；深底投影时把 muted 提亮一档，否则注释看不清。
