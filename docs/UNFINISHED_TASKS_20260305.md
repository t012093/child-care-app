# 子育て支援アプリ 未完成タスク一覧

最終更新: 2026-03-05

このドキュメントは、現在のコード実装を直接確認して整理した「未完成タスク」の実行リストです。

## 優先度 High

- [x] 1. 申請書データを永続化する
  - 現状: 実データ保存・一覧・IDプレビューに接続済み。
  - 対象ファイル: `app/application/index.tsx`, `app/application/new.tsx`, `app/application/preview/[id].tsx`
  - 完了条件:
    - [x] 新規作成データを保存できる。
    - [x] 一覧に保存済み申請書が表示される。
    - [x] プレビューがURLの `id` に対応する保存データを表示する。
  - 備考: 認証付きAPIの完全E2E自動化はタスク13で継続。

- [x] 2. 子ども詳細ページのモック依存を解消する
  - 現状: 詳細はDB `children` 取得に接続し、編集導線を実装済み。
  - 対象ファイル: `app/child/[id].tsx`, `app/child/edit/[id].tsx`, `lib/childService.ts`
  - 完了条件:
    - [x] 詳細データを実データから取得する。
    - [x] 各編集操作が実際の更新導線につながる。

- [x] 3. ホーム画面の主要カードを実データ化する
  - 現状: 直近予約・通知を実データ取得に接続済み（デモユーザーのみデモ表示）。
  - 対象ファイル: `app/(tabs)/index.tsx`, `components/TodayScheduleCard.tsx`, `components/NotificationCard.tsx`, `lib/notificationService.ts`
  - 完了条件:
    - [x] 直近予約を実データで表示する。
    - [x] 通知一覧と未読件数を実データで表示する。

- [x] 4. 掲示板機能を実装する
  - 現状: `messages` テーブル接続で一覧/詳細/空状態/エラー状態を実装済み。
  - 対象ファイル: `app/(tabs)/board.tsx`, `app/(tabs)/board/[id].tsx`, `lib/boardService.ts`
  - 完了条件:
    - [x] 一覧表示・詳細遷移・空状態/エラー状態が動作する。

- [x] 5. 施設登録の承認フローを実装する
  - 現状: 承認待ち施設一覧・承認/却下操作を管理者画面に実装済み。
  - 対象ファイル: `app/admin/facility-approvals.tsx`, `lib/facilityApprovalService.ts`, `supabase/functions/moderate-facility/index.ts`, `app/settings/index.tsx`
  - 完了条件:
    - [x] 承認待ち施設の一覧確認ができる。
    - [x] 承認/却下操作で状態更新できる。

## 優先度 Medium

- [ ] 6. コラム/レビュー/ナレッジを本データ接続に切り替える
  - 現状: コラム・レビューが静的配列依存。
  - 対象ファイル: `components/ColumnSection.tsx`, `app/column/index.tsx`, `app/column/[id].tsx`, `components/CommunityReviewCard.tsx`, `constants/columnData.ts`
  - 完了条件:
    - 一覧・詳細ともにAPI/DB由来のデータで表示する。

- [ ] 7. 設定画面の未接続アクションを解消する
  - 現状: 複数メニューが `console.log` のみ。
  - 対象ファイル: `app/settings/index.tsx`, `app/settings/profile.tsx`
  - 完了条件:
    - ヘルプ/問い合わせ/規約/プライバシー等が遷移または処理に接続される。
    - プロフィール写真変更の導線が実装される。

- [ ] 8. デモユーザー機能を運用モードで制御する
  - 現状: 保護者ログインにゲストログイン導線が残る。
  - 対象ファイル: `app/(auth)/login.tsx`, `lib/AuthContext.tsx`
  - 完了条件:
    - 環境変数でデモ機能ON/OFFを切り替えられる。
    - 本番相当環境ではデモログインを非表示にできる。

- [ ] 9. 施設詳細取得のサンプルフォールバックを整理する
  - 現状: `fetchFacilityById` が `sampleFacilities` を優先参照する。
  - 対象ファイル: `lib/facilityCatalogService.ts`, `constants/facilities.ts`
  - 完了条件:
    - 施設詳細が実データ中心になる。
    - サンプル参照が必要な場合は開発モード限定に分離する。

## 優先度 Low

- [ ] 10. PDF/Excel のモバイル対応方針を確定する
  - 現状: ダウンロード処理がWeb前提で、モバイルは未実装ログのみ。
  - 対象ファイル: `utils/pdfGenerator.ts`, `utils/excelGenerator.ts`
  - 完了条件:
    - モバイル実装を行う、または機能制限を明確にUIへ反映する。

## 品質・運用タスク（追加）

- [ ] 11. [High] 404画面のlint修正と言語統一
  - 現状: `fontWeight: 600` でlintエラー、文言も英語のまま。
  - 対象ファイル: `app/+not-found.tsx`
  - 完了条件:
    - ESLintエラーが解消される。
    - 文言をアプリ全体の日本語UIに合わせる。

