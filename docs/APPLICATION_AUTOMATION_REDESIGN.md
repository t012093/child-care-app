# 申請書自動化 再設計案

## 結論

このアプリの申請書自動化は、`PDF に直接書き込む設計` から、`Excel / Word / CSV を正として扱い、提出時に PDF 化する設計` に寄せた方がよい。

ここでいう `Word` は、基本的に `DOCX` を正規形式とする。古い `DOC` は直接処理せず、最初に `DOCX` へ正規化してから扱う。

特に日本の申請書では、以下が多い。

- 元帳票が `XLSX`
- 元帳票が `DOC`
- 元帳票が `DOCX`
- 補助表や明細が `CSV`
- 自治体や勤務先が Excel / Word 記入を前提にしている
- 提出時だけ PDF 化、または印刷提出

この前提では、`canonical JSON -> XLSX / DOCX / CSV renderer -> PDF export -> PDF verifier` の 4 段構成が一番安定する。

`DOC` はこの流れの前段で `DOC -> DOCX` に正規化する。

## 現状の問題

現在の実装は次の構成になっている。

- `utils/pdfGenerator.ts`
  - PDF テンプレートに直接記入
- `utils/pdfAutoFill.ts`
  - PDF マッピングベースで自動入力
- `constants/pdfFields.ts`
  - PDF 座標や AcroForm 名の対応
- `utils/excelGenerator.ts`
  - Excel はテンプレートダウンロードのみ
- `utils/excelFieldMappings.ts`
  - 名前付きセルマッピングはあるが、自動入力は未実装

この構成には `DOCX` の自動入力レイヤも存在しない。`DOC` を安全に処理する正規化レイヤも存在しない。

この構成の弱点:

- PDF 座標ベースは帳票改訂に弱い
- Excel / Word / CSV を正として扱っていない
- 申請書データの正規化レイヤがない
- 出力検証の仕組みがない
- 一覧や保存が固定データ依存で、生成結果の再利用がしにくい

## 新しい基本方針

### 1. 申請書データの正本を `canonical JSON` にする

PDF / Excel / Word / CSV のどれにも依存しない中間表現を用意する。

例:

```ts
type ApplicationDraft = {
  formId: string;
  formVersion: string;
  applicant: {
    parentName: string;
    parentKana?: string;
    phone: string;
    email?: string;
    address: string;
    postalCode?: string;
  };
  child: {
    name: string;
    kana?: string;
    birthDate: string;
    gender?: string;
  };
  employment?: {
    employerName?: string;
    employerAddress?: string;
    workStartTime?: string;
    workEndTime?: string;
  };
  preferences?: {
    desiredStartDate?: string;
    notes?: string;
  };
  attachments?: {
    type: string;
    fileId?: string;
  }[];
};
```

以後の renderer は、この JSON だけを入力にする。

### 2. 帳票ごとに `form spec` を持つ

帳票の差はコードに埋め込まず、定義ファイルで持つ。

最低限必要な情報:

- `formId`
- `version`
- `inputFormat`
  - `pdf`
  - `xlsx`
  - `doc`
  - `docx`
  - `csv`
  - `xlsx_to_pdf`
  - `docx_to_pdf`
- `outputFormat`
  - `pdf`
  - `xlsx`
  - `docx`
  - `csv`
- `fields`
- `sheet / cell / namedRange`
- `docx placeholders / bookmarks / content controls`
- `csv columns`
- `pdf export rules`
- `validation rules`

例:

```yaml
formId: employment_certificate
version: sapporo_2026_01
inputFormat: xlsx
outputFormat: pdf
workbook:
  template: assets/templates/employment_certificate.xlsx
  sheets:
    - name: 証明書
fields:
  applicant.parentName:
    target:
      type: namedRange
      value: employee_name
  employment.employerName:
    target:
      type: namedRange
      value: employer_name
pdfExport:
  method: libreoffice
  fileNamePattern: 就労証明書_{applicant.parentName}_{date}
validators:
  - required: applicant.parentName
  - required: employment.employerName
```

### 3. `renderer` は決定論的にする

LLM には最終配置を任せない。

やること:

- `XLSX renderer`
  - named range 優先
  - 次に `sheet + cell`
  - さらに必要なら `header anchor + offset`
- `DOC normalizer`
  - `.doc` を `.docx` へ変換
  - 変換失敗時は自動入力対象外としてレビューへ回す
- `DOCX renderer`
  - content control 優先
  - 次に placeholder token
  - テーブル繰り返し行は row template で展開
- `CSV renderer`
  - 列順、エンコーディング、区切りを spec 化
- `PDF export`
  - Excel 由来なら `xlsx -> pdf`
  - Word 由来なら `docx -> pdf`
  - PDF テンプレート由来なら既存 `pdf-lib` 系を一部継続

### 4. 出力後に `verifier` を入れる

生成した PDF をそのまま信用しない。

確認するもの:

- 氏名
- 生年月日
- 希望開始日
- 会社名
- 必須チェック欄
- ページ数

不一致があれば、プレビューで差分表示して人が確認する。

## LLM の役割

LLM は有効だが、使う場所を限定する。

### 使う

- 新しい帳票の項目名ゆれ吸収
- Excel / Word / CSV の項目名や列名と canonical field の対応候補生成
- `DOC` を `DOCX` に変換した後の placeholder 候補抽出
- OCR 結果の正規化
- 欠損値や矛盾の説明
- spec の初期ドラフト作成

### 使わない

- 本番帳票への最終セル書き込み
- 本番帳票への最終 Word 差し込み
- PDF 座標の最終決定
- 数式や印刷範囲を含む Excel 保存の最終責任
- 改ページや書式を含む Word 保存の最終責任

