import { Application } from '@/components/ApplicationCard';
import { User } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

export interface ApplicationFormData {
  facilityName: string;
  applicationType: '入園申請' | '一時預かり申請' | 'その他';
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  childName: string;
  childBirthDate: string;
  childGender: '男' | '女';
  desiredStartDate: string;
  notes: string;
}

export interface SavedApplication extends Application {
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  childBirthDate: string;
  childGender: '男' | '女';
  desiredStartDate: string;
  notes: string;
  createdAtIso: string;
  updatedAtIso: string;
}

type ApplicationRow = {
  id: string;
  user_id: string;
  facility_name?: string | null;
  application_type?: string | null;
  status?: string | null;
  parent_name?: string | null;
  parent_phone?: string | null;
  parent_email?: string | null;
  address?: string | null;
  child_name?: string | null;
  child_birth_date?: string | null;
  child_gender?: string | null;
  desired_start_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
};

interface CreateApplicationInput {
  user: User;
  formData: ApplicationFormData;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeDateInput(value: string) {
  const normalized = value.trim().replace(/\//g, '-');
  if (!normalized) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error('日付は YYYY-MM-DD 形式で入力してください。');
  }
  return normalized;
}

function formatDate(isoLike: string) {
  if (!isoLike) return '-';
  return isoLike.split('T')[0];
}

function mapApplicationType(type?: string | null): SavedApplication['applicationType'] {
  if (type === '入園申請' || type === '一時預かり申請' || type === 'その他') {
    return type;
  }
  return 'その他';
}

function mapApplicationStatus(status?: string | null): SavedApplication['status'] {
  return status === 'submitted' ? 'submitted' : 'draft';
}

function mapApplicationRow(row: ApplicationRow): SavedApplication {
  const createdAtIso = row.created_at;
  const updatedAtIso = row.updated_at || row.created_at;

  return {
    id: row.id,
    facilityName: row.facility_name || '',
    applicationType: mapApplicationType(row.application_type),
    status: mapApplicationStatus(row.status),
    createdAt: formatDate(createdAtIso),
    childName: row.child_name || undefined,
    parentName: row.parent_name || '',
    parentPhone: row.parent_phone || '',
    parentEmail: row.parent_email || '',
    address: row.address || '',
    childBirthDate: row.child_birth_date || '',
    childGender: row.child_gender === '女' ? '女' : '男',
    desiredStartDate: row.desired_start_date || '',
    notes: row.notes || '',
    createdAtIso,
    updatedAtIso,
  };
}

export async function createApplicationDraft(input: CreateApplicationInput) {
  const { user, formData } = input;

  if (!isUuid(user.id)) {
    throw new Error('ゲストユーザーでは申請書を保存できません。');
  }

  const payload = {
    user_id: user.id,
    facility_name: formData.facilityName.trim(),
    application_type: formData.applicationType,
    status: 'draft',
    parent_name: formData.parentName.trim() || null,
    parent_phone: formData.parentPhone.trim() || null,
    parent_email: formData.parentEmail.trim() || null,
    address: formData.address.trim() || null,
    child_name: formData.childName.trim() || null,
    child_birth_date: normalizeDateInput(formData.childBirthDate),
    child_gender: formData.childGender,
    desired_start_date: normalizeDateInput(formData.desiredStartDate),
    notes: formData.notes.trim() || null,
    form_data: {
      ...formData,
      childBirthDate: normalizeDateInput(formData.childBirthDate),
      desiredStartDate: normalizeDateInput(formData.desiredStartDate),
    },
  };

  const { data, error } = await supabase
    .from('applications')
    .insert(payload)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || '申請書の保存に失敗しました。');
  }

  return mapApplicationRow(data as ApplicationRow);
}

export async function fetchParentApplications(userId: string) {
  if (!isUuid(userId)) {
    return [] as SavedApplication[];
  }

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || '申請書一覧の取得に失敗しました。');
  }

  return ((data as ApplicationRow[] | null) || []).map(mapApplicationRow);
}

export async function fetchApplicationById(applicationId: string, userId: string) {
  if (!isUuid(applicationId) || !isUuid(userId)) {
    return null;
  }

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || '申請書データの取得に失敗しました。');
  }

  if (!data) {
    return null;
  }

  return mapApplicationRow(data as ApplicationRow);
}

