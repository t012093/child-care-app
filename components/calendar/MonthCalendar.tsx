import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Reservation } from '../../types/reservation';
import { facilityColors } from '../../constants/colors';

interface MonthCalendarProps {
  reservations: Reservation[];
  selectedDate: string; // YYYY-MM-DD
  onDateSelect: (date: string) => void;
  currentMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
}

export default function MonthCalendar({
  reservations,
  selectedDate,
  onDateSelect,
  currentMonth,
  onMonthChange,
}: MonthCalendarProps) {
  const [year, month] = currentMonth.split('-').map(Number);

  // カレンダーグリッドデータを生成
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    // 予約数をカウント
    const reservationCounts = reservations.reduce((acc, r) => {
      const date = r.date;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const weeks: Array<Array<{ date: string; count: number; isOtherMonth: boolean }>> = [];
    let currentWeek: Array<{ date: string; count: number; isOtherMonth: boolean }> = [];

    // 前月の日付で埋める
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const prevMonth = month - 1 === 0 ? 12 : month - 1;
      const prevYear = month - 1 === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      currentWeek.push({
        date: dateStr,
        count: reservationCounts[dateStr] || 0,
        isOtherMonth: true,
      });
    }

    // 当月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      currentWeek.push({
        date: dateStr,
        count: reservationCounts[dateStr] || 0,
        isOtherMonth: false,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // 次月の日付で埋める
    if (currentWeek.length > 0) {
      const remainingDays = 7 - currentWeek.length;
      for (let day = 1; day <= remainingDays; day++) {
        const nextMonth = month + 1 === 13 ? 1 : month + 1;
        const nextYear = month + 1 === 13 ? year + 1 : year;
        const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        currentWeek.push({
          date: dateStr,
          count: reservationCounts[dateStr] || 0,
          isOtherMonth: true,
        });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [year, month, reservations]);

  const handlePrevMonth = () => {
    const newMonth = month - 1 === 0 ? 12 : month - 1;
    const newYear = month - 1 === 0 ? year - 1 : year;
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const newMonth = month + 1 === 13 ? 1 : month + 1;
    const newYear = month + 1 === 13 ? year + 1 : year;
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const today = new Date().toISOString().split('T')[0];

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <ChevronLeft size={24} color={facilityColors.primary} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {year}年 {month}月
        </Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <ChevronRight size={24} color={facilityColors.primary} />
        </TouchableOpacity>
      </View>

      {/* 曜日ヘッダー */}
      <View style={styles.weekHeader}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <Text
              style={[
                styles.weekDayText,
                index === 0 && styles.sundayText,
                index === 6 && styles.saturdayText,
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* カレンダーグリッド */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {calendarGrid.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            {week.map((day, dayIndex) => {
              const isToday = day.date === today;
              const isSelected = day.date === selectedDate;
              const dayOfWeek = dayIndex;

              return (
                <TouchableOpacity
                  key={day.date}
                  style={[
                    styles.dayCell,
                    isToday && styles.todayCell,
                    isSelected && styles.selectedCell,
                  ]}
                  onPress={() => onDateSelect(day.date)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayText,
                      day.isOtherMonth && styles.otherMonthText,
                      isToday && styles.todayText,
                      isSelected && styles.selectedText,
                      dayOfWeek === 0 && !day.isOtherMonth && styles.sundayDayText,
                      dayOfWeek === 6 && !day.isOtherMonth && styles.saturdayDayText,
                    ]}
                  >
                    {new Date(day.date).getDate()}
                  </Text>
                  {day.count > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>{day.count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
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
    padding: 16,
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
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: facilityColors.textMain,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: facilityColors.textSub,
  },
  sundayText: {
    color: '#EF4444',
  },
  saturdayText: {
    color: '#3B82F6',
  },
  week: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: facilityColors.accentSoft,
    marginBottom: -1,
    marginRight: -1,
  },
  todayCell: {
    backgroundColor: `${facilityColors.primary}10`,
  },
  selectedCell: {
    backgroundColor: facilityColors.primary,
    borderColor: facilityColors.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: facilityColors.textMain,
  },
  otherMonthText: {
    color: facilityColors.textSub,
    opacity: 0.4,
  },
  todayText: {
    color: facilityColors.primary,
    fontWeight: '700',
  },
  selectedText: {
    color: 'white',
    fontWeight: '700',
  },
  sundayDayText: {
    color: '#EF4444',
  },
  saturdayDayText: {
    color: '#3B82F6',
  },
  countBadge: {
    position: 'absolute',
    bottom: 4,
    backgroundColor: facilityColors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },
});
