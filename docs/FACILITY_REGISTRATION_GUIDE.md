# 施設登録機能 - 実装ガイド

**実装日**: 2025年10月25日
**バージョン**: 1.0

---

## 📋 概要

施設向け機能の第一歩として、施設登録フローを実装しました。このガイドでは、実装内容と使用方法を説明します。

---

## ✅ 実装済み機能

### 1. Supabase連携
- ✅ Supabase Authでユーザー登録
- ✅ `facilities`テーブルに施設情報を自動登録
- ✅ `facility_staff`テーブルにオーナーとして自動登録
- ✅ メール確認機能（Supabase Auth標準）

### 2. 入力フィールド
- ✅ 施設名
- ✅ 施設タイプ（ドロップダウン）
  - 認可保育所
  - 認可外保育施設
  - 一時預かり
  - 病児保育
  - クリニック
- ✅ 区（ドロップダウン）
  - 札幌市全10区
- ✅ メールアドレス
- ✅ パスワード（8文字以上）
- ✅ パスワード確認
- ✅ 電話番号
- ✅ 住所

### 3. バリデーション
- ✅ 必須フィールドチェック
- ✅ メール形式チェック
- ✅ パスワード長チェック（8文字以上）
- ✅ パスワード一致チェック

### 4. エラーハンドリング
- ✅ Supabase Auth エラーの表示
- ✅ データベースエラーの表示
- ✅ ロールバック機能（ユーザー登録失敗時）

---

## 🚀 使用方法

### 施設の新規登録

#### 1. アプリを起動
```bash
npm run web
# または
npm run ios
```

#### 2. 施設登録画面へ移動
- ブラウザで `http://localhost:8081/facility-login` にアクセス
- 「新規施設登録」ボタンをクリック

#### 3. 情報を入力
1. 施設名を入力
2. 施設タイプを選択
3. 区を選択
4. メールアドレスを入力
5. パスワードを入力（8文字以上）
6. パスワードを再入力
7. 電話番号を入力
8. 住所を入力
9. 「登録する」ボタンをクリック

#### 4. メール確認
- 入力したメールアドレスに確認メールが送信されます
- メール内のリンクをクリックしてアカウントを有効化

#### 5. ログイン
- 施設ログイン画面からログイン
- 施設ダッシュボードへ自動遷移

---

## 🗄️ データベース構造

### 登録時に作成されるデータ

#### 1. auth.users テーブル
```json
{
  "id": "uuid",
  "email": "facility@example.com",
  "user_metadata": {
    "facility_name": "〇〇保育園",
    "role": "facility_owner"
  }
}
```

#### 2. facilities テーブル
```json
{
  "id": "uuid",
  "name": "〇〇保育園",
  "type": "licensed",
  "district": "central",
  "address": "札幌市中央区...",
  "phone": "011-123-4567",
  "email": "facility@example.com",
  "lat": 43.064,
  "lng": 141.346,
  "owner_user_id": "user_uuid",
  "status": "pending_approval",
  "category": "licensed",
  "stock": 0,
  "featured": false,
  "rating": 0,
  "images": [],
  "has_lunch": false
}
```

#### 3. facility_staff テーブル
```json
{
  "id": "uuid",
  "facility_id": "facility_uuid",
  "user_id": "user_uuid",
  "role": "owner",
  "name": "〇〇保育園",
  "email": "facility@example.com",
  "phone": "011-123-4567",
  "status": "active",
  "joined_at": "2025-10-25T12:00:00Z"
}
```

---

## 🔐 セキュリティ

### Row Level Security (RLS)

#### facilities テーブル
- ✅ 認証ユーザーは新規施設を作成可能
- ✅ オーナーのみ自施設を更新可能
- ✅ 全員が公開中の施設を閲覧可能

#### facility_staff テーブル
- ✅ オーナーのみスタッフを追加可能
- ✅ スタッフは自分の情報を閲覧可能
- ✅ 管理者は自施設のスタッフを閲覧可能

---

## 📝 注意事項

### 1. デフォルト値
以下の値はデフォルトで設定されます:

- **lat, lng**: 札幌市中央区の中心座標（43.064, 141.346）
  - ⚠️ 将来的にGoogle Maps APIで正確な座標を取得予定
