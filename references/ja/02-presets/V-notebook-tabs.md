> 本ファイルはステップ 2 のスタイルライブラリ 22 冊のうちの 1 つ。組み合わせの助言、テンプレートの規律、スタイル決定ブロックは `../02-style.md` にあります。

## V. ノートブックタブ（編集風 / 整然 / チーム共有）
- 見た目：クリーム色の紙カード + 左のバインダー穴 + 右のカラー索引タブ。開いたリングバインダーのよう。清潔で軽く、圧迫感がない。社内共有、振り返り、研修資料、チェックリストの多い原稿に向く。`zarazhangrui/frontend-slides` の Notebook Tabs（MIT、© Zara Zhang）から抽出。
- ライト（既定）：bg `#FBF9F4`、panel `#FFFFFF`、ink `#1F1D1A`、muted `#6E6A61`、rule `#E7E1D5`、accent `#B23A48`（本文可、5.2:1）；タブ色（≤ 4）`#B23A48` / `#1D6FB8` / `#2E7D5B` / `#B0720A`、いずれも本文級に濃くする
- ダーク：bg `#1B1917`、panel `#232120`、ink `#F1EDE4`、muted `#A9A397`、rule `#332F2B`、accent `#E0757F`、タブ色は上記を明るくしたもの（例 `#E0757F` / `#6FB3E6` / `#6FCFA0` / `#E0A64B`）
- フォント：見出し `"Bodoni Moda","Noto Serif SC",Georgia,serif`（エディトリアルなセリフ）；本文 `"DM Sans","PingFang SC","Microsoft YaHei",sans-serif`
- 形状：カードは角丸 8px + ごく淡い影；左側に小さな穴の列（`radial-gradient` かインライン SVG）；右端のタブはカードから突き出たカラーのしおりで、そのページが属する節を示す
- モーション：クロスフェード + 6px 浮上を 300ms；タブは順に「引き出される」（`translateX` を少し動かし + フェード、90ms 間隔）；reduced-motion で全停止
- 補助 skill：`frontend-design`；納品前に `vercel-labs-web-design-guidelines` で UI レビュー
- リスク：タブ色は最大 4 色、1 ページに 1–2 個まで。増えると付箋の壁になる；日本語のセリフ体は小さいと滲むので、タブはサンセリフのまま。
