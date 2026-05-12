import { extractFunctionError } from '@/lib/emailVerification';
import { supabase } from '@/lib/supabase';

export type FacilityApprovalDecision = 'approve' | 'reject';

export interface PendingFacility {
  id: string;
  name: string;
  type: string;
  prefecture?: string;
  district?: string;
  address?: string;
  phone?: string;
  email?: string;
  ownerUserId?: string;
  createdAt: string;
}

type PendingFacilityRow = {
  id: string;
  name?: string | null;
  type?: string | null;
  prefecture?: string | null;
  district?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  owner_user_id?: string | null;
  created_at: string;
};

const APPROVAL_ADMIN_USER_ID = process.env.EXPO_PUBLIC_SUPPORT_USER_ID?.trim() || '';

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function mapPendingFacility(row: PendingFacilityRow): PendingFacility {
  return {
    id: row.id,
    name: row.name || '施設名未設定',
    type: row.type || '未設定',
    prefecture: row.prefecture || undefined,
    district: row.district || undefined,
    address: row.address || undefined,
    phone: row.phone || undefined,
    email: row.email || undefined,
    ownerUserId: row.owner_user_id || undefined,
    createdAt: row.created_at,
  };
}

function ensureAdmin(userId: string) {
  if (!isUuid(APPROVAL_ADMIN_USER_ID)) {
    throw new Error(
      '承認管理者ID（EXPO_PUBLIC_SUPPORT_USER_ID）が未設定です。環境変数を確認してください。'
    );
  }

  if (userId !== APPROVAL_ADMIN_USER_ID) {
    throw new Error('承認管理の権限がありません。');
  }
}

export function isFacilityApprovalAdmin(userId?: string | null) {
  if (!userId || !isUuid(APPROVAL_ADMIN_USER_ID)) {
    return false;
  }

  return userId === APPROVAL_ADMIN_USER_ID;
}

export async function fetchPendingFacilities(userId: string) {
  ensureAdmin(userId);

  const { data, error } = await supabase
    .from('facilities')
    .select('id, name, type, prefecture, district, address, phone, email, owner_user_id, created_at')
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message || '承認待ち施設の取得に失敗しました。');
  }

  return ((data as PendingFacilityRow[] | null) || []).map(mapPendingFacility);
}

export async function moderateFacilityApproval(
  userId: string,
  facilityId: string,
  decision: FacilityApprovalDecision
) {
  ensureAdmin(userId);

  if (!isUuid(facilityId)) {
    throw new Error('施設IDが不正です。');
  }

  const targetStatus = decision === 'approve' ? 'active' : 'inactive';

  const { data, error } = await supabase
    .from('facilities')
    .update({ status: targetStatus })
    .eq('id', facilityId)
    .eq('status', 'pending_approval')
    .select('id')
    .maybeSingle();

  if (!error && data) {
    return { id: facilityId, status: targetStatus as 'active' | 'inactive' };
  }

  const supportsFunctions = typeof (supabase as any).functions?.invoke === 'function';
  if (!supportsFunctions) {
    throw new Error('承認更新に失敗しました。Edge Function が利用できません。');
  }

  const { data: functionData, error: functionError } = await (supabase as any).functions.invoke(
    'moderate-facility',
    {
      body: {
        facilityId,
        decision,
      },
    }
  );

  if (functionError) {
    throw new Error(
      await extractFunctionError(
        functionError,
        '承認更新に失敗しました。moderate-facility Function の設定を確認してください。'
      )
    );
  }

  const status = functionData?.status;
  if (status !== 'active' && status !== 'inactive') {
    throw new Error('承認更新に失敗しました。レスポンスが不正です。');
  }

  return { id: facilityId, status };
}
