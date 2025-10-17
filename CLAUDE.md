# 子育て支援アプリ - Claude Code開発ガイド

## プロジェクト概要
- **目標**: Web版ローンチでMVP展開、その後アプリ版へ拡張
- **技術**: Expo + React Native + TypeScript（マルチプラットフォーム対応済み）
- **アーキテクチャ**: ファイルベースルーティング（Expo Router）

## アジャイルMVP開発戦略

### Phase 1: Web版MVP（優先実装）
- **コア機能**: 認証、施設検索・予約、基本プロフィール
- **UI方針**: レスポンシブデザインでモバイルファースト
- **ターゲット**: ブラウザ経由での利用者獲得

### Phase 2: アプリ版拡張
- **追加機能**: プッシュ通知、カメラ、位置情報、オフライン対応
- **エンハンス**: ネイティブUXの活用

## 開発フロー

### 1. 機能開発の基本サイクル
```bash
# 1. Web版での動作確認（推奨）
npm run web  # http://localhost:8081

# 2. モバイル版での動作確認
npm run iphone  # Expo Go経由（SDK 54対応済み）

# 3. 品質チェック
npm run lint
```

### 2. マルチプラットフォーム対応パターン
```typescript
// Web/Mobile分岐の例
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Web専用ロジック
} else {
  // モバイル専用ロジック
}
```

## プロジェクト構成

### ディレクトリ構造
```
app/
├── (auth)/          # 認証関連スクリーン
├── (onboarding)/    # オンボーディング
├── (tabs)/          # メインタブナビゲーション
│   ├── index.tsx    # ホーム画面
│   ├── reserve.tsx  # 予約画面
│   ├── board.tsx    # 掲示板
│   └── profile.tsx  # プロフィール
├── application/     # 申請書PDF生成機能
│   ├── index.tsx    # 申請書一覧
│   ├── new.tsx      # 新規申請書作成
│   └── preview/[id].tsx  # PDFプレビュー・ダウンロード
└── child/           # 子供詳細
```

### コンポーネント設計原則
- **再利用性**: Web/Mobile両対応のコンポーネント
- **レスポンシブ**: モバイルファーストでWeb拡張
- **アクセシビリティ**: Web標準準拠

## MVP開発優先順位

### 🚀 Phase 1 - コア機能（Web版リリース向け）
1. **認証システム** (`app/(auth)/`)
   - ログイン・新規登録
   - ゲストモード
   - パスワードリセット

2. **施設予約機能** (`app/(tabs)/reserve.tsx`)
   - 施設検索・一覧
   - 予約フォーム
   - 予約管理

3. **ホーム画面** (`app/(tabs)/index.tsx`)
   - 近隣施設表示
   - 予約状況ダッシュボード

4. **申請書PDF自動生成** (`app/application/`)
   - 入園申請書フォーム入力
   - PDF自動生成・ダウンロード
   - 申請履歴管理

### 📱 Phase 2 - アプリ版エンハンス
5. **プッシュ通知**
   - 予約リマインダー
   - 施設からのお知らせ

6. **カメラ機能**
   - プロフィール写真
   - アレルギー情報の写真添付

7. **位置情報**
   - 近隣施設の自動検索
   - 施設までのナビゲーション

## PDF自動入力機能の実装要件

### 📋 PDF申請書の2つのアプローチ

札幌市の保育制度申請書類は、以下の2つの方式で対応します：

#### アプローチ1: 統一テンプレートPDF（TypeScript自動入力方式）

**対象**: 札幌市が統一様式を提供している申請書類

**対象書類例**:
- 給付認定等申請書（2号・3号認定用）
- 就労証明書（札幌市指定様式）
- 復職予定申立書
- マイナンバー記入・貼付用紙
- 介護・看護申立書
- 求職活動申告書兼同意書
- 転入に関する誓約書

**実装方法**:
1. **フォーム入力画面をTypeScriptで実装**（`app/application/new.tsx`等）
2. ユーザーが入力したデータを収集
3. **Web版のみ**: pdf-libを使用してPDFに自動入力・生成
4. プレビュー・ダウンロード提供

```typescript
// データ構造例
interface SapporoApplicationData {
  // 保護者情報
  parentName: string;
  parentPhone: string;
  parentAddress: string;

  // お子様情報
  childName: string;
  childBirthDate: string;

  // 保育必要性証明
  employmentStatus: 'employed' | 'self-employed' | 'job-seeking';
  employerName?: string;
  workingHours?: string;
}

// PDF生成（Web版のみ）
if (Platform.OS === 'web') {
  const { PDFDocument } = await import('pdf-lib');
  const templateBytes = await fetch(require('../../assets/templates/application_form.pdf'));
  const pdfDoc = await PDFDocument.load(await templateBytes.arrayBuffer());
  const form = pdfDoc.getForm();

  // フィールド自動入力
  form.getTextField('parent_name').setText(data.parentName);
  form.getTextField('child_name').setText(data.childName);
  // ...

  const pdfBytes = await pdfDoc.save();
  // プレビュー・ダウンロード
}
```

