import { supabase } from '@/lib/supabase';

type FacilityStaffRow = {
  facility_id?: string | null;
};

type FacilityProfileRow = {
  id: string;
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  opening_hours?: {
    weekday?: string;
    saturday?: string;
  } | null;
  capacity?: number | null;
};

export interface FacilityProfile {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  openingHoursWeekday: string;
  openingHoursSaturday: string;
  capacity: number | null;
}

export interface UpdateFacilityProfileInput {
  name: string;
  address: string;
  phone: string;
  openingHoursWeekday: string;
  openingHoursSaturday: string;
  capacity: number | null;
}

function mapFacilityProfile(row: FacilityProfileRow): FacilityProfile {
  return {
    id: row.id,
    name: row.name || '',
    address: row.address || '',
    phone: row.phone || '',
    email: row.email || '',
    openingHoursWeekday: row.opening_hours?.weekday || '',
    openingHoursSaturday: row.opening_hours?.saturday || '',
    capacity: typeof row.capacity === 'number' ? row.capacity : null,
  };
}

function buildOpeningHours(weekday: string, saturday: string) {
  const weekdayValue = weekday.trim();
  const saturdayValue = saturday.trim();

  if (!weekdayValue && !saturdayValue) {
    return null;
  }

  return {
    weekday: weekdayValue || saturdayValue,
    saturday: saturdayValue || weekdayValue,
  };
}

export async function fetchFacilityProfileForUser(userId: string) {
  const { data: staffRows, error: staffError } = await supabase
    .from('facility_staff')
    .select('facility_id')
    .eq('user_id', userId);

  if (staffError) {
    throw new Error(staffError.message || '所属施設情報の取得に失敗しました。');
  }

  const facilityId = ((staffRows as FacilityStaffRow[] | null) || [])
    .map((row) => row.facility_id)
    .find((value): value is string => typeof value === 'string' && value.length > 0);

  if (!facilityId) {
    throw new Error('所属施設が見つかりません。施設登録・所属設定を確認してください。');
  }

  const { data: facilityRow, error: facilityError } = await supabase
    .from('facilities')
    .select('id, name, address, phone, email, opening_hours, capacity')
    .eq('id', facilityId)
    .single();

  if (facilityError || !facilityRow) {
    throw new Error(facilityError?.message || '施設情報の取得に失敗しました。');
  }

  return mapFacilityProfile(facilityRow as FacilityProfileRow);
}

export async function updateFacilityProfile(
  facilityId: string,
  input: UpdateFacilityProfileInput
) {
  const payload = {
    name: input.name.trim(),
    address: input.address.trim(),
    phone: input.phone.trim() || null,
    opening_hours: buildOpeningHours(input.openingHoursWeekday, input.openingHoursSaturday),
    capacity: input.capacity,
  };

  const { data, error } = await supabase
    .from('facilities')
    .update(payload)
    .eq('id', facilityId)
    .select('id, name, address, phone, email, opening_hours, capacity')
    .single();

  if (error || !data) {
    throw new Error(error?.message || '施設情報の更新に失敗しました。');
  }

  return mapFacilityProfile(data as FacilityProfileRow);
}
