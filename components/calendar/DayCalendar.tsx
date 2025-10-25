import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Reservation } from '../../types/reservation';
import { facilityColors } from '../../constants/colors';
import TimelineSchedule, { TimelineReservation } from '../TimelineSchedule';

interface DayCalendarProps {
  reservations: Reservation[];
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
  onReservationPress?: (reservation: Reservation) => void;
  onCheckIn?: (id: string) => void;
  onCheckOut?: (id: string) => void;
}

export default function DayCalendar({
  reservations,
  selectedDate,
  onDateChange,
  onReservationPress,
  onCheckIn,
  onCheckOut,
}: DayCalendarProps) {
  // 選択された日付の予約のみをフィルタ
  const dayReservations = useMemo(() => {
    return reservations.filter((r) => r.date === selectedDate);
  }, [reservations, selectedDate]);

  // TimelineScheduleで使用する形式に変換
  const timelineReservations: TimelineReservation[] = useMemo(() => {
    return dayReservations.map((r) => ({
      id: r.id,
      startTime: r.startTime,
      endTime: r.endTime,
      childName: r.childName,
      parentName: r.parentName,
      status: r.status,
      type: r.type,
      allergies: r.allergies,
      medicalNotes: r.medicalNotes,
    }));
  }, [dayReservations]);

  const handlePrevDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
    const dayOfWeek = weekDays[date.getDay()];
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${dayOfWeek}）`;
  };

  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;

  return (
    <View style={styles.container}>
      {/* 日付ナビゲーション */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevDay} style={styles.navButton}>
          <ChevronLeft size={24} color={facilityColors.primary} />
        </TouchableOpacity>
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          {isToday && <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>今日</Text>
          </View>}
        </View>
        <TouchableOpacity onPress={handleNextDay} style={styles.navButton}>
          <ChevronRight size={24} color={facilityColors.primary} />
        </TouchableOpacity>
      </View>

      {/* 予約数サマリー */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {dayReservations.length}件の予約
        </Text>
      </View>

      {/* タイムラインスケジュール */}
      {timelineReservations.length > 0 ? (
        <TimelineSchedule
          reservations={timelineReservations}
          onCheckIn={onCheckIn}
          onCheckOut={onCheckOut}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>この日の予約はありません</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: facilityColors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: facilityColors.textMain,
  },
  todayBadge: {
    backgroundColor: facilityColors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  summary: {
    backgroundColor: facilityColors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: facilityColors.textSub,
  },
  emptyState: {
    backgroundColor: facilityColors.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: 15,
    color: facilityColors.textSub,
    fontWeight: '500',
  },
});
