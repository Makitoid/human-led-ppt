> 本文件是第 2 步风格库里的 **J 套**。搭配建议、模板纪律与风格决定块见 `../02-style.md`；同目录放着其余 16 套。

## J. 白底杂志 / 图文卡（出版感 · 大标题 · 长叙述与种草）
- 观感：纯白底 + 顶栏一条 6 色细彩条 + 80–110px 级标题 + 黑底白字"焦点胶囊"。像一本可以翻页的杂志。
- 签名件：① 页顶 4–6px 的多色横条（只此一处用彩色渐变字）② 焦点胶囊（`background:accent-ink 反相`，2–6 字短语，每页一枚）
- 默认搭档：D Claude 或 C OpenAI 的气质；本页族自己只出结构
- 浅色：bg `#FFFFFF`，panel `#FAF9F7`，ink `#15140F`(18.44)，muted `#5E5A52`(6.86)，accent `#8B3A62`(7.29)，warn `#8A5A00`(5.93)，rule `#E7E4DD`，accent-ink `#FFFFFF`(7.29)
- 深色：bg `#17141A`，panel `#221E27`，ink `#F4F0EA`(16.07)，muted `#B3ACA2`(8.11)，accent `#E79CC0`(8.61)，warn `#E3B872`(9.87)，rule `#332D3A`，accent-ink `#0B0B0B`(9.29)
- 字体：标题 `"Source Han Serif SC","Noto Serif SC",Georgia,serif` 700+；正文无衬线；kicker 用等宽小字加字距
- 适配页型：cover / section-divider / bullets（转 3–5 张等宽软色卡）/ stat-highlight / closing
- 动效：交叉淡变 380–450ms；标题不做遮罩揭示，焦点胶囊可以 `opacity` 单独晚 120ms 落
- 风险：渐变字只给 ≤ 10 个大字，正文用渐变直接判废；深色下彩条要重新配饱和，否则一条变灰带
