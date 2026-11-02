# ステップ 5（PPTX 軌道）· ネイティブ PPTX を構築する

> 本稿の `target` に `native-pptx` を含むときだけ本ファイルを読む。HTML 軌道は `05-build.md` を読む；2 つの軌道はステップ 1–4 と、同じ骨子・同じ資料まとめを共有する。

目標：承認済みの骨子を、**PowerPoint / WPS / Keynote でそのまま編集できる** `.pptx` にコンパイルする。ネイティブの図形、文字、表、グラフ、画像、メディア、ノート；ページ送りのモーションは `motion.transition` から、ページ内モーションはページごとの `animation` から来る（細則は §4「動効」）。**OOXML を手書きするな**、officecli コマンドを 1 つずつ手打ちするな——幾何、文字サイズ、余白はすべて `assets/pptx/build.cjs` のレイアウトライブラリが担い、モーションも同様に spec からのみ生成する。

## 1. 開始前の前提

1. 骨子がユーザーの承認を得ている（ステップ 4 のレビューゲート）。§1 に `target` が `native-pptx` を含むと書かれている。
2. `04-skeleton.md` の §1 / §4 / §7 と、本ファイルを読了している。
3. 資料まとめを手元に開いている；`PPTX-src.json` のすべての数字がそこへ遡れなければならない。
4. エンジン検出を一度走らせ（§2 を参照）、この経路で officecli を使ってよいことを確認している。

## 2. エンジンのルーティング（先にやる、飛ばさない）

```bash
node <skill dir>/assets/pptx/detect-engine.cjs --json
```

スクリプトは「本 skill のインストールパス → 環境変数」でホストを識別し、そのホストにインストール済みの PPT プラグインを走査してから `officecli` を調べる：

| ホスト | ルーティング |
|---|---|
| Claude Code / Codex / ZCode | **PPTX 能力**を持つ既定のプラグイン → `host-plugin`；無ければ **`officecli` にフォールバック**し、フォールバックが起きたことを会話で明示する |
| DeepSeek Harness（dsh） | PPTX プラグインがあれば → `host-plugin`；無ければ → `officecli` |
| その他（Qoder、Cursor、VS Code、リポジトリの開発コピーなど） | `officecli`（強制） |

- `host-plugin`：そのプラグインの手順で PPTX を生成する。**本 skill の `lint.cjs` はその成果物では走らない**；保証するのは「骨子が承認済みで、内容を捏造していない」ところまでで、版面とコントラストはプラグイン自身の能力に従う。納品メモでは検収の約束を下げて書く。
- `officecli` が無いときは、**先にユーザーの同意を得てから**バイナリをインストールする：
  - Windows：`irm https://d.ai.officecli.ai/install.ps1 | iex`
  - macOS / Linux：`curl -fsSL https://d.ai.officecli.ai/install.sh | bash`
  - または `npm i -g @officecli/officecli` / `scoop install officecli` / `brew install officecli`
- **`officecli install` を実行するな**：officecli 自身の skills / MCP を、検出されたすべての agent に一緒に入れてしまう。バイナリだけを入れる。
- `officecli --version >= 1.0.159` を要求する；インストール後にシェルを開き直すか、フルパスで検証する。それでも失敗するなら止まる——OOXML を手書きしない。
- **動効は 1.0.160 以降**：fade 以外の切り替えとページ内アニメーションは 1.0.160 でのみ実測済み。それより低いバージョンでは `build.cjs` が構築を拒否する（バイナリを更新するか、`motion: "fade-400"` に戻して各ページの `animation` を外す）。

## 3. 成果物

| ファイル | 誰が書くか | 説明 |
|---|---|---|
| `<トピック>-PPTX-src.json` | agent | 骨子 §4 に沿って書く構築仕様；審査でき、diff も取れる |
| `<トピック>.pptx` | `build.cjs` | 完成品；ネイティブオブジェクト |
| `<トピック>.pptx.batch.json` | `build.cjs` | 実際に実行された officecli コマンド。問題が起きたらまずこれを見る |
| `<トピック>-PPTX-qa.md` | `lint.cjs --report` | 検収レポート（ステップ 6） |

