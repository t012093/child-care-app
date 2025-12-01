/**
 * フィルター機能のテストスクリプト
 */

// PDFファイルのrequireをモック
const mockRequire = (path: string) => path;
(global as any).require = mockRequire;

import { sampleFacilities, filterFacilities } from './constants/facilities';

console.log('🧪 フィルター機能テスト開始\n');

// テスト1: 全施設数確認
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('テスト1: 全施設数');
console.log(`全施設数: ${sampleFacilities.length}件`);

const toyamaFacilities = sampleFacilities.filter(f => f.prefecture === '富山県');
console.log(`富山県の施設: ${toyamaFacilities.length}件`);

const hokkaidoFacilities = sampleFacilities.filter(f => f.prefecture === '北海道');
console.log(`北海道の施設: ${hokkaidoFacilities.length}件`);

// テスト2: 富山県フィルター
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('テスト2: 富山県でフィルタリング');
const toyamaFiltered = filterFacilities(sampleFacilities, {
  types: [],
  prefectures: ['toyama'],
  districts: [],
  hasSaturday: null,
  capacityRange: null,
});
console.log(`フィルター結果: ${toyamaFiltered.length}件`);
console.log('施設リスト:');
toyamaFiltered.forEach(f => {
  console.log(`  - [${f.id}] ${f.name} (${f.type}, ${f.district})`);
});

// テスト3: 幼稚園フィルター
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('テスト3: 富山県の幼稚園');
const kindergartens = filterFacilities(sampleFacilities, {
  types: ['kindergarten'],
  prefectures: ['toyama'],
  districts: [],
  hasSaturday: null,
  capacityRange: null,
});
console.log(`フィルター結果: ${kindergartens.length}件`);
kindergartens.forEach(f => {
  console.log(`  - [${f.id}] ${f.name} (校区: ${f.schoolDistrict}, 地区: ${f.district})`);
});

// テスト4: 認可保育所フィルター
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('テスト4: 富山県の認可保育所');
const licensed = filterFacilities(sampleFacilities, {
  types: ['licensed'],
  prefectures: ['toyama'],
  districts: [],
  hasSaturday: null,
  capacityRange: null,
});
console.log(`フィルター結果: ${licensed.length}件`);
licensed.forEach(f => {
  console.log(`  - [${f.id}] ${f.name} (${f.district}, 定員: ${f.capacity}名)`);
});

// テスト5: 地区フィルター（中央地区）
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('テスト5: 富山市中央地区');
const centralDistrict = filterFacilities(sampleFacilities, {
  types: [],
  prefectures: ['toyama'],
  districts: ['toyama-中央'],
  hasSaturday: null,
  capacityRange: null,
});
console.log(`フィルター結果: ${centralDistrict.length}件`);
centralDistrict.forEach(f => {
  console.log(`  - [${f.id}] ${f.name} (${f.type})`);
});

// テスト6: 地区フィルター（北部地区）
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('テスト6: 富山市北部地区');
const northDistrict = filterFacilities(sampleFacilities, {
  types: [],
  prefectures: ['toyama'],
  districts: ['toyama-北部'],
  hasSaturday: null,
  capacityRange: null,
});
console.log(`フィルター結果: ${northDistrict.length}件`);
northDistrict.forEach(f => {
  console.log(`  - [${f.id}] ${f.name} (${f.type})`);
});

// テスト7: 複数地区フィルター
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('テスト7: 中央・北部・呉羽地区');
const multiDistricts = filterFacilities(sampleFacilities, {
  types: [],
  prefectures: ['toyama'],
  districts: ['toyama-中央', 'toyama-北部', 'toyama-呉羽'],
  hasSaturday: null,
  capacityRange: null,
});
console.log(`フィルター結果: ${multiDistricts.length}件`);
multiDistricts.forEach(f => {
  console.log(`  - [${f.id}] ${f.name} (${f.district})`);
});

// テスト8: 定員規模フィルター
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('テスト8: 富山県の大規模施設（定員31名以上）');
const largeFacilities = filterFacilities(sampleFacilities, {
  types: [],
  prefectures: ['toyama'],
  districts: [],
  hasSaturday: null,
  capacityRange: 'large',
});
console.log(`フィルター結果: ${largeFacilities.length}件`);
largeFacilities.forEach(f => {
  console.log(`  - [${f.id}] ${f.name} (定員: ${f.capacity}名)`);
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ テスト完了！');
