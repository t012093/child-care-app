import { supabase, SUPABASE_CONFIGURED } from './supabase';

type VerificationPurpose = 'register';

type FunctionErrorPayload = {
  error?: string;
};

export async function extractFunctionError(error: unknown, fallback: string) {
  if (error && typeof error === 'object') {
    const context =
      'context' in error && error.context && typeof error.context === 'object'
        ? error.context
        : undefined;

    if (context && 'json' in context && typeof context.json === 'function') {
      try {
        const payload = (await context.json()) as FunctionErrorPayload;
        if (payload?.error) {
          return payload.error;
        }
      } catch {
        // Ignore JSON parse errors and fall back to generic messages.
      }
    }

    const message =
      'message' in error && typeof error.message === 'string'
        ? error.message
        : undefined;

    if (message) {
      return message;
    }
  }

  return fallback;
}

async function invokeVerificationFunction<T>(
  functionName: string,
  body: Record<string, unknown>
) {
  if (!SUPABASE_CONFIGURED || typeof (supabase as any).functions?.invoke !== 'function') {
    throw new Error('メール認証機能が利用できません。設定を確認してください。');
  }

  const { data, error } = await (supabase as any).functions.invoke(functionName, { body });

  if (error) {
    throw new Error(await extractFunctionError(error, 'メール認証の通信に失敗しました。'));
  }

  return data as T;
}

export async function sendVerificationCode(email: string, purpose: VerificationPurpose = 'register') {
  return invokeVerificationFunction<{ success: boolean }>('send-verification-code', {
    email,
    purpose,
  });
}

export async function verifyVerificationCode(
  email: string,
  code: string,
  purpose: VerificationPurpose = 'register'
) {
  return invokeVerificationFunction<{ verified: boolean }>('verify-verification-code', {
    email,
    code,
    purpose,
  });
}
