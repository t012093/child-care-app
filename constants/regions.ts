// 地域マスターデータ

export interface Prefecture {
  id: string;
  name: string;
  districts: District[];
}

export interface District {
  id: string;
  label: string;
}

// 都道府県マスター
export const prefectures: Prefecture[] = [
  {
    id: 'hokkaido',
    name: '北海道',
    districts: [
      { id: 'central', label: '中央区' },
      { id: 'north', label: '北区' },
      { id: 'east', label: '東区' },
      { id: 'white-stone', label: '白石区' },
      { id: 'atsubetsu', label: '厚別区' },
      { id: 'toyohira', label: '豊平区' },
      { id: 'kiyota', label: '清田区' },
      { id: 'south', label: '南区' },
      { id: 'west', label: '西区' },
      { id: 'teine', label: '手稲区' },
    ],
  },
  {
    id: 'toyama',
    name: '富山県',
    districts: [
      // 富山市の7つの行政地区
      { id: 'toyama-中央', label: '富山市中央地区' },
      { id: 'toyama-東部', label: '富山市東部地区' },
      { id: 'toyama-西部', label: '富山市西部地区' },
      { id: 'toyama-南部', label: '富山市南部地区' },
      { id: 'toyama-北部', label: '富山市北部地区' },
      { id: 'toyama-和合', label: '富山市和合地区' },
      { id: 'toyama-呉羽', label: '富山市呉羽地区' },
      { id: 'toyama-水橋', label: '富山市水橋地区' },
      // 合併地域
      { id: 'toyama-大沢野', label: '富山市大沢野地域' },
      { id: 'toyama-八尾', label: '富山市八尾地域' },
      { id: 'toyama-婦中', label: '富山市婦中地域' },
      // その他の主要市町村
      { id: 'takaoka', label: '高岡市' },
      { id: 'uozu', label: '魚津市' },
      { id: 'himi', label: '氷見市' },
      { id: 'namerikawa', label: '滑川市' },
      { id: 'kurobe', label: '黒部市' },
      { id: 'tonami', label: '砺波市' },
      { id: 'oyabe', label: '小矢部市' },
      { id: 'nanto', label: '南砺市' },
      { id: 'imizu', label: '射水市' },
    ],
  },
];

// 都道府県IDから都道府県名を取得
export const getPrefectureName = (prefectureId: string): string => {
  const prefecture = prefectures.find(p => p.id === prefectureId);
  return prefecture ? prefecture.name : '';
};

// 都道府県IDと市区町村IDから市区町村名を取得
export const getDistrictLabel = (prefectureId: string, districtId: string): string => {
  const prefecture = prefectures.find(p => p.id === prefectureId);
  if (!prefecture) return '';

  const district = prefecture.districts.find(d => d.id === districtId);
  return district ? district.label : '';
};

// 都道府県IDから市区町村リストを取得
export const getDistrictsByPrefecture = (prefectureId: string): District[] => {
  const prefecture = prefectures.find(p => p.id === prefectureId);
  return prefecture ? prefecture.districts : [];
};
