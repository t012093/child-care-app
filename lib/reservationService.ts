import { Facility } from '@/constants/facilities';
import { User } from '@/lib/AuthContext';
import { getPersistedFacilityDistrict } from '@/lib/facilityDistrict';
import { supabase } from '@/lib/supabase';
import {
  Reservation,
  ReservationStatus,
  ReservationType,
} from '@/types/reservation';

type ReservationRow = {
  id: string;
  facility_id: string;
  facility_name?: string | null;
  child_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: string;
  reservation_type?: ReservationType | null;
  notes?: string | null;
  parent_name?: string | null;
  parent_phone?: string | null;
  parent_email?: string | null;
  child_name?: string | null;
  child_birth_date?: string | null;
  allergies?: string[] | null;
  medical_notes?: string | null;
  special_requests?: string | null;
  confirmed_at?: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export interface ReservationChildInput {
  id: string;
  name: string;
  birthDate: string;
  allergies?: string[];
  medicalInfo?: string;
}

export interface CreateReservationInput {
  facility: Facility;
  user: User;
  child: ReservationChildInput;
  date: string;
  startTime: string;
  endTime: string;
  type: ReservationType;
  notes?: string;
  specialRequests?: string;
}

export interface ParentReservationSummary {
  id: string;
  facilityId: string;
  facilityName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  type: ReservationType;
  childName: string;
}

const FACILITY_TYPE_MAP: Record<string, 'nursery' | 'sick-child' | 'clinic' | 'temporary-care' | 'licensed'> = {
  nursery: 'nursery',
  'sick-child': 'sick-child',
  clinic: 'clinic',
  'temporary-care': 'temporary-care',
  licensed: 'licensed',
  kindergarten: 'licensed',
};

function normalizeBirthDate(value: string) {
  return value.replace(/\//g, '-');
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function buildTimestamp(date: string, time: string) {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

function formatDateKey(timestamp: string) {
  const value = new Date(timestamp);
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTimeKey(timestamp: string) {
  const value = new Date(timestamp);
  const hours = `${value.getHours()}`.padStart(2, '0');
  const minutes = `${value.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
}

function calculateAge(birthDate?: string | null) {
  if (!birthDate) return undefined;

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return undefined;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : undefined;
}

function mapRowStatus(row: ReservationRow): ReservationStatus {
  if (row.check_out_time || row.status === 'completed') {
    return 'checked_out';
  }

  if (row.check_in_time) {
    return 'checked_in';
  }

  if (row.status === 'confirmed' || row.status === 'pending' || row.status === 'cancelled') {
    return row.status;
  }

  return 'pending';
}

function mapReservationRow(row: ReservationRow): Reservation {
  return {
    id: row.id,
    date: formatDateKey(row.start_time),
    startTime: formatTimeKey(row.start_time),
    endTime: formatTimeKey(row.end_time),
    childId: row.child_id,
    childName: row.child_name || 'お子様',
    childAge: calculateAge(row.child_birth_date),
    childBirthDate: row.child_birth_date || undefined,
    parentId: row.user_id,
    parentName: row.parent_name || '保護者',
    parentPhone: row.parent_phone || undefined,
    parentEmail: row.parent_email || undefined,
    status: mapRowStatus(row),
    type: row.reservation_type || '一時預かり',
    allergies: row.allergies || undefined,
    medicalNotes: row.medical_notes || undefined,
    specialRequests: row.special_requests || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
    checkedInAt: row.check_in_time || undefined,
    checkedOutAt: row.check_out_time || undefined,
  };
}

function mapParentReservationSummary(row: ReservationRow): ParentReservationSummary {
  return {
    id: row.id,
    facilityId: row.facility_id,
    facilityName: row.facility_name || '施設',
    date: formatDateKey(row.start_time),
    startTime: formatTimeKey(row.start_time),
    endTime: formatTimeKey(row.end_time),
    status: mapRowStatus(row),
    type: row.reservation_type || '一時預かり',
    childName: row.child_name || 'お子様',
  };
}

async function ensureFacilityRecord(facility: Facility) {
  if (isUuid(facility.id)) {
    return {
      id: facility.id,
      name: facility.name,
    };
  }

  const { data: existingFacilities, error: selectError } = await supabase
    .from('facilities')
    .select('*')
    .eq('name', facility.name)
    .eq('address', facility.address);

  if (selectError) {
    throw new Error(selectError.message || '施設情報の確認に失敗しました');
  }

  const existing = existingFacilities?.[0];
  if (existing?.id) {
    return {
      id: existing.id,
      name: existing.name || facility.name,
    };
  }

  const { data: insertedFacility, error: insertError } = await supabase
    .from('facilities')
    .insert({
      name: facility.name,
      type: FACILITY_TYPE_MAP[facility.type] || 'nursery',
      address: facility.address,
      lat: facility.lat,
      lng: facility.lng,
      phone: facility.phone || null,
      email: facility.email || null,
      description: facility.description || null,
      rating: facility.rating || 0,
      images: facility.imageUrl ? [facility.imageUrl] : [],
      category: facility.type,
      stock: 0,
      featured: false,
      district: getPersistedFacilityDistrict(facility.district),
      opening_hours: facility.openingHours || null,
      capacity: facility.capacity || null,
      age_range: facility.ageRange || null,
      has_lunch: facility.hasLunch || false,
      provider: facility.provider || null,
      status: 'pending_approval',
    })
    .select()
    .single();

  if (insertError || !insertedFacility) {
    throw new Error(insertError?.message || '施設情報の保存に失敗しました');
  }

  return {
    id: insertedFacility.id,
    name: insertedFacility.name || facility.name,
  };
}

async function ensureChildRecord(userId: string, child: ReservationChildInput) {
  const normalizedBirthDate = normalizeBirthDate(child.birthDate);

  if (isUuid(child.id)) {
    return {
      id: child.id,
      birthday: normalizedBirthDate,
    };
  }

  const { data: existingChildren, error: selectError } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', userId)
    .eq('name', child.name)
    .eq('birthday', normalizedBirthDate);

  if (selectError) {
    throw new Error(selectError.message || 'お子様情報の確認に失敗しました');
  }

  const existing = existingChildren?.[0];
  if (existing?.id) {
    return {
      id: existing.id,
      birthday: existing.birthday || normalizedBirthDate,
    };
  }

  const { data: insertedChild, error: insertError } = await supabase
    .from('children')
    .insert({
      user_id: userId,
      name: child.name,
      birthday: normalizedBirthDate,
      allergies: child.allergies || [],
      medical_notes: child.medicalInfo || null,
    })
    .select()
    .single();

  if (insertError || !insertedChild) {
    throw new Error(insertError?.message || 'お子様情報の保存に失敗しました');
  }

  return {
    id: insertedChild.id,
    birthday: insertedChild.birthday || normalizedBirthDate,
  };
}

export async function createReservation(input: CreateReservationInput) {
  if (!isUuid(input.user.id)) {
    throw new Error('ゲストログインでは予約できません。実アカウントでログインしてください。');
  }

  const facilityRecord = await ensureFacilityRecord(input.facility);
  const childRecord = await ensureChildRecord(input.user.id, input.child);

  const { data, error } = await supabase
    .from('reservations')
    .insert({
      facility_id: facilityRecord.id,
      facility_name: input.facility.name,
      child_id: childRecord.id,
      user_id: input.user.id,
      start_time: buildTimestamp(input.date, input.startTime),
      end_time: buildTimestamp(input.date, input.endTime),
      status: 'pending',
      reservation_type: input.type,
      notes: input.notes?.trim() || null,
      parent_name: input.user.name || '保護者',
      parent_phone: input.user.parentInfo?.phone || null,
      parent_email: input.user.email || null,
      child_name: input.child.name,
      child_birth_date: childRecord.birthday,
      allergies: input.child.allergies || [],
      medical_notes: input.child.medicalInfo || null,
      special_requests: input.specialRequests?.trim() || null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || '予約の作成に失敗しました');
  }

  return mapReservationRow(data as ReservationRow);
}

export async function fetchAllReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select('*');

  if (error) {
    throw new Error(error.message || '予約一覧の取得に失敗しました');
  }

  return ((data as ReservationRow[] | null) || [])
    .map(mapReservationRow)
    .sort((left, right) =>
      `${left.date} ${left.startTime}`.localeCompare(`${right.date} ${right.startTime}`)
    );
}

export async function fetchFacilityIdsForStaffUser(userId: string) {
  if (!isUuid(userId)) {
    return [];
  }

  const [staffResponse, ownerResponse] = await Promise.all([
    supabase
      .from('facility_staff')
      .select('facility_id, status')
      .eq('user_id', userId),
    supabase
      .from('facilities')
      .select('id')
      .eq('owner_user_id', userId),
  ]);

  if (staffResponse.error) {
    throw new Error(staffResponse.error.message || '施設所属情報の取得に失敗しました');
  }

  if (ownerResponse.error) {
    throw new Error(ownerResponse.error.message || '施設オーナー情報の取得に失敗しました');
  }

  const staffFacilityIds = ((staffResponse.data as {
    facility_id?: string | null;
    status?: string | null;
  }[] | null) || [])
    .filter((row) => (row.status || 'active') !== 'inactive')
    .map((row) => row.facility_id)
    .filter((value): value is string => typeof value === 'string' && isUuid(value));

  const ownerFacilityIds = ((ownerResponse.data as { id?: string | null }[] | null) || [])
    .map((row) => row.id)
    .filter((value): value is string => typeof value === 'string' && isUuid(value));

  return Array.from(new Set([...staffFacilityIds, ...ownerFacilityIds]));
}

export async function fetchReservationsByFacilityIds(facilityIds: string[]) {
  const scopedFacilityIds = Array.from(new Set(facilityIds.filter((id) => isUuid(id))));
  if (scopedFacilityIds.length === 0) {
    return [];
  }

  const responses = await Promise.all(
    scopedFacilityIds.map((facilityId) =>
      supabase
        .from('reservations')
        .select('*')
        .eq('facility_id', facilityId)
    )
  );

  const failedResponse = responses.find((response) => response.error);
  if (failedResponse?.error) {
    throw new Error(failedResponse.error.message || '施設予約一覧の取得に失敗しました');
  }

  const mergedRows = responses.flatMap((response) => (response.data as ReservationRow[] | null) || []);
  const uniqueRows = Array.from(
    new Map(mergedRows.map((row) => [row.id, row])).values()
  );

  return uniqueRows
    .map(mapReservationRow)
    .sort((left, right) =>
      `${left.date} ${left.startTime}`.localeCompare(`${right.date} ${right.startTime}`)
    );
}

export async function fetchParentReservations(userId: string) {
  if (!isUuid(userId)) {
    return [];
  }

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message || '予約一覧の取得に失敗しました');
  }

  return ((data as ReservationRow[] | null) || [])
    .map(mapParentReservationSummary)
    .sort((left, right) =>
      `${left.date} ${left.startTime}`.localeCompare(`${right.date} ${right.startTime}`)
    );
}

export async function updateReservationStatusRecord(
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
  extra: Record<string, unknown> = {}
) {
  const { error } = await supabase
    .from('reservations')
    .update({
      status,
      ...extra,
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message || '予約更新に失敗しました');
  }
}

export async function markReservationCheckedIn(id: string) {
  return updateReservationStatusRecord(id, 'confirmed', {
    check_in_time: new Date().toISOString(),
  });
}

export async function markReservationCheckedOut(id: string) {
  return updateReservationStatusRecord(id, 'completed', {
    check_out_time: new Date().toISOString(),
  });
}