`<トピック>-PPTX-src.json` は**構築の作業ファイル**であり、第二の真実ではない；ページ数、ページ型、数字は骨子と資料まとめを正とする。

## 4. `PPTX-src.json` の構造

```json
{
  "meta": {
    "title": "…", "author": "…", "lang": "ja-JP", "locale": "ja-JP",
    "skeleton": "<トピック>-PPTX骨子.md", "slides": 12,
    "numberWhitelist": ["2026"]
  },
  "theme": {
    "bg": "#FFFFFF", "panel": "#F2F4F7", "ink": "#1F2328", "muted": "#5A6472",
    "accent": "#0063B1", "accentInk": "#FFFFFF", "warn": "#B42318", "rule": "#D0D7DE",
    "font": { "latin": "Arial", "ea": "Yu Gothic UI" },
    "scale": { "claim": 48, "title": 34, "body": 24, "meta": 14 },
    "radius": 16
  },
  "motion": { "transition": "fade-400", "discipline": "calm" },
  "slides": [{
    "id": "s3", "type": "kpi-hero", "topic": "…", "title": "…", "key": "…",
    "blocks": [{ "kind": "kpi", "items": [{ "value": "-32", "unit": "%", "label": "…" }] }],
    "emphasis": { "role": "kpi", "index": 0, "tone": "accent" },
    "transition": "push-right-600",
    "transition_why": "第 2 幕の項目別コスト分解から、第 3 幕の二者択一の結論へ押し出す——方向は論証に従う",
    "animation": { "on": "cards", "effect": "fade", "class": "entrance", "duration": 400 },
    "source": "機関 · 年",
    "notes": "…"
  }]
}
```

- `theme` はステップ 2 のスタイル決定ブロックからそのまま写す；`scale` は 1280×720 の px 値で、構築時に 1px = 0.75pt で pt に変換する（48/34/24/14 → 36/25.5/18/10.5pt）。4 段の比率は変えない。
- `emphasis`：`role` は `key | kpi | title`、`tone` は `accent | warn`；そのページの主役にしか落とせない。
- `source` は `kpi` / `table` / `chart` / `compare` / `quote` を含むページで必須；右下のフッターに落ちる。
- `notes` は骨子 §7 に由来するプレーンテキスト；`<strong>` / `<em>` はビルダーが剥がす。強調の書式は HTML の発表者ウィンドウにだけ残る。

### 動効（`motion` とページ別 `animation`）

動効は**演示の規律であって、版面ではない**：幾何は一切変えず、`p:transition` と `p:timing` を書くだけ。エンジンが渡せるものは初版で開放したより多い；ホワイトリストは officecli 自身のエラーメッセージを正とし、`assets/pptx/lib.cjs` にハードコードされている。だが「エンジンが 58 種を許す」ことと「この稿が何種を使うべきか」は別問題で、後者は ppt-master の動効規範に沿って締める（既定は `fade-400`、ページ内アニメーションは既定でオフ）。それを `lib.cjs` の `motionPolicyErrors` が止める。

**先に規律を選び、それから効果を選ぶ。** `motion.discipline` は 2 段階だけ：

| 段階 | 切り替えで使えるもの | ページ内アニメーション | 予算 |
|---|---|---|---|
| `calm`（既定） | base + directional + identity | `entrance` / `emphasis` だけ | アニメーションのあるページ ≤ `max(1, ⌈ページ数/3⌉)`、隣り合う 2 ページを両方動かさない |
| `story` | さらに expressive | 4 分類すべて | アニメーションのあるページ ≤ `⌈ページ数/2⌉`；expressive の切り替え ≤ `max(2, ⌈ページ数×20%⌉)`、隣接不可 |

切り替えは**隣り合う 2 ページの関係**で選ぶ——変化のために変えない：

