> 本ファイルはステップ 2 のスタイルライブラリ 17 冊のうちの 1 つ。組み合わせの助言、テンプレートの規律、スタイル決定ブロックは `../02-style.md` にあります。

## C. OpenAI（抑制 / 中性 / 技術的な権威）
- 見た目：紙のような中性の下地 + ヘアライン + たっぷりの余白、装飾はほぼなし；数字を語らせる。技術サーベイ、真剣な題材に向く。
- ライト：bg `#F7F7F5`, panel `#FFFFFF`, ink `#0D0D0D`, muted `#676767`, rule `#E5E5E3`, accent `#0A6E56`（本文可、5.8:1）；ブランドグリーン `#10A37F` は 2.98:1——**大きな数字と塗りブロックのみ**
- ダーク：bg `#0E0E0E`, panel `#171717`, elevated `#1F1F1F`, ink `#ECECEC`, muted `#A0A0A0`, rule `#2A2A2A`, accent `#1FCB9F`
- 書体：`Söhne,Inter,-apple-system,"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",sans-serif`；見出しに等幅（`"JetBrains Mono",ui-monospace`）を使うと技術的な風味が出る
- 規則：影なし、角丸 ≤ 6px；グラフは 1 色 + アクセント 1 色；階層は書体スケールと余白でつくる
- モーション / 切り替え：クロスフェード 350 ms のみ、移動なし、拡縮なし；許される演出は数字のカウントアップだけ。この抑制*こそが*見た目。
- 補助スキル：`frontend-design`；書体スケールの根拠が要るなら `agrimsingh-bringhurst-typography`。
