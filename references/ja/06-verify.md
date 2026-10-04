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

ビルド済みのデッキを `data-src` で grep して件数を数えてはならない：インライン化されたシェルは自分の JS コメントに例示の `data-src="clip.mp4"` を運んでいるので、そのコメント 2 行は必ずヒットする。メディアの figure は `#stage` の中で数えるか、`class="mp"` を grep すること。

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

### 2.1 メディア（`image` / `audio` / `video` があるときは必ず実行）

```js
// 1) 構造：シェルが引き受けた後はこうなり、作者自身の controls は入っていない
const fig = document.querySelector('#stage .slide.active [data-mp]');
out.mp = {kind: fig.dataset.kind,
          hasBar: !!fig.querySelector('.mp-bar'),
          elClass: fig.querySelector('video,audio').className,   // mp-el を含むこと
          controls: fig.querySelector('video,audio').controls,   // false でなければならない
          dataSrcLeft: fig.querySelector('video,audio').hasAttribute('data-src')};  // false でなければならない：取り除かれている
// 2) 箱がカードの中に閉じ込められていること：音声だけのページは**静止時に小さなスピーカーのチップ 1 枚だけ**が
//    残る（.mp の高さは 48px 未満、幅はボタン約 1 個分）のであって、一面の白いパネルではない；ホバー / Tab
//    フォーカス / タッチで 1 タップ（fig に data-open="1" が付く）となって初めて全体のバーに展開される
out.audioBox = fig.getBoundingClientRect().height;
// 3) そのページを歩く：K で再生 → 再生ボタンの aria-label が「再生」から「一時停止」に反転 → もう一度押して「再生」に戻る
// 4) ページを離れると停止する：そのページを出た後、video.paused === true かつ currentTime === 0
// 5) ← → は必ずページ送り：コントロールバーのボタンにフォーカスがある状態で ArrowRight を押し、ページ番号は変わらなければならない
// 6) 容錯分岐：ある 1 ページの data-src を一時的に存在しないファイル名へ差し替え、次をアサートする
//    fig.dataset.state === 'error' かつ fig.querySelector('.mp-note') に文言が入っている（人に通じる言葉で、エラーコードではない）
// 7) オーバーフローの自己チェック（必須）：バーは映像の下にありカードの一部——カードは .slide のトリミングボックスを破ってはいけない
const s = fig.closest('.slide'), bar = fig.querySelector('.mp-bar');
const limit = s.clientHeight - parseFloat(getComputedStyle(s).paddingBottom);
const br = bar.getBoundingClientRect();
const hit = document.elementFromPoint(br.left + br.width / 2, br.top + br.height / 2);
out.overflow = {cardBottom: fig.offsetTop + fig.offsetHeight, limit,
                fits: fig.offsetTop + fig.offsetHeight <= limit,
                barReachable: !!(hit && hit.closest && hit.closest('.mp-bar'))};
//   両方とも true でなければならない：fits=false はカードがそのページに残ったスペースより高いことを意味する（バーがキャンバス外に切り取られる）。
//   barReachable=false はバーが DOM に横たわっているのにクリックできないことを意味する——それはプレーヤーが無いのと同じである。シェルは代わりに
//   クリップしてくれず、これはビルドエラーなので、05-build の「カードの高さにバーを含める」に従って寸法を作り直す。
//   進捗バー .mp-track はバーの中にあり常に表示されているので、その中点に同じ elementFromPoint を行けばそれも命中しなければならない。
//   オーディオページは**展開してから測る**こと：静止時は .mp-fold が display:none なので、バーが命中してはそもそもならない——
//   そのステップだけ fig.setAttribute('data-open','1') を行って測り、測り終えたら外す；静止状態では代わりにスピーカー .mp-mute
//   自身がクリックできることをアサートする。
// 8) 音量と全画面：音量は常設のスライダーではない。.mp-mute にホバーする（タッチパネルならタップする）と .mp-volpop が上に現れ、
//    そのスライダー .mp-volr をドラッグすると el.volume が連続的に変わる（0–1、段階なし）。0 までドラッグするとミュート、マウスでスピーカーをクリックすればミュートの切替；
//    デッキがすでに全画面（F を押済み）のときに動画カードの .mp-fs を押すと、メディア全画面へ入れ子になるべきで、Esc はデッキの全画面に戻る——
//    ウィンドウへ直接落ちるのではない。
// 9) 全画面の帰属：通常のウィンドウでは動画カードに .mp-fs が在り、押して占めるのは**このウィンドウ**である。
//    `?preview=N` の iframe（発表者ウィンドウの現在のページのタイル）の中でも同じボタンは在り、押せるが、映像が
//    発表者ウィンドウを埋めてはいけない——その要求は media-fs → presenter-media-fs のブリッジで聴衆ウィンドウへ
//    渡り、画面を占めるのは聴衆ウィンドウであり、カードの中は全画面前のあのページのまま、タイルの右上に
//    「動画が全画面」バッジが点く（08-presenter-mode.md §3 を参照）。聴衆ウィンドウ自身が Esc を押すかあのページから
//    ページを送ればバッジも消えなければならない——状態はカードではなく聴衆ウィンドウが真値である。
```

