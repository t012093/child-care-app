/**
 * 予約管理システムの型定義
 */

export type ReservationStatus = 'confirmed' | 'pending' | 'cancelled' | 'checked_in' | 'checked_out';

export type ReservationType = '一時預かり' | '見学' | '相談' | 'イベント' | 'その他';

/**
 * 予約の基本情報
 */
export interface Reservation {
  id: string;

  // 日時情報
  date: string; // YYYY-MM-DD形式
  startTime: string; // HH:mm形式
  endTime: string; // HH:mm形式

  // 子供情報
  childId: string;
  childName: string;
  childAge?: number;
  childBirthDate?: string; // YYYY-MM-DD形式

  // 保護者情報
  parentId: string;
  parentName: string;
  parentPhone?: string;
  parentEmail?: string;

  // 予約情報
  status: ReservationStatus;
  type: ReservationType;

  // 追加情報
  allergies?: string[];
  medicalNotes?: string;
  specialRequests?: string;
  notes?: string;

  // メタ情報
  createdAt: string;
  updatedAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
}

/**
 * 予約のフィルタ条件
 */
export interface ReservationFilter {
  dateRange?: {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
  };
  status?: ReservationStatus[];
  type?: ReservationType[];
  searchQuery?: string; // 子供名、保護者名、電話番号などで検索
}

/**
 * 予約のソート条件
 */
export type ReservationSortKey = 'date' | 'childName' | 'parentName' | 'status' | 'type' | 'createdAt';

export interface ReservationSort {
  key: ReservationSortKey;
  order: 'asc' | 'desc';
}

/**
 * カレンダービューの種類
 */
export type CalendarViewType = 'month' | 'week' | 'day' | 'list';

/**
 * カレンダーの日付情報
 */
export interface CalendarDate {
  date: string; // YYYY-MM-DD
  reservations: Reservation[];
  isToday: boolean;
  isSelected: boolean;
  isOtherMonth?: boolean;
}

/**
 * ステータスの表示情報
 */
export interface StatusConfig {
  label: string;
  color: string;
  backgroundColor: string;
}

/**
 * ステータスごとの設定マップ
 */
export const STATUS_CONFIG: Record<ReservationStatus, StatusConfig> = {
  confirmed: {
    label: '確定',
    color: '#10B981',
    backgroundColor: '#10B98115',
  },
  pending: {
    label: '保留',
    color: '#F59E0B',
    backgroundColor: '#F59E0B15',
  },
  cancelled: {
    label: 'キャンセル',
    color: '#EF4444',
    backgroundColor: '#EF444415',
  },
  checked_in: {
    label: 'チェックイン済',
    color: '#3B82F6',
    backgroundColor: '#3B82F615',
  },
  checked_out: {
    label: 'チェックアウト済',
    color: '#6B7280',
    backgroundColor: '#6B728015',
  },
};

/**
 * 予約タイプの色設定
 */
export const TYPE_COLORS: Record<ReservationType, string> = {
  '一時預かり': '#6366F1',
  '見学': '#4ECDC4',
  '相談': '#10B981',
  'イベント': '#F59E0B',
  'その他': '#6B7280',
};
