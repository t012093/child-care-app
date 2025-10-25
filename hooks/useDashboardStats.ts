import { useMemo } from 'react';

export interface Trend {
  value: number; // パーセンテージ
  direction: 'up' | 'down' | 'neutral';
  comparisonText: string;
}

export interface DayReservation {
  date: string; // MM/DD形式
  count: number;
}

export interface ReservationByType {
  type: string;
  count: number;
  color: string;
}

export interface HourlyUsage {
  hour: string;
  count: number;
  capacity: number;
}

export interface TodayStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  trend: Trend;
}

export interface WeekStats {
  total: number;
  trend: Trend;
}

export interface AvailabilityStatus {
  status: '◯' | '△' | '×';
  remainingSlots: number;
  maxCapacity: number;
  percentage: number;
}

export interface DashboardStats {
  today: TodayStats;
  thisWeek: WeekStats;
  availability: AvailabilityStatus;
  weeklyReservations: DayReservation[];
  reservationsByType: ReservationByType[];
  hourlyUsage: HourlyUsage[];
}

/**
 * ダッシュボード統計データを提供するカスタムHook
 * モックデータを生成し、トレンド計算などを行う
 */
export function useDashboardStats(): DashboardStats {
  const stats = useMemo(() => {
    // 過去7日間の予約データ（モック）
    const weeklyReservations: DayReservation[] = [
      { date: '10/19', count: 5 },
      { date: '10/20', count: 8 },
      { date: '10/21', count: 6 },
      { date: '10/22', count: 10 },
      { date: '10/23', count: 7 },
      { date: '10/24', count: 12 },
      { date: '10/25', count: 3 }, // 今日
    ];

    // 本日の統計
    const todayTotal = 3;
    const yesterdayTotal = 12;
    const todayTrend = calculateTrend(todayTotal, yesterdayTotal, '前日比');

    // 今週の統計
    const thisWeekTotal = weeklyReservations.reduce((sum, day) => sum + day.count, 0);
    const lastWeekTotal = 45; // 前週のモックデータ
    const weekTrend = calculateTrend(thisWeekTotal, lastWeekTotal, '前週比');

    // 空き状況の計算
    const maxCapacity = 20;
    const currentReservations = todayTotal;
    const remainingSlots = maxCapacity - currentReservations;
    const percentage = (currentReservations / maxCapacity) * 100;

    let status: '◯' | '△' | '×';
    if (percentage < 50) {
      status = '◯';
    } else if (percentage < 80) {
      status = '△';
    } else {
      status = '×';
    }

    // 予約タイプ別の集計（モック）
    const reservationsByType: ReservationByType[] = [
      { type: '一時預かり', count: 15, color: '#6366F1' },
      { type: '見学', count: 5, color: '#4ECDC4' },
      { type: '相談', count: 2, color: '#10B981' },
    ];

    // 時間帯別利用率（モック）
    const hourlyUsage: HourlyUsage[] = [
      { hour: '9:00', count: 2, capacity: 5 },
      { hour: '10:00', count: 4, capacity: 5 },
      { hour: '11:00', count: 3, capacity: 5 },
      { hour: '12:00', count: 2, capacity: 5 },
      { hour: '13:00', count: 1, capacity: 5 },
      { hour: '14:00', count: 3, capacity: 5 },
      { hour: '15:00', count: 4, capacity: 5 },
      { hour: '16:00', count: 5, capacity: 5 },
      { hour: '17:00', count: 3, capacity: 5 },
      { hour: '18:00', count: 2, capacity: 5 },
    ];

    return {
      today: {
        total: todayTotal,
        confirmed: 2,
        pending: 1,
        cancelled: 0,
        trend: todayTrend,
      },
      thisWeek: {
        total: thisWeekTotal,
        trend: weekTrend,
      },
      availability: {
        status,
        remainingSlots,
        maxCapacity,
        percentage,
      },
      weeklyReservations,
      reservationsByType,
      hourlyUsage,
    };
  }, []);

  return stats;
}

/**
 * トレンドを計算するヘルパー関数
 */
function calculateTrend(
  current: number,
  previous: number,
  comparisonText: string
): Trend {
  if (previous === 0) {
    return {
      value: 0,
      direction: 'neutral',
      comparisonText,
    };
  }

  const percentageChange = ((current - previous) / previous) * 100;
  const roundedChange = Math.round(percentageChange);

  let direction: 'up' | 'down' | 'neutral';
  if (roundedChange > 0) {
    direction = 'up';
  } else if (roundedChange < 0) {
    direction = 'down';
  } else {
    direction = 'neutral';
  }

  return {
    value: Math.abs(roundedChange),
    direction,
    comparisonText,
  };
}
