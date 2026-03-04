# 子育て支援アプリ 実装状況サマリー

最終確認日: 2026-03-04

このドキュメントは、2026-03-04 時点のコードベースと直近の Web 検証結果を踏まえて整理した実装状況です。
コード読解に加えて、親登録、認証コード送信、予約作成、プロフィール反映の一部フローは実地確認済みです。

## 全体所感

- 画面数と導線はかなり揃っている
- 親向けのコアフローは、`Supabase Auth + Resend + Edge Functions` ベースで動き始めている
- 施設検索と親向け予約作成は実接続済みだが、施設側運用はまだ途中
- PDF / 申請書系は画面基盤がある一方、永続化や運用連携は弱い
- 施設一覧や一部統計は依然としてサンプルデータ依存

## 実装済み

### 1. 親向け認証・登録

- `supabase.auth.signInWithPassword` によるログイン
- `supabase.auth.getSession()` と `onAuthStateChange` によるセッション復元
- `register.tsx -> parent-info.tsx -> child-info.tsx` の登録導線
- `send-verification-code` と `verify-verification-code` による認証コード送信 / 確認
- `register-parent` Function による親登録と `children` 保存
- 登録後の自動ログイン
- ゲストログインのデモフローも併存
- `forgot-password.tsx` から `supabase.auth.resetPasswordForEmail` を呼ぶ実装あり

対象:
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

補足:
- フルフローには Edge Functions と secrets の deploy が必要
- 認証メール送信元は `noreply@childcare.send.coral-network.com` まで分離済み
- `AuthContext` にはデモユーザー向けロジックも残る

### 2. 親向けプロフィール・予約確認

- プロフィール表示画面あり
- `supabase.auth.updateUser` を使った保護者情報更新あり
- `children` テーブルから子ども情報読み込みあり
- `profile.tsx` で親予約一覧を取得して表示

対象:
- `app/(tabs)/profile.tsx`
- `app/settings/profile.tsx`
- `lib/AuthContext.tsx`
- `lib/reservationService.ts`

### 3. 親向け予約作成

- 施設詳細から予約作成画面へ遷移
- 子ども選択、日時入力、種別選択、要望 / メモ入力
- `reservations` への保存
- 予約後にプロフィール画面へ反映
- 施設レコードと子どもレコードの存在確認 / 必要時 insert

対象:
- `app/facility/[id].tsx`
- `app/reservation/new.tsx`
- `lib/reservationService.ts`
- `app/(tabs)/profile.tsx`

### 4. 施設検索 UI / 地図表示

- 施設一覧表示
- フィルター
- 並び替え
- ページネーション
- 施設詳細画面
- Web 版 Google Maps 表示
- API キー未設定時のフォールバック導線
- 登録住所ベースでの地図中心調整

対象:
- `app/(tabs)/reserve.tsx`
- `app/facility/[id].tsx`
- `components/FacilityMap.web.tsx`
- `components/FacilityMap.tsx`
- `lib/facilityMapViewport.ts`
- `constants/facilities.ts`

### 5. PDF 申請書機能の基盤

- 申請書一覧画面
- 新規申請フォーム
- PDF プレビュー画面
- Web 版 PDF マッピングエディタ
- Web 版 PDF 自動入力

対象:
- `app/application/index.tsx`
- `app/application/new.tsx`
- `app/application/preview/[id].tsx`
- `app/application/mapping/[templateId].tsx`
- `utils/pdfAutoFill.ts`
- `utils/pdfGenerator.ts`
- `constants/pdfFields.ts`

### 6. 就労証明書作成フロー

- 4 ステップ入力フォーム
- 下書き保存
- プレビュー画面
- テンプレートダウンロード導線

対象:
- `app/application/employment/new.tsx`
- `app/application/employment/preview/[id].tsx`
- `utils/excelFieldMappings.ts`
- `utils/excelGenerator.ts`

### 7. 施設新規登録

- Supabase Auth の `signUp`
- `facilities` テーブル登録
- `facility_staff` テーブル登録

対象:
- `app/facility-register.tsx`
- `lib/supabase.ts`

補足:
- 環境変数未設定時はモック Supabase にフォールバックする

## 部分実装

### 1. 施設側ダッシュボード・予約管理

状態:
- 予約管理画面はある
- `useReservations.ts` では実予約取得と更新系 API を呼ぶ
- 実データが空のときはデモ予約をフォールバック表示する
- `useDashboardStats.ts` はまだモック統計
- 施設単位の厳密な絞り込みや、本格運用向けの統計整合は未完成

対象:
- `app/(facility-tabs)/dashboard.tsx`
- `app/(facility-tabs)/reservations.tsx`
- `hooks/useReservations.ts`
- `hooks/useDashboardStats.ts`

### 2. 親プロフィールのデータモデル

状態:
- 親情報は Auth metadata ベース
- `children` はテーブル保存される
- 専用の `profiles` テーブルや、親属性の正規化はまだない

対象:
- `lib/AuthContext.tsx`
- `app/settings/profile.tsx`

### 3. パスワードリセット完了導線

状態:
- リセットメール送信自体は実装済み
- 受信後の再設定完了 UX や検証は未整理

対象:
- `app/(auth)/forgot-password.tsx`
- `app/settings/password.tsx`

### 4. 申請書管理

状態:
- 一覧・入力・プレビュー画面はある
- 一覧とプレビューは固定データ依存
- 新規入力値がそのまま保存済み申請書として扱われる構成にはなっていない

