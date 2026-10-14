> 本ファイルはステップ 2 のスタイルライブラリ 22 冊のうちの 1 つ。組み合わせの助言、テンプレートの規律、スタイル決定ブロックは `../02-style.md` にあります。

## S. ボールドシグナル（自信 / 高インパクト / 基調講演）
- 見た目：チャコールの地に明るいオレンジの焦点カード + 特大のセクション番号（01/02/03）。聴衆が背筋を伸ばす。基調講演、結論を突きつける報告、経営層への説明に向く。`zarazhangrui/frontend-slides` の Bold Signal（MIT、© Zara Zhang）から抽出。
- ライト（明るい会場でやむを得ない場合のみ）：bg `#F4F1EC`、panel `#FFFFFF`、ink `#141414`、muted `#63615C`、rule `#E1DDD5`、accent `#C2410C`（本文可、5.4:1——明るいオレンジ `#FF5722` は 2.7:1 しかないので **32px 以上の大字と色面のみ**）
- ダーク：bg `#1A1A1A`、panel `#242424`、elevated `#2E2E2E`、ink `#F5F3EF`、muted `#A6A29B`、rule `#33322F`、accent（オレンジカード）`#FF5722`、その上の文字は必ず `--accent-ink`（`#1A1A1A` に対して約 5.3:1 で成立）
- フォント：見出し `"Archivo Black","Noto Sans SC",sans-serif` 900；本文・小見出し `"Space Grotesk","PingFang SC","Microsoft YaHei",sans-serif`
- 形状：角丸 10–14px；オレンジカードが焦点（1 ページに 1 枚まで）；セクション番号を角に特大（120px+）で置く；グラデーションもガラスもなし
- モーション：ハードカット + 120ms の白フラッシュ；焦点カードは `scale .92→1` でポップイン（`cubic-bezier(.34,1.56,.64,1)`）；番号は `data-count` でカウントアップ；1 ページのアニメ要素 ≤ 5
- 補助 skill：`frontend-design`；モーションの曲線は `web-animation-design`
- リスク：オレンジは**唯一**の彩度色——2 色目を足すとバザールになる；暗い地では `muted` を一段明るくしないと注記が読めない。
