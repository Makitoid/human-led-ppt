> 本ファイルはステップ 2 のスタイルライブラリ 17 冊のうちの 1 つ。組み合わせの助言、テンプレートの規律、スタイル決定ブロックは `../02-style.md` にあります。

## H. 学術／論文（厳格 / 密 / 論文審査と研究室ミーティング）
- 見た目：紙の下地 + セリフ体の見出し + 厳格なグラフの作法；ノイズのない高密度。論文審査、研究室のミーティング、技術レビューに向く。
- ライト：bg `#FBFAF7`, panel `#FFFFFF`, ink `#1A1A1A`, muted `#4D4D4D`, accent `#1F3A5F`（または部署の色）, warn `#8C2F1E`, rule `#D8D4CB`
- ダーク：bg `#16181C`, panel `#1E2126`, ink `#E8E6E1`, muted `#A8A69F`, accent `#7FA8D9`, warn `#E08A6E`, rule `#33373E`
- 書体：見出し `"Source Han Serif JP","Noto Serif JP","Times New Roman",serif`；本文 `"Inter","Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",sans-serif`；図表のキャプションは 12–14px で番号付きの「図 1 / 表 2」ラベル
- 規則：毎ページ上部にキッカー（節番号 + 名称）；グラフには軸ラベル、単位、n、年を入れる；脚注は上付き番号で、最終ページに参考文献リスト；アクセント色は最大 1 色 + グレー
- モーション / 切り替え：データに奉仕する「成長」アニメーションのみ——棒は `width 0→final`、線は `stroke-dashoffset`、表の行は 150 ms でフェードイン；ページ間は 300 ms のクロスフェード、**移動も拡縮もなし**（学術では見せ場は不真面目に見える）。
- 補助スキル：`agrimsingh-bringhurst-typography`（スライドを明示的に扱う）、WCAG 2.1 は `entur-accessibility`；グラフの負荷限界は `cognitive-design`。
