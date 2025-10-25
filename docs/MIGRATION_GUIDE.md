# Supabaseマイグレーション実行ガイド

このガイドでは、施設向け機能のデータベースマイグレーションを実行する手順を説明します。

---

## 📋 前提条件

### 必要なもの
- ✅ Supabaseプロジェクト（既存のプロジェクトを使用）
- ✅ Supabase CLI（インストール済み）
- ✅ プロジェクトの環境変数設定

### 環境変数の確認

`.env.local`に以下の環境変数が設定されていることを確認してください:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🚀 マイグレーション実行手順

### オプション A: Supabase CLIを使用（推奨）

#### 1. Supabase CLIのインストール確認

```bash
supabase --version
```

インストールされていない場合:

```bash
# macOS (Homebrew)
brew install supabase/tap/supabase

# または npm経由
npm install -g supabase
```

#### 2. Supabaseプロジェクトへのリンク

```bash
# プロジェクトディレクトリで実行
npx supabase link --project-ref your-project-ref
```

**project-ref の確認方法**:
- Supabase Dashboardを開く
- Project Settings > General
- Reference IDをコピー

#### 3. マイグレーションの確認

```bash
# マイグレーションファイルの一覧を確認
ls -la supabase/migrations/

# 出力例:
# 20250518081224_late_castle.sql
# 20251025000000_facility_features.sql
```

#### 4. マイグレーションの実行

```bash
# すべてのマイグレーションを適用
npx supabase db push
```

**成功時の出力例**:
```
Applying migration 20251025000000_facility_features.sql...
✔ Migration 20251025000000_facility_features.sql applied successfully
```

#### 5. マイグレーション状態の確認

```bash
# 適用済みマイグレーションを確認
npx supabase migration list

# データベース構造の確認
npx supabase db dump --schema public
```

---

### オプション B: Supabase Dashboardを使用

#### 1. SQL Editorを開く

