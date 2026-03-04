import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../_shared/cors.ts';
import {
  buildVerificationEmailHtml,
  generateVerificationCode,
  getNumberEnv,
  hashVerificationCode,
  jsonResponse,
  normalizeEmail,
  validateEmail,
  type VerificationPurpose,
} from '../_shared/emailVerification.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const resendApiKey = Deno.env.get('RESEND_API_KEY') || '';
const fromEmail = Deno.env.get('VERIFY_FROM_EMAIL') || '';

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

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !fromEmail) {
    return withCors(jsonResponse(500, { error: 'Email verification settings are missing.' }));
  }

  let body: { email?: string; purpose?: VerificationPurpose };
  try {
    body = await request.json();
  } catch {
    return withCors(jsonResponse(400, { error: 'Invalid JSON body.' }));
  }

  const email = normalizeEmail(body.email);
  const purpose = body.purpose || 'register';

  if (!validateEmail(email)) {
    return withCors(jsonResponse(400, { error: '正しいメールアドレスを入力してください。' }));
  }

  const resendCooldownSeconds = getNumberEnv('EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS', 60);
  const expiresInMinutes = getNumberEnv('EMAIL_VERIFICATION_TTL_MINUTES', 10);
  const now = new Date();

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('email_verifications')
    .select('id, last_sent_at, send_count')
    .eq('email', email)
    .eq('purpose', purpose)
    .maybeSingle();

  if (existingError) {
    console.error(existingError);
    return withCors(jsonResponse(500, { error: '認証コードの準備に失敗しました。' }));
  }

  if (existing?.last_sent_at) {
    const lastSentAt = new Date(existing.last_sent_at);
    const diffSeconds = Math.floor((now.getTime() - lastSentAt.getTime()) / 1000);
    if (diffSeconds < resendCooldownSeconds) {
      return withCors(
        jsonResponse(429, {
          error: `認証コードは${resendCooldownSeconds}秒ごとに再送できます。少し待ってからお試しください。`,
        })
      );
    }
  }

  const code = generateVerificationCode();
  const codeHash = await hashVerificationCode(email, purpose, code);
  const expiresAt = new Date(now.getTime() + expiresInMinutes * 60_000).toISOString();

  const { error: upsertError } = await supabaseAdmin
    .from('email_verifications')
    .upsert({
      email,
      purpose,
      code_hash: codeHash,
      expires_at: expiresAt,
      verified_at: null,
      consumed_at: null,
      last_sent_at: now.toISOString(),
      send_count: (existing?.send_count || 0) + 1,
      verify_attempt_count: 0,
    }, {
      onConflict: 'email,purpose',
    });

  if (upsertError) {
    console.error(upsertError);
    return withCors(jsonResponse(500, { error: '認証コードの保存に失敗しました。' }));
  }

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [email],
      subject: '【ほいポチ】メール認証コード',
      html: buildVerificationEmailHtml(code),
    }),
  });

  if (!resendResponse.ok) {
    console.error(await resendResponse.text());
    return withCors(jsonResponse(502, { error: '認証メールの送信に失敗しました。' }));
  }

  return withCors(jsonResponse(200, { success: true }));
});
