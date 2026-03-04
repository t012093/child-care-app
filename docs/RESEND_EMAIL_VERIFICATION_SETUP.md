# Resend Email Verification Setup

このアプリでは、Supabase標準の確認メールではなく、Resend + Supabase Edge Functions で登録前のメール認証を行えます。

## 追加されたもの

- Migration: `supabase/migrations/20260303120000_email_verifications.sql`
- Edge Function: `supabase/functions/send-verification-code`
- Edge Function: `supabase/functions/verify-verification-code`
- Edge Function: `supabase/functions/register-parent`

## 必要な環境変数

Supabase Edge Functions 側に以下を設定します。

- `RESEND_API_KEY`
- `VERIFY_FROM_EMAIL`
- `EMAIL_VERIFICATION_SECRET`
- 任意: `EMAIL_VERIFICATION_TTL_MINUTES`
- 任意: `EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS`
- 任意: `EMAIL_VERIFICATION_MAX_ATTEMPTS`

推奨値:

- `EMAIL_VERIFICATION_TTL_MINUTES=10`
- `EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS=60`
- `EMAIL_VERIFICATION_MAX_ATTEMPTS=5`

## 推奨送信元

- `RESEND_API_KEY` はアプリ専用のものを使う
- `VERIFY_FROM_EMAIL` も専用ドメインの送信元にする

現在の運用例:

```text
VERIFY_FROM_EMAIL=ほいポチ <noreply@childcare.send.coral-network.com>
```

Resend 側では `childcare.send.coral-network.com` を verify し、親アプリや他サービスと送信元を分離しておくと切り分けがしやすいです。

## 反映手順

1. SQL Editor で `20260303120000_email_verifications.sql` を実行
2. Edge Functions の secrets を設定
3. Edge Functions を deploy

例:

```bash
supabase functions secrets set \
  RESEND_API_KEY=... \
  VERIFY_FROM_EMAIL=... \
  EMAIL_VERIFICATION_SECRET=...
```

```bash
supabase functions deploy send-verification-code
supabase functions deploy verify-verification-code
supabase functions deploy register-parent
```

## 現状の制約

- 新規登録だけが Resend 認証コード化されています
- `forgot-password` はまだ Supabase 標準の reset email を使っています
- Web / mobile ともに `supabase.functions.invoke(...)` で呼び出す前提です