1. [Supabase Dashboard](https://app.supabase.com/)にログイン
2. プロジェクトを選択
3. 左メニューから「SQL Editor」をクリック

#### 2. マイグレーションSQLをコピー

1. `supabase/migrations/20251025000000_facility_features.sql`を開く
2. すべての内容をコピー

#### 3. SQLを実行

1. SQL Editorに貼り付け
2. 「Run」ボタンをクリック
3. エラーがないか確認

#### 4. テーブルの確認

1. 左メニューから「Table Editor」をクリック
2. 以下のテーブルが追加されていることを確認:
   - `facility_staff`
   - `facility_availability`
   - `messages`
   - `facility_reviews`
   - `notifications`

---

## ✅ マイグレーション後の確認

### 1. テーブル構造の確認

Supabase Dashboard > Table Editorで以下を確認:

#### 既存テーブルの拡張確認
- **facilities**:
  - `owner_user_id` 列が追加されている
  - `status` 列が追加されている
  - `opening_hours` 列が追加されている

- **children**:
  - `gender` 列が追加されている
  - `photo_url` 列が追加されている

- **reservations**:
  - `confirmed_by` 列が追加されている
  - `check_in_time` 列が追加されている

#### 新規テーブルの確認
- `facility_staff`（5件の列）
- `facility_availability`（10件の列）
- `messages`（13件の列）
- `facility_reviews`（10件の列）
- `notifications`（9件の列）

### 2. RLSポリシーの確認

Supabase Dashboard > Authentication > Policiesで以下を確認:

- **facilities**: 6個のポリシー
- **facility_staff**: 5個のポリシー
- **reservations**: 4個のポリシー（既存2個 + 新規2個）
- **children**: 2個のポリシー（既存1個 + 新規1個）
- **messages**: 3個のポリシー
- **facility_reviews**: 4個のポリシー
- **notifications**: 1個のポリシー

### 3. トリガーの確認

Database > Functions > Triggersで以下を確認:

- `update_facilities_updated_at`
- `update_children_updated_at`
- `update_reservations_updated_at`
- `update_facility_staff_updated_at`
- `update_facility_availability_updated_at`
- `update_facility_reviews_updated_at`
- `update_facility_rating_trigger`

---

## 🔍 動作確認

### 1. アプリケーションでの確認

```bash
# 開発サーバーを起動
npm run web
```

以下を確認:
- ✅ 既存の施設一覧が表示される
- ✅ TypeScriptのエラーが出ない
- ✅ コンソールにエラーが出ない

### 2. データベースクエリのテスト

Supabase Dashboard > SQL Editorで以下のクエリを実行:

```sql
-- 施設一覧を取得
SELECT * FROM facilities LIMIT 5;

-- 施設スタッフテーブルの構造確認
SELECT * FROM facility_staff LIMIT 1;

-- 予約テーブルの新しいフィールド確認
SELECT
  id,
  status,
  confirmed_by,
  check_in_time
FROM reservations
LIMIT 5;
```

---

## 🐛 トラブルシューティング

### エラー: "relation already exists"

**原因**: テーブルが既に存在している

**解決方法**:
```sql
-- 該当テーブルを削除（注意: データが消えます）
DROP TABLE IF EXISTS table_name CASCADE;

-- 再度マイグレーション実行
```

### エラー: "column already exists"

**原因**: 列が既に追加されている

**解決方法**:
マイグレーションファイルの該当部分を確認し、`IF NOT EXISTS`が含まれているか確認してください。

### エラー: "permission denied"

**原因**: RLSポリシーによるアクセス拒否

**解決方法**:
1. Supabase Dashboard > Authentication > Policies
2. 該当テーブルのポリシーを確認
3. 必要に応じてポリシーを調整

### エラー: "syntax error"

**原因**: SQL構文エラー

**解決方法**:
1. マイグレーションファイルのSQL構文を確認
2. PostgreSQL 15以上で動作する構文か確認
3. コメント（`--`）が正しく記述されているか確認

---

## 🔄 ロールバック（マイグレーションの取り消し）

万が一、問題が発生した場合:

### 方法1: 特定のマイグレーションを取り消し

```bash
# マイグレーション履歴を確認
npx supabase migration list

# 特定のマイグレーションを取り消し
npx supabase migration revert --version 20251025000000
```

### 方法2: 手動でテーブルを削除

```sql
-- 新規テーブルを削除
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS facility_reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS facility_availability CASCADE;
DROP TABLE IF EXISTS facility_staff CASCADE;

-- 既存テーブルの追加列を削除
ALTER TABLE facilities DROP COLUMN IF EXISTS owner_user_id;
ALTER TABLE facilities DROP COLUMN IF EXISTS status;
-- ... (他の列も同様)
```

**⚠️ 注意**: ロールバックするとデータが失われます。本番環境では慎重に実行してください。

---

## 📝 次のステップ

マイグレーションが完了したら:

1. ✅ `lib/supabase.ts`の型定義を確認
2. ✅ 施設登録画面の実装を開始
3. ✅ 予約管理画面をSupabaseに接続
4. ✅ ダッシュボードにリアルタイムデータを表示

---

## 🔗 参考リンク

- [Supabase CLI ドキュメント](https://supabase.com/docs/guides/cli)
- [Supabase マイグレーションガイド](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/)

---

## 💡 Tips

### 開発環境でのテスト

本番環境に適用する前に、ローカルのSupabaseインスタンスでテストすることを推奨します:

```bash
# ローカルSupabaseを起動
npx supabase start

# ローカルでマイグレーションをテスト
npx supabase db push --local

# 確認
npx supabase db diff --local
```

### マイグレーションファイルの命名規則

新しいマイグレーションを作成する場合:

```bash
# 自動的にタイムスタンプ付きファイルを生成
npx supabase migration new <migration_name>

# 例:
npx supabase migration new add_payment_table
```

---

**ドキュメント管理**:
- 作成日: 2025年10月25日
- 最終更新: 2025年10月25日
- バージョン: 1.0
