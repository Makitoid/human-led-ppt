> 本文件是第 2 步风格库里的 **B 套**。搭配建议、模板纪律与风格决定块见 `../02-style.md`；同目录放着其余 16 套。

## B. Material Design 3（Google / 亲和 / 结构化）
- 观感：色调面（surface tint）+ 明确的角色色，组件感强，适合流程、方法论、教学。
- 浅色：primary `#6750A4`，on-primary `#FFFFFF`，surface `#FFFBFE`，surface-variant `#E7E0EC`，on-surface `#1C1B1F`，muted `#49454F`，warn `#B3261E`，rule `#CAC4D0`
- 深色：primary `#D0BCFF`，on-primary `#381E72`，surface `#141218`，surface-container-highest `#36343B`，on-surface `#E6E1E5`，muted `#CAC4D0`，warn `#F2B8B5`，rule `#49454F`
- 字体：`Roboto,"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif`；标题 500 字重、正文 400
- 形状：卡片圆角 12–16px，按钮全圆角；层级用色调叠加而非阴影堆叠
- 动效/切页：emphasized easing `cubic-bezier(.2,0,0,1)`；页内元素按 40–60ms 递进 stagger；可做**容器变换**（缩略图/卡片扩展为整页）作为幕间页效果；切页用淡入 + 24px 纵向位移。
- **有官方 skill**：`material-3`（M3 令牌、组件、排版比例、expressive 动效）。选这套时先调用它取权威值，别只靠上面的近似。