対象:
- `app/application/index.tsx`
- `app/application/new.tsx`
- `app/application/preview/[id].tsx`

### 5. 就労証明書

状態:
- 入力と下書き保存はできる
- プレビューもできる
- ただし Excel 自動入力は未実装
- 実態はテンプレートをダウンロードして手動記入する前提

対象:
- `app/application/employment/new.tsx`
- `app/application/employment/preview/[id].tsx`
- `utils/excelGenerator.ts`

### 6. 施設情報編集

状態:
- 編集 UI はある
- 保存ボタンもある
- state 更新のみで、DB 保存はない

対象:
- `app/(facility-tabs)/facility-info.tsx`

## 未実装

### 1. 掲示板 / コミュニティ本体

- 掲示板画面はプレースホルダーのみ

対象:
- `app/(tabs)/board.tsx`

### 2. 施設ログインの実通信

- 成功シミュレーションのみ

対象:
- `app/facility-login.tsx`

### 3. お問い合わせフォーム送信 API

- 送信成功アラートのみ

対象:
- `app/support/contact.tsx`

### 4. 管理者承認フロー

- 施設登録時に `pending_approval` で保存される
- ただし承認画面、承認 API、通知は未実装

対象:
- `app/facility-register.tsx`
- `docs/FACILITY_REGISTRATION_GUIDE.md`

### 5. お気に入り機能の接続

- `KeepContext` は存在する
- ただし Provider の組み込みや施設画面との接続が見当たらない

対象:
- `contexts/KeepContext.tsx`
- `app/_layout.tsx`

### 6. メッセージ、レビュー、通知の本実装

- 型定義やサンプル UI はある
- ただし一覧取得、投稿、既読、返信などの実装は未確認

対象:
- `lib/supabase.ts`
- `components/NotificationCard.tsx`
- `components/CommunityReviewCard.tsx`

## 既知の制約 / 既知の不具合

### 1. 富山系施設での予約作成

- `constants/facilities.ts` の富山系サンプルデータが持つ `district` 値と、remote DB 側 `facilities.district` 制約が一致していない
- そのため `ensureFacilityRecord()` 実行時に insert が失敗し、富山系施設では予約作成に失敗するケースがある
- 札幌系施設では実予約作成を確認済み

対象:
- `constants/facilities.ts`
- `lib/reservationService.ts`
- `supabase/migrations/20251025000000_facility_features.sql`

### 2. 施設一覧のデータソース

- 施設一覧は `constants/facilities.ts` の固定データ
- `facilities` テーブル全件取得ベースではないため、施設登録と検索結果はまだ同一データソースに統一されていない

### 3. 認証メール基盤の依存

- 親登録フローは `send-verification-code`
- `verify-verification-code`
- `register-parent`

の 3 Function と secrets が揃って初めて成立する

## 2026-03-04 に確認した実フロー

### 確認済み

- 認証コードメール送信
- 認証コード確認
- 親登録
- 自動ログイン
- 札幌系施設での予約作成
- プロフィール画面への予約反映

### 差出人確認

- `ほいポチ <noreply@childcare.send.coral-network.com>`

## モック・サンプル依存の箇所

### データソース

- `constants/facilities.ts`
- `lib/supabase.mock.ts`
- `constants/columnData.ts`
- `components/NotificationCard.tsx`
- `components/KnowledgeSection.tsx`
- `hooks/useReservations.ts`
- `app/application/index.tsx`
- `app/application/preview/[id].tsx`
- `app/(facility-tabs)/dashboard.tsx`

補足:
- `AuthContext.tsx` のコア認証は実接続済みだが、ゲストログイン用のデモユーザーは残る
- `hooks/useReservations.ts` は実取得優先だが、デモ予約フォールバックあり

### 傾向

- ホーム画面の通知、コラム、お役立ち情報は静的データ
- 施設一覧は固定データ
- 申請書一覧は固定データ
- 施設側予約一覧は実取得優先だがデモフォールバックあり
- ダッシュボード統計も固定計算ベース

## プラットフォーム制約がある機能

### Web 版のみ

- PDF マッピングエディタ
- PDF 自動入力
- PDF ダウンロード
- Excel テンプレートダウンロード

対象:
- `app/application/mapping/[templateId].tsx`
- `utils/pdfAutoFill.ts`
- `utils/pdfGenerator.ts`
- `utils/excelGenerator.ts`

### モバイル版で未完了

- 地図は外部マップ導線中心
- PDF/Excel の一部機能は非対応

対象:
- `components/FacilityMap.tsx`
- `utils/pdfGenerator.ts`
- `utils/excelGenerator.ts`

## 次に着手するなら

### 優先度: 高

1. 富山系施設でも予約できるように `facilities.district` とサンプル施設データを整合させる
2. 施設側予約管理を完全に実データ化し、ダッシュボード統計も Supabase 接続へ寄せる
3. 申請書データを固定値ではなく保存データで表示する
4. 施設ログインと施設情報編集を本接続にする

### 優先度: 中

1. お問い合わせ送信 API
2. 管理者承認フロー
3. お気に入り / 通知 / レビュー接続

### 優先度: 低

1. 掲示板機能
2. モバイル地図の強化

## 備考

- `docs/TASK_PROGRESS.md` は短い要約版
- このファイルは詳細棚卸し用
