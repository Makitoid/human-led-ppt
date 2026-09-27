> 本文件是第 2 步风格库里的 **M 套**。搭配建议、模板纪律与风格决定块见 `../02-style.md`；同目录放着其余 16 套。

## M. 开发者暗紫渐变（GitHub Blog / changelog 气质）
- 观感：GitHub 深蓝黑底 + 紫蓝环境光 + 60px 遮罩网格 + 居中排版 + 紫蓝绿三段渐变字。
- 签名件：① 三段渐变字标题（`#a855f7→#60a5fa→#34d399`，只给封面/幕间的大字）② 左侧紫红竖线的引用/要点块
- 默认搭档：C OpenAI 的数字纪律（一页 ≤ 4 个数字）
- 深色（主用）：bg `#0D1117`，panel `#161B22`，ink `#E6EDF3`(16.02)，muted `#A6B3BF`(8.85)，accent `#A371F7`(5.64)，warn `#E3B341`(9.72)，rule `#262D36`，accent-ink `#0B0B0B`(5.87)
- 浅色（讲给非技术观众时用）：bg `#F7F8FA`，panel `#FFFFFF`，ink `#111820`(16.81)，muted `#4C5866`(6.83)，accent `#6639BA`(6.91)，warn `#7A5300`(6.45)，rule `#E2E6EB`，accent-ink `#FFFFFF`(7.34)
- 字体：`"Inter","PingFang SC",sans-serif` 正文 + 等宽 code；居中式排版靠留白撑，不靠框
- 适配页型：cover / toc / section-divider / config 步骤页 / Q&A
- 动效：交叉淡变 400ms + 背景光斑缓慢位移（≤ 3%）；渐变字用 `background-position` 微移，不做扫光
- 风险：`--accent` 是紫色，任何写在它上面的字必须走 accent-ink（近黑 5.87，白只有 3.35）；紫蓝环境光在浅色稿里必须整个删掉
