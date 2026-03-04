import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../_shared/cors.ts';
import {
  jsonResponse,
  normalizeEmail,
  validateEmail,
} from '../_shared/emailVerification.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type ChildInput = {
  name?: string;
  birthDate?: string;
  allergies?: string[];
  medicalInfo?: string;
  photo?: string;
};

function withCors(response: Response) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, {
    status: response.status,
    headers,
  });
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeBirthDate(value: string) {
  return value.replace(/\//g, '-');
}

function parseChildren(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<Required<Pick<ChildInput, 'name' | 'birthDate'>> & ChildInput>;
  }

  return value.flatMap((child) => {
    if (!child || typeof child !== 'object') {
      return [];
    }

    const input = child as ChildInput;
    const name = normalizeText(input.name);
    const birthDate = normalizeText(input.birthDate);

    if (!name || !birthDate) {
      return [];
    }

    return [
      {
        ...input,
        name,
        birthDate,
      },
    ];
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
    return withCors(jsonResponse(500, { error: 'Registration settings are missing.' }));
  }

  let body: {
    email?: string;
    password?: string;
    name?: string;
    parentInfo?: {
      phone?: string;
      address?: string;
      emergencyContact?: string;
    };
    children?: ChildInput[];
  };

  try {
    body = await request.json();
  } catch {
    return withCors(jsonResponse(400, { error: 'Invalid JSON body.' }));
  }

  const email = normalizeEmail(body.email);
  const password = normalizeText(body.password);
  const name = normalizeText(body.name);
  const phone = normalizeText(body.parentInfo?.phone);
  const address = normalizeText(body.parentInfo?.address);
  const emergencyContact = normalizeText(body.parentInfo?.emergencyContact);
  const children = parseChildren(body.children);

  if (!validateEmail(email)) {
    return withCors(jsonResponse(400, { error: '正しいメールアドレスを入力してください。' }));
  }

  if (password.length < 6) {
    return withCors(jsonResponse(400, { error: 'パスワードは6文字以上で入力してください。' }));
  }

  if (!name || !phone || !address || !children.length) {
    return withCors(jsonResponse(400, { error: '登録に必要な情報が不足しています。' }));
  }

  const { data: verification, error: verificationError } = await supabaseAdmin
    .from('email_verifications')
    .select('*')
    .eq('email', email)
    .eq('purpose', 'register')
    .maybeSingle();

  if (verificationError) {
    console.error(verificationError);
    return withCors(jsonResponse(500, { error: 'メール認証状態を確認できませんでした。' }));
  }

  if (!verification?.verified_at) {
    return withCors(jsonResponse(400, { error: 'Email address is not verified.' }));
  }

  if (verification.consumed_at) {
    return withCors(jsonResponse(400, { error: 'この認証コードはすでに使用されています。' }));
  }

  if (new Date(verification.expires_at).getTime() < Date.now()) {
    return withCors(jsonResponse(400, { error: 'Verification has expired.' }));
  }

  const { data: createdUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      phone,
      address,
      emergency_contact: emergencyContact || undefined,
    },
  });

  if (createUserError || !createdUser.user) {
    console.error(createUserError);
    return withCors(
      jsonResponse(400, {
        error:
          createUserError?.message === 'A user with this email address has already been registered'
            ? 'このメールアドレスは既に登録されています。'
            : createUserError?.message || '登録に失敗しました。',
      })
    );
  }

  const childPayload = children.map((child) => ({
    user_id: createdUser.user!.id,
    name: child.name,
    birthday: normalizeBirthDate(child.birthDate),
    allergies: Array.isArray(child.allergies) ? child.allergies : [],
    medical_notes: normalizeText(child.medicalInfo) || null,
    photo_url: normalizeText(child.photo) || null,
  }));

  const { error: childrenError } = await supabaseAdmin
    .from('children')
    .insert(childPayload);

  if (childrenError) {
    console.error(childrenError);
    await supabaseAdmin.auth.admin.deleteUser(createdUser.user.id);
    return withCors(jsonResponse(500, { error: 'お子様情報の保存に失敗しました。' }));
  }

  const { error: consumeError } = await supabaseAdmin
    .from('email_verifications')
    .update({
      consumed_at: new Date().toISOString(),
    })
    .eq('id', verification.id);

  if (consumeError) {
    console.error(consumeError);
  }

  return withCors(jsonResponse(200, { success: true, userId: createdUser.user.id }));
});
