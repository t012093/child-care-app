# 子育て支援アプリ - タスク進捗メモ

**最終更新**: 2026-03-04

---

## 📊 現在地

- 親向けの `登録 -> ログイン -> 予約作成 -> マイページ反映` のコアフローは Supabase / Resend に接続済み
- Web 版の施設検索、施設詳細、Google Maps、予約作成、プロフィールの予約表示まで確認済み
- 施設側運用、申請書データ永続化、お問い合わせ、掲示板はまだ途中
- 施設一覧や一部ダッシュボードはサンプルデータ依存が残っている

---

## ✅ 2026-03-04 時点で確認済み

### 1. 親向け認証・メール認証

- `supabase.auth.signInWithPassword` によるログイン
- `supabase.auth.getSession()` と `onAuthStateChange` によるセッション復元
- `Resend + Supabase Edge Functions` による認証コード送信
- `register-parent` Function 経由の親登録
- 登録後の自動ログイン
- `supabase.auth.resetPasswordForEmail` によるパスワードリセットメール送信

#### 関連ファイル

- `app/(auth)/login.tsx`
- `app/(auth)/register.tsx`
- `app/(auth)/parent-info.tsx`
- `app/(auth)/child-info.tsx`
- `app/(auth)/forgot-password.tsx`
- `lib/AuthContext.tsx`
- `lib/emailVerification.ts`
- `supabase/functions/send-verification-code/index.ts`
- `supabase/functions/verify-verification-code/index.ts`
- `supabase/functions/register-parent/index.ts`

#### 補足

- ゲストログインはまだ残している
- フルフローには Supabase secrets と Edge Functions の deploy が必要
- 認証メールの送信元は `ほいポチ <noreply@childcare.send.coral-network.com>` に分離済み

---

### 2. 親向け予約フロー

- 施設詳細から予約作成画面へ遷移
- 子ども、利用日、時間、種別、要望を入力して予約作成
- `reservations` への保存
- プロフィール画面で予約状況を読み込み

#### 関連ファイル

- `app/facility/[id].tsx`
- `app/reservation/new.tsx`
- `app/(tabs)/profile.tsx`
- `lib/reservationService.ts`

#### 2026-03-04 の確認内容

- 実アカウントで親登録から予約作成まで通過
- 札幌系施設では予約作成成功
- 予約後にプロフィールへ反映されることを確認

---

### 3. 施設検索・地図表示

- 施設一覧表示
- フィルター、並び替え、ページネーション
- 施設詳細表示
- Web 版 Google Maps 表示
- API キー未設定時の地図フォールバック
- 登録住所ベースの地図中心調整

#### 関連ファイル

- `app/(tabs)/reserve.tsx`
- `app/facility/[id].tsx`
- `components/FacilityMap.web.tsx`
- `components/FacilityMap.tsx`
- `lib/facilityMapViewport.ts`
- `constants/facilities.ts`

---

### 4. 施設新規登録

- Supabase Auth の `signUp`
- `facilities` テーブル登録
- `facility_staff` テーブル登録

#### 関連ファイル

- `app/facility-register.tsx`
- `lib/supabase.ts`

---

### 5. PDF / 申請書基盤

- 申請書一覧画面
- 新規申請フォーム
- PDF プレビュー画面
- Web 版 PDF マッピングエディタ
- Web 版 PDF 自動入力
- 就労証明書入力フローとプレビュー

#### 関連ファイル

- `app/application/index.tsx`
- `app/application/new.tsx`
- `app/application/preview/[id].tsx`
- `app/application/mapping/[templateId].tsx`
- `app/application/employment/new.tsx`
- `app/application/employment/preview/[id].tsx`
- `utils/pdfAutoFill.ts`
- `utils/pdfGenerator.ts`
- `utils/excelGenerator.ts`

---

## ⚠️ 部分実装

### 1. 施設側予約管理

- `hooks/useReservations.ts` は実予約の取得と更新を呼ぶ
- ただしデータが空のときはデモ予約をフォールバック表示する
- `hooks/useDashboardStats.ts` はまだモック統計
- 施設単位の厳密な絞り込みや実運用向けダッシュボードは未完成

