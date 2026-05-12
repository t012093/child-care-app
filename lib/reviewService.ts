import { supabase, SUPABASE_CONFIGURED } from '@/lib/supabase';

export interface CommunityReview {
  id: string;
  userName: string;
  facilityName: string;
  rating: number;
  comment: string;
  location: string;
}

const mockReviews: CommunityReview[] = [
  {
    id: '1',
    userName: '田中さん',
    facilityName: 'さくら保育園',
    rating: 5,
    comment: '先生が優しくて安心して預けられます！息子も毎回楽しみにしています。',
    location: '渋谷区',
  },
  {
    id: '2',
    userName: '佐藤さん',
    facilityName: 'ひまわり託児所',
    rating: 4,
    comment: '駅近で便利！施設も清潔でとても良いです。',
    location: '新宿区',
  },
  {
    id: '3',
    userName: '鈴木さん',
    facilityName: 'コスモス幼児園',
    rating: 5,
    comment: '急な予約にも対応してくれて助かりました。',
    location: '世田谷区',
  },
];

export async function fetchRecentReviews(limit = 3): Promise<CommunityReview[]> {
  if (!SUPABASE_CONFIGURED) {
    return mockReviews;
  }

  const { data, error } = await supabase
    .from('facility_reviews')
    .select(`
      id,
      rating,
      comment,
      facilities ( name, district )
    `)
    .not('comment', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('Failed to fetch reviews from DB, falling back to mock:', error.message);
    return mockReviews;
  }

  const rows = (data as any[] | null) || [];
  if (rows.length === 0) return mockReviews;

  return rows.map((row) => ({
    id: row.id,
    userName: '利用者',
    facilityName: row.facilities?.name || '',
    rating: row.rating,
    comment: row.comment || '',
    location: row.facilities?.district || '',
  }));
}