**メリット**:
- ユーザーは一度入力すれば複数書類に自動反映可能
- 入力ミス削減
- 入力データの再利用（Supabase保存）

#### アプローチ2: 施設固有PDF（クリック方式）

**対象**: 施設ごとに独自の申込書がある場合

**対象施設例**:
- 一時保育（各保育園独自様式）
- 企業主導型保育（各施設独自様式）
- 一部の認定こども園

**実装方法**:
1. 施設情報テーブルに`pdfTemplateUrl`フィールドを追加
2. 管理者が施設ごとにPDFテンプレートをアップロード
3. ユーザーは施設ページから直接PDFをダウンロード
4. 手動でPDFに記入して施設へ提出

```typescript
// 施設データ構造
interface Facility {
  id: string;
  name: string;
  type: 'temporary_care' | 'corporate_led' | 'licensed';
  pdfTemplateUrl?: string; // 施設独自の申込書PDF URL
}

// ダウンロード機能
const downloadFacilityPdf = async (facility: Facility) => {
  if (facility.pdfTemplateUrl) {
    // PDFをダウンロード
    const response = await fetch(facility.pdfTemplateUrl);
    const blob = await response.blob();
    // ファイル保存処理
  }
};
```

**メリット**:
- 施設ごとの多様なフォーマットに柔軟対応
- 実装がシンプル
- 施設側の更新に即座に対応可能

### 📄 自治体PDFフォーム対応

#### 1. PDF配置場所

**重要**: Web版・モバイル版共通で`assets/templates/`のみ使用

```bash
/assets/templates/
  ├── temporary_care_application.pdf
  └── ...
```

**配置手順**:
```bash
# 自治体PDFをassets/templates/に配置するだけ
cp path/to/government.pdf assets/templates/
```

**Metro Asset Systemの利用**:
- Web版・モバイル版両方で`require()`を使用
- 開発モード・プロダクションビルド両対応
- `public/`フォルダは**不要**

```typescript
// Web版・モバイル版共通コード
const asset = require('../assets/templates/temporary_care_application.pdf');
setPdfUri(asset); // Metroが自動的に配信可能なURLに変換
```

**注意事項**:
- ~~`public/`フォルダにPDFを配置する必要はありません~~（誤り）
- Expo Metroの開発モードでは`public/`フォルダは配信されない
- Metro asset systemを使えば、開発・本番両方で動作する

#### 2. PDF種別判定と処理方法

**ケースA: AcroFormフィールドあり（推奨）**
```typescript
// PDFにフォームフィールドが埋め込まれている場合
import { PDFDocument } from 'pdf-lib';

const pdfDoc = await PDFDocument.load(templateBytes);
const form = pdfDoc.getForm();
const nameField = form.getTextField('parentName');
nameField.setText(userData.parentName);
```

**ケースB: AcroFormフィールドなし（座標指定）**
```typescript
// 座標を手動で設定してテキスト描画
const fieldPositions = {
  parentName: { x: 150, y: 700, page: 0 },
  address: { x: 150, y: 650, page: 0 },
};

const page = pdfDoc.getPage(0);
page.drawText(userData.parentName, fieldPositions.parentName);
```

#### 3. フィールドマッピング設定

**constants/pdfFields.ts**
```typescript
export const pdfFieldMappings = {
  application_form: {
    type: 'acroform', // または 'coordinate'
    fields: {
      parentName: 'field_001',  // AcroFormフィールド名
      parentPhone: 'field_002',
      // ...
    }
  },
  temporary_care_form: {
    type: 'coordinate',
    fields: {
      parentName: { x: 150, y: 700, page: 0 },
      // ...
    }
  }
};
```

### 🔧 実装ガイドライン

#### Platform別処理

**方法1: Platform-specific files（推奨）**
```
components/
├── PdfPreview.tsx       # モバイル版実装
└── PdfPreview.web.tsx   # Web版実装
```

Metro bundlerが自動的にプラットフォームに応じたファイルを選択します。

**方法2: Metro Asset System（現在の実装・推奨）**
```typescript
// Web版・モバイル版共通コード
const asset = require('../assets/templates/temporary_care_application.pdf');
setPdfUri(asset); // Metro経由で配信されるURL
```

**誤った実装例（動作しない）**:
```typescript
// ❌ 開発モードで動作しない
if (Platform.OS === 'web') {
  const pdfUrl = '/assets/templates/temporary_care_application.pdf'; // 404エラー
  setPdfUri(pdfUrl);
}
```
理由: Expo Metroの開発モードでは`public/`フォルダは配信されない