- **status**: `pending_approval`（承認待ち）
  - 管理者向け「施設承認管理」画面から `active` / `inactive` へ更新できます
- **rating**: 0（評価なし）
- **images**: 空配列
- **stock**: 0

### 2. メール確認
- Supabase Authのデフォルト設定では、メール確認が必須です
- 開発環境では、Supabase Dashboardから手動で確認済みにできます:
  1. Supabase Dashboard > Authentication > Users
  2. 該当ユーザーを選択
  3. 「Confirm email」をクリック

### 3. 施設ステータス
施設は`pending_approval`で登録され、管理者による審査後に `active`（承認）または `inactive`（却下）へ更新されます。
管理画面が利用できない場合のみ、以下のSQLで手動更新できます:

```sql
-- Supabase Dashboard > SQL Editor
UPDATE facilities
SET status = 'active'
WHERE email = 'facility@example.com';
```

### 4. 承認管理画面のセットアップ（Edge Function）
承認/却下操作は `moderate-facility` Edge Function を経由して実行します。  
初回セットアップ時に以下を実行してください。

```bash
supabase functions deploy moderate-facility
supabase secrets set FACILITY_APPROVAL_ADMIN_USER_ID="<管理者ユーザーUUID>"
```

クライアント側では、`.env.local` の `EXPO_PUBLIC_SUPPORT_USER_ID` と同じ UUID を設定します。

---

## 🐛 トラブルシューティング

### エラー: "Auth error: User already registered"
**原因**: 同じメールアドレスで既に登録されている

**解決方法**:
1. 別のメールアドレスで登録
2. または、既存アカウントでログイン

### エラー: "施設情報の登録に失敗しました"
**原因**: データベース権限エラー

**解決方法**:
1. マイグレーションが正しく実行されているか確認
2. RLSポリシーが正しく設定されているか確認

### エラー: "Picker is not defined"
**原因**: @react-native-picker/pickerがインストールされていない

**解決方法**:
```bash
npm install @react-native-picker/picker
```

---

## 🔧 開発者向け情報

### ファイル構成
```
app/facility-register.tsx  # 施設登録画面
app/admin/facility-approvals.tsx  # 承認待ち一覧・承認/却下画面
lib/facilityApprovalService.ts  # 承認管理サービス
supabase/functions/moderate-facility/index.ts  # 承認更新 Edge Function
lib/supabase.ts            # Supabaseクライアント・型定義
```

### 主要な関数

#### handleRegister()
```typescript
const handleRegister = async () => {
  // 1. バリデーション
  // 2. Supabase Authでユーザー登録
  // 3. facilitiesテーブルに施設情報を登録
  // 4. facility_staffテーブルにオーナー登録
  // 5. 完了メッセージ表示
};
```

### カスタマイズ

#### 施設タイプを追加する場合
```typescript
// app/facility-register.tsx
<Picker.Item label="新しいタイプ" value="new-type" />

// マイグレーションファイルで制約を更新
ALTER TABLE facilities DROP CONSTRAINT IF EXISTS facilities_type_check;
ALTER TABLE facilities ADD CONSTRAINT facilities_type_check
  CHECK (type IN ('nursery', 'sick-child', 'clinic', 'temporary-care', 'licensed', 'new-type'));
```

---

## 🚧 今後の実装予定

### Phase 2: 位置情報の取得（優先度: 高）
- [ ] Google Maps Geocoding APIで住所→座標変換
- [ ] 住所入力時の自動補完

### Phase 3: 詳細情報入力（優先度: 中）
- [ ] 営業時間の設定
- [ ] 定員の入力
- [ ] 対象年齢の入力
- [ ] 給食の有無
- [ ] 施設画像のアップロード

### Phase 4: 承認フロー（優先度: 中）
- [x] 管理者ダッシュボード（施設承認管理）
- [x] 承認・却下機能
- [ ] 承認状況の通知（アプリ内通知/メール連携）

---

## 📞 サポート

問題が発生した場合:
1. `docs/MIGRATION_GUIDE.md`を確認
2. `docs/FACILITY_DESIGN.md`を確認
3. Supabase Dashboardのログを確認

---

**ドキュメント管理**:
- 作成日: 2025年10月25日
- 最終更新: 2025年10月25日
- バージョン: 1.0
