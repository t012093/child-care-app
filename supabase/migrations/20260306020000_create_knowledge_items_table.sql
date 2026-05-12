/*
  # Knowledge items table

  お役立ち情報ページで表示するナレッジ記事を管理します。
  初期データは既存のインライン knowledgeData から移行します。
*/

CREATE TABLE IF NOT EXISTS knowledge_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('subsidy', 'health', 'education', 'community', 'work', 'facility')),
  image_url TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_items_category ON knowledge_items(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_published_at ON knowledge_items(published_at DESC);

ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "Knowledge items are viewable by everyone"
  ON knowledge_items FOR SELECT
  TO public
  USING (true);

DROP TRIGGER IF EXISTS update_knowledge_items_updated_at ON knowledge_items;
CREATE TRIGGER update_knowledge_items_updated_at
  BEFORE UPDATE ON knowledge_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed initial data from existing inline knowledgeData
INSERT INTO knowledge_items (title, description, category, image_url, published_at)
VALUES
  (
    '保育料の補助金制度について',
    '国や自治体が提供する保育料の補助金制度を詳しく解説します。申請方法や必要書類もご案内。',
    'subsidy',
    'https://images.unsplash.com/photo-1554224311-beee415c201f?w=800&h=600&fit=crop',
    '2025-01-10'
  ),
  (
    '子供の発達段階と健康チェック',
    '0歳から6歳までの子供の発達段階と、各年齢で注意すべき健康ポイントをまとめました。',
    'health',
    'https://images.unsplash.com/photo-1587393855524-087f83d95bc9?w=800&h=600&fit=crop',
    '2025-01-08'
  ),
  (
    '幼児教育の基礎知識',
    'モンテッソーリ教育、シュタイナー教育など、様々な教育法の特徴と選び方をご紹介。',
    'education',
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
    '2025-01-05'
  ),
  (
    '地域の子育てコミュニティ',
    'お住まいの地域で参加できる子育てサークルやイベント情報をお届けします。',
    'community',
    'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&h=600&fit=crop',
    '2025-01-03'
  ),
  (
    '仕事と育児の両立支援制度',
    '育児休業、時短勤務、在宅勤務など、働くパパママを支援する制度を解説します。',
    'work',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
    '2025-01-01'
  ),
  (
    '保育施設の種類と選び方',
    '認可保育園、認定こども園、企業主導型保育など、各施設の特徴と選び方のポイント。',
    'facility',
    'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=600&fit=crop',
    '2024-12-28'
  ),
  (
    '予防接種スケジュールガイド',
    '0歳から必要な予防接種の種類とスケジュールを分かりやすく説明します。',
    'health',
    'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&h=600&fit=crop',
    '2024-12-25'
  ),
  (
    '子供の食育と栄養管理',
    '離乳食から幼児食まで、年齢に応じた食育のポイントとレシピをご紹介。',
    'health',
    'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&h=600&fit=crop',
    '2024-12-20'
  ),
  (
    '児童手当と医療費助成制度',
    '児童手当の申請方法や、自治体ごとに異なる医療費助成制度について詳しく解説。',
    'subsidy',
    'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?w=800&h=600&fit=crop',
    '2024-12-15'
  );
