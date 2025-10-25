import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, AlertCircle, CheckCircle2, User } from 'lucide-react-native';
import { facilityColors } from '../constants/colors';

export interface TimelineReservation {
  id: string;
  startTime: string; // "09:00"
  endTime: string; // "12:00"
  childName: string;
  parentName: string;
  status: 'confirmed' | 'pending' | 'checked_in' | 'checked_out';
  type: string;
  allergies?: string[];
  medicalNotes?: string;
}

interface TimelineScheduleProps {
  reservations: TimelineReservation[];
  onCheckIn?: (id: string) => void;
  onCheckOut?: (id: string) => void;
}

export default function TimelineSchedule({
  reservations,
  onCheckIn,
  onCheckOut,
}: TimelineScheduleProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return facilityColors.primary;
      case 'pending':
        return '#F59E0B';
      case 'checked_in':
        return '#10B981';
      case 'checked_out':
        return facilityColors.textSub;
      default:
        return facilityColors.textSub;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '確定';
      case 'pending':
        return '保留中';
      case 'checked_in':
        return '登園済';
      case 'checked_out':
        return '降園済';
      default:
        return '';
    }
  };

  const hasUrgentInfo = (reservation: TimelineReservation) => {
    return (
      (reservation.allergies && reservation.allergies.length > 0) ||
      reservation.medicalNotes
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Clock size={20} color={facilityColors.primary} />
        <Text style={styles.title}>本日のスケジュール</Text>
      </View>

      {reservations.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>本日の予約はありません</Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {reservations.map((reservation, index) => (
            <View key={reservation.id} style={styles.timelineItem}>
              {/* 時間表示 */}
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{reservation.startTime}</Text>
                <View style={styles.timeLine} />
                <Text style={styles.timeText}>{reservation.endTime}</Text>
              </View>

              {/* 予約詳細 */}
              <View style={styles.reservationCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <User size={16} color={facilityColors.textMain} />
                    <Text style={styles.childName}>{reservation.childName}</Text>
                    {hasUrgentInfo(reservation) && (
                      <AlertCircle size={16} color="#EF4444" />
                    )}
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(reservation.status)}15` },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: getStatusColor(reservation.status) }]}
                    >
                      {getStatusLabel(reservation.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.parentName}>保護者: {reservation.parentName}</Text>
                <Text style={styles.typeText}>{reservation.type}</Text>

                {/* アレルギー警告 */}
                {reservation.allergies && reservation.allergies.length > 0 && (
                  <View style={styles.alertBox}>
                    <AlertCircle size={14} color="#EF4444" />
                    <Text style={styles.alertText}>
                      アレルギー: {reservation.allergies.join(', ')}
                    </Text>
                  </View>
                )}

                {/* 医療メモ */}
                {reservation.medicalNotes && (
                  <View style={styles.alertBox}>
                    <AlertCircle size={14} color="#F59E0B" />
                    <Text style={styles.alertText}>{reservation.medicalNotes}</Text>
                  </View>
                )}

                {/* チェックイン/アウトボタン */}
                <View style={styles.actionButtons}>
                  {reservation.status === 'confirmed' && (
                    <TouchableOpacity
                      style={styles.checkInButton}
                      onPress={() => onCheckIn?.(reservation.id)}
                    >
                      <CheckCircle2 size={16} color="white" />
                      <Text style={styles.checkInButtonText}>チェックイン</Text>
                    </TouchableOpacity>
                  )}

                  {reservation.status === 'checked_in' && (
                    <TouchableOpacity
                      style={styles.checkOutButton}
                      onPress={() => onCheckOut?.(reservation.id)}
                    >
                      <CheckCircle2 size={16} color={facilityColors.primary} />
                      <Text style={styles.checkOutButtonText}>チェックアウト</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
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
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: facilityColors.textMain,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: facilityColors.textSub,
  },
  timeline: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  timeContainer: {
    alignItems: 'center',
    width: 50,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: facilityColors.textSub,
  },
  timeLine: {
    width: 2,
    flex: 1,
    backgroundColor: facilityColors.accentSoft,
    marginVertical: 4,
  },
  reservationCard: {
    flex: 1,
    backgroundColor: facilityColors.background,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: facilityColors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  childName: {
    fontSize: 15,
    fontWeight: '700',
    color: facilityColors.textMain,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  parentName: {
    fontSize: 12,
    fontWeight: '500',
    color: facilityColors.textSub,
    marginBottom: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: facilityColors.textSub,
    marginBottom: 8,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  alertText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#991B1B',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  checkInButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  checkOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: facilityColors.surface,
    borderWidth: 1,
    borderColor: facilityColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  checkOutButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: facilityColors.primary,
  },
});
