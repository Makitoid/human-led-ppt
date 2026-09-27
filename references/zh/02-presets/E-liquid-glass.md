> 本文件是第 2 步风格库里的 **E 套**。搭配建议、模板纪律与风格决定块见 `../02-style.md`；同目录放着其余 16 套。

## E. Liquid Glass（Apple 2025 / 通透 / 展示型）
- 观感：半透明折射层、高光边缘、内容在其下流动，发布会气质。**课堂投影风险高**：低对比 + 细字在投影仪上会糊。
- 浅色：底层色场 `#EDEFF3 → #F7F4F0`（低对比渐变，仅供折射），玻璃层 `rgba(255,255,255,.14)`，ink `#1D1D1F`，accent `#0B62B8`（正文可用，5.28:1；系统蓝 `#0A84FF` 只有 3.17:1，留给大字号），内高光 `inset 0 1px 0 rgba(255,255,255,.45)`
- 深色：底层色场 `#0B0D12 → #141A24`，玻璃层 `rgba(255,255,255,.08)`，ink `#F2F5FA`，muted `#9BA6B5`，accent `#64D2FF`，高光 `inset 0 1px 0 rgba(255,255,255,.22)`，描边 `rgba(255,255,255,.16)`
- 字体：`"SF Pro Display","PingFang SC","Microsoft YaHei",system-ui,sans-serif`，标题负字距 `-0.02em`
- 形状：圆角 24–32px；`backdrop-filter: blur(24px) saturate(180%)`
- 动效/切页：切页用**折射位移**——新页从下方 12px 淡入，同时背景色场轻微视差（`translate3d` 2–3%）；玻璃层进场时 `blur` 半径从 40px 收到 24px（只给封面/幕间页用）。性能敏感：全场同时做 backdrop-filter 的层不超过 3 个。
- 借助 skill：`majiayu000-axiom-liquid-glass`（WWDC 2025 设计原则、视觉伪影与性能评审清单；偏 Swift，CSS 自己推导）；`frontend-design` 复核对比度方案。
- 硬要求：玻璃上的正文对比度实测 ≥ 4.5:1（用 `06-verify.md` 的脚本量），不达标就加不透明度。深色下总览墙背板要一并改深，否则缩略图墙会浮成一片白。