**重要な制約事項**:
- `@react-pdf/renderer`: Web版のみ対応（`import.meta`エラーでモバイル不可）
- `pdf-lib`: Web版のみ対応（tslib競合でモバイル不可）
- `react-native-pdf`: モバイル版のみ対応（native依存でWeb不可）

#### PDF生成フロー

**現在の実装（v1.0 - テンプレート表示のみ）**:
1. フォームデータ収集（`app/application/new.tsx`）
2. プレビュー画面に遷移（`app/application/preview/[id].tsx`）
3. テンプレートPDFを直接表示
   - Web版・モバイル版共通: `assets/templates/`から`require()`で読み込み
   - Web版: Metro asset URL → iframe表示（`PdfPreview.web.tsx`）
   - モバイル版: Metro asset URL → react-native-pdf表示（`PdfPreview.tsx`）
4. ダウンロード（Web版のみ）: Metro asset URLをfetchしてダウンロード

**将来の実装（v2.0 - データ自動入力）**:
1. フォームデータ収集
2. PDF種別判定（AcroForm or 座標指定）
3. テンプレート読み込み
4. **pdf-libでデータ書き込み**（Web版のみ）
5. プレビュー表示
6. 入力済みPDFをダウンロード

## 開発時の注意点

### Web版最適化
- `react-native-web`による自動変換を活用
- Web特有のSEO・アクセシビリティ考慮
- モバイルファーストなレスポンシブデザイン

### パフォーマンス
- バンドルサイズの最適化（Web版重要）
- 画像最適化（複数フォーマット対応）
- 遅延読み込み（Lazy Loading）

### 品質管理
```bash
# 型チェック
npx tsc --noEmit

# リント
npm run lint

# Web版ビルドテスト
npm run build:web
```

## 技術仕様

### 使用ライブラリ
- **Expo SDK 54**: マルチプラットフォーム基盤
- **React Native 0.81.4**: UIコンポーメント
- **Expo Router 6.0.8**: ファイルベースルーティング
- **Supabase**: 認証・データベース
- **TypeScript 5.9.2**: 型安全性
- **react-native-pdf**: PDF表示（モバイル版のみ）
- **pdf-lib**: PDF編集・フィールド入力（Web版のみ、v2.0で活用予定）

### パッケージアップデート
```bash
# SDK 54互換バージョンに自動調整
npx expo install --fix

# 特定パッケージの更新
npx expo install <package-name>
```

## デプロイ戦略

### Web版
- Vercel/Netlify等での静的サイトホスティング
- `npm run build:web`でプロダクションビルド

### アプリ版
- Expo Build Service (EAS)活用
- App Store/Google Play配信

## トラブルシューティング

### よくある問題
1. **Web版で一部機能が動作しない**
   - `Platform.OS === 'web'`で分岐処理を追加

2. **レスポンシブデザインの崩れ**
   - `react-native-web`のCSSプロパティ制限を確認

3. **パフォーマンス問題**
   - Bundle Analyzerでサイズ分析
   - 不要なネイティブライブラリの分離

4. **PDF生成関連の問題**
   - **Web版でPDFプレビューに「Asset not found」エラー**:
     - ✅ 解決済み: Metro asset systemを使用（`require()`）
     - `assets/templates/`にPDFが存在するか確認
     - ~~`public/`フォルダは不要~~（開発モードでは配信されない）
     - 開発サーバーを再起動: `pkill -f expo && npm run web`
   - **モバイル版でPDFが表示されない**:
     - `react-native-pdf`がインストールされているか確認
     - `npx expo install react-native-pdf`で再インストール
     - `assets/templates/`にPDFファイルが存在するか確認
   - **Web bundling時に`react-native-blob-util`エラー**:
     - Platform-specific files（`.web.tsx`）を使用して分離
     - `import`文でのPlatform分岐は不十分（bundler段階でエラー）
   - **`@react-pdf/renderer`で`import.meta`エラー**:
     - このライブラリはWeb版でも動作しません（ESモジュール問題）
     - 代替: テンプレートPDF直接表示 or pdf-libを使用
   - **pdf-libで`tslib.default`エラー**:
     - Web版のみで動的import使用: `await import('pdf-lib')`
     - モバイル版では使用しない（Platform.OS チェック）
   - **自治体PDFのフィールドが認識されない**（v2.0実装時）:
     - Adobe Acrobatで開いてフォームフィールドの有無を確認
     - フィールド名を`pdfFieldMappings`に正しく設定
   - **座標指定がずれる**（v2.0実装時）:
     - PDFビューアで座標を確認（左下が原点(0,0)）
     - フォントサイズと文字幅を考慮して調整