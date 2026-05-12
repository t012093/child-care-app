import { supabase, SUPABASE_CONFIGURED } from '@/lib/supabase';
import {
  mockArticles,
  type Article,
  type ArticleCategory,
  type ArticleContent,
} from '@/constants/columnData';

type ArticleRow = {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: ArticleContent[];
  author_name: string;
  author_avatar?: string | null;
  author_role?: string | null;
  image?: string | null;
  tags?: string[] | null;
  reading_time?: number | null;
  is_featured?: boolean | null;
  published_at: string;
};

function mapRowToArticle(row: ArticleRow): Article {
  const publishedAt = row.published_at.slice(0, 10);
  return {
    id: row.id,
    title: row.title,
    category: row.category as ArticleCategory,
    excerpt: row.excerpt,
    content: Array.isArray(row.content) ? row.content : [],
    author: {
      name: row.author_name,
      avatar: row.author_avatar || '',
      role: row.author_role || '',
    },
    image: row.image || '',
    tags: row.tags || [],
    publishedAt,
    readingTime: row.reading_time || 5,
    isFeatured: row.is_featured || false,
    date: publishedAt.replace(/-/g, '.'),
  };
}

export async function fetchArticles(): Promise<Article[]> {
  if (!SUPABASE_CONFIGURED) {
    return mockArticles;
  }

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.warn('Failed to fetch articles from DB, falling back to mock:', error.message);
    return mockArticles;
  }

  const rows = (data as ArticleRow[] | null) || [];
  return rows.length > 0 ? rows.map(mapRowToArticle) : mockArticles;
}

export async function fetchArticleById(id: string): Promise<Article | null> {
  if (!SUPABASE_CONFIGURED) {
    return mockArticles.find((a) => a.id === id) || null;
  }

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    // Fallback: try mock by id
    return mockArticles.find((a) => a.id === id) || null;
  }

  return mapRowToArticle(data as ArticleRow);
}

export async function fetchFeaturedArticles(limit = 3): Promise<Article[]> {
  if (!SUPABASE_CONFIGURED) {
    return mockArticles.filter((a) => a.isFeatured).slice(0, limit);
  }

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('Failed to fetch featured articles, falling back to mock:', error.message);
    return mockArticles.filter((a) => a.isFeatured).slice(0, limit);
  }

  const rows = (data as ArticleRow[] | null) || [];
  return rows.length > 0 ? rows.map(mapRowToArticle) : mockArticles.filter((a) => a.isFeatured).slice(0, limit);
}
