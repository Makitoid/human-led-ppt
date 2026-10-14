> 本文件是第 2 步风格库里的 **U 套**。搭配建议、模板纪律与风格决定块见 `../02-style.md`；同目录放着其余 21 套。

## U. Terminal Green（极客 / 终端 / 开发者分享）
- 观感：近黑终端底 + 荧光绿等宽字，像一块跑着的终端。适合开发者分享、CTF／安全、命令行 demo、极客观点的技术评审。提炼自 `zarazhangrui/frontend-slides` 的 Terminal Green（MIT，© Zara Zhang）。
- 与 **L 暗底终端**的区别：L 是**版式模板**（可叠任意气质，用 `$ prompt` 标题 + 扫描线），U 是**完整气质**（固定荧光绿单色 + 近黑底 + 全等宽）；两者别叠着用。
- 浅色（几乎不用，仅备）：bg `#F2F4F0`，panel `#FFFFFF`，ink `#12211A`，accent `#0B6B3A`（正文可用，5.6:1）
- 深色（默认）：bg `#070B09`，panel `#0E1512`，elevated `#131C18`，ink `#B7F5C8`，muted `#5F8C6E`，rule `rgba(183,245,200,.16)`，accent `#39FF14`（上深底 ≈ 15:1，但**太扎眼，只给光标、行首符、关键数字**，正文用 ink）
- 字体：全局 `"JetBrains Mono",ui-monospace,SFMono-Regular,"PingFang SC","Microsoft YaHei",monospace`——**标题与正文都用等宽**；中文等宽回退到 PingFang 但用 letter-spacing 拉出栅格感
- 形状：直角，0 圆角；左对齐，行首可放 `$`／`>` 提示符；用 ASCII 分隔线（`──`）代替边框；无阴影、无渐变
- 动效/切页：打字机逐字（`steps()` 或 JS 逐字追加，30–45ms/字，仅给标题与 key），进页顺序出现；光标方块 `1s step-end` 闪烁；reduced-motion 时直接落终值不逐字
- 借助 skill：`frontend-design`（等宽字体与终端质感）
- 风险：荧光绿大面积用会刺眼、投影偏色；**只当点缀色**，面积控制在 10% 以内；中文等宽字体体验差，正文若长可退回无衬线，仅代码／标签保留等宽。
