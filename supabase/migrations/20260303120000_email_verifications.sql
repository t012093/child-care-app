/*
  # Email verification codes for custom Resend flow

  Supabase標準の確認メールではなく、Resend経由の確認コードを使うためのテーブルです。
  Edge Functions が service role でのみアクセスします。
*/

CREATE TABLE IF NOT EXISTS public.email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('register')),
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  send_count INTEGER NOT NULL DEFAULT 1 CHECK (send_count >= 0),
  verify_attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (verify_attempt_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email, purpose)
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_email
  ON public.email_verifications(email);

CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at
  ON public.email_verifications(expires_at);

ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_email_verifications_updated_at ON public.email_verifications;
CREATE TRIGGER update_email_verifications_updated_at
  BEFORE UPDATE ON public.email_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.email_verifications IS 'Resend経由のメール認証コード管理';