| 隣り合う 2 ページの関係 | 使うもの | 階層 |
|---|---|---|
| 同じ節の中の連続した叙述 | `fade-400`（既定） | base |
| 連続性を保つ必要のない直接的な切り替え | `none` / `cut-400` | base |
| 手順・年表・階層に明確な推進方向がある | `push-*` / `wipe-*` / `cover-*` / `pull-*` / `split-*` / `reveal-*` | directional |
| 同じ対象がページをまたいで位置・サイズ・クロップを変える | `morph` | identity |
| 幕の開き・重要な提示・明確な状態の境界 | 残りの「華やかな」ライブラリ（`zoom` / `flip` / `cube` / `vortex` …） | expressive |

- **base 以外の効果には理由が要る**：デッキ全体の既定は `motion.why`、1 ページの上書きは `slides[].transition_why` に、「この 2 ページの間で何が変わったか」を一言で書く。理由が書けないなら効果を変えない——`fade` / `cut` / `none` に理由は要らない。
- **`random` は不確実性そのものが内容のときだけ**（ランダム抽出、ランダムな故障など）使い、理由にもそう書く；「単調が怖い」は理由にならない。
- **expressive は句読点であって、飾りではない**：1 つの節に最大 1 回、しかも隣り合う 2 ページには使わない。残りのページは `fade` に戻す。

**ページ切り替え `motion.transition`**（デッキ全体の既定）と `slides[].transition`（1 ページの上書き）は同じトークン文字列を使う：

```
タイプ[-方向またはサブタイプ][-速度 fast|med|slow | ミリ秒]
fade-400 · push-right-600 · split-vertical-in · wipe-slow · morph · none
```

- タイプは 58 個のホワイトリスト値（`fade cut dissolve circle diamond newsflash plus random wedge wipe push cover pull wheel zoom split blinds checker comb bars strips flash honeycomb vortex switch flip ripple glitter prism cube rotate orbit clock doors window shred ferris flythrough warp gallery conveyor pan reveal morph box fallOver drape curtains wind prestige fracture crush peelOff pageCurlDouble pageCurlSingle airplane origami none`）からしか選べない；綴りを誤ると `lib.cjs` が直接に誤りと判定する。officecli は無効なトークンを受け取ると**batch 全体をロールバック**するからである。
- 時間と速度はどちらか一方：`fade-400` は p14 拡張の `transitionDuration` を通り、`fade-slow` は legacy の `transitionSpeed` を通る。両方を同時に与えれば誤りとする。
- 方向とサブタイプは**タイプ依存**（`push-right` は合法、`circle-in` は無効）；構築後は読み戻し結果とのズレを報告する——推測しない。
- `morph` はエンジンが書けて読み戻せるが、マッチは**前ページ同名の図形**に依存し、ビルダーが図形に渡すのは安定 id で意味上の名前ではないため、効果は大半が通常のページ送りに退化する——使う前に納品メモの約束を 1 段下げておこう。
- 古い書き方 `{ "transition": "fade", "duration": 400 }` は廃止された。`lib.cjs` は誤りを報告し、`"fade-400"` への変更を促す。

**ページ内 `animation`**（宣言したページだけに付く）：

```json
"animation": { "on": "content", "effect": "fade", "class": "entrance", "direction": "up", "duration": 400, "delay": 0, "trigger": "onClick" }
```

