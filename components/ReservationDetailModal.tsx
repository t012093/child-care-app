import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  AlertCircle,
  Heart,
  FileText,
  Check,
  XCircle,
  LogIn,
  LogOut,
} from 'lucide-react-native';
import { Reservation, STATUS_CONFIG } from '../types/reservation';
import { facilityColors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';

interface ReservationDetailModalProps {
  reservation: Reservation | null;
  visible: boolean;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: Reservation['status']) => void;
  onCheckIn?: (id: string) => void;
  onCheckOut?: (id: string) => void;
}

export default function ReservationDetailModal({
  reservation,
  visible,
  onClose,
  onUpdateStatus,
  onCheckIn,
  onCheckOut,
}: ReservationDetailModalProps) {
  const { isTablet } = useResponsive();

  if (!reservation) return null;

  const statusConfig = STATUS_CONFIG[reservation.status];
  const canCheckIn = reservation.status === 'confirmed';
  const canCheckOut = reservation.status === 'checked_in';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const formatTime = (timeStr: string) => {
    return timeStr;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={isTablet}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, isTablet && styles.overlayTablet]}>
        <View style={[styles.container, isTablet && styles.containerTablet]}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>予約詳細</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={facilityColors.textMain} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* ステータスバッジ */}
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>

            {/* 予約タイプ */}
            <View style={styles.section}>
              <Text style={styles.typeLabel}>予約タイプ</Text>
              <Text style={styles.typeValue}>{reservation.type}</Text>
            </View>

            {/* 日時情報 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>日時</Text>
              <View style={styles.infoRow}>
                <Calendar size={20} color={facilityColors.primary} />
                <Text style={styles.infoText}>{formatDate(reservation.date)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Clock size={20} color={facilityColors.primary} />
                <Text style={styles.infoText}>
                  {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                </Text>
              </View>
            </View>

            {/* 子供情報 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>お子様情報</Text>
              <View style={styles.infoRow}>
                <User size={20} color={facilityColors.primary} />
                <Text style={styles.infoText}>{reservation.childName}</Text>
              </View>
              {reservation.childAge && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>年齢:</Text>
                  <Text style={styles.infoText}>{reservation.childAge}歳</Text>
                </View>
              )}
              {reservation.childBirthDate && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>生年月日:</Text>
                  <Text style={styles.infoText}>{formatDate(reservation.childBirthDate)}</Text>
                </View>
              )}
            </View>

            {/* 保護者情報 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>保護者情報</Text>
              <View style={styles.infoRow}>
                <User size={20} color={facilityColors.primary} />
                <Text style={styles.infoText}>{reservation.parentName}</Text>
              </View>
              {reservation.parentPhone && (
                <View style={styles.infoRow}>
                  <Phone size={20} color={facilityColors.primary} />
                  <Text style={styles.infoText}>{reservation.parentPhone}</Text>
                </View>
              )}
              {reservation.parentEmail && (
                <View style={styles.infoRow}>
                  <Mail size={20} color={facilityColors.primary} />
                  <Text style={styles.infoText}>{reservation.parentEmail}</Text>
                </View>
              )}
            </View>

            {/* アレルギー情報 */}
            {reservation.allergies && reservation.allergies.length > 0 && (
              <View style={[styles.section, styles.alertSection]}>
                <View style={styles.alertHeader}>
                  <AlertCircle size={20} color="#EF4444" />
                  <Text style={styles.alertTitle}>アレルギー情報</Text>
                </View>
                <View style={styles.allergyList}>
                  {reservation.allergies.map((allergy, index) => (
                    <View key={index} style={styles.allergyBadge}>
                      <Text style={styles.allergyText}>{allergy}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 医療メモ */}
            {reservation.medicalNotes && (
              <View style={[styles.section, styles.alertSection]}>
                <View style={styles.alertHeader}>
                  <Heart size={20} color="#F59E0B" />
                  <Text style={styles.alertTitle}>医療メモ</Text>
                </View>
                <Text style={styles.noteText}>{reservation.medicalNotes}</Text>
              </View>
            )}

            {/* 特別な要望 */}
            {reservation.specialRequests && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <FileText size={20} color={facilityColors.primary} />
                  <Text style={styles.sectionTitle}>特別な要望</Text>
                </View>
                <Text style={styles.noteText}>{reservation.specialRequests}</Text>
              </View>
            )}

            {/* メモ */}
            {reservation.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>メモ</Text>
                <Text style={styles.noteText}>{reservation.notes}</Text>
              </View>
            )}

            {/* チェックイン/アウト情報 */}
            {(reservation.checkedInAt || reservation.checkedOutAt) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>チェック履歴</Text>
                {reservation.checkedInAt && (
                  <View style={styles.infoRow}>
                    <LogIn size={18} color={facilityColors.textSub} />
                    <Text style={styles.checkTimeText}>
                      チェックイン: {new Date(reservation.checkedInAt).toLocaleString('ja-JP')}
                    </Text>
                  </View>
                )}
                {reservation.checkedOutAt && (
                  <View style={styles.infoRow}>
                    <LogOut size={18} color={facilityColors.textSub} />
                    <Text style={styles.checkTimeText}>
                      チェックアウト: {new Date(reservation.checkedOutAt).toLocaleString('ja-JP')}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* アクションボタン */}
          <View style={styles.actions}>
            {/* チェックインボタン */}
            {canCheckIn && onCheckIn && (
              <TouchableOpacity
                style={[styles.actionButton, styles.checkInButton]}
                onPress={() => onCheckIn(reservation.id)}
              >
                <LogIn size={20} color="white" />
                <Text style={styles.actionButtonText}>チェックイン</Text>
              </TouchableOpacity>
            )}

            {/* チェックアウトボタン */}
            {canCheckOut && onCheckOut && (
              <TouchableOpacity
                style={[styles.actionButton, styles.checkOutButton]}
                onPress={() => onCheckOut(reservation.id)}
              >
                <LogOut size={20} color="white" />
                <Text style={styles.actionButtonText}>チェックアウト</Text>
              </TouchableOpacity>
            )}

            {/* ステータス変更ボタン */}
            {reservation.status === 'pending' && onUpdateStatus && (
              <View style={styles.statusActions}>
                <TouchableOpacity
                  style={[styles.statusButton, styles.approveButton]}
                  onPress={() => onUpdateStatus(reservation.id, 'confirmed')}
                >
                  <Check size={18} color="white" />
                  <Text style={styles.statusButtonText}>承認</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusButton, styles.cancelButton]}
                  onPress={() => onUpdateStatus(reservation.id, 'cancelled')}
                >
                  <XCircle size={18} color="white" />
                  <Text style={styles.statusButtonText}>キャンセル</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTablet: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: facilityColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...Platform.select({
      web: {
        maxHeight: '90vh',
      },
    }),
  },
  containerTablet: {
    borderRadius: 24,
    width: '90%',
    maxWidth: 600,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: facilityColors.accentSoft,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: facilityColors.textMain,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: facilityColors.textMain,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: facilityColors.textSub,
    marginBottom: 4,
  },
  typeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: facilityColors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: facilityColors.textSub,
    width: 80,
  },
  infoText: {
    fontSize: 15,
    color: facilityColors.textMain,
    flex: 1,
  },
  alertSection: {
    backgroundColor: facilityColors.background,
    borderRadius: 12,
    padding: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: facilityColors.textMain,
  },
  allergyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  allergyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  noteText: {
    fontSize: 14,
    color: facilityColors.textMain,
    lineHeight: 20,
  },
  checkTimeText: {
    fontSize: 13,
    color: facilityColors.textSub,
  },
  actions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: facilityColors.accentSoft,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: facilityColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  checkInButton: {
    backgroundColor: '#10B981',
  },
  checkOutButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  statusActions: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});
