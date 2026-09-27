> 本ファイルはステップ 2 のスタイルライブラリ 17 冊のうちの 1 つ。組み合わせの助言、テンプレートの規律、スタイル決定ブロックは `../02-style.md` にあります。

## P. VC のロードショー（トラクション · 主役の指標 · お願い）
- 見た目：白、見出しと CTA に限定した紺 → 紫のグラデーション、特大の KPI、牽引曲線 1 本。
- 署名の仕掛け：① 幕ごとの NOW/NEXT/LATER マイルストーンレール ② 96–120px の数字と小さなデルタチップを載せた 4 連の KPI カード列
- 既定の相手：A Fluent または C OpenAI
- ライト：bg `#FFFFFF`, panel `#F8FAFC`, ink `#0B1220`(18.72), muted `#46536B`(7.75), accent `#1F4FD8`(6.63), warn `#8A5A00`(5.93), rule `#E3E8F0`, accent-ink `#FFFFFF`(6.63)
- ダーク：bg `#0B1020`, panel `#141B2E`, ink `#EEF2FA`(16.87), muted `#A6B0C4`(8.68), accent `#7FA7FF`(8.00), warn `#E8C05C`(10.93), rule `#222C44`, accent-ink `#0B0B0B`(8.32)
- 書体：`Inter,"Hiragino Sans","Hiragino Kaku Gothic ProN",sans-serif` の 700 見出し；すべての数字は `tabular-nums`
- 適合：kpi-grid / roadmap / chart-line / comparison / team / the-ask
- モーション：数字のカウントアップ（シェルの `data-count`）+ 線の描画 + カードのフェード；**入場時の平行移動なし**
- リスク：これは空虚な論を最もよく隠すテンプレート——すべての KPI は資料ファイルの 1 行に遡れなければならず、出典のない「兆ドル市場」の主張は削除する；グラデーションは見出し／CTA に留め、本文領域は panel の白のまま