| 鍵 | 取り得る値 | 説明 |
|---|---|---|
| `on` | `primary` / `title` / `content` / `cards` / `all` | **すでに組版済みの要素**からどれにアニメーションを付けるか：主役、タイトル（主役を含む）、本文レイヤー、カードレイヤー、すべて。全面背景とスクリム（`ground`）、角標フッター（`role:detail`）は決して動かない |
| `class` | `entrance` / `exit` / `emphasis` / `motion` | 4 分類で、効果のホワイトリストは分類別に分かれる：emphasis は `spin grow bold wave fade`（+ 色系）だけ、entrance/exit は `appear fade fly zoom wipe bounce float split wheel swivel checkerboard blinds dissolve flash box circle diamond plus strips wedge random` を使い、`contract floatOut sinkDown …` の 16 個のテンプレート効果は `class=exit` に限る |
| `trigger` | `onClick`（既定）/ `withPrevious` / `afterPrevious` | クリック 1 回で 1 項目出る——それが講義のテンポである。`onClick` のとき要素は読み順（上を先、それから左）に並ぶ |
| `duration` / `delay` | 整数 ms | テンプレートの exit 効果は PowerPoint 内蔵の長さを保つ；`duration` を与えたら直接に誤りとする |
| `direction` | `in out left right up down` | 方向を持つ効果だけがこれを受け取る；読み戻しは `left/right/up/down` に正規化される |
| `path` / `d` | `line arc circle diamond triangle square custom` | `class=motion` は `effect` の代わりにこれを使う；`path=custom` は `d`（0..1 の相対座標、SVG 風）が必須 |
| `repeat` | 正整数 / `indefinite` | emphasis / motion にだけ意味がある；`calm` では禁止、`story` では `why` を書く |
| `why` | 一言 | `class` が `entrance` 以外のとき必須：そのアニメーションが担う伝達の役割（注意を取り戻す / 場所を空ける / 動きが何を表すか）を書く |

- **ページ内アニメーションはページごとの opt-in**：`calm` では `entrance`（読み順に現す）と `emphasis`（すでに見えている対象に注意を戻す）だけを許す；`exit` / `motion` は `story` に属し、`why` が必須。既定ではページ全体が一度に現れる。
- **予算**：`calm` でアニメーションのあるページは 3 分の 1 を超えない、しかも隣り合う 2 ページを両方動かさない；`story` では半分を超えない。1 ページは依然 ≤ 6 要素、クリック 1 回で 1 項目出る——一言の説明が終わってもまだ動いている効果は書き直させる。
- **1 本の長さ ≤ 800ms**：800ms を超えたら直接に誤り——アニメーションが語りより遅いのは、強調ではなく足枷である。
- **背景、スクリム、フッター、角標は決して動かない**（`ground` と `role:detail` はアニメーションの池に入らない）；表紙 / 出典 / 謝辞のページはふつう静止のまま、`lint` が注意する。
- **`exit` は「ページ内の内容を取り去る / 差し替える」ときだけ**：普通のページ送りはすでにページ全体を移す；**動きそのものが意味を運ぶとき**（因果、空間関係）だけ `motion` のパスを使い、それ以外は `entrance` / `emphasis`。
- **画像と表にはアニメーションを付けられない**：officecli のアニメーションの親ノードは `shape` と `chart` だけ。画像ページを動かしたいなら、その上の文字／カードを動かす；`on` がアニメーション可能な要素を 1 つも選べないなら構築は失敗する——黙ってスキップはしない。
- 1 ページ ≤ 6 のアニメーション要素（= クリック ≤ 6 回）。超過は誤りとし、内容を削るか `trigger` を変えさせる。
- HTML 主軌と違い、ここでは `prefers-reduced-motion` のセーフティネットも CSS のイージング曲線の選択も**無い**；PowerPoint のアニメーションはプリセットと fast/med/slow だけ。本物の入場カーブが要るなら HTML 軌道へ。

### block kind（第 1 版はこれだけを認める）

`points` · `prose` · `kpi` · `table` · `chart` · `compare` · `steps` · `timeline` · `diagram` · `image` · `media` · `pull` · `quote` · `code`

骨子の 58 語の語彙から block への対応表はこれ 1 つだけ（骨子 §4 に写さない）：

