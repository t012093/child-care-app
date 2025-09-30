import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';

interface Reservation {
  id: string;
  facilityName: string;
  time: string;
  date: string;
  type: string;
}

interface TodayScheduleCardProps {
  reservation?: Reservation;
  childName?: string;
  onPress?: () => void;
}

export default function TodayScheduleCard({
  reservation,
  childName = '太郎くん',
  onPress
}: TodayScheduleCardProps) {
  const { horizontalPadding, isDesktop, maxContentWidth } = useResponsive();

  const containerStyle = [
    styles.container,
    {
      marginHorizontal: horizontalPadding,
      marginBottom: isDesktop ? 32 : 16,
    },
    isDesktop && {
      alignSelf: 'center',
      maxWidth: maxContentWidth,
      width: '100%',
    },
  ];

  if (!reservation) {
    return (
      <View style={containerStyle}>
        <View style={styles.header}>
          <Calendar size={20} color={colors.accent} />
          <Text style={styles.headerTitle}>今日の予定</Text>
        </View>
        <Text style={styles.emptyText}>予定はありません</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Calendar size={20} color={colors.accent} />
        <Text style={styles.headerTitle}>{childName}の予定</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.timeSection}>
          <Clock size={18} color={colors.textSub} />
          <Text style={styles.time}>{reservation.time}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.facilityName}>{reservation.facilityName}</Text>
          <View style={styles.typeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{reservation.type}</Text>
            </View>
          </View>
        </View>

        <ChevronRight size={20} color={colors.textSub} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
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
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    marginLeft: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  time: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    marginLeft: 6,
  },
  detailSection: {
    flex: 1,
  },
  facilityName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 4,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    backgroundColor: `${colors.accent}20`,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: 'center',
    paddingVertical: 8,
  },
});