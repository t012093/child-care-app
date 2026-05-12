import { supabase, SUPABASE_CONFIGURED } from '@/lib/supabase';

export type KnowledgeCategory = 'subsidy' | 'health' | 'education' | 'community' | 'work' | 'facility';

export interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  category: KnowledgeCategory;
  imageUrl: string;
  date: string;
}

type KnowledgeRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url?: string | null;
  published_at: string;
};

const mockKnowledgeData: KnowledgeItem[] = [
  {
    id: '1',
    title: '保育料の補助金制度について',
    description: '国や自治体が提供する保育料の補助金制度を詳しく解説します。申請方法や必要書類もご案内。',
    category: 'subsidy',
    imageUrl: 'https://images.unsplash.com/photo-1554224311-beee415c201f?w=800&h=600&fit=crop',
    date: '2025-01-10',
  },
  {
    id: '2',
    title: '子供の発達段階と健康チェック',
    description: '0歳から6歳までの子供の発達段階と、各年齢で注意すべき健康ポイントをまとめました。',
    category: 'health',
    imageUrl: 'https://images.unsplash.com/photo-1587393855524-087f83d95bc9?w=800&h=600&fit=crop',
    date: '2025-01-08',
  },
  {
    id: '3',
    title: '幼児教育の基礎知識',
    description: 'モンテッソーリ教育、シュタイナー教育など、様々な教育法の特徴と選び方をご紹介。',
    category: 'education',
    imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
    date: '2025-01-05',
  },
  {
    id: '4',
    title: '地域の子育てコミュニティ',
    description: 'お住まいの地域で参加できる子育てサークルやイベント情報をお届けします。',
    category: 'community',
    imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&h=600&fit=crop',
    date: '2025-01-03',
  },
  {
    id: '5',
    title: '仕事と育児の両立支援制度',
    description: '育児休業、時短勤務、在宅勤務など、働くパパママを支援する制度を解説します。',
    category: 'work',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
    date: '2025-01-01',
  },
  {
    id: '6',
    title: '保育施設の種類と選び方',
    description: '認可保育園、認定こども園、企業主導型保育など、各施設の特徴と選び方のポイント。',
    category: 'facility',
    imageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=600&fit=crop',
    date: '2024-12-28',
  },
  {
    id: '7',
    title: '予防接種スケジュールガイド',
    description: '0歳から必要な予防接種の種類とスケジュールを分かりやすく説明します。',
    category: 'health',
    imageUrl: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&h=600&fit=crop',
    date: '2024-12-25',
  },
  {
    id: '8',
    title: '子供の食育と栄養管理',
    description: '離乳食から幼児食まで、年齢に応じた食育のポイントとレシピをご紹介。',
    category: 'health',
    imageUrl: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&h=600&fit=crop',
    date: '2024-12-20',
  },
  {
    id: '9',
    title: '児童手当と医療費助成制度',
    description: '児童手当の申請方法や、自治体ごとに異なる医療費助成制度について詳しく解説。',
    category: 'subsidy',
    imageUrl: 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?w=800&h=600&fit=crop',
    date: '2024-12-15',
  },
];

function mapRowToKnowledgeItem(row: KnowledgeRow): KnowledgeItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category as KnowledgeCategory,
    imageUrl: row.image_url || '',
    date: row.published_at.slice(0, 10),
  };
}

export async function fetchKnowledgeItems(): Promise<KnowledgeItem[]> {
  if (!SUPABASE_CONFIGURED) {
    return mockKnowledgeData;
  }

  const { data, error } = await supabase
    .from('knowledge_items')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.warn('Failed to fetch knowledge items from DB, falling back to mock:', error.message);
    return mockKnowledgeData;
  }

  const rows = (data as KnowledgeRow[] | null) || [];
  return rows.length > 0 ? rows.map(mapRowToKnowledgeItem) : mockKnowledgeData;
}
