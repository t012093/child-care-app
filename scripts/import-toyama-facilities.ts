/**
 * 富山市保育施設Excelデータインポートスクリプト
 * Excelファイルから施設データを読み込み、Facility型に変換
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface ExcelRow {
  地域?: string;
  公私立?: string;
  区域?: string;
  '小学\n校区'?: string;
  'No.　　施設名'?: string;
  定員?: number;
  '入所可能\n年齢'?: string;
  所在地?: string;
  '電話番号\n（※１）'?: string;
  開所時間?: string;
  一時保育?: string;
  休日一時保育?: string;
  休日保育?: string;
  年末保育?: string;
  体調不良児?: string;
}

interface FacilityData {
  id: string;
  name: string;
  type: 'licensed' | 'temporary-care' | 'kindergarten';
  address: string;
  lat?: number;
  lng?: number;
  phone?: string;
  provider?: string;
  description?: string;
  rating: number;
  imageUrl: string;
  prefecture: string;
  district?: string;
  schoolDistrict?: string;
  openingHours?: {
    weekday: string;
    saturday: string;
  };
  capacity?: number;
  ageRange?: string;
  hasLunch: boolean;
}

// Google Maps Geocoding API で座標取得
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn('⚠️  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY が設定されていません。概算座標を使用します。');
    return null;
  }

  const fullAddress = address.startsWith('富山') ? address : `富山県富山市${address}`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    fullAddress
  )}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: Math.round(location.lat * 1000) / 1000,
        lng: Math.round(location.lng * 1000) / 1000,
      };
    } else {
      console.log(`❌ Geocoding failed for ${address}: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error(`Error geocoding ${address}:`, error);
    return null;
  }
}

// Excelファイルを読み込み
function readExcelFile(filePath: string): any[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  return data;
}

// 施設タイプを判定
function determineFacilityType(row: any): 'licensed' | 'temporary-care' | 'kindergarten' {
  const name = row['No.　　施設名'] || row['施設名'] || '';
  const pubPriv = row['公私立'] || '';

  if (name.includes('幼稚園')) {
    return 'kindergarten';
  }
  if (pubPriv.includes('地域型')) {
    return 'temporary-care';
  }
  return 'licensed';
}

// 年齢範囲を変換
function convertAgeRange(ageStr: string | undefined): string {
  if (!ageStr) return '産休明けから就学前まで';
  if (ageStr.includes('8週')) return '産休明けから就学前まで';
  if (ageStr.includes('6')) return '生後６か月から就学前まで';
  if (ageStr.includes('1歳')) return '1歳児から就学前まで';
  if (ageStr.includes('3歳')) return '3歳児から就学前まで';
  return ageStr + 'から就学前まで';
}

// 電話番号をフォーマット
function formatPhone(phone: string | number | undefined): string {
  if (!phone) return '';
  const phoneStr = String(phone).replace(/[^\d-]/g, '');
  if (phoneStr.startsWith('076')) {
    return `076-${phoneStr.substring(3)}`;
  }
  if (!phoneStr.startsWith('0')) {
    return `076-${phoneStr}`;
  }
  return phoneStr;
}

// 富山市の概算座標（座標取得失敗時のフォールバック）
function getToyamaCityCenterCoords(): { lat: number; lng: number } {
  return { lat: 36.695, lng: 137.213 };
}

// メイン処理
async function main() {
  console.log('🚀 富山市保育施設データのインポートを開始します...\n');

  const file1 = '/Users/naoyakusunoki/Downloads/富山市内保育施設一覧いくさん保育.xlsx';
  const file2 = '/Users/naoyakusunoki/Downloads/認可保育所方後連携方認定こども園.xlsx';

  // ファイル1を読み込み
  console.log('📂 ファイル1を読み込み中...');
  const data1 = readExcelFile(file1);
  console.log(`   ✅ ${data1.length}件のデータを読み込みました\n`);

  const facilities: FacilityData[] = [];
  let idCounter = 318; // 幼稚園の次から開始

  // データ処理（ヘッダー行より後のデータ）
  // 12行目（インデックス11）がヘッダー、13行目から実データ
  const limitedData = data1.slice(12, 32); // 最初の20件をテスト

  for (const row of limitedData) {
    // __EMPTY_4 が施設名、__EMPTY_7 が住所
    const facilityName = row['__EMPTY_4'];
    const address = row['__EMPTY_7'];
    const no = row['__EMPTY_3'];

    // データが不完全な行、または土曜日データ（定員が空）はスキップ
    if (!facilityName || !address || typeof facilityName !== 'string' || !row['__EMPTY_5']) {
      continue;
    }

    console.log(`📍 処理中: ${facilityName}`);

    // 座標取得
    let coords = await geocodeAddress(address);
    if (!coords) {
      coords = getToyamaCityCenterCoords();
      console.log(`   ⚠️  概算座標を使用: (${coords.lat}, ${coords.lng})`);
    } else {
      console.log(`   ✅ 座標取得成功: (${coords.lat}, ${coords.lng})`);
    }

    const pubPriv = row['__EMPTY'] || '';
    const district = row['__EMPTY_1'] || '';
    const schoolDist = row['__EMPTY_2'] || '';

    const facility: FacilityData = {
      id: String(idCounter++),
      name: facilityName,
      type: determineFacilityType(row),
      address: address.startsWith('富山') ? address : `富山県富山市${address}`,
      lat: coords.lat,
      lng: coords.lng,
      phone: formatPhone(row['__EMPTY_8']), // 電話番号
      provider: pubPriv.includes('公立') ? '富山市' : '社会福祉法人',
      description: `${district}地区の保育施設。`,
      rating: 4.5,
      imageUrl:
        'https://images.pexels.com/photos/1001914/pexels-photo-1001914.jpeg?auto=compress&cs=tinysrgb&w=600',
      prefecture: '富山県',
      district: district ? `toyama-${district}` : 'toyama-city',
      schoolDistrict: schoolDist,
      capacity: row['__EMPTY_5'] || undefined, // 定員
      ageRange: convertAgeRange(row['__EMPTY_6']), // 入所可能年齢
      hasLunch: true,
    };

    facilities.push(facility);

    // API制限を避けるため待機
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ ${facilities.length}件の施設データを生成しました`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // TypeScriptファイルとして出力
  const outputPath = path.join(__dirname, '../constants/toyama-facilities-generated.ts');
  const tsCode = `/**
 * 富山市保育施設データ（自動生成）
 * 生成日時: ${new Date().toLocaleString('ja-JP')}
 * 元データ: 富山市オープンデータ
 */

import { Facility } from './facilities';

export const toyamaFacilities: Facility[] = ${JSON.stringify(facilities, null, 2)};
`;

  fs.writeFileSync(outputPath, tsCode, 'utf-8');
  console.log(`📄 ファイルを出力しました: ${outputPath}\n`);

  // サマリー表示
  console.log('📊 生成データサマリー:');
  const typeCount = facilities.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(typeCount).forEach(([type, count]) => {
    console.log(`   - ${type}: ${count}件`);
  });

  console.log(`\n合計定員: ${facilities.reduce((sum, f) => sum + (f.capacity || 0), 0)}名`);
}

main().catch(console.error);
