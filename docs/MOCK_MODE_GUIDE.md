# モックモード開発ガイド

**作成日**: 2025年10月25日
**バージョン**: 1.0

---

## 📋 概要

Supabaseの実環境がなくても開発を進められるように、モッククライアントを実装しました。

---

## 🎯 モックモードとは？

**モックモード**では、Supabaseの代わりにブラウザの`AsyncStorage`（React Native）を使ってデータを保存します。

### メリット
- ✅ Supabaseのセットアップ不要で即座に開発開始
- ✅ インターネット接続不要
- ✅ 本番と同じコードで動作（切り替えが簡単）
- ✅ 開発速度の向上

### デメリット
- ❌ データは端末ローカルのみ（共有不可）
- ❌ リアルタイム機能は未対応
- ❌ 複雑なクエリは未対応

---

## 🚀 使用方法

### 自動的にモックモードになる条件

以下の環境変数が**設定されていない**場合、自動的にモックモードで動作します:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

### モードの確認方法

アプリ起動時、コンソールに以下のメッセージが表示されます:

```
⚠️  Supabase環境変数が設定されていません。モックモードで動作します。
📝 本番環境では .env.local にSupabaseの設定を追加してください。
```

---

## 💾 データの保存場所

### React Native（モバイル）
AsyncStorage（端末内の永続ストレージ）

### Web版
localStorage（ブラウザのローカルストレージ）

### データキー
- `@mock_users` - ユーザー情報
- `@mock_facilities` - 施設情報
- `@mock_facility_staff` - スタッフ情報
- `@mock_children` - 子供情報
- `@mock_reservations` - 予約情報
- `@mock_current_user` - 現在ログイン中のユーザー

---

## 🔧 対応している機能

### Auth機能
- ✅ `signUp()` - ユーザー登録
- ✅ `signInWithPassword()` - ログイン
- ✅ `signOut()` - ログアウト
- ✅ `getUser()` - 現在のユーザー取得
- ✅ `getSession()` - セッション取得

### Database機能
- ✅ `from().insert()` - データ挿入
- ✅ `from().select()` - データ取得
- ✅ `from().update()` - データ更新
- ✅ `from().delete()` - データ削除
- ✅ `eq()` - 等価条件フィルター
- ✅ `single()` - 単一レコード取得

### 未対応機能
- ❌ `gte()`, `lte()`, `like()` などの高度なフィルター
- ❌ `order()` - ソート
- ❌ `limit()`, `range()` - ページネーション
- ❌ Realtime機能
- ❌ Storage機能

---

## 📝 使用例

### 施設登録
```typescript
import { supabase } from '@/lib/supabase';

// モックでもこのコードは同じ
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123',
});

// facilitiesテーブルに挿入
const { data: facility } = await supabase
  .from('facilities')
  .insert({
    name: 'テスト保育園',
    type: 'nursery',
    // ...
  })
  .select()
  .single();
```

### データ取得
```typescript
// 全施設取得
const { data: facilities } = await supabase
  .from('facilities')
  .select('*');

// 条件付き取得
const { data: myFacility } = await supabase
  .from('facilities')
  .select('*')
  .eq('owner_user_id', userId)
  .single();
```

---

## 🗑️ データのリセット

### 方法1: ブラウザのストレージをクリア

**Chrome/Edge**:
1. F12で開発者ツールを開く
2. Application タブ
3. Storage > Local Storage
4. `@mock_` で始まるキーをすべて削除

**Firefox**:
1. F12で開発者ツールを開く
2. Storage タブ
3. Local Storage
4. `@mock_` で始まるキーをすべて削除

### 方法2: コードでクリア

```typescript
import { clearMockData } from '@/lib/supabase.mock';

// すべてのモックデータをクリア
await clearMockData();
```

### 方法3: アプリを再インストール（モバイル）

React Nativeアプリを削除して再インストール

---

## 🌱 サンプルデータの投入

開発用のサンプルデータを簡単に投入できます:

```typescript
import { seedMockData } from '@/lib/supabase.mock';

// サンプル施設などを投入
await seedMockData();
```

---

## 🔄 本番環境への切り替え

### 手順

#### 1. Supabaseプロジェクトを作成
https://app.supabase.com/

#### 2. 環境変数を設定
`.env.local` に以下を追加:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3. アプリを再起動
```bash
# 開発サーバーを停止（Ctrl + C）
# 再起動
npm run web
```

#### 4. 本番モードで動作確認
コンソールに警告メッセージが表示されなければ、本番モードで動作しています。

---

## 🐛 トラブルシューティング

### Q: 登録したデータが消えた
**A**: ブラウザのキャッシュクリアやプライベートモードで消えます。開発中は定期的にバックアップを推奨。

### Q: 別のデバイス/ブラウザでデータが見えない
**A**: モックモードはローカルストレージを使用するため、デバイス間でデータは共有されません。

### Q: モックモードから本番モードに切り替えたらエラーが出る
**A**: マイグレーションが実行されているか確認してください:
```bash
npx supabase db push
```

### Q: AsyncStorageのエラーが出る
**A**: パッケージがインストールされているか確認:
```bash
npm install @react-native-async-storage/async-storage
```

---

## 📊 モック vs 本番の比較

| 機能 | モックモード | 本番モード |
|------|------------|----------|
| セットアップ | 不要 | 必要 |
| データ保存 | ローカル | クラウド |
| データ共有 | ❌ | ✅ |
| リアルタイム | ❌ | ✅ |
| バックアップ | 手動 | 自動 |
| 認証メール | なし | あり |
| RLS | 未対応 | 対応 |
| パフォーマンス | 高速 | 標準 |

---

## 💡 開発のベストプラクティス

### 1. モックモードで開発開始
UI/UX の実装に集中できます。

### 2. 機能が完成したら本番環境でテスト
データの整合性やRLSの動作を確認。

### 3. 本番環境で問題があればモックで再現
デバッグが簡単になります。

---

## 🔗 関連ドキュメント

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Supabaseマイグレーション手順
- [FACILITY_DESIGN.md](./FACILITY_DESIGN.md) - 施設側機能の設計
- [FACILITY_REGISTRATION_GUIDE.md](./FACILITY_REGISTRATION_GUIDE.md) - 施設登録機能

---

**ドキュメント管理**:
- 作成日: 2025年10月25日
- 最終更新: 2025年10月25日
- バージョン: 1.0
