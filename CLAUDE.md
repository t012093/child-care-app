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

### 📱 Phase 2 - アプリ版エンハンス
4. **プッシュ通知**
   - 予約リマインダー
   - 施設からのお知らせ

5. **カメラ機能**
   - プロフィール写真
   - アレルギー情報の写真添付

6. **位置情報**
   - 近隣施設の自動検索
   - 施設までのナビゲーション

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
- **React Native 0.81.4**: UIコンポーネント
- **Expo Router 6.0.8**: ファイルベースルーティング
- **Supabase**: 認証・データベース
- **TypeScript 5.9.2**: 型安全性

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