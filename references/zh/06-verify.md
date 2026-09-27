# 第 6 步 · 自检与交付

顺序：静态自检 → 浏览器实测 → 数字审计 → 交付。任何一项没过就回去改，不要把未验证的东西当完成品交出去。

## 1. 静态自检

```bash
# 零外部依赖
grep -nEo '<(script|link|img|iframe)[^>]*(src|href)="(https?:)?//[^"]*"' <主题>.html
grep -n 'localStorage\|sessionStorage\|fetch(\|XMLHttpRequest' <主题>.html

# 页数与骨架一致
grep -c 'class="slide"' <主题>.html        # 对比骨架 §1 slides
grep -o 'data-i="[0-9]*"' <主题>.html      # 应连续且与渲染页码序列一致

# 每页都有引用条（封面/幕间页可豁免，但要在骨架里写明）
grep -c 'class="foot"' <主题>.html

# 骨架 §4 的词表注释只给人看，不许泄漏进成品（应为 0）
grep -c '⧉\|词表注释\|legend start' <主题>.html
```

再确认：`<meta name="viewport">` 存在；`#viewport/#stage/#overview/#aria/#rotate-mask` 齐备；`.notes` 里的内容没有以可见形式出现在页面上。

## 2. 浏览器实测

内置浏览器常截不了图，用 `evaluate_script` 做结构断言；每次改完文件必须换 `?v=N` 重载，否则测的是缓存。

```js
async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const key = k => document.dispatchEvent(new KeyboardEvent('keydown', {key:k, bubbles:true, cancelable:true}));
  const out = {total: window.__deck.total, hash: location.hash};
  // 导航
  key(' '); await sleep(450); out.afterSpace = window.__deck.index;
  key('ArrowLeft'); await sleep(450); out.afterLeft = window.__deck.index;
  key('End'); await sleep(450); out.afterEnd = window.__deck.index;
  key('Home'); await sleep(450);
  key('3'); await sleep(450); out.afterDigit3 = {idx: window.__deck.index, hash: location.hash};
  // 点击左右半屏
  const r = document.getElementById('stage').getBoundingClientRect();
  document.body.dispatchEvent(new MouseEvent('click',{clientX:r.left+r.width*0.9, clientY:r.top+r.height*0.85, bubbles:true, cancelable:true}));
  await sleep(450); out.afterClickRight = window.__deck.index;
  // G 总览
  key('g'); await sleep(200);
  const ov = document.getElementById('overview');
  out.overview = {open: ov.classList.contains('open'), thumbs: ov.querySelectorAll('.thumb').length,
                  scale: ov.querySelector('.thumb-slide')?.style.transform,
                  caps: [...ov.querySelectorAll('.capno')].map(e=>e.textContent)};
  ov.querySelectorAll('.thumb')[0].click(); await sleep(450);
  out.thumbJump = {idx: window.__deck.index, closed: !ov.classList.contains('open')};
  // 逐页溢出 + 字号 + 缩放
  const bad = [];
  for (let i=0;i<window.__deck.total;i++){
    window.__deck.go(i); await sleep(120);
    const s = document.querySelectorAll('#stage > .slide')[i];
    if (s.scrollHeight > s.clientHeight + 2 || s.scrollWidth > s.clientWidth + 2)
      bad.push({i:i+1, sh:s.scrollHeight, ch:s.clientHeight, sw:s.scrollWidth, cw:s.clientWidth});
    // 字号下限只查正文类元素；引用条/标签/kicker 按设计就是小字，排除
    s.querySelectorAll('p,li,td,span').forEach(el=>{
      if (el.closest('.notes, .foot, .kicker, .srcline, .badge, .capno')) return;
      if (el.textContent.trim() && parseFloat(getComputedStyle(el).fontSize) < 21.5)
        bad.push({i:i+1, small:Math.round(parseFloat(getComputedStyle(el).fontSize))+'px', text:el.textContent.trim().slice(0,24)});
    });
  }
  out.problems = bad;
  out.stageTransform = document.getElementById('stage').style.transform;
  // 竖屏遮罩版式
  const m = document.getElementById('rotate-mask'); m.classList.add('show');
  out.mask = getComputedStyle(m).display; m.classList.remove('show');
  return JSON.stringify(out);
}
```

深链与打印：直接访问 `<主题>.html#s7` 应落在第 7 页；`Ctrl+P` 预览应一页一纸（内置浏览器做不到时用 `@media print` 规则存在性核对，并说明未实测）。

快捷键面板：按真按键 `Q` 应弹出 `#deckhelp`，分区块里至少有壳那段「翻页与视图」；装了可选层的话，
`window.__deckHelp` 里还应有批注层和演讲者层注册的段落。`Esc` 关闭，面板打开时批注工具条与小按钮
全部隐藏（`#deckhelp.open ~ …` 的兄弟选择器），点面板空白处不翻页。`?preview=N` 里按 `Q` 应无反应。

对比度（尤其玻璃/低对比方案）：

```js
const lum = c => { const [r,g,b]=c.match(/\d+/g).map(Number).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}); return .2126*r+.7152*g+.0722*b; };
const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p); return ((x+.05)/(y+.05)).toFixed(2); };
// 对每个正文元素取 getComputedStyle(el).color 与其最近的不透明祖先 background-color 比对
```

移动端：把窗口收到 390×844 竖屏，遮罩应出现；转 844×390 应消失且画面完整缩放。

## 3. 数字审计（不可跳过）

逐页把 HTML 上出现的**每一个数字和主张**回指到资料总结的具体行：

- 数字、单位、年份、来源四要素齐备且与资料总结一致
- 推算值页面上写了"据…推算"；⚠️ 有分歧说明；🔍 措辞是"据…转引"；⛔ 条目一次都没出现
- 被纠正过的误读没有被按错误版本复述
- 无来源的数字、形容词化断言（"惊人""遥遥领先"）、把估算写成定论 → 一律删改
- 骨架 §4 该页的每个关键字条目与 HTML 一一对应，可数：`points` 几条、`table` 几行、`steps` 几步、`defs` 几条、`code` 看哪两行。骨架有而 HTML 没有 = 漏做；HTML 有而骨架没有 = 擅自加内容

发现冲突按 `05-build.md` 的分级处理，并同步骨架与资料总结。

## 4. 交付说明

给用户的回复包含：

- 三个文件的可点击链接（HTML / 骨架 / 资料总结），HTML 放最前
- 页数、时长合计、风格名
- **实测通过项**：导航、G 总览、点击半屏、hash、竖屏遮罩、零外部请求、逐页无溢出、字号下限、数字审计
- **未验证项与假设**：例如打印分页未实测、某来源因网络不可达未核实、深链只在桌面验证
- 需要用户拍板的点（如署名、是否保留某页）
- 启用了哪个可选层，以及它带来的例外（批注层的 localStorage / 演讲者层的弹窗权限与不打印提示词）——细节按 `07-annotation.md` §7、`08-presenter-mode.md` §9 补

不要只说"已完成"。用户要靠这段判断能不能直接上台。
