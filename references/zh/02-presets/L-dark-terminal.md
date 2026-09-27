> 本文件是第 2 步风格库里的 **L 套**。搭配建议、模板纪律与风格决定块见 `../02-style.md`；同目录放着其余 16 套。

## L. 暗底终端 / 诚实评测（CLI · trace · benchmark）
- 观感：近黑蓝底 + 56px 细网格 + CRT 暗角与扫描线 + `$ prompt` 式标题 + 薄荷绿发光大数字。
- 签名件：① 窗口三色灯条（把一页伪装成终端窗口，装 trace/代码/输出）② 闪烁光标 `▍`（只给封面与结尾）
- 默认搭档：C OpenAI 的克制（去掉发光即可转浅色），或 M 紫渐变
- 深色（主用）：bg `#0A0C10`，panel `#11151A`，ink `#E6EDF3`(16.56)，muted `#9AA4B0`(7.75)，accent `#7ED3A4`(10.94)，warn `#E0A94D`(9.27)，rule `#1E252D`，accent-ink `#0B0B0B`(11.00)
- 浅色（降级版）：bg `#F6F7F5`，panel `#FFFFFF`，ink `#12181D`(16.64)，muted `#4E5A63`(6.59)，accent `#0E6E4A`(5.84)，warn `#7A5300`(6.38)，rule `#DDE2E0`，accent-ink `#FFFFFF`(6.27)
- 字体：`"JetBrains Mono",ui-monospace` 承担标题、数字、代码；中文正文交给无衬线，别用等宽写中文
- 适配页型：terminal / code / diff / chart-bar（描边柱，不填充）/ 结论页
- 动效：打字机逐字（≤ 1 页）、柱体 `stroke` 描线；发光 `text-shadow` 只给 ≥ 64px 数字
- 风险：扫描线 + 网格 + 发光三件套同时开，投影仪上会变成一片糊——同一页只用两件；等宽中文发虚，禁做正文
