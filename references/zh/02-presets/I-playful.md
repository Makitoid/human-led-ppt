> 本文件是第 2 步风格库里的 **I 套**。搭配建议、模板纪律与风格决定块见 `../02-style.md`；同目录放着其余 16 套。

## I. 趣味 / 玩乐（明快 / 强互动 / 破冰与社团）
- 观感：糖果色块 + 超大圆角 + 手绘描边 + 表情化几何形状（内联 SVG 画的圆脸、箭头、星星，不用 emoji 字体）。适合破冰、活动、面向低龄或内部轻松场合。
- 浅色：bg `#FFFCF5`，panel `#FFFFFF`，ink `#232323`；正文可用 `accent #C24A2E` / `accent2 #007A70` / `accent4 #5A4BD1`，大字号与色块用糖果原色 `#FF7A5C` / `#00B8A9` / `#FFC93C` / `#7B6CF6`，rule `#EFE6D8`
- 深色：bg `#1A1725`，panel `#241F33`，ink `#FFF6EA`，accent `#FF8E70`，accent2 `#2FD8C4`，accent3 `#FFD75E`，accent4 `#9C8CFF`，rule `#38304D`
- 字体：标题 `"Smiley Sans","思源黑体 Bold","PingFang SC",sans-serif` 700–900；正文常规；数字可放大到 140px 当主视觉
- 形状：圆角 20–28px；硬投影或彩色偏移边（`box-shadow: 6px 6px 0 <accent>`）；标签用胶囊
- 动效/切页：切页可做 `slide-left/slide-right` 位移（350ms，`cubic-bezier(.22,.61,.36,1)`）；元素 `popIn` 带 ±2° 轻微旋转与过冲；悬停/点击态有 4px 下沉。**注意**：位移型切页在 1280×720 固定画布上要靠 `opacity+transform` 做，别改 `display`，否则总览缩略图会空白。
- 借助 skill：`frontend-design`；弹簧、按压反馈与时间曲线查 `web-animation-design`。
- 风险：多色块最容易失控，限定"1 主色 + 2 辅色 + 中性"，且每页色块不超过 3 种。


> 每套模板给的是**页面骨架 + 两个签名件 + 起手色板**，不是官方令牌。色板对比度已用 `06-verify.md` 的 ratio 脚本逐色实测（正文 ≥ 4.5:1，写在括号里）；`accent-ink` = 写在 accent 填充块上的文字色及其比值。**改任何色值都要重跑一遍。**
> 用法：选定模板后只把它那两个签名件的 CSS 写进这份 deck 的 `<style>`，其余部分照气质预设走。签名件每页 ≤ 2 个，多出来的就是装饰噪声。