| 骨子の語 | block |
|---|---|
| `points` / `action` / `takeaway` / `caveat` / `missing` / `defs` / `toc` | `points`（`defs` は 2 列の短文で書く；`takeaway` は 1 項目） |
| `prose` / `lead` | `prose` |
| `kpi` | `kpi`（1–4 項目；主項目は `emphasis` で指定） |
| `table` / `cast` | `table`（≤6 行 × ≤5 列） |
| `bars` / `line` / `stack` / `pie` / `rank` / `visual`（データ図） | `chart`（ネイティブグラフ；§8 を参照） |
| `compare` / `before-after` / `counter` | `compare`（左右 2 欄） |
| `steps` | `steps`（ネイティブのステップ帯） |
| `timeline` | `timeline` |
| `diagram` / `arch-diagram` / `root-cause` / `framework` | `diagram`（`steps` / `timeline` / `quadrant` / `hub` の 4 パターン） |
| `image` / `background` / `draw`（生成済み） | `image`（`bleed:true` で全面背景、`scrim` でスクリムを調整） |
| `audio` / `video` | `media`（動画は `poster` 必須） |
| `pull` / `quote` | `pull` / `quote` |
| `code` | `code` |
| `hint` / `ask` / `quiz` / `discuss` / `task` / `demo` / `poll` / `lines` / `handoff` | `notes` かページの `points` に入れる。単独のブロックにはしない |

**どの block もページ型の recipe に消費されなければならない。** たとえば `split-compare` が食べるのは `compare / points / prose` だけ；そこへ `image` を差し込むと、黙って内容を捨てるのではなく、その時点で誤りになる。1 ページに主役 1 つ、accent ≤1、warn ≤1、カード ≤4 は、ビルダーと lint の二重で検査する。

## 5. ページ型 → レイアウト recipe

| recipe | 受け持つページ型 |
|---|---|
| `cover` | cover / team |
| `section` | act-divider / agenda / toc |
| `statement` | concept / verdict / problem / solution |
| `points` | points / definition / recap / caveat / next-steps |
| `kpi-hero` | kpi-hero / data-cards / data-contrast / traction |
| `table-showdown` | table-showdown / cast / action |
| `chart` | chart-line / chart-bars / chart-stack / results / experiment / breakdown / rank-list |
| `split-compare` | split-compare / before-after / counter-argument / competition |
| `diagram` | steps / timeline / arch-diagram / root-cause / framework / lifecycle-strip / policy-timeline |
| `image` | `image` / `media` を載せるすべてのページ |
| `code` | code-walkthrough / terminal-log / demo |
| `closing` | closing / references / thanks / the-ask |

- 1 つの稿は recipe 6–8 個に抑える；同じ recipe のページは同じ版面を共有する。
- `type:"custom"` は逃げ道：各 block に `rect: [x, y, w, h]`（1280×720 px）を与える。最大 2 ページまで；lint はなお安全領域、レイヤー内の重なり、強調の予算を検査する。
- 骨子のページ型が上の表に無いときは、ビルダーが block から recipe を自動で選ぶ；ただし**ページ型の名前はなお 6–8 種に抑える**——受け皿に頼らない。

## 6. 座標、文字サイズ、余白

- キャンバス：`960×540pt`（13.333×7.5in）、`1px = 0.75pt`；`x/y/width/height` はすべて単位付きの文字列で書き、裸の数字は禁止。
- 4 段の文字サイズ：主役 36pt（KPI 54–90pt）/ タイトル 25.5pt / 本文 18pt / 注記 10.5pt；フッターは最小 10.5pt（HTML の 9px の出典バーは移行しない）。
- ページ余白 42pt（56px）；ページ頭から本文まで、組と組の間、組の中は、ステップ 2 の 28/24/12px の換算をそのまま使う。
- 主役は 1 つだけ：主役になれるのは `key`、`kpi` の組の主項目、`pull` だけ；`title` は第 2 段。KPI ページは既定で KPI の組を主役とし、`key` はタイトル段に下げる。
- accent の塗り ≤1 か所 / ページ、warn の印 ≤1 か所 / ページ；強調は必ず主役に落とす。
- **文字の容量はハードゲート**：すべてのテキストフレームは `autoFit=none` で、文字サイズ・枠の幅・文字幅から行数を推定する；収まらなければ**文字を縮めずに誤りを返す**：
  `s7/points: text overflow need 5.2 lines, box …`。処理はブロックを分割する、ノートへ移す、文字を削るのいずれかで、あなたが決めて骨子 §6 に書く。

## 7. 構築コマンド

