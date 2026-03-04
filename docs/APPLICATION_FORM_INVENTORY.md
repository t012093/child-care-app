# 帳票棚卸し表

更新日: 2026-03-04

## 目的

申請書自動化の再設計を進める前に、リポジトリ内に存在する帳票関連ファイルを棚卸しし、以下を明確にする。

- どの帳票が実際にアプリから使われているか
- どの帳票が参考資料か
- どの形式が中心か
- どの帳票から自動化 PoC を始めるべきか

## サマリー

- 現在のリポジトリ内で確認できた帳票形式は `xlsx` `pdf` `odg` `eps`
- `doc` `docx` `csv` は、2026-03-04 時点ではこのリポジトリ内には存在しない
- アプリから実際に配線されているのは主に次の 2 系統
  - `employment_certificate.xlsx`
  - `temporary_care_application.pdf`
- 札幌・一時保育系の大きい PDF は、現状は主に参考資料またはダウンロード資料
- `public/assets/templates/` の `xlsx` `pdf` は、`assets/templates/` の複製であり、Web 配信用の複製として扱うのが自然

## 形式別集計

| 形式 | 件数 | 備考 |
|---|---:|---|
| `xlsx` | 3 | 実質 2 系統。うち 1 系統は `assets` と `public` の複製 |
| `pdf` | 6 | 実テンプレート、参考資料、施設配布資料が混在 |
| `odg` | 1 | 一時保育申込書の元データ候補 |
| `eps` | 1 | 一時保育申込書の印刷用元データ候補 |
| `doc` | 0 | リポジトリ内には未配置 |
| `docx` | 0 | リポジトリ内には未配置 |
| `csv` | 0 | リポジトリ内には未配置 |

## 実運用テンプレート候補

### 1. 就労証明書

| 項目 | 内容 |
|---|---|
| 主ファイル | `assets/templates/employment_certificate.xlsx` |
| 複製 | `public/assets/templates/employment_certificate.xlsx` |
| 参考元候補 | `docs/syuurou/work_certificate_241129 (1).xlsx` |
| 形式 | `xlsx` |
| 現在の導線 | `app/application/employment/new.tsx` -> `app/application/employment/preview/[id].tsx` |
| 現在の実装状態 | 入力画面あり。プレビューあり。自動入力は未実装。テンプレートダウンロードのみ |
| 保存方法 | `AsyncStorage` に draft を一時保存 |
| 想定運用 | Excel 記入後に PDF 提出の可能性が高い |
| 自動化適性 | 高い |
| 推奨優先度 | 最優先 |

判断:

- 現状のアプリ上の導線がすでにある
- `xlsx` なので `named range` や `cell` ベースの renderer に寄せやすい
- 再設計案の最初の PoC 対象として最も適している

#### 技術調査メモ

- `assets/templates/employment_certificate.xlsx`
- `docs/syuurou/work_certificate_241129 (1).xlsx`
- `public/assets/templates/employment_certificate.xlsx`

の 3 ファイルは SHA-256 が一致しており、実体は同一ファイル

```text
faae88cd87456d31477530ea8f9ea0cd8d4f72681046a78d956ea86eed5077f5
```

構造:

- シート数: 3
  - `標準的な様式`
  - `プルダウンリスト`
  - `記載要領`
- 定義名: 9 個
- 主シート使用範囲: `A1:AL1000`
- 主シートの結合セル: 236
- 主シートの非空セル: 374
- 主シートの数式セル: 0
- `プルダウンリスト` シートには年・月などの数式あり
- 主シートには `dataValidation` があり、`プルダウンリスト` を参照している
- `workbook.xml` に `GoogleSheetsCustomDataVersion2` があり、Google Sheets 経由で編集・出力された可能性が高い

定義名の一覧:

| Name | Ref |
|---|---|
| `name` | `'標準的な様式'!$Z$5:$AK$5` |
| `place` | `'標準的な様式'!$Z$6:$AK$6` |
| `phone1` | `'標準的な様式'!$Z$7:$AB$7` |
| `phone2` | `'標準的な様式'!$AD$7:$AG$7` |
| `phone3` | `'標準的な様式'!$AI$7:$AK$7` |
| `tantouname` | `'標準的な様式'!$Z$8:$AK$8` |
| `k.phone1` | `'標準的な様式'!$Z$9:$AB$9` |
| `k.name2` | `'標準的な様式'!$AD$9:$AG$9` |
| `k.name3` | `'標準的な様式'!$AI$9:$AK$9` |

示唆:

- `named range` は事業所名・所在地・電話・担当者など一部だけ
- 申請書全体を `named range` だけで埋めるのは難しい
- 実装は `named range + cell anchor` の併用が必要
- `プルダウンリスト` と `dataValidation` を壊さないことが重要
- PDF 変換前に workbook 構造を保持したまま保存できるライブラリ選定が必要

### 2. 一時保育事業利用申込書

