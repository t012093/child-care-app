import { prefectures } from '@/constants/regions';

const PERSISTED_FACILITY_DISTRICTS = new Set(
  prefectures.flatMap((prefecture) => prefecture.districts.map((district) => district.id))
);

export function getPersistedFacilityDistrict(district?: string | null) {
  if (!district) return null;
  return PERSISTED_FACILITY_DISTRICTS.has(district) ? district : null;
}
