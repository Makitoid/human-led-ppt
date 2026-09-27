> 本文件是第 2 步风格库里的 **D 套**。搭配建议、模板纪律与风格决定块见 `../02-style.md`；同目录放着其余 16 套。

## D. Claude（温暖 / 人文 / 叙事）
- 观感：奶油底 + 墨色文字 + 陶土色强调，衬线标题带来出版物气质。适合人文、教育、观点型、访谈式叙事。
- 浅色：bg `#F5F1E8`，panel `#FBF8F1`，ink `#26221C`，muted `#6B655B`，rule `#DED7C8`，accent `#9E4A28`（正文可用，5.38:1）；陶土原色 `#B75C38` 为 4.05:1，只用于 ≥ 32px 的标题与色块；warn `#7A5F1B`
- 深色：bg `#211D18`，panel `#2B2621`，ink `#F0EAE0`，muted `#B4A99B`，accent `#D97A52`，warn `#D6A94B`，rule `#3B342C`
- 字体：标题 `"Source Han Serif SC","Noto Serif SC",Georgia,serif`；正文 `"Söhne","Inter","PingFang SC","Microsoft YaHei",sans-serif`
- 形状：圆角 8–12px，边框代替阴影；可用细线手绘插画做单页锚点（内联 SVG）
- 动效/切页：慢而柔——淡入 500ms + 6px 上浮，行距随进场轻微展开；衬线标题可做 20px 遮罩式逐行揭示；避免弹跳过冲（与出版物气质冲突）。
- 借助 skill：`frontend-design`；字体搭配与模块化比例可查 `majiayu000-brand-typography-systems`。
- 注意：衬线中文在小字号下发虚，正文一律无衬线，标题才用衬线；深色下把奶油底压到 `#211D18` 这类暖黑，别用纯黑，否则暖色文字会脏。
