/*
  # Articles (column) table

  ホーム画面やコラム一覧で表示する記事データを管理します。
  初期データは既存の mockArticles から移行します。
*/

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('health', 'nutrition', 'parenting', 'education', 'support')),
  excerpt TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  author_role TEXT,
  image TEXT,
  tags TEXT[] DEFAULT ARRAY[]::text[],
  reading_time INTEGER DEFAULT 5,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_is_featured ON articles(is_featured);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Anyone can read published articles
CREATE POLICY "Articles are viewable by everyone"
  ON articles FOR SELECT
  TO public
  USING (true);

-- Only service role can manage articles (no client-side insert/update/delete)

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed initial articles from existing mock data
INSERT INTO articles (title, category, excerpt, content, author_name, author_avatar, author_role, image, tags, reading_time, is_featured, published_at)
VALUES
  (
    '2歳児の成長発達：この時期に見られる変化と親のサポート方法',
    'health',
    '2歳は「魔の2歳児」と呼ばれることもありますが、実は脳の発達が著しい大切な時期です。この時期の特徴と適切なサポート方法をご紹介します。',
    '[{"type":"heading","content":"2歳児の身体的発達"},{"type":"paragraph","content":"2歳になると、歩く・走る・跳ぶといった基本的な運動能力が著しく向上します。また、手先の器用さも発達し、クレヨンで丸を描いたり、大きなボタンを留めたりすることができるようになります。"},{"type":"highlight","content":"この時期は、安全な環境で思い切り体を動かせる機会を作ることが大切です。公園での遊びや、室内での運動遊びを積極的に取り入れましょう。"},{"type":"heading","content":"言葉の発達"},{"type":"paragraph","content":"2歳前半では2語文、2歳後半では3語文以上を話すようになります。語彙も急速に増えます。"},{"type":"heading","content":"「イヤイヤ期」への対応"},{"type":"paragraph","content":"この時期は自我が芽生え、何でも「イヤ！」と言いたがることがあります。これは成長の証です。"}]'::jsonb,
    '山田 花子',
    'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
    '保育士・子育てアドバイザー',
    'https://images.pexels.com/photos/1257110/pexels-photo-1257110.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['2歳児', 'イヤイヤ期', '発達', '身体発達'],
    5, true, '2025-10-01'
  ),
  (
    '離乳食から幼児食へ：1歳半からの食事の進め方',
    'nutrition',
    '離乳食を卒業して幼児食に移行する時期の食事のポイントと、好き嫌いへの対応方法をご紹介します。',
    '[{"type":"heading","content":"幼児食とは"},{"type":"paragraph","content":"幼児食は、1歳半頃から5歳頃までの子どもに適した食事のことです。"},{"type":"heading","content":"栄養バランスのポイント"},{"type":"paragraph","content":"主食・主菜・副菜をバランスよく。1日3食＋おやつ2回が基本です。"}]'::jsonb,
    '佐藤 美咲',
    'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
    '管理栄養士',
    'https://images.pexels.com/photos/1324803/pexels-photo-1324803.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['幼児食', '栄養バランス', '好き嫌い', '食育'],
    6, true, '2025-09-28'
  ),
  (
    'トイレトレーニングの始め方：焦らず進める3つのステップ',
    'parenting',
    'トイレトレーニングを始めるタイミングと、子どものペースに合わせた進め方をご紹介します。',
    '[{"type":"heading","content":"トイレトレーニングを始める目安"},{"type":"paragraph","content":"おしっこの間隔が2時間以上空く、「出た」を伝えられる頃が目安です。"},{"type":"heading","content":"ステップ1：トイレに慣れる"},{"type":"paragraph","content":"まずはトイレという場所に慣れることから始めましょう。"}]'::jsonb,
    '鈴木 太郎',
    'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600',
    '保育士',
    'https://images.pexels.com/photos/4473601/pexels-photo-4473601.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['トイレトレーニング', '自立', '生活習慣', 'ステップ'],
    7, true, '2025-09-25'
  ),
  (
    '雨の日でも楽しめる！室内遊びのアイデア10選',
    'education',
    '雨の日や寒い日でも、家の中で楽しく過ごせる遊びのアイデアをご紹介します。',
    '[{"type":"paragraph","content":"外で遊べない日が続くと、子どもも親もストレスが溜まりがち。でも工夫次第で、室内でも十分に楽しめます！"},{"type":"heading","content":"体を動かす遊び"},{"type":"paragraph","content":"新聞紙を使った遊び、風船バレーボール、かくれんぼなど。"},{"type":"heading","content":"創造力を育む遊び"},{"type":"paragraph","content":"お絵かき、粘土遊び、折り紙、段ボール工作など。"}]'::jsonb,
    '田中 明美',
    'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=600',
    '幼児教育専門家',
    'https://images.pexels.com/photos/3662630/pexels-photo-3662630.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['室内遊び', '創造力', 'アイデア', '雨の日'],
    5, false, '2025-09-22'
  ),
  (
    '札幌市の保育園入園申し込み：スケジュールと必要書類',
    'support',
    '札幌市の認可保育園への入園申し込みについて、スケジュールと必要な書類をまとめました。',
    '[{"type":"heading","content":"入園申し込みのスケジュール"},{"type":"paragraph","content":"札幌市では、4月入園の一斉申し込みは前年の11月頃に行われます。"},{"type":"heading","content":"必要な書類"},{"type":"paragraph","content":"給付認定等申請書、就労証明書、マイナンバー確認書類等が必要です。"}]'::jsonb,
    '高橋 健一',
    'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600',
    '保育コンシェルジュ',
    'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['入園申し込み', '札幌市', '必要書類', 'スケジュール'],
    6, false, '2025-09-20'
  );