## 推奨アーキテクチャ

```text
UI Form
  -> canonical JSON draft
  -> form spec resolver
  -> renderer
     -> xlsx renderer
     -> doc normalizer
     -> docx renderer
     -> csv renderer
     -> pdf renderer
  -> export
     -> xlsx
     -> docx
     -> csv
     -> pdf
  -> verifier
  -> review UI
  -> submit / download
```

## ファイル構成案

```text
lib/application/
  schema/
    applicationDraft.ts
  specs/
    employment_certificate/
      sapporo_2026_01.yaml
    temporary_care_application/
      toyama_2026_01.yaml
  renderers/
    xlsxRenderer.ts
    docNormalizer.ts
    docxRenderer.ts
    csvRenderer.ts
    pdfRenderer.ts
    pdfFromWorkbook.ts
    pdfFromDocument.ts
  validators/
    applicationValidator.ts
    outputVerifier.ts
  services/
    applicationStorage.ts
    applicationExport.ts
    templateRegistry.ts
```

## 実装方針

### Phase 1: Excel を自動入力できるようにする

対象:

- `就労証明書`

やること:

- `utils/excelFieldMappings.ts` を `spec` ベースへ移行
- `utils/excelGenerator.ts` の未実装部分を `XLSX renderer` に置き換える
- named range のあるテンプレート 1 枚で成立させる

ここではまだ PDF 変換を必須にしない。

### Phase 2: Word 帳票を自動入力できるようにする

対象:

- `申立書`
- `同意書`
- `勤務先記入の補足文書`

やること:

- `DOC` が来たら最初に `DOCX` へ正規化する
- `DOCX renderer` を追加する
- content controls または placeholder token を spec で定義する
- 繰り返し行や差し込み段落を deterministic に展開する

### Phase 3: Office 文書から PDF を作る

対象:

- 提出が PDF の帳票

やること:

- サーバー側で `LibreOffice` 変換、または外部変換基盤を使う
- 変換後の PDF を verifier に通す
- UI でプレビュー確認させる

ローカル Web クライアントだけで完結させるより、バックエンド変換の方が壊れにくい。

### Phase 4: CSV 帳票を追加する

対象:

- 明細表
- 自治体アップロード用 CSV

やること:

- `delimiter`
- `encoding`
- `header aliases`
- `required columns`

を spec で管理する。

### Phase 5: PDF テンプレート系を縮小整理する

残すもの:

- AcroForm が安定している帳票

縮小するもの:

- 座標直打ち前提の汎用 PDF 自動入力

## 既存コードからの移行

### 残す

- `app/application/*`
  - UI 画面の土台
- `app/application/employment/*`
  - 就労証明書入力導線
- `utils/excelFieldMappings.ts`
  - 初期マッピングの種
- `utils/pdfGenerator.ts`
  - PDF 直生成の一部ロジック

### 置き換える

- `utils/excelGenerator.ts`
  - テンプレートダウンロードのみ
  - `XLSX renderer` に置き換える
- Word テンプレート向けの新規 generator
  - `DOC normalizer` と `DOCX renderer` として追加する
- `constants/pdfFields.ts`
  - PDF 専用定義から `form spec` に寄せる
- `utils/pdfAutoFill.ts`
  - 汎用 PDF 直入力の中心を外す

## データ保存設計

申請書は生成物ではなく、`draft` と `rendered artifact` を分けて保存する。

### 保存したいもの

- `application_drafts`
  - canonical JSON
  - formId
  - formVersion
  - status
- `application_outputs`
  - outputType: `xlsx` `docx` `csv` `pdf`
  - storagePath
  - generatedAt
  - verificationStatus

### 状態例

- `draft`
- `validated`
- `rendered`
- `review_required`
- `ready_to_submit`
- `submitted`

## UI 改修の方向

### 追加したい画面

- 生成物レビュー画面
- 差分確認画面
- 帳票バージョン選択
- 添付書類管理

### 既存画面の変更

- `app/application/index.tsx`
  - 固定一覧ではなく保存データを表示
- `app/application/preview/[id].tsx`
  - 単なる PDF プレビューではなく、生成物種別に応じて
    - Excel ダウンロード
    - Word ダウンロード
    - PDF プレビュー
    - 差分確認
    を出し分ける
- `app/application/employment/preview/[id].tsx`
  - 手動入力案内中心から、自動生成レビュー中心へ移行する

## この方式の利点

- Excel / Word / CSV 主体の日本帳票に合う
- PDF 座標依存を減らせる
- 帳票改訂時に spec 差し替えで追従しやすい
- 自動生成後の検証を差し込みやすい
- LLM を安全な補助役に限定できる

## この方式の注意点

- PDF 変換はクライアントだけで完結しにくい
- Excel テンプレートの品質に依存する
- Word テンプレートの placeholder 設計にも依存する
- `DOC` は変換時に崩れることがある
- named range がない帳票は cell anchor 設計が必要
- content control がない Word は token 設計が必要
- 生成物と元データの両方を管理する設計が必要

## 最初に着手すべき 3 点

1. `就労証明書` を対象に、`canonical JSON` と `form spec` を作る
2. `XLSX renderer` を実装して、named range ベースで自動入力を成立させる
3. `DOC` または `DOCX` 帳票を 1 種選び、`DOC -> DOCX` 正規化を含む `DOCX renderer` と `PDF` 変換 PoC を作る

## 判断

このアプリの申請書自動化は、今後は

`PDF 自動入力中心`

ではなく

`Excel / Word / CSV を正として管理し、提出時に PDF へ変換する設計`

へ切り替えるのがよい。

ただし `Word` は実装上 `DOCX` を基準とし、`DOC` は互換入力として前段で正規化する。
