import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, User, ChevronRight } from 'lucide-react-native';
import { facilityColors } from '../constants/colors';

export interface Reservation {
  id: string;
  time: string;
  childName: string;
  parentName: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  type: string;
}

interface ReservationListItemProps {
  reservation: Reservation;
  onPress?: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return '#10B981'; // green
    case 'pending':
      return '#F59E0B'; // orange
    case 'cancelled':
      return '#EF4444'; // red
    default:
      return facilityColors.textSub;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'confirmed':
      return '確定';
    case 'pending':
      return '保留';
    case 'cancelled':
      return 'キャンセル';
    default:
      return status;
  }
};

export default function ReservationListItem({
  reservation,
  onPress,
}: ReservationListItemProps) {
  const statusColor = getStatusColor(reservation.status);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(reservation.id)}
      activeOpacity={0.7}
    >
      <View style={styles.timeSection}>
        <Clock size={18} color={facilityColors.textSub} />
        <Text style={styles.time}>{reservation.time}</Text>
      </View>

      <View style={styles.detailSection}>
        <View style={styles.nameRow}>
          <User size={16} color={facilityColors.textSub} />
          <Text style={styles.childName}>{reservation.childName}</Text>
          <Text style={styles.parentName}>（{reservation.parentName}）</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{reservation.type}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(reservation.status)}
            </Text>
          </View>
        </View>
      </View>

      <ChevronRight size={20} color={facilityColors.textSub} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: facilityColors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    minWidth: 70,
  },
  time: {
    fontSize: 16,
    fontWeight: '700',
    color: facilityColors.textMain,
    marginLeft: 6,
  },
  detailSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  childName: {
    fontSize: 15,
    fontWeight: '600',
    color: facilityColors.textMain,
    marginLeft: 6,
  },
  parentName: {
    fontSize: 13,
    color: facilityColors.textSub,
    marginLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    backgroundColor: `${facilityColors.primary}20`,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeText: {
    fontSize: 11,
    color: facilityColors.primary,
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});