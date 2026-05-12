import { Facility, sampleFacilities } from '@/constants/facilities';
import { prefectures } from '@/constants/regions';
import { supabase } from '@/lib/supabase';

type FacilityCatalogRow = {
  id?: string | null;
  name?: string | null;
  type?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  rating?: number | string | null;
  images?: string[] | null;
  prefecture?: string | null;
  district?: string | null;
  opening_hours?: {
    weekday?: string;
    saturday?: string;
  } | null;
  capacity?: number | null;
  age_range?: string | null;
  has_lunch?: boolean | null;
  provider?: string | null;
  pdf_template_url?: string | null;
  created_at?: string | null;
  status?: string | null;
};

const DEFAULT_FACILITY_IMAGE_URL =
  'https://images.pexels.com/photos/296301/pexels-photo-296301.jpeg?auto=compress&cs=tinysrgb&w=600';

function normalizeFacilityType(type?: string | null): Facility['type'] {
  switch (type) {
    case 'temporary-care':
    case 'licensed':
    case 'nursery':
    case 'sick-child':
    case 'clinic':
    case 'kindergarten':
      return type;
    default:
      return 'nursery';
  }
}

function parseRating(value: number | string | null | undefined) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function resolveImageUrl(images: string[] | null | undefined) {
  if (!Array.isArray(images)) {
    return DEFAULT_FACILITY_IMAGE_URL;
  }

  const firstImage = images.find((image) => typeof image === 'string' && image.trim().length > 0);
  return firstImage || DEFAULT_FACILITY_IMAGE_URL;
}

function resolvePrefectureFromDistrict(district?: string | null) {
  if (!district) return undefined;

  const matchedPrefecture = prefectures.find((prefecture) =>
    prefecture.districts.some((value) => value.id === district)
  );

  return matchedPrefecture?.name;
}

function isPublicFacilityStatus(status?: string | null) {
  return status !== 'inactive' && status !== 'pending_approval';
}

function mapFacilityRow(row: FacilityCatalogRow): Facility | null {
  if (!row.id || !row.name || !row.address) {
    return null;
  }

  if (typeof row.lat !== 'number' || typeof row.lng !== 'number') {
    return null;
  }

  const openingWeekday = row.opening_hours?.weekday?.trim();
  const openingSaturday = row.opening_hours?.saturday?.trim();
  const openingHours =
    openingWeekday || openingSaturday
      ? {
          weekday: openingWeekday || openingSaturday || '',
          saturday: openingSaturday || openingWeekday || '',
        }
      : undefined;

  return {
    id: row.id,
    name: row.name,
    type: normalizeFacilityType(row.type),
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    phone: row.phone || undefined,
    email: row.email || undefined,
    description: row.description || undefined,
    rating: parseRating(row.rating),
    imageUrl: resolveImageUrl(row.images),
    prefecture: row.prefecture || resolvePrefectureFromDistrict(row.district),
    district: row.district || undefined,
    openingHours,
    capacity: typeof row.capacity === 'number' ? row.capacity : undefined,
    ageRange: row.age_range || undefined,
    hasLunch: typeof row.has_lunch === 'boolean' ? row.has_lunch : undefined,
    provider: row.provider || undefined,
    pdfTemplateUrl: row.pdf_template_url || undefined,
    createdAt: row.created_at || undefined,
  };
}

export async function fetchPublicFacilities() {
  const { data, error } = await supabase
    .from('facilities')
    .select('*');

  if (error) {
    throw new Error(error.message || '施設一覧の取得に失敗しました。');
  }

  const facilities = ((data as FacilityCatalogRow[] | null) || [])
    .filter((row) => isPublicFacilityStatus(row.status))
    .map(mapFacilityRow)
    .filter((facility): facility is Facility => facility !== null);

  return facilities.sort((left, right) => left.name.localeCompare(right.name, 'ja'));
}

export async function fetchFacilityById(id: string) {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('id', id)
    .single();

  if (!error && data) {
    const row = data as FacilityCatalogRow;
    if (!isPublicFacilityStatus(row.status)) {
      return null;
    }
    return mapFacilityRow(row);
  }

  // DB miss — fall back to sample data for demo/mock mode
  const staticFacility = sampleFacilities.find((facility) => facility.id === id);
  if (staticFacility) {
    return staticFacility;
  }

  if (error && (error as { code?: string }).code !== 'PGRST116') {
    throw new Error(error.message || '施設情報の取得に失敗しました。');
  }

  return null;
}
