# ステップ 6 · 自検と交付

順序：静的チェック → ブラウザ実機テスト → 数字監査 → 交付。どれかが失敗したら戻って直してください；未検証のものを完成品として提示してはならない。

## 1. 静的チェック

```bash
# 外部依存ゼロ
grep -nEo '<(script|link|img|iframe)[^>]*(src|href)="(https?:)?//[^"]*"' <トピック>.html
grep -n 'localStorage\|sessionStorage\|fetch(\|XMLHttpRequest' <トピック>.html

# スライド数が骨子と一致すること
grep -c 'class="slide"' <トピック>.html        # 骨子 §1 slides と比較
grep -o 'data-i="[0-9]*"' <トピック>.html      # 連続していて §3 のレンダリング順と一致すること

# 全スライドに出典バーがあること（表紙 / 幕間ページは例外可——骨子にその旨を書く）
grep -c 'class="foot"' <トピック>.html

# §4 のレビュー用凡例は人間専用で、デッキへ漏れてはならない（期待値 0）
grep -c '⧉\|語句凡例 開始' <トピック>.html
```

さらに確認します：`<meta name="viewport">` が存在する；`#viewport/#stage/#overview/#aria/#rotate-mask` がすべてそろっている；`.notes` の中身が可視の形で描画されていない。

## 2. ブラウザ実機テスト

内蔵ブラウザはスクリーンショットを撮れないことが多いので、`evaluate_script` で構造をアサートします。ファイルを編集したら毎回新しい `?v=N` でリロードしてください——そうしないとテストしているのはキャッシュです。

```js
async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const key = k => document.dispatchEvent(new KeyboardEvent('keydown', {key:k, bubbles:true, cancelable:true}));
  const out = {total: window.__deck.total, hash: location.hash};
  // ナビゲーション
  key(' '); await sleep(450); out.afterSpace = window.__deck.index;
  key('ArrowLeft'); await sleep(450); out.afterLeft = window.__deck.index;
  key('End'); await sleep(450); out.afterEnd = window.__deck.index;
  key('Home'); await sleep(450);
  key('3'); await sleep(450); out.afterDigit3 = {idx: window.__deck.index, hash: location.hash};
  // 左右の半分をクリック
  const r = document.getElementById('stage').getBoundingClientRect();
  document.body.dispatchEvent(new MouseEvent('click',{clientX:r.left+r.width*0.9, clientY:r.top+r.height*0.85, bubbles:true, cancelable:true}));
  await sleep(450); out.afterClickRight = window.__deck.index;
  // G 総覧
  key('g'); await sleep(200);
  const ov = document.getElementById('overview');
  out.overview = {open: ov.classList.contains('open'), thumbs: ov.querySelectorAll('.thumb').length,
                  scale: ov.querySelector('.thumb-slide')?.style.transform,
                  caps: [...ov.querySelectorAll('.capno')].map(e=>e.textContent)};
  ov.querySelectorAll('.thumb')[0].click(); await sleep(450);
  out.thumbJump = {idx: window.__deck.index, closed: !ov.classList.contains('open')};
  // スライドごとのオーバーフロー + 最小フォントサイズ
  const bad = [];
  for (let i=0;i<window.__deck.total;i++){
    window.__deck.go(i); await sleep(120);
    const s = document.querySelectorAll('#stage > .slide')[i];
    if (s.scrollHeight > s.clientHeight + 2 || s.scrollWidth > s.clientWidth + 2)
      bad.push({i:i+1, overflow:[s.scrollHeight,s.clientHeight,s.scrollWidth,s.clientWidth].join('/')});
    // フォントの下限は本文のテキストにだけ適用する；出典バー、kicker、チップ、バッジは設計上もともと小さい
    s.querySelectorAll('p,li,td,span').forEach(el=>{
      if (el.closest('.notes, .foot, .kicker, .srcline, .badge, .capno')) return;
      if (el.textContent.trim() && parseFloat(getComputedStyle(el).fontSize) < 21.5)
        bad.push({i:i+1, small:Math.round(parseFloat(getComputedStyle(el).fontSize))+'px', text:el.textContent.trim().slice(0,24)});
    });
  }
  out.problems = bad;
  out.stageTransform = document.getElementById('stage').style.transform;
  // 縦向きマスクのレイアウト
  const m = document.getElementById('rotate-mask'); m.classList.add('show');
  out.mask = getComputedStyle(m).display; m.classList.remove('show');
  return JSON.stringify(out);
}
```

