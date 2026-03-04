export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type VerificationPurpose = 'register';

export function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

export function getNumberEnv(name: string, fallback: number) {
  const raw = Deno.env.get(name);
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function validateEmail(email: string) {
  return EMAIL_REGEX.test(email);
}

export function generateVerificationCode() {
  const value = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return value.toString().padStart(6, '0');
}

export async function hashVerificationCode(
  email: string,
  purpose: VerificationPurpose,
  code: string
) {
  const pepper = Deno.env.get('EMAIL_VERIFICATION_SECRET') || 'child-care-app';
  const source = `${email}:${purpose}:${code}:${pepper}`;
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(source)
  );

  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}

export function buildVerificationEmailHtml(code: string) {
  return `
    <div style="background:#f4f7f5;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px;border:1px solid #d9e3df;">
        <div style="font-size:24px;font-weight:700;color:#11332B;margin-bottom:8px;">ほいポチ</div>
        <div style="font-size:16px;line-height:1.7;margin-bottom:24px;">
          新規登録のメール認証コードです。<br />
          下の6桁コードをアプリ画面に入力してください。
        </div>
        <div style="font-size:36px;font-weight:700;letter-spacing:0.18em;text-align:center;color:#5EB5A8;background:#EDF7F4;border-radius:16px;padding:20px 12px;margin-bottom:24px;">
          ${code}
        </div>
        <div style="font-size:13px;line-height:1.7;color:#64748b;">
          有効期限は10分です。<br />
          心当たりがない場合は、このメールを破棄してください。
        </div>
      </div>
    </div>
  `;
}
