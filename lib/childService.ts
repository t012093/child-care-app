import { supabase } from './supabase';

export interface ChildProfile {
  id: string;
  userId: string;
  name: string;
  birthday: string;
  allergies: string[];
  medicalInfo?: string;
  photoUrl?: string;
}

type ChildRow = {
  id: string;
  user_id: string;
  name: string;
  birthday: string;
  allergies?: string[] | null;
  medical_notes?: string | null;
  photo_url?: string | null;
};

interface UpdateChildProfileInput {
  name: string;
  birthday: string;
  allergies: string[];
  medicalInfo?: string;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function normalizeDateInput(value: string) {
  return value.trim().replace(/\//g, '-');
}

function mapChildRow(row: ChildRow): ChildProfile {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    birthday: row.birthday,
    allergies: Array.isArray(row.allergies) ? row.allergies : [],
    medicalInfo: row.medical_notes || undefined,
    photoUrl: row.photo_url || undefined,
  };
}

export async function fetchChildById(childId: string, userId: string) {
  if (!isUuid(childId) || !isUuid(userId)) {
    return null as ChildProfile | null;
  }

  const { data, error } = await supabase
    .from('children')
    .select('id, user_id, name, birthday, allergies, medical_notes, photo_url')
    .eq('id', childId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'お子様情報の取得に失敗しました。');
  }

  if (!data) {
    return null;
  }

  return mapChildRow(data as ChildRow);
}

export async function updateChildProfile(
  childId: string,
  userId: string,
  input: UpdateChildProfileInput
) {
  if (!isUuid(childId) || !isUuid(userId)) {
    throw new Error('お子様IDが不正です。');
  }

  const name = input.name.trim();
  const birthday = normalizeDateInput(input.birthday);

  if (!name) {
    throw new Error('お子様の名前を入力してください。');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
    throw new Error('生年月日は YYYY-MM-DD 形式で入力してください。');
  }

  const allergies = (input.allergies || [])
    .map((item) => item.trim())
    .filter(Boolean);
  const medicalNotes = input.medicalInfo?.trim() || null;

  const { data, error } = await supabase
    .from('children')
    .update({
      name,
      birthday,
      allergies,
      medical_notes: medicalNotes,
    })
    .eq('id', childId)
    .eq('user_id', userId)
    .select('id, user_id, name, birthday, allergies, medical_notes, photo_url')
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'お子様情報の更新に失敗しました。');
  }

  if (!data) {
    throw new Error('更新対象のお子様が見つかりませんでした。');
  }

  return mapChildRow(data as ChildRow);
}
