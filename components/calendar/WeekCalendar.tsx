import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Reservation } from '../../types/reservation';
import { facilityColors } from '../../constants/colors';

interface WeekCalendarProps {
  reservations: Reservation[];
  selectedDate: string; // YYYY-MM-DD
  onDateSelect: (date: string) => void;
  currentWeek: string; // YYYY-MM-DD (週の開始日)
  onWeekChange: (weekStart: string) => void;
}

export default function WeekCalendar({
  reservations,
  selectedDate,
  onDateSelect,
  currentWeek,
  onWeekChange,
}: WeekCalendarProps) {
  // 週の日付を生成
  const weekDates = useMemo(() => {
    const startDate = new Date(currentWeek);
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }, [currentWeek]);

  // 時間帯のスロット（9:00-18:00を30分刻み）
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(`${String(hour).padStart(2, '0')}:00`);
      if (hour < 18) {
        slots.push(`${String(hour).padStart(2, '0')}:30`);
      }
    }
    return slots;
  }, []);

  // 日付ごとの予約をグループ化
  const reservationsByDate = useMemo(() => {
    return reservations.reduce((acc, r) => {
      if (!acc[r.date]) {
        acc[r.date] = [];
      }
      acc[r.date].push(r);
      return acc;
    }, {} as Record<string, Reservation[]>);
  }, [reservations]);

  const handlePrevWeek = () => {
    const date = new Date(currentWeek);
    date.setDate(date.getDate() - 7);
    onWeekChange(date.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const date = new Date(currentWeek);
    date.setDate(date.getDate() + 7);
    onWeekChange(date.toISOString().split('T')[0]);
  };

  const today = new Date().toISOString().split('T')[0];
  const weekDayNames = ['日', '月', '火', '水', '木', '金', '土'];

  // 予約が時間スロット内に存在するかチェック
  const getReservationsForSlot = (date: string, timeSlot: string) => {
    const dayReservations = reservationsByDate[date] || [];
    return dayReservations.filter((r) => {
      const startTime = r.startTime;
      return startTime <= timeSlot && r.endTime > timeSlot;
    });
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevWeek} style={styles.navButton}>
          <ChevronLeft size={24} color={facilityColors.primary} />
        </TouchableOpacity>
        <Text style={styles.weekTitle}>
          {new Date(weekDates[0]).getMonth() + 1}月{new Date(weekDates[0]).getDate()}日 -{' '}
          {new Date(weekDates[6]).getMonth() + 1}月{new Date(weekDates[6]).getDate()}日
        </Text>
        <TouchableOpacity onPress={handleNextWeek} style={styles.navButton}>
          <ChevronRight size={24} color={facilityColors.primary} />
        </TouchableOpacity>
      </View>

      {/* 曜日ヘッダー */}
      <View style={styles.daysHeader}>
        <View style={styles.timeColumn} />
        {weekDates.map((date, index) => {
          const isToday = date === today;
          const isSelected = date === selectedDate;
          const dayOfWeek = new Date(date).getDay();

          return (
            <TouchableOpacity
              key={date}
              style={[
                styles.dayHeaderCell,
                isToday && styles.todayHeader,
                isSelected && styles.selectedHeader,
              ]}
              onPress={() => onDateSelect(date)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayName,
                  dayOfWeek === 0 && styles.sundayText,
                  dayOfWeek === 6 && styles.saturdayText,
                  isSelected && styles.selectedHeaderText,
                ]}
              >
                {weekDayNames[dayOfWeek]}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isToday && styles.todayNumber,
                  isSelected && styles.selectedHeaderText,
                ]}
              >
                {new Date(date).getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* タイムグリッド */}
      <ScrollView style={styles.timeGrid} showsVerticalScrollIndicator={false}>
        {timeSlots.map((timeSlot, slotIndex) => (
          <View key={timeSlot} style={styles.timeRow}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeText}>{timeSlot}</Text>
            </View>
            {weekDates.map((date) => {
              const reservationsInSlot = getReservationsForSlot(date, timeSlot);
              return (
                <View key={date} style={styles.timeCell}>
                  {reservationsInSlot.map((reservation) => (
                    <View
                      key={reservation.id}
                      style={[
                        styles.reservationBlock,
                        reservation.status === 'confirmed' && styles.confirmedBlock,
                        reservation.status === 'pending' && styles.pendingBlock,
                        reservation.status === 'checked_in' && styles.checkedInBlock,
                      ]}
                    >
                      <Text style={styles.reservationName} numberOfLines={1}>
                        {reservation.childName}
                      </Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: facilityColors.surface,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: facilityColors.accentSoft,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: facilityColors.textMain,
  },
  daysHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: facilityColors.accentSoft,
  },
  timeColumn: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayHeaderCell: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayHeader: {
    backgroundColor: `${facilityColors.primary}10`,
  },
  selectedHeader: {
    backgroundColor: facilityColors.primary,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: facilityColors.textSub,
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: facilityColors.textMain,
  },
  todayNumber: {
    color: facilityColors.primary,
  },
  selectedHeaderText: {
    color: 'white',
  },
  sundayText: {
    color: '#EF4444',
  },
  saturdayText: {
    color: '#3B82F6',
  },
  timeGrid: {
    maxHeight: 400,
  },
  timeRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: facilityColors.accentSoft,
    minHeight: 40,
  },
  timeText: {
    fontSize: 11,
    color: facilityColors.textSub,
    fontWeight: '500',
  },
  timeCell: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: facilityColors.accentSoft,
    padding: 2,
    minHeight: 40,
  },
  reservationBlock: {
    borderRadius: 4,
    padding: 4,
    marginBottom: 2,
  },
  confirmedBlock: {
    backgroundColor: '#10B98120',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  pendingBlock: {
    backgroundColor: '#F59E0B20',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  checkedInBlock: {
    backgroundColor: '#3B82F620',
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  reservationName: {
    fontSize: 10,
    fontWeight: '600',
    color: facilityColors.textMain,
  },
});
