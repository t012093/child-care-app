import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../_shared/cors.ts';
import {
  getNumberEnv,
  hashVerificationCode,
  jsonResponse,
  normalizeEmail,
  validateEmail,
  type VerificationPurpose,
} from '../_shared/emailVerification.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function withCors(response: Response) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, {
    status: response.status,
    headers,
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return withCors(jsonResponse(405, { error: 'Method not allowed' }));
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return withCors(jsonResponse(500, { error: 'Email verification settings are missing.' }));
  }

  let body: { email?: string; code?: string; purpose?: VerificationPurpose };
  try {
    body = await request.json();
  } catch {
    return withCors(jsonResponse(400, { error: 'Invalid JSON body.' }));
  }

  const email = normalizeEmail(body.email);
  const code = typeof body.code === 'string' ? body.code.trim() : '';
  const purpose = body.purpose || 'register';

  if (!validateEmail(email) || !code) {
    return withCors(jsonResponse(400, { error: 'メールアドレスと認証コードを入力してください。' }));
  }

  const maxAttempts = getNumberEnv('EMAIL_VERIFICATION_MAX_ATTEMPTS', 5);
  const { data: record, error: selectError } = await supabaseAdmin
    .from('email_verifications')
    .select('*')
    .eq('email', email)
    .eq('purpose', purpose)
    .maybeSingle();

  if (selectError) {
    console.error(selectError);
    return withCors(jsonResponse(500, { error: '認証コードの確認に失敗しました。' }));
  }

  if (!record) {
    return withCors(jsonResponse(400, { error: '認証コードが見つかりません。もう一度送信してください。' }));
  }

  if (record.verify_attempt_count >= maxAttempts) {
    return withCors(jsonResponse(429, { error: '認証コードの試行回数が上限に達しました。再送信してください。' }));
  }

  if (record.consumed_at) {
    return withCors(jsonResponse(400, { error: 'この認証コードは使用済みです。もう一度送信してください。' }));
  }

  if (new Date(record.expires_at).getTime() < Date.now()) {
    return withCors(jsonResponse(400, { error: '認証コードの有効期限が切れています。もう一度送信してください。' }));
  }

  const codeHash = await hashVerificationCode(email, purpose, code);

  if (codeHash !== record.code_hash) {
    await supabaseAdmin
      .from('email_verifications')
      .update({
        verify_attempt_count: record.verify_attempt_count + 1,
      })
      .eq('id', record.id);

    return withCors(jsonResponse(400, { error: '認証コードが正しくありません。' }));
  }

  const { error: updateError } = await supabaseAdmin
    .from('email_verifications')
    .update({
      verified_at: new Date().toISOString(),
      verify_attempt_count: record.verify_attempt_count + 1,
    })
    .eq('id', record.id);

  if (updateError) {
    console.error(updateError);
    return withCors(jsonResponse(500, { error: '認証状態の更新に失敗しました。' }));
  }

  return withCors(jsonResponse(200, { verified: true }));
});