#### 関連ファイル

- `hooks/useReservations.ts`
- `hooks/useDashboardStats.ts`
- `app/(facility-tabs)/reservations.tsx`
- `app/(facility-tabs)/dashboard.tsx`

---

### 2. 親プロフィール / ユーザーモデル

- 親情報は主に Auth metadata ベース
- 子ども情報は `children` テーブルから読み込む
- 専用の `profiles` テーブルや、親属性の明確な正規化はまだない

#### 関連ファイル

- `lib/AuthContext.tsx`
- `app/settings/profile.tsx`

---

### 3. パスワードリセット

- リセットメール送信自体は実装済み
- 受信後の再設定完了導線や運用ドキュメントまでは未整理

#### 関連ファイル

- `app/(auth)/forgot-password.tsx`
- `app/settings/password.tsx`

---

### 4. 申請書の永続化

- 申請書入力画面とプレビューはある
- 一覧や詳細表示はまだ固定データ依存
- 保存済み申請書を読み書きする構成にはなっていない

#### 関連ファイル

- `app/application/index.tsx`
- `app/application/new.tsx`
- `app/application/preview/[id].tsx`

---

## ❌ 未実装

### 1. 掲示板 / コミュニティ

- `app/(tabs)/board.tsx` はプレースホルダー中心

### 2. 施設ログインの本実装

- `app/facility-login.tsx` は実運用向け接続が未完了

### 3. お問い合わせ送信 API

- `app/support/contact.tsx` は送信成功アラート中心

### 4. 管理者承認フロー

- 施設登録時に `pending_approval` は保存される
- 承認画面、承認 API、通知は未実装

### 5. お気に入り・通知・レビューの本接続

- UI や型はある
- 一覧取得、保存、既読、返信などの接続は未確認または未実装

---

## 🧪 モック・サンプル依存の箇所

### 主な対象

- `constants/facilities.ts`
- `lib/supabase.mock.ts`
- `components/NotificationCard.tsx`
- `components/KnowledgeSection.tsx`
- `app/application/index.tsx`
- `app/application/preview/[id].tsx`
- `app/(facility-tabs)/dashboard.tsx`

### 補足

- 親認証のコアは実接続済みだが、ゲストログイン用のデモユーザーは残っている
- 施設一覧は固定データで、DB の `facilities` 全件取得ではない
- 施設側予約一覧は実取得優先だが、デモデータ併用

---

## ⚠️ 既知の制約

### 1. 富山系施設の予約作成

- 2026-03-05 対応済み
- `lib/facilityDistrict.ts` で永続化対象 `district` を `constants/regions.ts` から動的生成するように統一
- `supabase/migrations/20260305090000_align_facility_district_check_with_regions.sql` を追加し、富山系 `district` を DB 制約に追加

#### 関連ファイル

- `constants/facilities.ts`
- `lib/reservationService.ts`
- `lib/facilityDistrict.ts`
- `supabase/migrations/20260305090000_align_facility_district_check_with_regions.sql`

### 2. モバイル地図

- `components/FacilityMap.tsx` はネイティブ埋め込み地図ではなく外部マップ導線中心
- Web 版ほどの機能はまだない

### 3. 認証メール基盤の前提

- `send-verification-code`
- `verify-verification-code`
- `register-parent`

これら 3 Function と secrets が揃っていない環境では、親の新規登録フローは成立しない

---

## 🚀 次タスク候補

### 優先度: 高

1. 施設側予約管理を完全に実データ化し、ダッシュボード統計も Supabase 接続へ寄せる
2. 申請書データを固定値ではなく保存データで表示する
3. 施設ログインと施設情報編集を本接続にする

### 優先度: 中

1. お問い合わせ送信 API
2. 管理者承認フロー
3. お気に入り / 通知 / レビュー接続

### 優先度: 低

1. 掲示板機能
2. モバイル地図の強化

---

## 備考

- 旧版の進捗メモは 2025-10-10 時点の内容で、現状との差分が大きかったため整理した
- このファイルは「今どこまで動いているか」と「次に何をやるか」を短く把握するための要約版
- 詳細版は `docs/IMPLEMENTATION_STATUS_20260303.md` を参照
