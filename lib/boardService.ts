import { supabase } from './supabase';

export interface BoardPost {
  id: string;
  title: string;
  summary: string;
  body: string;
  createdAt: string;
  isUnread: boolean;
  senderType: 'parent' | 'facility';
}

type MessageRow = {
  id: string;
  sender_type: 'parent' | 'facility';
  recipient_id: string;
  subject?: string | null;
  body: string;
  is_read?: boolean | null;
  created_at: string;
};

export const DEMO_BOARD_POSTS: BoardPost[] = [
  {
    id: 'demo-board-1',
    title: '園からのお知らせ',
    summary: '3/10(火) は避難訓練を実施します。',
    body: '3/10(火) は避難訓練を実施します。登園時刻に変更はありません。動きやすい服装での登園をお願いします。',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isUnread: true,
    senderType: 'facility',
  },
  {
    id: 'demo-board-2',
    title: '給食メニュー更新',
    summary: '今週の給食メニューを更新しました。',
    body: '今週の給食メニューを更新しました。アレルギー対応メニューについては個別にご確認ください。',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    isUnread: false,
    senderType: 'facility',
  },
];

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function extractTitle(subject: string | null | undefined, body: string) {
  const trimmedSubject = (subject || '').trim();
  if (trimmedSubject) {
    return trimmedSubject;
  }

  const firstLine = body
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine || 'お知らせ';
}

function extractSummary(body: string) {
  const normalized = body.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return '本文がありません';
  }
  return normalized.length > 80 ? `${normalized.slice(0, 80)}...` : normalized;
}

function mapMessageRow(row: MessageRow): BoardPost {
  return {
    id: row.id,
    title: extractTitle(row.subject, row.body),
    summary: extractSummary(row.body),
    body: row.body,
    createdAt: row.created_at,
    isUnread: !(row.is_read || false),
    senderType: row.sender_type,
  };
}

export async function fetchBoardPosts(userId: string, limit = 30) {
  if (!isUuid(userId)) {
    return [] as BoardPost[];
  }

  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_type, recipient_id, subject, body, is_read, created_at')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message || '掲示板データの取得に失敗しました。');
  }

  return ((data as MessageRow[] | null) || []).map(mapMessageRow);
}

export async function fetchBoardPostById(postId: string, userId: string) {
  if (!isUuid(postId) || !isUuid(userId)) {
    return null as BoardPost | null;
  }

  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_type, recipient_id, subject, body, is_read, created_at')
    .eq('id', postId)
    .eq('recipient_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || '掲示板詳細の取得に失敗しました。');
  }

  if (!data) {
    return null;
  }

  return mapMessageRow(data as MessageRow);
}

export async function markBoardPostAsRead(postId: string, userId: string) {
  if (!isUuid(postId) || !isUuid(userId)) {
    return;
  }

  const { error } = await supabase
    .from('messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .eq('recipient_id', userId);

  if (error) {
    throw new Error(error.message || '既読更新に失敗しました。');
  }
}
