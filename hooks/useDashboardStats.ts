import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { Reservation, ReservationStatus, ReservationType, TYPE_COLORS } from '../types/reservation';
import { useReservations } from './useReservations';

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

export interface UseDashboardStatsResult extends DashboardStats {
  isLoading: boolean;
  loadError: string | null;
  scopedFacilityIds: string[];
  todayReservations: Reservation[];
  recentReservations: Reservation[];
  checkIn: (id: string) => Promise<void>;
  checkOut: (id: string) => Promise<void>;
}

const DEFAULT_DAILY_CAPACITY = 20;
const BASE_HOUR_LABELS = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const RESERVATION_TYPE_ORDER: ReservationType[] = ['一時預かり', '見学', '相談', 'イベント', 'その他'];

function buildDateKey(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(baseDate: Date, dayOffset: number) {
  const value = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  value.setDate(value.getDate() + dayOffset);
  return value;
}

function buildRecentDateKeys(baseDate: Date, length: number, anchorShift = 0) {
  const anchor = addDays(baseDate, anchorShift);
  return Array.from({ length }, (_, index) => {
    const dayOffset = index - (length - 1);
    return buildDateKey(addDays(anchor, dayOffset));
  });
}

function formatMonthDay(dateKey: string) {
  const [, month, day] = dateKey.split('-');
  return `${month}/${day}`;
}

function normalizeHourLabel(startTime: string) {
  const parsedHour = Number(startTime.split(':')[0]);
  if (Number.isNaN(parsedHour)) return null;
  return `${parsedHour}:00`;
}

function parseHourLabel(hourLabel: string) {
  const parsed = Number(hourLabel.split(':')[0]);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isActiveStatus(status: ReservationStatus) {
  return status !== 'cancelled';
}

function getAvailabilityStatus(percentage: number): AvailabilityStatus['status'] {
  if (percentage < 50) return '◯';
  if (percentage < 80) return '△';
  return '×';
}

/**
 * ダッシュボード統計データを提供するカスタムHook
 * 施設スタッフの `facility_id` に紐づく予約のみを対象に集計します。
 */
function useFacilityCapacity(facilityIds: string[]) {
  const [totalCapacity, setTotalCapacity] = useState<number | null>(null);

  useEffect(() => {
    if (facilityIds.length === 0) {
      setTotalCapacity(null);
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        const responses = await Promise.all(
          facilityIds.map((id) =>
            supabase
              .from('facilities')
              .select('capacity')
              .eq('id', id)
              .single()
          )
        );

        if (!isMounted) return;

        const sum = responses.reduce((acc, res) => {
          const cap = (res.data as { capacity?: number | null } | null)?.capacity;
          return acc + (typeof cap === 'number' ? cap : 0);
        }, 0);

        setTotalCapacity(sum > 0 ? sum : null);
      } catch {
        if (isMounted) setTotalCapacity(null);
      }
    })();

    return () => { isMounted = false; };
  }, [facilityIds]);

  return totalCapacity;
}

