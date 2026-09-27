> 本ファイルはステップ 2 のスタイルライブラリ 17 冊のうちの 1 つ。組み合わせの助言、テンプレートの規律、スタイル決定ブロックは `../02-style.md` にあります。

## M. 開発者向けの紫グラデーション（GitHub Blog / changelog の調子）
- 見た目：GitHub のダークな青、紫青の環境光のブルーム、60px のマスクグリッド、中央寄せの構成、3 段グラデーションの見出し。
- 署名の仕掛け：① 3 段グラデーションの見出し `#a855f7→#60a5fa→#34d399`（表紙と幕間のみ）② 紫の左罫線を持つ引用／要点ブロック
- 既定の相手：C OpenAI の数字の規律（1 ページ ≤ 4 個の数字）
- ダーク（主）：bg `#0D1117`, panel `#161B22`, ink `#E6EDF3`(16.02), muted `#A6B3BF`(8.85), accent `#A371F7`(5.64), warn `#E3B341`(9.72), rule `#262D36`, accent-ink `#0B0B0B`(5.87)
- ライト（非技術者向け）：bg `#F7F8FA`, panel `#FFFFFF`, ink `#111820`(16.81), muted `#4C5866`(6.83), accent `#6639BA`(6.91), warn `#7A5300`(6.45), rule `#E2E6EB`, accent-ink `#FFFFFF`(7.34)
- 書体：`"Inter","Hiragino Sans","Hiragino Kaku Gothic ProN",sans-serif` の本文 + 等幅のコード；中央寄せのレイアウトは枠ではなく余白が支える
- 適合：cover / toc / section-divider / config の手順ページ / Q&A
- モーション：クロスフェード 400ms + 環境光のブルームが ≤ 3% 漂う；グラデーション文字は `background-position` を動かしてよく、光の掃引はしない
- リスク：`--accent` が紫なので、その上の文字は accent-ink を使う（近黒 5.87 対 白 3.35）；明色版では環境光のブルームを完全に削除する