深いリンクと印刷：`<トピック>.html#s7` を開くと 7 枚目に着地しなければならない；`Ctrl+P` は 1 ページ 1 スライドになるはずです（内蔵ブラウザが印刷を描画できない場合は、`@media print` の規則が存在することを確認し、印刷は未検証だと明記してください）。

ショートカットパネル：実際に `Q` キーを押すと `#deckhelp` が開き、少なくともシェル自身の「ページ送りと表示」セクションが入っていること；任意レイヤーをインストール済みなら、`window.__deckHelp` に ink レイヤーと presenter レイヤーが登録したセクションも入っていなければならない。`Esc` で閉じ、開いている間はすべての ink サーフェスが退く（`#deckhelp.open ~ …` の兄弟セレクタ）。パネルをクリックしてもページ送りせず、`?preview=N` の中での `Q` は何も起こさない。

コントラスト（グラス / 低コントラストの配色では必須）：

```js
const lum = c => { const [r,g,b]=c.match(/\d+/g).map(Number).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}); return .2126*r+.7152*g+.0722*b; };
const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p); return ((x+.05)/(y+.05)).toFixed(2); };
// 各本文要素について、getComputedStyle(el).color を直近の不透明な祖先の background-color と比較する
```

モバイル：ウィンドウを 390×844 の縦向きに縮めてください——マスクが現れるはずです；844×390 に回転させると消え、キャンバスが収まるはずです。

任意のレビューパス（マーケットプレイスの skill、ユーザーが先にインストールする）：UI/UX/a11y 監査には `vercel-labs-web-design-guidelines`、WCAG 2.1 チェックには `entur-accessibility`。

## 3. 数字監査（絶対に省略しない）

画面上の**すべての数字と主張**を、資料ファイルの特定の行までたどってください：

- 値、単位、年、出典の 4 点がそろい、資料ファイルと同一である
- 導出値は画面上に「…から導出」と書く；⚠️ は相違の注記を伴う；🔍 は「…からの孫引き」と読める；⛔ の項目は 1 回も現れない
- 訂正済みの誤読が、誤った形で繰り返されていない
- 出典の無い数字、形容詞で置き換えたエビデンス、発見として述べられた推定 → 削除または修正
- そのスライドの §4 の各エントリが HTML と対応し、数えられること：`points` が何項目、`table` が何行、`steps` が何段、`defs` が何個、`code` はどの行か。骨子にあって HTML に無い = 漏れ；HTML にあって骨子に無い = 勝手な追加

衝突は `05-build.md` の重大度の規則に従って処理し、骨子と資料ファイルを同期させてください。

## 4. 納品メモ

ユーザーへの返信に含めるもの：

- 3 つのファイルへのクリック可能なリンク（HTML を先頭に）、加えて骨子と資料ファイル
- スライド数、所要時間の合計、スタイル名
- **実際にテストした項目**：ナビゲーション、G 総覧、左右半分のクリックによるページ送り、ハッシュ、縦向きマスク、外部リクエストゼロ、スライドごとのオーバーフロー、フォントの下限、数字監査
- **テストしなかった項目と仮定**：例——印刷のページ割りは未実施、一部の出典はネットワーク到達不可のため未確認、深いリンクはデスクトップでのみ検証
- ユーザーの判断を仰ぐ未決の点（クレジット表記、あるスライドを残すか）
- どの任意レイヤーを有効にしたか、それが持ち込む例外（ink レイヤーの localStorage；presenter レイヤーのポップアップ権限と印刷されないプロンプト）——`07-annotation.md` §7 と `08-presenter-mode.md` §9 に従って記入してください

「完了しました」と言うだけで済ませないでください。ユーザーはこのメモで、そのまま舞台に立てるかどうかを判断します。
