import { Facility } from '@/constants/facilities';
import { prefectures } from '@/constants/regions';

export interface FacilityMapViewport {
  center: { lat: number; lng: number };
  zoom: number;
}

export const DEFAULT_FACILITY_MAP_VIEWPORT: FacilityMapViewport = {
  center: { lat: 43.0642, lng: 141.3469 },
  zoom: 13,
};

const PREFECTURE_HINTS: Record<string, string[]> = {
  北海道: ['北海道', '札幌市'],
  富山県: ['富山県', '富山市', '高岡市', '魚津市', '氷見市', '滑川市', '黒部市', '砺波市', '小矢部市', '南砺市', '射水市'],
};

function normalizeText(value?: string) {
  return value?.replace(/[ \t\r\n　]+/g, '').trim() ?? '';
}

function averageFacilityCoordinates(facilities: Facility[]) {
  if (facilities.length === 0) {
    return null;
  }

  const totals = facilities.reduce(
    (accumulator, facility) => ({
      lat: accumulator.lat + facility.lat,
      lng: accumulator.lng + facility.lng,
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: totals.lat / facilities.length,
    lng: totals.lng / facilities.length,
  };
}

function inferDistrictMatch(address: string) {
  const normalizedAddress = normalizeText(address);

  for (const prefecture of prefectures) {
    for (const district of prefecture.districts) {
      const normalizedLabel = normalizeText(district.label);

      if (normalizedLabel && normalizedAddress.includes(normalizedLabel)) {
        return {
          prefecture: prefecture.name,
          districtId: district.id,
        };
      }
    }
  }

  return null;
}

function inferPrefecture(address: string) {
  const normalizedAddress = normalizeText(address);

  for (const [prefectureName, hints] of Object.entries(PREFECTURE_HINTS)) {
    if (hints.some((hint) => normalizedAddress.includes(normalizeText(hint)))) {
      return prefectureName;
    }
  }

  return undefined;
}

function zoomForFacilities(facilities: Facility[]) {
  if (facilities.length <= 1) {
    return 14;
  }

  const uniquePrefectures = new Set(
    facilities.map((facility) => facility.prefecture).filter((value): value is string => Boolean(value))
  );
  const uniqueDistricts = new Set(
    facilities
      .map((facility) =>
        facility.prefecture && facility.district ? `${facility.prefecture}:${facility.district}` : null
      )
      .filter((value): value is string => Boolean(value))
  );

  if (uniqueDistricts.size === 1) {
    return 12;
  }

  if (uniquePrefectures.size === 1) {
    const [prefectureName] = Array.from(uniquePrefectures);
    return prefectureName === '富山県' ? 10 : 11;
  }

  return 7;
}

export function getFacilityMapViewportForAddress(
  address: string | undefined,
  facilities: Facility[],
  fallback: FacilityMapViewport = DEFAULT_FACILITY_MAP_VIEWPORT
): FacilityMapViewport {
  if (!address?.trim()) {
    return fallback;
  }

  const districtMatch = inferDistrictMatch(address);
  if (districtMatch) {
    const districtFacilities = facilities.filter(
      (facility) =>
        facility.prefecture === districtMatch.prefecture && facility.district === districtMatch.districtId
    );
    const districtCenter = averageFacilityCoordinates(districtFacilities);

    if (districtCenter) {
      return {
        center: districtCenter,
        zoom: zoomForFacilities(districtFacilities),
      };
    }
  }

  const prefectureName = districtMatch?.prefecture ?? inferPrefecture(address);
  if (!prefectureName) {
    return fallback;
  }

  const prefectureFacilities = facilities.filter((facility) => facility.prefecture === prefectureName);
  const prefectureCenter = averageFacilityCoordinates(prefectureFacilities);

  if (!prefectureCenter) {
    return fallback;
  }

  return {
    center: prefectureCenter,
    zoom: zoomForFacilities(prefectureFacilities),
  };
}

export function getFacilityMapViewportForFacilities(
  facilities: Facility[],
  fallback: FacilityMapViewport = DEFAULT_FACILITY_MAP_VIEWPORT
): FacilityMapViewport {
  const center = averageFacilityCoordinates(facilities);

  if (!center) {
    return fallback;
  }

  return {
    center,
    zoom: zoomForFacilities(facilities),
  };
}
