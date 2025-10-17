# Google Maps API セットアップガイド

## 概要
Phase 1のGoogle Maps API統合が完了しました。施設検索画面と施設詳細画面に実際の地図が表示されます。

## 実装済み機能
- ✅ 施設検索画面のマップ表示（複数施設マーカー）
- ✅ 施設詳細画面のマップ表示（単一施設）
- ✅ Web版対応（`@react-google-maps/api`）
- ✅ モバイル版対応（`react-native-maps`）

## APIキー取得手順

### 1. Google Cloud Consoleでプロジェクト作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（例: "child-app-dev"）
3. プロジェクトを選択

### 2. 必要なAPIを有効化

以下のAPIを有効化してください：

- **Maps JavaScript API**（Web版で使用）
- **Maps SDK for iOS**（iOS版で使用）
- **Maps SDK for Android**（Android版で使用）
- **Places API**（将来の施設検索機能で使用）

手順：
1. 左メニュー > "APIとサービス" > "ライブラリ"
2. 上記APIを検索して有効化

### 3. APIキーの作成

1. 左メニュー > "APIとサービス" > "認証情報"
2. "認証情報を作成" > "APIキー"をクリック
3. 作成されたAPIキーをコピー

### 4. APIキーの制限設定（推奨）

セキュリティのため、APIキーに制限をかけることを推奨します：

#### 開発用キー（テスト環境）
- **アプリケーションの制限**: なし（開発中）
- **APIの制限**: Maps JavaScript API, Maps SDK for iOS/Android, Places API

#### 本番用キー（将来）
- **Webキー**: HTTPリファラーで制限（例: `your-domain.com/*`）
- **iOSキー**: iOSアプリで制限（バンドルID指定）
- **Androidキー**: Androidアプリで制限（パッケージ名 + SHA-1指定）

## 環境変数の設定

### ステップ1: `.env.local`ファイルを編集

プロジェクトルートの`.env.local`ファイルを開き、APIキーを設定：

```bash
# Google Maps API Key（Web版で使用）
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...あなたのAPIキー
```

### ステップ2: `app.json`を編集（モバイル版）

`app.json`の該当箇所を編集：

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "AIzaSy...あなたのAPIキー"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSy...あなたのAPIキー"
        }
      }
    }
  }
}
```

**注意**:
- 本番環境では異なるキーを使用することを推奨
- `.env.local`はgitにコミットしないこと（`.gitignore`で除外済み）

## 開発サーバーの起動

環境変数を変更した場合は、開発サーバーを再起動してください：

```bash
# 既存のサーバーを停止
pkill -f expo

# Web版を起動
npm run web

# モバイル版を起動（Expo Go）
npm run iphone  # または npm run android
```

## 動作確認

### Web版
1. `npm run web`で起動
2. http://localhost:8081 にアクセス
3. "施設を探す"タブをクリック
4. 地図が表示され、施設マーカーが表示されることを確認
5. 施設をクリックして詳細画面に移動
6. 施設の位置が地図上に表示されることを確認

### モバイル版
1. `npm run iphone`または`npm run android`で起動
2. Expo Goアプリで開く
3. "施設を探す"タブで地図が表示されることを確認
4. 位置情報許可を求められた場合は許可

## トラブルシューティング

### Web版で地図が表示されない

**症状**: 灰色の背景に"地図の読み込みに失敗しました"と表示される

**原因と対処**:
1. APIキーが正しく設定されていない
   - `.env.local`の`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`を確認
   - 開発サーバーを再起動

2. Maps JavaScript APIが有効化されていない
   - Google Cloud Consoleで"Maps JavaScript API"を有効化

3. APIキーの制限が厳しすぎる
   - 開発中は制限を緩める（リファラー制限を一時的に解除）

### モバイル版で地図が表示されない

**症状**: "Google Maps not available"エラー

**原因と対処**:
1. `app.json`のAPIキーが設定されていない
2. Maps SDK for iOS/Androidが有効化されていない
3. ネイティブビルドが必要な場合がある（Expo Goでは制限あり）

### ブラウザコンソールのエラー

```
Google Maps JavaScript API error: InvalidKeyMapError
```
- APIキーが無効です。正しいキーを設定してください

```
Google Maps JavaScript API error: RefererNotAllowedMapError
```
- リファラー制限でブロックされています。開発中は制限を緩めてください

## APIキーの移行（個人→クライアント）

将来、個人アカウントのAPIキーからクライアントアカウントのAPIキーに移行する場合：

1. クライアントのGoogle Cloud Consoleで同様の手順でAPIキーを作成
2. `.env.local`と`app.json`のキーを置き換え
3. 開発サーバーを再起動
4. 動作確認

**注意点**:
- 請求先アカウントの設定を確認
- 使用量の上限アラートを設定（予期せぬ課金を防ぐ）
- 本番環境ではAPIキーの制限を必ず設定

## 料金について

Google Maps Platformは従量課金制です：

- **無料枠**: 月額$200分のクレジット（新規ユーザー）
- **Maps JavaScript API**: 1,000リクエストあたり$7
- **Places API**: 1,000リクエストあたり$17

開発段階では無料枠内で十分ですが、本番環境では使用量監視を推奨します。

## 次のステップ（Phase 2）

将来実装予定の機能：
- Google Places APIを使った施設検索
- ルート案内（Directions API）
- Google Calendar連携（予約同期）
- 位置情報に基づく近隣施設自動検索

## 参考リンク

- [Google Maps Platform](https://developers.google.com/maps)
- [@react-google-maps/api ドキュメント](https://react-google-maps-api-docs.netlify.app/)
- [react-native-maps ドキュメント](https://github.com/react-native-maps/react-native-maps)
- [Expo Location API](https://docs.expo.dev/versions/latest/sdk/location/)
