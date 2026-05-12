#!/usr/bin/env node

/**
 * Verifies applications table end-to-end with authenticated user token.
 * Flow:
 * 1. sign up disposable user
 * 2. insert one application row as that user
 * 3. list applications
 * 4. fetch inserted application by id
 */

import { randomUUID } from 'node:crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL?.trim() || '';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD?.trim() || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL/EXPO_PUBLIC_SUPABASE_URL or SUPABASE_ANON_KEY/EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const now = Date.now();
const email = `codex.app.smoke.${now}@mailinator.com`;
const password = `T3st!${randomUUID()}Aa`;

async function requestJson(url, init = {}) {
  const response = await fetch(url, init);
  const raw = await response.text();
  let body;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    body = raw;
  }
  return { ok: response.ok, status: response.status, body };
}

async function getAccessToken() {
  if (TEST_USER_EMAIL && TEST_USER_PASSWORD) {
    const login = await requestJson(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }),
    });

    if (!login.ok || !login.body?.access_token || !login.body?.user?.id) {
      throw new Error(
        `login failed with TEST_USER_EMAIL/TEST_USER_PASSWORD: ${login.status} ${JSON.stringify(login.body)}`
      );
    }

    return { accessToken: login.body.access_token, userId: login.body.user.id, mode: 'login' };
  }

  const signup = await requestJson(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!signup.ok) {
    if (signup.status === 429) {
      throw new Error(
        `signup failed: 429 email rate limit exceeded. Set TEST_USER_EMAIL / TEST_USER_PASSWORD and retry.`
      );
    }
    throw new Error(`signup failed: ${signup.status} ${JSON.stringify(signup.body)}`);
  }

  const signupToken = signup.body?.access_token;
  const signupUserId = signup.body?.user?.id;
  if (signupToken && signupUserId) {
    return { accessToken: signupToken, userId: signupUserId, mode: 'signup' };
  }

  const login = await requestJson(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!login.ok || !login.body?.access_token || !login.body?.user?.id) {
    throw new Error(
      `login failed after signup: ${login.status} ${JSON.stringify(login.body)}`
    );
  }

  return { accessToken: login.body.access_token, userId: login.body.user.id, mode: 'signup+login' };
}

async function main() {
  console.log('[1/4] get authenticated user token');
  if (!TEST_USER_EMAIL) {
    console.log(`[info] trying disposable signup: ${email}`);
  } else {
    console.log(`[info] trying password login with TEST_USER_EMAIL=${TEST_USER_EMAIL}`);
  }

  const { accessToken, userId, mode } = await getAccessToken();
  console.log(`[ok] auth user id: ${userId} (${mode})`);

  const insertPayload = {
    user_id: userId,
    facility_name: 'テスト保育園',
    application_type: '入園申請',
    status: 'draft',
    parent_name: 'テスト 太郎',
    parent_phone: '09012345678',
    parent_email: TEST_USER_EMAIL || email,
    address: '東京都千代田区1-1-1',
    child_name: 'テスト 花子',
    child_birth_date: '2021-04-01',
    child_gender: '女',
    desired_start_date: '2026-04-01',
    notes: 'API e2e smoke',
    form_data: {
      source: 'scripts/verify_applications_api_e2e.mjs',
      created_at: new Date().toISOString(),
    },
  };

  console.log('[2/4] insert application');
  const insert = await requestJson(`${SUPABASE_URL}/rest/v1/applications`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(insertPayload),
  });

  if (!insert.ok || !Array.isArray(insert.body) || !insert.body[0]?.id) {
    throw new Error(`insert failed: ${insert.status} ${JSON.stringify(insert.body)}`);
  }

  const insertedId = insert.body[0].id;
  console.log(`[ok] inserted id: ${insertedId}`);

  console.log('[3/4] list applications');
  const list = await requestJson(
    `${SUPABASE_URL}/rest/v1/applications?select=id,facility_name,application_type,status&order=created_at.desc`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!list.ok || !Array.isArray(list.body)) {
    throw new Error(`list failed: ${list.status} ${JSON.stringify(list.body)}`);
  }

  const foundInList = list.body.some((row) => row.id === insertedId);
  if (!foundInList) {
    throw new Error(`list missing inserted id: ${insertedId}`);
  }
  console.log(`[ok] list count for user: ${list.body.length}`);

  console.log('[4/4] fetch application by id');
  const detail = await requestJson(
    `${SUPABASE_URL}/rest/v1/applications?id=eq.${insertedId}&select=id,facility_name,application_type,parent_name,child_name`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!detail.ok || !Array.isArray(detail.body) || detail.body.length !== 1) {
    throw new Error(`detail failed: ${detail.status} ${JSON.stringify(detail.body)}`);
  }

  console.log('[ok] detail fetched:', detail.body[0]);
  console.log('\nPASS applications API e2e smoke');
}

main().catch((error) => {
  console.error('\nFAIL applications API e2e smoke');
  console.error(error?.message || error);
  process.exit(1);
});