| 項目 | 内容 |
|---|---|
| 主ファイル | `assets/templates/temporary_care_application.pdf` |
| 複製 | `public/assets/templates/temporary_care_application.pdf` |
| 元データ候補 | `assets/templates/temporary_care_application.odg` `assets/templates/temporary_care_application.eps` |
| 形式 | `pdf` |
| 現在の導線 | `app/application/preview/[id].tsx` `app/application/mapping/[templateId].tsx` |
| 現在の実装状態 | PDF プレビュー、PDF ダウンロード、座標マッピング、自動入力ダウンロードあり |
| 保存方法 | 画面内のサンプルデータ中心 |
| 想定運用 | PDF 直接入力または PDF 提出 |
| 自動化適性 | 中 |
| 推奨優先度 | 2番手 |

判断:

- 現在のコードでは最も PDF 自動入力が進んでいる
- ただし座標依存のため帳票改訂に弱い
- `odg` `eps` があるので、将来的には元データから Office 形式へ寄せられる余地がある

## 未配線テンプレート候補

### 3. ボランティア証明書

| 項目 | 内容 |
|---|---|
| ファイル | `assets/templates/ボランティア証明書(フォーム).pdf` |
| 形式 | `pdf` |
| 現在の導線 | なし |
| コード参照 | なし |
| 現在の実装状態 | 未配線 |
| 自動化適性 | 不明 |
| 推奨優先度 | 低 |

判断:

- テンプレートは置かれているが、現状アプリから使っていない
- 先に業務上必要かどうかを確認した方がよい

## 参考資料・配布資料

### 4. 札幌市認可保育所一覧 PDF

| 項目 | 内容 |
|---|---|
| ファイル | `docs/facilities/sapporoninkahoiku/251001ninnkahoikusyoitirann.pdf` |
| 形式 | `pdf` |
| サイズ | 約 1.1MB / 16ページ |
| 現在の導線 | `constants/facilities.ts` から多数の施設に `pdfTemplateUrl` として紐付け |
| 現在の実装状態 | 施設詳細画面からダウンロード導線あり |
| 用途 | 施設・制度の配布資料寄り |
| 自動化適性 | 低 |

判断:

- 帳票自動入力対象というより、施設案内資料・申込資料リンクとして使われている
- 自動化対象ではなく、参照資料として扱う方が自然

### 5. 一時保育実施施設一覧 PDF

| 項目 | 内容 |
|---|---|
| ファイル | `docs/facilities/ichiji/jissisisetsu_20250812.pdf` |
| 形式 | `pdf` |
| サイズ | 約 5.2MB / 11ページ |
| 現在の導線 | コード参照なし |
| 用途 | 参考資料 |
| 自動化適性 | 低 |

### 6. 札幌市の保育制度ガイド PDF

| 項目 | 内容 |
|---|---|
| ファイル | `docs/札幌市の保育制度：利用申請に必要な書類と申請方法まとめ.pdf` |
| 形式 | `pdf` |
| 現在の導線 | コード参照なし |
| 用途 | 制度説明資料 |
| 自動化適性 | 低 |

## 現状のコード配線

### 配線済み

- `employment_certificate.xlsx`
  - `utils/excelGenerator.ts`
  - `utils/excelFieldMappings.ts`
  - `app/application/employment/new.tsx`
  - `app/application/employment/preview/[id].tsx`

- `temporary_care_application.pdf`
  - `utils/pdfGenerator.ts`
  - `utils/pdfAutoFill.ts`
  - `constants/pdfFields.ts`
  - `app/application/preview/[id].tsx`
  - `app/application/mapping/[templateId].tsx`

### 未配線

- `ボランティア証明書(フォーム).pdf`
- `docs/syuurou/work_certificate_241129 (1).xlsx`
- `docs/facilities/ichiji/jissisisetsu_20250812.pdf`

## 設計上の示唆

### 1. 現時点の repo だけ見ると、PoC は `xlsx` と `pdf` から始めるのが妥当

- `doc` `docx` `csv` は設計上は考慮すべきだが、現物は repo 内にまだない
- したがって、実装の第一歩は
  - `employment_certificate.xlsx`
  - `temporary_care_application.pdf`
  の 2 本立てでよい

### 2. 再設計の主対象は `employment_certificate.xlsx`

理由:

- アプリの入力導線がすでにある
- 現在は手動入力案内で止まっている
- `XLSX renderer` に置き換える価値が最も高い

### 3. `temporary_care_application` は現状維持しつつ縮小整理候補

理由:

- すでに PDF ベースの自動入力が動いている
- ただし中長期では座標依存から外したい

### 4. `DOC / DOCX / CSV` は外部帳票の持ち込み前提で設計だけ先行させる

現時点では repo 内に実物がないため、先に renderer を作るより

- 棚卸し表
- spec 形式
- 正規化方針

を決めておく方が効率がよい

## 最初の PoC 対象

### 推奨 1位

`employment_certificate.xlsx`

理由:

- 実導線あり
- 価値が高い
- `xlsx` のため自動化しやすい
- PDF 提出フローへの拡張もしやすい

### 推奨 2位

`temporary_care_application.pdf`

理由:

- 現在の PDF 自動入力実装を比較対象にできる
- `odg` `eps` があるため、元データ再構成の可能性がある

## 次にやること

1. `employment_certificate.xlsx` の中身を確認し、`named range` または `cell anchor` の有無を調べる
2. `docs/syuurou/work_certificate_241129 (1).xlsx` と `assets/templates/employment_certificate.xlsx` の差を確認する
3. `employment_certificate` 向けの `form spec` 草案を作る
