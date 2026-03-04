import { Facility } from '@/constants/facilities';
import { prefectures } from '@/constants/regions';

export interface FacilityMapViewport {
  center: { lat: number; lng: number };
  zoom: number;
}

export const DEFAULT_FACILITY_MAP_VIEWPORT: FacilityMapViewport = {
  center: { lat: 35.6762, lng: 139.6503 },
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

function buildDistrictHints(prefectureName: string, districtLabel: string, allowLooseHints: boolean) {
  const normalizedLabel = normalizeText(districtLabel);
  const hints = new Set<string>();

  if (normalizedLabel) {
    hints.add(normalizedLabel);
  }

  if (prefectureName === '北海道' && districtLabel.endsWith('区')) {
    hints.add(normalizeText(`札幌市${districtLabel}`));
  }

  if (/(地区|地域)$/.test(districtLabel)) {
    hints.add(normalizeText(districtLabel.replace(/(地区|地域)$/, '')));
  }

  if (allowLooseHints && prefectureName === '富山県' && districtLabel.startsWith('富山市')) {
    const districtCore = districtLabel
      .replace(/^富山市/, '')
      .replace(/(地区|地域)$/, '');

    if (districtCore) {
      hints.add(normalizeText(`富山市${districtCore}`));
      hints.add(normalizeText(`${districtCore}町`));

      if (districtCore.length >= 3) {
        hints.add(normalizeText(districtCore));
      }
    }
  }

  return Array.from(hints).filter((hint) => hint.length >= 2);
}

function inferDistrictMatch(address: string, preferredPrefecture?: string) {
  const normalizedAddress = normalizeText(address);
  const targetPrefectures = preferredPrefecture
    ? prefectures.filter((prefecture) => prefecture.name === preferredPrefecture)
    : prefectures;

  const allowLooseHints = Boolean(preferredPrefecture);
  let bestMatch:
    | {
        prefecture: string;
        districtId: string;
        score: number;
      }
    | null = null;

  for (const prefecture of targetPrefectures) {
    for (const district of prefecture.districts) {
      const hints = buildDistrictHints(prefecture.name, district.label, allowLooseHints);

      for (const hint of hints) {
        if (!normalizedAddress.includes(hint)) {
          continue;
        }

        if (!bestMatch || hint.length > bestMatch.score) {
          bestMatch = {
            prefecture: prefecture.name,
            districtId: district.id,
            score: hint.length,
          };
        }
      }
    }
  }

  if (!bestMatch) {
    return null;
  }

  return {
    prefecture: bestMatch.prefecture,
    districtId: bestMatch.districtId,
  };
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

  const prefectureNameFromAddress = inferPrefecture(address);
  const districtMatch = inferDistrictMatch(address, prefectureNameFromAddress);
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

  const prefectureName = districtMatch?.prefecture ?? prefectureNameFromAddress;
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
