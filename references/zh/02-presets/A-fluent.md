> 本文件是第 2 步风格库里的 **A 套**。搭配建议、模板纪律与风格决定块见 `../02-style.md`；同目录放着其余 16 套。

## A. Fluent Design 2（微软 / 机构感 / 报告体）
- 观感：分层深度 + 亚克力背板 + 细描边卡片，秩序感强，适合政策、数据、正式汇报。
- 浅色：bg `#FAF9F8`，panel `#FFFFFF`，ink `#201F1E`，muted `#605E5C`，accent `#0F6CBD`，warn `#8A5A00`，rule `#E1DFDD`
- 深色：bg `#1B1A19`，panel `#292827`，elevated `#323130`，ink `#FAF9F8`，muted `#AAAAAA`，accent `#75B6E9`，warn `#F1D08A`，rule `#3B3A39`
- 字体：`"Segoe UI Variable","Segoe UI","Microsoft YaHei UI","Microsoft YaHei",system-ui,sans-serif`；中文标题用雅黑加粗，不要硬套拉丁字体导致中文回退成宋体
- 形状：圆角 4/8px；阴影极轻（`0 1.6px 3.6px rgba(0,0,0,.13)`）；重点靠描边与亚克力层，不靠厚阴影
- 动效/切页：交叉淡变 + 8px 上浮（`cubic-bezier(.1,.9,.2,1)`，280–350ms）；亚克力层可缓慢漂移做背景；卡片 hover 用 Reveal 描边光。切页不加方向性位移（投影时位移会显得晃）。
- 借助 skill：`fluent-design`（bingfoon）取亚克力配方、控件规格与深色令牌；`frontend-design` 复核整体方向。
- 适配：数据密集页表现最好；每页给一条 1px 分栏线，秩序感立刻出来
