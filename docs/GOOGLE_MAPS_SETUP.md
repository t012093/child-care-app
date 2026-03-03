# Google Maps セットアップガイド

このドキュメントは、Web と将来の iOS/Android で Google Maps の設定が混ざって問題にならないように、現在の実装と今後必要になる設定を分けて整理したものです。

## 現在の実装

### Web
- 埋め込み地図を使用しています
- 実装ファイル: `components/FacilityMap.web.tsx`
- 使用 API: `Maps JavaScript API`
- 必要なキー: `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

### iOS / Android
- 現在はネイティブ埋め込み地図を使っていません
- 実装ファイル: `components/FacilityMap.tsx`
- 現在の挙動: `Googleマップで開く` ボタンで外部マップを開く
- そのため、現状の機能だけなら iOS / Android 用 Google Maps API キーは必須ではありません

## 結論

今すぐ必要なのは Web 用キーだけです。
iOS / Android 用キーは、将来ネイティブ埋め込み地図を実装するときに別で用意してください。

同じキーを全プラットフォームで使い回すより、以下のように分ける運用を推奨します。

- Web 開発用キー
- Web 本番用キー
- iOS 用キー
- Android 用キー

## このリポジトリの現状設定

### ローカル Web
`.env.local` に以下を設定します。

```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_web_api_key
```

### Vercel
本リポジトリの Vercel プロジェクト `child-care-app` には、以下の環境変数を登録済みです。

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

現在の公開 URL:

```text
https://child-care-app-eta.vercel.app
```

## Google Cloud で今すぐ必要な設定

### 有効化する API
今の Web 実装で必須なのはこれだけです。

- `Maps JavaScript API`

以下は将来ネイティブ埋め込み地図を入れる時に有効化します。

- `Maps SDK for iOS`
- `Maps SDK for Android`
- `Places API`（施設検索強化時）

## Web 用キーの制限設定

### 推奨設定
- Application restrictions: `Websites`
- API restrictions: `Maps JavaScript API`

### 開発用 referrer 例
```text
http://localhost:8081
http://localhost:8081/*
http://127.0.0.1:8081
http://127.0.0.1:8081/*
```

### Vercel 本番用 referrer 例
```text
https://child-care-app-eta.vercel.app
https://child-care-app-eta.vercel.app/*
```

Vercel の別エイリアスも使う場合は、実際にアクセスする URL を追加してください。

## Vercel デプロイ時の注意

- Google Maps の Web キーは `Website` 制限のままで正しいです
- Expo アプリでも、Vercel で表示するのはブラウザ版なので `iOS app` 制限にはしません
- 本番 URL が変わったら、Google Cloud 側の許可 referrer も更新してください

## 将来 iOS に埋め込み地図を入れるとき

現状では未使用ですが、後でネイティブ地図を実装するならこの順で進めます。

1. `ios.bundleIdentifier` を決める
2. Google Cloud で `Maps SDK for iOS` を有効化する
3. iOS 専用の API キーを作る
4. Application restrictions を `iOS apps` にする
5. 対象の bundle identifier を登録する
6. Expo 設定に iOS キーを入れる
7. ネイティブアプリを再ビルドする

### 重要
- Web キーと iOS キーは分けてください
- Web の `Website` 制限キーは iOS では使いません
- iOS キーは bundle identifier が決まってから作るのが安全です

## 将来 Android に埋め込み地図を入れるとき

1. `android.package` を決める
2. Google Cloud で `Maps SDK for Android` を有効化する
3. Android 専用キーを作る
4. Application restrictions を `Android apps` にする
5. package name と SHA-1 を登録する
6. Expo 設定に Android キーを入れる
7. ネイティブアプリを再ビルドする

## Expo 設定について

現在の [app.json](../app.json) には以下のプレースホルダがあります。

```json
"ios": {
  "config": {
    "googleMapsApiKey": "YOUR_IOS_GOOGLE_MAPS_API_KEY"
  }
},
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_ANDROID_GOOGLE_MAPS_API_KEY"
    }
  }
}
```

ただし、これは現時点では未使用です。
将来ネイティブ埋め込み地図を導入するまでは、Web 用キーだけ管理してください。

ネイティブ対応を始める段階では、`app.json` に直接書くより `app.config.ts` に移して環境変数から読む形へ寄せるのを推奨します。

## トラブルシューティング

### `RefererNotAllowedMapError`
原因:
- Google Cloud 側の許可 referrer に現在の URL が入っていない

対処:
- `https://child-care-app-eta.vercel.app`
- `https://child-care-app-eta.vercel.app/*`
- `http://localhost:8081`
- `http://localhost:8081/*`

を見直してください。

`/*` だけでなく、パスなしの URL も入れる方が安全です。

### `InvalidKeyMapError`
原因:
- API キーが無効
- 別プロジェクトのキーを見ている
- `Maps JavaScript API` が未有効化

### iOS キーを入れたのに Web が直らない
正常です。Web と iOS は別設定です。
Web は `Website` 制限 + `Maps JavaScript API` を見ます。

### `app.json` にキーを書いたのに Web が直らない
正常です。Web は `app.json` の `ios` / `android` 設定を使いません。
Web は `.env.local` または Vercel の `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` を使います。

## 運用ルール

後で詰まらないように、以下を守る運用にしてください。

- Web / iOS / Android のキーは分離する
- Google Cloud の restriction は用途ごとに最小化する
- Vercel の本番 URL が変わったら referrer を更新する
- 将来ネイティブ地図を入れるまでは、iOS / Android キーを先に埋めない

## 参考リンク

- Google Maps Platform: https://developers.google.com/maps
- Maps JavaScript API: https://developers.google.com/maps/documentation/javascript
- API キー制限: https://cloud.google.com/docs/authentication/api-keys
- Maps API Security Best Practices: https://developers.google.com/maps/api-security-best-practices
- Expo MapView: https://docs.expo.dev/versions/latest/sdk/map-view/