7 番はこの版で新増した必須チェックであり、**すべての**メディアページで 1 回ずつ実行しなければならない（`for` で `#stage [data-mp]` を回せばよい）。狭いウィンドウでは `#rotate-mask` が画面全体を覆い、`elementFromPoint` は必ずそれを返す——それはバグではなくテスト環境のせいである：まずウィンドウを広げるか（一時的に `mask.classList.remove('show')`）、そのあとで `barReachable` を判定する。

ソースファイルはテスト前に**本当に HTML の隣に置く**こと——`file://` ではパスが違うということは 6 番目の容錯分岐にほかならないので、2 つのことを 1 回の実行で確認できる。
インライン化した画像は独立した確認が 1 つ要る：`img.complete === true && img.naturalWidth > 0`、および `img.src` が `data:image/` で始まること。

実測で踏んだ 3 つのプローブの罠——スクリプトを書く前に読まないといけない：

- メディアのセレクタは `#stage` にスコープすること。`[data-mp]` は今**生きているプレイヤーだけ**に
  マッチする；総覧のサムネイルには静的な `.mp-ph` チップが入っている（再生グリフ付きの黒い箱で、
  バーもメディア要素も無い）。プレイヤーの数が期待の 2 倍になるなら、見ているのは古いビルドである。
- 転送バー作用域のキー（`, . [ ] M Space Enter`）は**バーの中のコントロール之上**に dispatch しなければ
  ならない。例：`fig.querySelector('.mp-btn-play').dispatchEvent(new KeyboardEvent('keydown',{key:']',bubbles:true,cancelable:true}))`。
  `document` に合成した keydown は `target === document` なので、`target.closest('[data-mp]')` は null と
  なり、シェルは正しくそれを無視する——実キー入力では普通に効くショートカットを「死んでいる」と
  「測定」してしまうことになる。グローバルなメディアキーは `K` だけ。さらに：ブラウザパネルが OS の
  フォーカスを失うと、実キー入力は黙って破棄される——フォーカスを取り直すか、要素の上に dispatch する。
- `file://` では内蔵ブラウザがクエリ文字列を剥がするので、`?preview=N`（とこのドキュメントの他の
  場所で使っている `?v=N` のキャッシュバスター）はページに届かない。プレビューモードは
  `http://localhost` 経由で測るか、発表者ウィンドウを 1 度開くこと。**ディレクトリ名**に CJK が
  含まれると内蔵ブラウザで読み込みに失敗することがある（テスト用デッキは ASCII のディレクトリに置く）；
  ただし `data-src` の**ファイル名**の中の日本語とスペースは問題なく、動作を実測済みで、手動の
  URL エンコードは要らない。

### 2.2 注記 / 黒板（ステップ 7 を導入しているとき）

- `A` で注記を開いた後も、矢印キー / スペース / 数字キーは通常どおりページ送りする；
- `B` で黒板に入る：`body` に `board` が付き、ページ全体があの暗い黒板に変わり、ステータスピルが現れ、
  パレットはチョークの一式に切り替わる（各ペンは `#1D2A26` に対して ≥4.5:1、色ごとの値は
  `07-annotation.md` §6.1 に文書化されている）；黒板ではマーカーの色帯が `.55` の透明度で描かれ、
  それで暗い面で 3:1 をクリアする；
  **黒板の筆跡はページをめくっても残る**（1 つの共有された本体であり、ページごとに 1 つではない）、**スライドに戻るときに黒板の筆跡がスライドへ漏れ出さず、スライド自身の筆跡はそのまま**；
- `X` は今この面だけを消す（黒板の上で押しても、あるスライドの注記まで消えることはない）；
- 注記を付けた状態で `S` を押すと PNG を書き出すだけで、発表者ウィンドウまで**一緒に出ることはない**（2 つの層の `S` は互いに排他でなければならない。`07-annotation.md` §8 を参照）；
- 発表者ウィンドウ（併せて導入している場合）：カードは**ちょうど 4 枚**（`c-cur` `c-nxt` `c-pmt` `c-ovw`）で、そのどれも黒板ではなく、`board=1` を運ぶ iframe も無い；カードをリサイズするかドラッグして**マウスを離した（mouseup）あと**、通り過ぎた隣りのカードの上に載ったままでなければならない（`parseInt(card.style.zIndex,10)` が増え、`z-index:auto` に戻らない）；そしてリロード後もその前後関係が残る——`z` は x/y/w/h と共にレイアウト記録 `pv.v2|` に保存される。

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
- **メディアがあるとき**：音声 / 動画のファイル名一覧 + 「フォルダごと一緒にコピーすること」という注意；画像はインライン化されているので影響を受けない
- **テストしなかった項目と仮定**：例——印刷のページ割りは未実施、一部の出典はネットワーク到達不可のため未確認、深いリンクはデスクトップでのみ検証
- ユーザーの判断を仰ぐ未決の点（クレジット表記、あるスライドを残すか）
- どの任意レイヤーを有効にしたか、それが持ち込む例外（ink レイヤーの localStorage；presenter レイヤーのポップアップ権限と印刷されないプロンプト）——`07-annotation.md` §7 と `08-presenter-mode.md` §9 に従って記入してください

「完了しました」と言うだけで済ませないでください。ユーザーはこのメモで、そのまま舞台に立てるかどうかを判断します。