```bash
# batch だけを生成し、まず人が一度目を通す（初回はこれを推奨）
node <skill dir>/assets/pptx/build.cjs <トピック>-PPTX-src.json <トピック>.pptx --emit-only

# 実際の構築：close → 古いファイルを削除 → create → batch(stdin) → close → 切り替えを検証
node <skill dir>/assets/pptx/build.cjs <トピック>-PPTX-src.json <トピック>.pptx
```

構築が成功してもすぐには納品せず、そのままステップ 6（`06b-pptx.md`）へ進む。ビルダーは自動で次を行う：

- `slideWidth=960pt` / `slideHeight=540pt`、テーマの書体と色を明示的に設定する；
- すべての図形に `id`（`10000 + slide*100 + slot`）、`fill`、`line` を明示的に与える；以後の変更は揺れる `[N]` ではなく `@id` で行う；
- 表は `;` で行を分け、引用符をエスケープする；行ごとに高さを計算し、セルごとに書体 / 塗りを設定する；
- 画像は元の幅・高さから `crop`（パーセント）を計算する；全面背景は「画像をクロップ + 黒のスクリム」で作る；
- 各ページに `motion.transition`（またはそのページの `transition` の上書き）のトークン文字列を書き、構築後にページごとに読み戻す：**タイプ**が読み戻せなければすべての切り替えを削除して警告する——黙って別の効果へ置き換えることは絶対にしない；時間または方向・サブタイプだけが読み戻せないなら効果は保持し、WARN を出し、納品メモに明記する；
- 構築の前に `motionPolicyErrors` を通す：`discipline`、`why` / `transition_why`、expressive とアニメーションのあるページの予算はこの層で誤りになり、officecli のバッチには持ち込まれない；
- `animation` を宣言したページでは、読み順に選択された `shape` / `chart` へ一つずつ `add … --type animation` を実行する——コマンドの順序がそのまま PowerPoint のクリック順序になる。

## 8. 表、グラフ、画像、メディア

- **表**：ネイティブの表、≤6 行 × ≤5 列；`style=none`、`firstRow=false`、`bandedRows=false`、ヘッダーの塗りは `panel`、罫線は `0.75pt rule`。セルの文字は本文段の 18pt；行の高さは容量の推定で決まり、合計が枠を超えたら誤りを返して行番号を示す。
- **グラフ**：ネイティブグラフ、2–12 カテゴリ、1–3 系列、線形軸；`autotitledeleted=true`、`chartareafill=none`、`gridlines=false`、単一系列なら凡例なし。色は明示的に与える（第 1 系列は accent、残りは muted）；カテゴリ名 / 系列名に `,` や `;` を含めない。
  - 対数軸、ウォーターフォール、2 単位、データ点が 5 個未満など、確実に表現できない場合は、**ネイティブの表か単純な棒グラフに降格**し、QA レポートに明記する；第 1 版ではグラフを手描きしない。
- **画像**：ローカルの PNG / JPEG / GIF；`fit=cover` は比率を保ってクロップ、`fit=contain` は中央寄せで余白を残す。全面背景は `bleed:true`、`scrim` の既定は 0.55；下地が明るければ上げ、暗ければ下げる——**スクリムを敷いた後も本文は ≥4.5:1**。
- **メディア**：`media` 要素、`src` はローカルパス（ファイルは埋め込まれる）；動画は `poster` 必須で、ポスターの比率に contain；音声は正方形の小さな枠。URL は禁止。
  - officecli の HTML スクリーンショット経路は、音声 / 動画のコントロールを描かないことがある；`query media` と PowerPoint で開いた結果を正とする。

## 9. 発表者ノート

骨子 §7 のプロンプトをページごとに `notes` へ書く：

```bash
officecli get <トピック>.pptx "/slide[3]/notes" --json
```

- PPTX のノートは**プレーンテキスト**；`<strong>` / `<em>` のタグは剥がされ、文字だけが残る。強調の書式は HTML の発表者ウィンドウにしかない。
- プロンプトの中の数字も資料まとめの制約下にある；ノートは新しい事実を足す場所ではない。
- ステップ 8 の発表者 2 ウィンドウは**PPTX には当てはまらない**；PowerPoint 標準の発表者ビューを使う。ステップ 7 の画面注記も当てはまらず、PowerPoint のインクを使う。