export function useDashboardStats(): UseDashboardStatsResult {
  const { user } = useAuth();
  const {
    reservations,
    isLoading,
    loadError,
    scopedFacilityIds,
    checkIn,
    checkOut,
  } = useReservations({
    scope: 'facility',
    facilityUserId: user?.id,
    includeDemoFallback: false,
  });

  const dbCapacity = useFacilityCapacity(scopedFacilityIds);

  return useMemo(() => {
    const now = new Date();
    const todayKey = buildDateKey(now);
    const yesterdayKey = buildDateKey(addDays(now, -1));

    const maxCapacity = dbCapacity
      ?? Math.max(DEFAULT_DAILY_CAPACITY, scopedFacilityIds.length * DEFAULT_DAILY_CAPACITY);
    const baseHourlyCapacity = Math.max(1, Math.ceil(maxCapacity / 4));

    const todayReservations = reservations
      .filter((reservation) => reservation.date === todayKey)
      .sort((left, right) => left.startTime.localeCompare(right.startTime));

    const todayActiveReservations = todayReservations.filter((reservation) =>
      isActiveStatus(reservation.status)
    );
    const activeReservations = reservations.filter((reservation) =>
      isActiveStatus(reservation.status)
    );

    const countByDate = activeReservations.reduce((map, reservation) => {
      map.set(reservation.date, (map.get(reservation.date) || 0) + 1);
      return map;
    }, new Map<string, number>());

    const weeklyDateKeys = buildRecentDateKeys(now, 7);
    const weeklyReservations = weeklyDateKeys.map((dateKey) => ({
      date: formatMonthDay(dateKey),
      count: countByDate.get(dateKey) || 0,
    }));

    const thisWeekTotal = weeklyReservations.reduce((sum, day) => sum + day.count, 0);
    const previousWeekDateKeys = buildRecentDateKeys(now, 7, -7);
    const lastWeekTotal = previousWeekDateKeys.reduce(
      (sum, dateKey) => sum + (countByDate.get(dateKey) || 0),
      0
    );

    const todayTotal = todayActiveReservations.length;
    const yesterdayTotal = countByDate.get(yesterdayKey) || 0;

    const confirmedStatuses = new Set<ReservationStatus>([
      'confirmed',
      'checked_in',
      'checked_out',
    ]);
    const todayConfirmed = todayReservations.filter((reservation) =>
      confirmedStatuses.has(reservation.status)
    ).length;
    const todayPending = todayReservations.filter(
      (reservation) => reservation.status === 'pending'
    ).length;
    const todayCancelled = todayReservations.filter(
      (reservation) => reservation.status === 'cancelled'
    ).length;

    const remainingSlots = Math.max(0, maxCapacity - todayTotal);
    const usagePercentage = maxCapacity > 0
      ? Math.min(100, (todayTotal / maxCapacity) * 100)
      : 0;

    const reservationsByTypeBase = RESERVATION_TYPE_ORDER.map((type) => {
      const count = activeReservations.filter((reservation) => reservation.type === type).length;
      return {
        type,
        count,
        color: TYPE_COLORS[type],
      };
    });
    const reservationsByType = reservationsByTypeBase.some((item) => item.count > 0)
      ? reservationsByTypeBase.filter((item) => item.count > 0)
      : reservationsByTypeBase.slice(0, 3);

    const hourlyCountMap = todayActiveReservations.reduce((map, reservation) => {
      const hourLabel = normalizeHourLabel(reservation.startTime);
      if (!hourLabel) return map;
      map.set(hourLabel, (map.get(hourLabel) || 0) + 1);
      return map;
    }, new Map<string, number>());

    const dynamicHourLabels = Array.from(hourlyCountMap.keys()).filter(
      (hourLabel) => !BASE_HOUR_LABELS.includes(hourLabel)
    );
    const hourlyLabels = Array.from(new Set([...BASE_HOUR_LABELS, ...dynamicHourLabels])).sort(
      (left, right) => parseHourLabel(left) - parseHourLabel(right)
    );
    const hourlyUsage = hourlyLabels.map((hour) => {
      const count = hourlyCountMap.get(hour) || 0;
      return {
        hour,
        count,
        capacity: Math.max(baseHourlyCapacity, count, 1),
      };
    });

    const recentReservations = [...reservations]
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .slice(0, 5);

    return {
      today: {
        total: todayTotal,
        confirmed: todayConfirmed,
        pending: todayPending,
        cancelled: todayCancelled,
        trend: calculateTrend(todayTotal, yesterdayTotal, '前日比'),
      },
      thisWeek: {
        total: thisWeekTotal,
        trend: calculateTrend(thisWeekTotal, lastWeekTotal, '前週比'),
      },
      availability: {
        status: getAvailabilityStatus(usagePercentage),
        remainingSlots,
        maxCapacity,
        percentage: usagePercentage,
      },
      weeklyReservations,
      reservationsByType,
      hourlyUsage,
      isLoading,
      loadError,
      scopedFacilityIds,
      todayReservations,
      recentReservations,
      checkIn,
      checkOut,
    };
  }, [checkIn, checkOut, dbCapacity, isLoading, loadError, reservations, scopedFacilityIds]);
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
