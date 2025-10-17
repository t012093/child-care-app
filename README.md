# Child App - 子育て支援アプリケーション

子育て施設の予約やコミュニティ機能を提供するExpo React Nativeアプリケーションです。

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/OpenCoralNetwork/child-app)

## 必要な環境

- Node.js v20以上
- npm v10以上
- Expo Go アプリ（iOS/Android）

## クイックスタート

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 起動方法

#### 📱 iPhone/Androidで起動

```bash
# iPhoneで起動（推奨）
npm run iphone

# または通常のトンネルモード
npm run tunnel
```

1. **Expo Go**アプリをスマートフォンにインストール
2. 表示されるQRコードをスキャン
3. アプリが自動的に起動します

#### 💻 Webブラウザで起動

```bash
npm run web
```

ブラウザで `http://localhost:8081` にアクセス

#### 🌐 両方同時に起動

```bash
npm run dev
```

### 3. デモモードでログイン

アプリ起動後、ログイン画面で「**ゲストとして利用**」ボタンをタップすると、デモユーザーとしてすべての機能を試すことができます。

## プロジェクト構成

```
/child-app/
├── app/                  # アプリケーションのルートとスクリーン
│   ├── (tabs)/          # タブナビゲーション
│   ├── application/     # 申請書PDF機能
│   ├── child/           # 子供向け機能
│   └── _layout.tsx      # ルートレイアウト
├── components/          # 再利用可能なコンポーネント
├── constants/           # 定数定義
├── hooks/              # カスタムフック
├── lib/                # ユーティリティ関数
├── utils/              # PDF生成などのユーティリティ
├── assets/             # 画像・フォント・PDFなどのアセット
│   └── templates/      # 自治体PDFテンプレート（重要）
└── supabase/           # Supabase設定
```

**重要なディレクトリ**:
- `assets/templates/`: 自治体PDFテンプレートを配置（Metro asset systemで配信）
- `components/PdfPreview.tsx` / `PdfPreview.web.tsx`: Platform-specific実装

## 利用可能なコマンド

### 開発用コマンド

| コマンド | 説明 | 用途 |
|---------|------|------|
| `npm start` | 基本的な開発サーバー起動 | ローカル開発 |
| `npm run web` | Web版のみ起動 | ブラウザでの開発 |
| `npm run iphone` | iPhone/Android向け起動（トンネル付き） | モバイル開発（推奨） |
| `npm run tunnel` | トンネルモードで起動 | 別ネットワークからアクセス |
| `npm run mobile` | モバイル向け起動（トンネル付き） | モバイル開発 |
| `npm run dev` | Web + トンネル同時起動 | フルスタック開発 |
| `npm run all` | すべてのプラットフォーム起動 | 全環境テスト |

### ビルド・その他

| コマンド | 説明 |
|---------|------|
| `npm run build:web` | Web版のプロダクションビルド作成 |
| `npm run lint` | コードのリントチェック |

## 技術スタック

- Expo SDK 54
- React Native 0.81.4
- React 19.0.0
- Expo Router 6.0.8
- TypeScript 5.9.2
- Supabase
- react-native-pdf (PDF表示 - モバイル版)
- pdf-lib (PDF編集 - Web版のみ)

## 主な機能

- 🏫 **施設予約**: 保育園や学童施設の検索と予約
- 📄 **申請書PDF生成・管理**: 入園申請書などのPDF作成・ダウンロード機能

  **2つのアプローチ**:

  1. **統一テンプレートPDF（自動入力方式）**
     - **対象**: 札幌市統一様式（給付認定申請書、就労証明書など）
     - フォーム入力からワンクリックでPDF生成
     - 保護者・お子様情報の自動入力（TypeScript実装）
     - 入力データはSupabaseに保存し再利用可能
     - **Web版**: pdf-libで自動生成 + プレビュー・ダウンロード
     - **モバイル版**: 生成済みPDFのプレビュー（react-native-pdf）

  2. **施設固有PDF（クリック方式）**
     - **対象**: 一時保育、企業主導型保育など施設独自の申込書
     - 各施設がアップロードしたPDFテンプレートを直接ダウンロード
     - ユーザーは手動でPDFに記入して施設へ提出
     - 施設ごとの多様なフォーマットに柔軟対応
- 👨‍👩‍👧‍👦 **コミュニティ**: 子育て中の親同士の情報交換
- 🛡️ **安全な情報管理**: お子様のアレルギーや医療情報を安全に保存
- 📱 **マルチプラットフォーム**: iOS、Android、Webに対応

## トラブルシューティング

### 「The internet connection appears to be offline」エラー

このエラーは表示されても、ローカル開発には影響しません。そのまま開発を続けられます。

### Expo Goで接続できない場合

1. 開発マシンとスマートフォンが同じWi-Fiに接続されているか確認
2. 異なるネットワークの場合は`npm run iphone`または`npm run tunnel`を使用
3. キャッシュをクリアして再起動：`npx expo start --clear`

### ポートが使用中の場合

```bash
# 既存のプロセスを終了
pkill -f expo

# 別のポートで起動
npx expo start --port 8082
```

### QRコードが表示されない場合

1. ターミナルを全画面表示にする
2. `npm run tunnel`を実行し直す
3. 表示されるURLを手動でExpo Goアプリに入力

### PDFプレビューで「Asset not found」エラー

**✅ 解決済み**: Metro asset systemを使用することで解決しています。

PDFが表示されない場合：

1. `assets/templates/`にPDFが存在するか確認
   ```bash
   ls assets/templates/
   ```
2. 開発サーバーを再起動
   ```bash
   pkill -f expo
   npm run web
   ```

**重要**: このアプリではMetro asset systemを使用しています。
- PDFは`assets/templates/`に配置するだけでOK
- `public/`フォルダは**不要**（開発モードでは配信されない）
- `require()`で読み込むことでWeb・モバイル両対応

### Platform-specific files（プラットフォーム別ファイル）

Web版とモバイル版で異なる実装が必要な場合、ファイル拡張子で分岐できます：

```
components/
├── PdfPreview.tsx       # モバイル版（iOS/Android）
└── PdfPreview.web.tsx   # Web版
```

Metro bundlerが自動的にプラットフォームに応じて適切なファイルを選択します。

## ライセンス

MIT