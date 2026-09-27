> 本文件是第 2 步风格库里的 **H 套**。搭配建议、模板纪律与风格决定块见 `../02-style.md`；同目录放着其余 16 套。

## H. 学术 / 论文（严谨 / 高密度 / 答辩与组会）
- 观感：纸感底 + 衬线标题 + 严格的图表规范，信息密度高但不喧哗。适合论文答辩、组会、技术评审。
- 浅色：bg `#FBFAF7`，panel `#FFFFFF`，ink `#1A1A1A`，muted `#4D4D4D`，accent `#1F3A5F`（或院系主色），warn `#8C2F1E`，rule `#D8D4CB`
- 深色：bg `#16181C`，panel `#1E2126`，ink `#E8E6E1`，muted `#A8A69F`，accent `#7FA8D9`，warn `#E08A6E`，rule `#33373E`
- 字体：标题 `"Source Han Serif SC","Noto Serif SC","Times New Roman",serif`；正文 `"Inter","PingFang SC","Microsoft YaHei",sans-serif`；图注 12–14px 且斜排"图 1 / 表 2"编号
- 规则：每页顶部一条 kicker（章节号 + 章节名）；图表必须有轴标题、单位、样本量/年份；引用条用脚注式上标编号，末页统一列参考文献；配色最多 1 强调色 + 灰阶
- 动效/切页：只用"生长"类动画服务数据——条形 `width 0→终值`、折线 `stroke-dashoffset` 描线、表格逐行淡入 150ms；切页交叉淡变 300ms，**不加任何位移或缩放**（学术场合动效越花越掉分）。
- 借助 skill：`agrimsingh-bringhurst-typography`（明确覆盖 slide 的排版规范）、`entur-accessibility`（WCAG 2.1）；图表认知负荷查 `cognitive-design`。
