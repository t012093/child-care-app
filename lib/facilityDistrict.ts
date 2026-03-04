const PERSISTED_FACILITY_DISTRICTS = new Set([
  'central',
  'north',
  'east',
  'white-stone',
  'atsubetsu',
  'toyohira',
  'kiyota',
  'south',
  'west',
  'teine',
]);

export function getPersistedFacilityDistrict(district?: string | null) {
  if (!district) return null;
  return PERSISTED_FACILITY_DISTRICTS.has(district) ? district : null;
}
