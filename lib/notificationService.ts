import { supabase } from './supabase';

export type HomeNotificationType = 'message' | 'reminder' | 'info';

export interface HomeNotification {
  id: string;
  type: HomeNotificationType;
  title: string;
  description: string;
  isUnread: boolean;
  createdAt: string;
}

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  is_read?: boolean | null;
  created_at: string;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function mapNotificationType(type: string): HomeNotificationType {
  if (type === 'message_received') {
    return 'message';
  }

  if (
    type === 'reservation_created' ||
    type === 'reservation_confirmed' ||
    type === 'reservation_cancelled'
  ) {
    return 'reminder';
  }

  return 'info';
}

function mapNotificationRow(row: NotificationRow): HomeNotification {
  return {
    id: row.id,
    type: mapNotificationType(row.type),
    title: row.title,
    description: row.body,
    isUnread: !(row.is_read || false),
    createdAt: row.created_at,
  };
}

export async function fetchUserNotifications(userId: string, limit = 20) {
  if (!isUuid(userId)) {
    return [] as HomeNotification[];
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('id, user_id, type, title, body, is_read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message || '通知の取得に失敗しました。');
  }

  return ((data as NotificationRow[] | null) || []).map(mapNotificationRow);
}
