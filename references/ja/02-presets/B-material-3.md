> 本ファイルはステップ 2 のスタイルライブラリ 17 冊のうちの 1 つ。組み合わせの助言、テンプレートの規律、スタイル決定ブロックは `../02-style.md` にあります。

## B. Material Design 3（Google / 親しみやすい / 構造的）
- 見た目：トーン面 + 明示的な役割色、コンポーネント感。プロセス、方法論、教育に向く。
- ライト：primary `#6750A4`, on-primary `#FFFFFF`, surface `#FFFBFE`, surface-variant `#E7E0EC`, on-surface `#1C1B1F`, muted `#49454F`, warn `#B3261E`, rule `#CAC4D0`
- ダーク：primary `#D0BCFF`, on-primary `#381E72`, surface `#141218`, surface-container-highest `#36343B`, on-surface `#E6E1E5`, muted `#CAC4D0`, warn `#F2B8B5`, rule `#49454F`
- 書体：`Roboto,"Noto Sans JP","Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",sans-serif`；見出しの太さ 500、本文 400
- 形状：カードの角丸 12–16px、ボタンは完全な丸型；階層は面のティントでつくり、影の重ねではつくらない
- モーション / 切り替え：emphasized イージング `cubic-bezier(.2,0,0,1)`；ページ内のスタッガーは 40–60 ms；コンテナトランスフォーム（サムネイル → 全面スライド）は幕間の区切りに向く；スライド切り替え = フェード + 24px の垂直移動。
- 補助スキル：`material-3`——権威あるトークンはそこから取り、上記の近似に頼らない。
