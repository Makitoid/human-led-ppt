> 本文件是第 2 步风格库里的 **Q 套**。搭配建议、模板纪律与风格决定块见 `../02-style.md`；同目录放着其余 16 套。

## Q. 马卡龙卡片（生活方式 · 慢节奏 · 图文轮播）
- 观感：奶油底 + 三个大范围模糊光斑 + 衬线斜体大标题与无衬线正文混排 + 高饱和但不刺眼的圆角卡（桃/薄荷/天蓝/丁香/柠檬/玫红）。
- 签名件：① 背景模糊光斑（≤ 3 个，只随切页淡入淡出，不飘动）② `Playfair italic` 的 `01–04` 序号字
- 默认搭档：I 趣味的圆角与胶囊，但字重与饱和度都降一档
- 浅色：bg `#FEF8F1`，panel `#FFFFFF`，ink `#2A2320`(14.64)，muted `#6A6058`(5.81)，accent `#8C5AA8`(4.81)，warn `#946A12`(4.60)，rule `#EFE2D4`，accent-ink `#FFFFFF`(5.07)
- 深色：bg `#1C1822`，panel `#26202F`，ink `#FBF3EA`(15.88)，muted `#BEB2BE`(8.56)，accent `#D6A6EE`(8.77)，warn `#E8C05C`(10.08)，rule `#38303F`，accent-ink `#0B0B0B`(9.89)
- 字体：标题 `"Playfair Display","Source Han Serif SC",serif`（斜体只给序号与引语）；正文常规无衬线
- 适配页型：bullets（多卡）/ image-gallery / chart-pie（甜甜圈）/ quote / closing
- 动效：淡入 + 卡片 6px 上浮，400–500ms，间隔 120ms；不要用弹跳过冲（与柔和气质冲突）
- 风险：**本表最紧的一套**——accent 4.81、warn 4.60 只比 4.5 线高一点，改色必复测；马卡龙卡超过 4 张就变糖果铺，正文区域永远保持 panel 白
