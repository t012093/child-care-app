/**
 * 富山市幼稚園データ座標取得スクリプト
 * Google Maps Geocoding API を使用して住所から緯度・経度を自動取得
 */

// 幼稚園データ（富山市オープンデータより）
interface KindergartenRawData {
  id: string;
  name: string;
  address: string;
  phone: string;
  schoolDistrict: string;
  capacity: number;
  websiteUrl?: string;
}

const toyamaKindergartens: KindergartenRawData[] = [
  {
    id: '310',
    name: '富山市立月岡幼稚園',
    address: '富山県富山市上千俵町508',
    phone: '076-429-4959',
    schoolDistrict: '月岡',
    capacity: 105,
    websiteUrl: 'https://swa.city.toyama.toyama.jp/swas/index.php?frame=webindex&page=ePage&enc=ca03eba42a20feab',
  },
  {
    id: '311',
    name: '富山市立速星幼稚園',
    address: '富山県富山市婦中町速星706-1',
    phone: '076-465-2183',
    schoolDistrict: '速星',
    capacity: 95,
    websiteUrl: 'https://swa.city.toyama.toyama.jp/swas/index.php?frame=webindex&page=ePage&enc=9d0a30e0e2e3d2ce',
  },
  {
    id: '312',
    name: '富山市立水橋幼稚園',
    address: '富山県富山市水橋舘町390-13',
    phone: '076-478-0568',
    schoolDistrict: '水橋中部',
    capacity: 105,
    websiteUrl: 'https://swa.city.toyama.toyama.jp/swas/index.php?frame=webindex&page=ePage&enc=0e0b50e9f3e1d4d0',
  },
  {
    id: '313',
    name: '富山大学教育学部附属幼稚園',
    address: '富山県富山市五艘1300',
    phone: '076-445-2812',
    schoolDistrict: '桜谷',
    capacity: 160,
    websiteUrl: 'https://www.fuzoku.u-toyama.ac.jp/fuzoku/fuzoku-yotien/',
  },
  {
    id: '314',
    name: 'あさひ幼稚園',
    address: '富山県富山市東石金町8-28',
    phone: '076-425-1184',
    schoolDistrict: '東部',
    capacity: 25,
  },
  {
    id: '315',
    name: '愛護幼稚園',
    address: '富山県富山市山王町4-49',
    phone: '076-423-4342',
    schoolDistrict: '中央',
    capacity: 15,
  },
  {
    id: '316',
    name: '五番町幼稚園',
    address: '富山県富山市古鍛冶町2-22',
    phone: '076-421-8759',
    schoolDistrict: '中央',
    capacity: 60,
  },
  {
    id: '317',
    name: '富山カワイ幼稚園',
    address: '富山県富山市向新庄町五丁目5-6',
    phone: '076-451-5884',
    schoolDistrict: '新庄北',
    capacity: 150,
  },
];

// Google Maps Geocoding API を使用して座標を取得
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('Error: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is not set');
    return null;
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: Math.round(location.lat * 1000) / 1000, // 小数点第3位まで
        lng: Math.round(location.lng * 1000) / 1000,
      };
    } else {
      console.error(`Geocoding failed for ${address}: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error(`Error geocoding ${address}:`, error);
    return null;
  }
}

// Facility オブジェクト形式で出力
async function generateFacilityData() {
  console.log('🚀 富山市幼稚園データの座標取得を開始します...\n');

  const facilities = [];

  for (const kindergarten of toyamaKindergartens) {
    console.log(`📍 取得中: ${kindergarten.name} (${kindergarten.address})`);

    const coords = await geocodeAddress(kindergarten.address);

    if (coords) {
      console.log(`   ✅ 座標取得成功: (${coords.lat}, ${coords.lng})\n`);

      facilities.push({
        id: kindergarten.id,
        name: kindergarten.name,
        type: 'kindergarten',
        address: kindergarten.address,
        lat: coords.lat,
        lng: coords.lng,
        phone: kindergarten.phone,
        provider: kindergarten.name.includes('市立')
          ? '富山市'
          : kindergarten.name.includes('大学')
          ? '国立大学法人富山大学'
          : `学校法人${kindergarten.name.replace('幼稚園', '')}`,
        description: `${kindergarten.schoolDistrict}校区の幼稚園。`,
        rating: 4.5,
        imageUrl:
          'https://images.pexels.com/photos/1001914/pexels-photo-1001914.jpeg?auto=compress&cs=tinysrgb&w=600',
        prefecture: '富山県',
        district: `toyama-${kindergarten.schoolDistrict}`,
        schoolDistrict: kindergarten.schoolDistrict,
        capacity: kindergarten.capacity,
        ageRange: '3歳児から就学前まで',
        hasLunch: true,
        websiteUrl: kindergarten.websiteUrl,
      });
    } else {
      console.log(`   ❌ 座標取得失敗\n`);
    }

    // API制限を避けるため、少し待機
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 座標取得完了！以下のデータをコピーしてください:\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // TypeScript 形式で出力
  facilities.forEach(facility => {
    console.log(`  {`);
    console.log(`    id: '${facility.id}',`);
    console.log(`    name: '${facility.name}',`);
    console.log(`    type: '${facility.type}',`);
    console.log(`    address: '${facility.address}',`);
    console.log(`    lat: ${facility.lat},`);
    console.log(`    lng: ${facility.lng},`);
    console.log(`    phone: '${facility.phone}',`);
    console.log(`    provider: '${facility.provider}',`);
    console.log(`    description: '${facility.description}',`);
    console.log(`    rating: ${facility.rating},`);
    console.log(`    imageUrl: '${facility.imageUrl}',`);
    console.log(`    prefecture: '${facility.prefecture}',`);
    console.log(`    district: '${facility.district}',`);
    console.log(`    schoolDistrict: '${facility.schoolDistrict}',`);
    if (facility.websiteUrl) {
      console.log(`    websiteUrl: '${facility.websiteUrl}',`);
    }
    console.log(`    capacity: ${facility.capacity},`);
    console.log(`    ageRange: '${facility.ageRange}',`);
    console.log(`    hasLunch: ${facility.hasLunch},`);
    console.log(`  },`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 合計 ${facilities.length} 件のデータを生成しました`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// スクリプト実行
generateFacilityData().catch(console.error);
