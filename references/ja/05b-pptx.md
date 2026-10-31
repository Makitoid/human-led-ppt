# ステップ 5（PPTX 軌道）· ネイティブ PPTX を構築する

> 本稿の `target` に `native-pptx` を含むときだけ本ファイルを読む。HTML 軌道は `05-build.md` を読む；2 つの軌道はステップ 1–4 と、同じ骨子・同じ資料まとめを共有する。

目標：承認済みの骨子を、**PowerPoint / WPS / Keynote でそのまま編集できる** `.pptx` にコンパイルする。ネイティブの図形、文字、表、グラフ、画像、メディア、ノート；ページ送りは一律 `fade` 0.4s；ページ内アニメーションは一切足さない。**OOXML を手書きするな**、officecli コマンドを 1 つずつ手打ちするな——幾何、文字サイズ、余白はすべて `assets/pptx/build.cjs` のレイアウトライブラリが担う。

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
  "motion": { "transition": "fade", "duration": 400 },
  "slides": [{
    "id": "s3", "type": "kpi-hero", "topic": "…", "title": "…", "key": "…",
    "blocks": [{ "kind": "kpi", "items": [{ "value": "-32", "unit": "%", "label": "…" }] }],
    "emphasis": { "role": "kpi", "index": 0, "tone": "accent" },
    "source": "機関 · 年",
    "notes": "…"
  }]
}
```

- `theme` はステップ 2 のスタイル決定ブロックからそのまま写す；`scale` は 1280×720 の px 値で、構築時に 1px = 0.75pt で pt に変換する（48/34/24/14 → 36/25.5/18/10.5pt）。4 段の比率は変えない。
- `motion` は `{ "transition": "fade", "duration": 400 }` だけを許す；他の値はその時点で誤りとする。
- `emphasis`：`role` は `key | kpi | title`、`tone` は `accent | warn`；そのページの主役にしか落とせない。
- `source` は `kpi` / `table` / `chart` / `compare` / `quote` を含むページで必須；右下のフッターに落ちる。
- `notes` は骨子 §7 に由来するプレーンテキスト；`<strong>` / `<em>` はビルダーが剥がす。強調の書式は HTML の発表者ウィンドウにだけ残る。

### block kind（第 1 版はこれだけを認める）

`points` · `prose` · `kpi` · `table` · `chart` · `compare` · `steps` · `timeline` · `diagram` · `image` · `media` · `pull` · `quote` · `code`

骨子の 56 語の語彙から block への対応表はこれ 1 つだけ（骨子 §4 に写さない）：

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
- 各ページに `transition=fade-400` を書き、構築後に `transitionDuration=400` を読み戻す；読み戻せなければ**すべての切り替えを削除**して端末に警告する——黙って `fade-med` に降格させない；
- `animation` 要素は一切書かない。

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

## 10. 既知の罠（踏んだ頻度順）

1. **常駐プロセスがファイルを掴む**：`create` は resident を 1 つ残す；先に `close`、次に `rm`、それから `create`。削除に失敗するときは `fs.rmSync(..., {maxRetries:5, retryDelay:200})`；ビルダーに内蔵済み。
2. **batch が失敗すると全体が書き込まれない**：先にすべての slide を作り、それからページごとに埋める；どの batch が失敗しても中止し、`--best-effort` は使わない。
3. **`/shape[N]` は揺れる**：一律 `@id` を使う；id は構築時に割り当てられ、以後の変更で番号から探さない。
4. **図形は既定でテーマ色を継承する**：すべての rect に `fill` と `line=none` を明示する。さもないと accent1 の線や下地が湧く。
5. **切り替えの時間は p14 拡張の中に隠れる**：`transition=fade-400` を読み戻して 400 でなければ、すべての切り替えを削除する；XML を手で直さない。
6. **表の `data` は `;` で行を分ける**、`\n` ではない；カンマを含むセルは引用符で囲む（ビルダーが処理済み）。
7. **画像の変形**：`view issues` が `picture_aspect_distorted` を報告する；幅・高さの比から `crop`（0–100 のパーセント）を計算し、無理に引き伸ばさない。
8. **書体**：納品先のマシンにインストール済みの書体だけを使い、`font.latin` / `font.ea` を明示する；`create --locale` で言語を固定する。書体が欠けると PowerPoint が置換し、版面が変わりうる。
9. **スクリーンショットは PowerPoint ではない**：手元に PowerPoint が無いとき、`view screenshot` は officecli の HTML レンダリング経路を通る；版面の構造は証明するが、PowerPoint のピクセル一致は証明しない。
10. **`--grid` はヘッドレスブラウザを要する**：手元に無いときは `--page N` で 1 ページずつ撮るか、複数ページを `--page 1-N` で縦長 1 枚にする。
11. **音声のポスターは 1×1**：音声は正方形の枠を使う；動画は実在の poster を必ず与える。さもないと変形と判定される。
12. **構築仕様は第二の真実ではない**：ページ数 / ページ型 / 数字が骨子・資料まとめと食い違ったら、`PPTX-src.json` を直し、骨子 §6 に 1 行記録する。

## 11. 出力

骨子 §1 の `filename` が指定する `.pptx` のパス（既定は骨子と同じディレクトリ）に書き出す。書き終えたらすぐステップ 6 へ進み、先に納品しない。
