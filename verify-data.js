/**
 * 富山県施設データの検証スクリプト（Node.js互換）
 * PDFファイルをrequireせずに、データ構造のみを検証
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 富山県施設データ検証開始\n');

// facilities.tsファイルを読み込み
const facilitiesPath = path.join(__dirname, 'constants', 'facilities.ts');
const content = fs.readFileSync(facilitiesPath, 'utf-8');

// 富山県の施設を正規表現で抽出
const toyamaMatches = content.matchAll(/{\s*id:\s*'(\d+)',\s*name:\s*'([^']+)',\s*type:\s*'([^']+)',[\s\S]*?prefecture:\s*'富山県',[\s\S]*?}/g);

const toyamaFacilities = [];
for (const match of toyamaMatches) {
  const fullText = match[0];
  const id = match[1];
  const name = match[2];
  const type = match[3];

  // districtを抽出
  const districtMatch = fullText.match(/district:\s*'([^']+)'/);
  const district = districtMatch ? districtMatch[1] : null;

  // capacityを抽出
  const capacityMatch = fullText.match(/capacity:\s*(\d+)/);
  const capacity = capacityMatch ? parseInt(capacityMatch[1]) : null;

  // schoolDistrictを抽出
  const schoolDistrictMatch = fullText.match(/schoolDistrict:\s*'([^']+)'/);
  const schoolDistrict = schoolDistrictMatch ? schoolDistrictMatch[1] : null;

  toyamaFacilities.push({
    id,
    name,
    type,
    district,
    capacity,
    schoolDistrict
  });
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ 富山県の施設: ${toyamaFacilities.length}件`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// タイプ別集計
const byType = toyamaFacilities.reduce((acc, f) => {
  acc[f.type] = (acc[f.type] || 0) + 1;
  return acc;
}, {});

console.log('📊 施設タイプ別:');
Object.entries(byType).forEach(([type, count]) => {
  const typeLabel = {
    'kindergarten': '幼稚園',
    'licensed': '認可保育所',
    'temporary-care': '一時保育',
    'nursery': '保育園'
  }[type] || type;
  console.log(`  - ${typeLabel}: ${count}件`);
});

// 地区別集計
const byDistrict = toyamaFacilities.reduce((acc, f) => {
  if (f.district) {
    acc[f.district] = (acc[f.district] || 0) + 1;
  }
  return acc;
}, {});

console.log('\n📍 地区別:');
Object.entries(byDistrict).forEach(([district, count]) => {
  console.log(`  - ${district}: ${count}件`);
});

// ID範囲確認
const ids = toyamaFacilities.map(f => parseInt(f.id)).sort((a, b) => a - b);
console.log(`\n🔢 ID範囲: ${ids[0]} ～ ${ids[ids.length - 1]}`);

// 幼稚園（ID 310-317）の確認
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🏫 幼稚園（ID 310-317）:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const kindergartens = toyamaFacilities.filter(f => f.type === 'kindergarten');
kindergartens.forEach(f => {
  console.log(`  [${f.id}] ${f.name}`);
  console.log(`      地区: ${f.district}, 校区: ${f.schoolDistrict}, 定員: ${f.capacity}名`);
});

// 公立保育所（ID 318-327）の確認
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🏢 公立保育所（ID 318-327）:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const licensed = toyamaFacilities.filter(f => f.type === 'licensed' && parseInt(f.id) >= 318 && parseInt(f.id) <= 327);
licensed.forEach(f => {
  console.log(`  [${f.id}] ${f.name}`);
  console.log(`      地区: ${f.district}, 定員: ${f.capacity}名`);
});

// regions.tsから地区マスターを読み込み
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🗺️  地区マスター検証:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const regionsPath = path.join(__dirname, 'constants', 'regions.ts');
const regionsContent = fs.readFileSync(regionsPath, 'utf-8');

// 富山県の地区定義を抽出
const toyamaDistrictsMatch = regionsContent.match(/id:\s*'toyama',[\s\S]*?districts:\s*\[([\s\S]*?)\]/);
if (toyamaDistrictsMatch) {
  const districtsDef = toyamaDistrictsMatch[1];
  const districtMatches = districtsDef.matchAll(/{\s*id:\s*'([^']+)',\s*label:\s*'([^']+)'/g);

  const definedDistricts = [];
  for (const match of districtMatches) {
    definedDistricts.push({ id: match[1], label: match[2] });
  }

  console.log(`定義済み地区: ${definedDistricts.length}件`);
  definedDistricts.forEach(d => {
    console.log(`  - ${d.id}: ${d.label}`);
  });

  // 使用されている地区がすべて定義されているか確認
  console.log('\n🔍 地区ID整合性チェック:');
  const usedDistricts = new Set(toyamaFacilities.map(f => f.district).filter(Boolean));
  const definedDistrictIds = new Set(definedDistricts.map(d => d.id));

  let hasError = false;
  usedDistricts.forEach(districtId => {
    if (!definedDistrictIds.has(districtId)) {
      console.log(`  ❌ 未定義の地区ID: ${districtId}`);
      hasError = true;
    }
  });

  if (!hasError) {
    console.log('  ✅ すべての地区IDが正しく定義されています');
  }
}

// 定員の集計
const totalCapacity = toyamaFacilities.reduce((sum, f) => sum + (f.capacity || 0), 0);
console.log(`\n📊 合計定員: ${totalCapacity}名`);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ データ検証完了！');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📝 次のステップ:');
console.log('  1. ブラウザで http://localhost:8081 を開く');
console.log('  2. BROWSER_TEST.md の手順に従ってテストを実施');
console.log('  3. フィルター機能が正しく動作することを確認\n');