## 10. 保守上の注意

1. 常駐状態は close → 削除 → create。削除は最大 5 回、200ms 間隔で再試行。
2. batch は原子的で、1 件の拒否でも全体を戻す。JSON を読み最初の 5 件の理由を報告。
3. 変動する `/shape[N]` ではなく安定した `@id` を使用。アニメーションも id 配下。
4. 各図形に fill / line を明示し、テーマの既定色継承を防ぐ。
5. p14 の時間は読戻せない場合がある。後缀差異は WARN、タイプ欠落時のみ全切替を削除。
6. 表 data はセミコロンで行区切り、カンマを含むセルは引用符。エスケープは構築器が担当。
7. 固有比率から 0–100% の crop を計算し、`picture_aspect_distorted` を修正。
8. 納品先の書体のみを使い `font.latin` / `font.ea` と create locale を明示。欠落書体は置換される。
9. PowerPoint がない場合の HTML 描画スクリーンショットは構造のみを確認し、画素一致は示さない。
10. `--grid` はヘッドレスブラウザが必要。なければページ別または `--page 1-N` の長画像。
11. 音声 poster は 1×1 なので正方形枠を使用。動画には実 poster が必須。
12. JSON と骨子・資料の不整合は同期修正して §6 に記録。事実の別管理を作らない。
13. 方向・サブタイプは型依存。`push-right` は有効、`circle-in` は拒否、`zoom-in` は zoom のみになる場合あり。読戻しに従う。
14. アニメーションは shape / chart のみ。画像・表・媒体は不可、on が空なら構築失敗。
15. 最後のアニメーション削除は空の `p:timing` を残すため、成品で remove せず仕様から再構築。
16. calm / story と予算は §4 に従う。非 base は why / transition_why を記し、理由がなければ fade-400。
17. random は不確実性の表現のみ。repeat は story と why が必要。変化だけを目的に使わない。

## 11. 出力

骨子 §1 の `filename` が指定する `.pptx` のパス（既定は骨子と同じディレクトリ）に書き出す。書き終えたらすぐステップ 6 へ進み、先に納品しない。

## 12. レビュー通過後の再編集

`.pptx` はコンパイルの成果物で、**唯一の真実は `<トピック>-PPTX-src.json`**（ページ数、ページ型、文字、数字はなお骨子と資料まとめを正とする）。ステップ 6 の再審査後にユーザーが何でも直したいなら——言葉を換える、版面を調整する、1 行足す、ページ切り替えやアニメーションを変える——すべて同じ 1 本道を通る：

1. 変更を `PPTX-src.json` へ書き戻す（構造を動かすなら先に骨子を直し、骨子 §6 に 1 行記録する）；
2. `build.cjs` で再コンパイルする；
3. ステップ 6 を再び走らせる：ビルダー自身のモーション読み戻し + `lint.cjs`（アニメーション数と切り替えタイプの照合を含む）+ ページごとのスクリーンショット。

**再コンパイルは古いファイルを削除してから全体を作り直す**（`close → rm → create → batch`）——だから：

- ユーザーが PowerPoint / WPS の中で手作業で加えた変更はすべて失われる。手で付けたアニメーション、変えた文字サイズ、差し込んだ 1 ページも含む；
- `.pptx` を手渡した後、またはユーザーが「このファイルいじった」と明言したら、**先に問う**：(a) 変更を spec へ書き戻して再コンパイルするか（推奨——変更は lint のカバー下に留まる）、それとも (b) この完成品の上で最小限の点改だけするか。(b) の選ばれた場合は再コンパイルせず、`officecli set @id` 水準の部分修正だけを行い、このファイルは以後 spec と非同期になること、アニメーション数が食い違えば `lint` が `none in the spec (edited outside the build spec?)` と報告することをありのままに伝える；
- 完成品が動く変更を受けたか不确定なら、まず `lint.cjs` を 1 回走らせてから直しかたを決める——あのアニメーション照合はまさにこのためにある。