- [ ] 12. [Medium] `console.log` の整理とエラーハンドリング統一
  - 現状: 設定・プロフィール周辺にデバッグログ/仮実装が残る。
  - 対象ファイル: `app/settings/index.tsx`, `app/settings/profile.tsx`, `app/(tabs)/profile.tsx`
  - 完了条件:
    - 本番不要ログを削除する。
    - ユーザー通知と例外処理の方針を統一する。

- [ ] 13. [High] API/E2Eスモークテストの自動化
  - 現状: 手動確認中心で回帰検知が弱い。
  - 対象ファイル: `scripts/`, `package.json`
  - 完了条件:
    - 予約作成、問い合わせ送信、施設ログインの最低限の自動テストが実行できる。

- [ ] 14. [High] RLS/権限ポリシーの再点検
  - 現状: 機能追加後の権限整合を再確認していない。
  - 対象ファイル: `supabase/migrations/`（`messages`, `reservations`, `facility_staff` 関連）
  - 完了条件:
    - 想定ロールごとの許可/拒否が確認できる。
    - 必要なポリシー修正を反映する。

- [ ] 15. [Low] 進捗ドキュメントの最新化
  - 現状: 旧状態の記述が一部残る。
  - 対象ファイル: `docs/TASK_PROGRESS.md`, `docs/IMPLEMENTATION_STATUS_20260303.md`
  - 完了条件:
    - 実装済み/未実装/次タスクが現状コードと一致する。

## プロジェクト横断での追加タスク

- [ ] 16. [Medium] 施設側設定画面の未接続メニューを実装する
  - 現状: 施設側設定は複数項目が `console.log` のみ。
  - 対象ファイル: `app/(facility-tabs)/settings.tsx`
  - 完了条件:
    - プロフィール編集/パスワード変更/通知/ヘルプが実画面または実処理に接続される。

- [ ] 17. [Medium] ナレッジ機能をデータ連携と詳細導線まで実装する
  - 現状: ナレッジ一覧が静的配列で、カード押下はログのみ。
  - 対象ファイル: `app/knowledge/index.tsx`, `components/KnowledgeSection.tsx`
  - 完了条件:
    - 一覧データがAPI/DB接続される。
    - 詳細画面への遷移が実装される。

- [ ] 18. [Medium] 通知設定の保存先を永続化する
  - 現状: 通知設定はローカル state のみで、保存は完了アラートのみ。
  - 対象ファイル: `app/settings/notifications.tsx`
  - 完了条件:
    - 設定値を保存・再取得できる。
    - 再起動後も設定が保持される。

- [ ] 19. [Medium] メッセージ以外の施設機能テーブルをアプリ接続する
  - 現状: `notifications`, `facility_reviews`, `facility_availability` はDB定義済みだが、アプリ側参照がほぼ無い。
  - 対象ファイル: `supabase/migrations/20251025000000_facility_features.sql`, `app/`, `lib/`, `hooks/`
  - 完了条件:
    - 各テーブルを利用する画面/サービスが最低1本ずつ実装される。

- [ ] 20. [Medium] 施設向けEdge Function計画と実装を一致させる
  - 現状: 設計書上の `confirm-reservation` などが未実装で、実装済みFunctionは認証系中心。
  - 対象ファイル: `docs/FACILITY_DESIGN.md`, `supabase/functions/`
  - 完了条件:
    - 設計書のAPIを実装するか、現実装に合わせて設計書を更新する。

- [ ] 21. [High] CIにAPI/E2E回帰テストを追加する
  - 現状: GitHub ActionsはExcel回帰のみ。
  - 対象ファイル: `.github/workflows/`, `package.json`, `scripts/`
  - 完了条件:
    - `lint` 以外に予約・問い合わせ・認証フローの自動テストをCIで実行できる。

- [ ] 22. [Low] サポート導線（プロフィール内）を実処理に接続する
  - 現状: プロフィール画面の「電話相談」「チャットボット」はタップしても動作しない。
  - 対象ファイル: `app/(tabs)/profile.tsx`
  - 完了条件:
    - 電話/問い合わせ導線が実際に遷移または外部リンク起動する。

- [ ] 23. [High] モックモード有効化条件を環境フラグ化する
  - 現状: Supabase環境変数未設定時に自動でモックモードに切り替わる。
  - 対象ファイル: `lib/supabase.ts`, `lib/supabase.mock.ts`
  - 完了条件:
    - 明示フラグでのみモック利用可能にする（誤接続防止）。
    - 本番相当環境でのサイレントフォールバックを防ぐ。

## 推奨着手順

1. タスク21（CIにAPI/E2E回帰テスト追加）
2. タスク14（RLS/権限ポリシー再点検）
3. タスク7（設定画面の未接続アクション解消）
4. タスク23（モックモード有効化条件の環境フラグ化）
