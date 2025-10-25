import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { X, Calendar } from 'lucide-react-native';
import { ReservationFilter, ReservationStatus, ReservationType } from '../types/reservation';
import { facilityColors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';

interface ReservationFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filter: ReservationFilter;
  onApplyFilter: (filter: ReservationFilter) => void;
}

const STATUS_OPTIONS: { value: ReservationStatus; label: string }[] = [
  { value: 'confirmed', label: '確定' },
  { value: 'pending', label: '保留' },
  { value: 'cancelled', label: 'キャンセル' },
  { value: 'checked_in', label: 'チェックイン済' },
  { value: 'checked_out', label: 'チェックアウト済' },
];

const TYPE_OPTIONS: { value: ReservationType; label: string }[] = [
  { value: '一時預かり', label: '一時預かり' },
  { value: '見学', label: '見学' },
  { value: '相談', label: '相談' },
  { value: 'イベント', label: 'イベント' },
  { value: 'その他', label: 'その他' },
];

export default function ReservationFilterModal({
  visible,
  onClose,
  filter,
  onApplyFilter,
}: ReservationFilterModalProps) {
  const { isTablet } = useResponsive();
  const [localFilter, setLocalFilter] = useState<ReservationFilter>(filter);

  const toggleStatus = (status: ReservationStatus) => {
    const currentStatuses = localFilter.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];

    setLocalFilter({
      ...localFilter,
      status: newStatuses.length > 0 ? newStatuses : undefined,
    });
  };

  const toggleType = (type: ReservationType) => {
    const currentTypes = localFilter.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];

    setLocalFilter({
      ...localFilter,
      type: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  const handleApply = () => {
    onApplyFilter(localFilter);
    onClose();
  };

  const handleReset = () => {
    const emptyFilter: ReservationFilter = {};
    setLocalFilter(emptyFilter);
    onApplyFilter(emptyFilter);
    onClose();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilter.status && localFilter.status.length > 0) count++;
    if (localFilter.type && localFilter.type.length > 0) count++;
    if (localFilter.dateRange) count++;
    return count;
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
            <Text style={styles.headerTitle}>フィルター</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={facilityColors.textMain} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* ステータスフィルター */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ステータス</Text>
              <View style={styles.optionsGrid}>
                {STATUS_OPTIONS.map((option) => {
                  const isSelected = localFilter.status?.includes(option.value);
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionChip,
                        isSelected && styles.optionChipSelected,
                      ]}
                      onPress={() => toggleStatus(option.value)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 予約タイプフィルター */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>予約タイプ</Text>
              <View style={styles.optionsGrid}>
                {TYPE_OPTIONS.map((option) => {
                  const isSelected = localFilter.type?.includes(option.value);
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionChip,
                        isSelected && styles.optionChipSelected,
                      ]}
                      onPress={() => toggleType(option.value)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 日付範囲フィルター（簡易版：今後実装予定） */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>日付範囲</Text>
              <TouchableOpacity style={styles.dateRangeButton}>
                <Calendar size={20} color={facilityColors.primary} />
                <Text style={styles.dateRangeText}>
                  {localFilter.dateRange
                    ? `${localFilter.dateRange.start} - ${localFilter.dateRange.end}`
                    : '日付を選択'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>
                ※日付範囲選択は今後実装予定です
              </Text>
            </View>

            {/* アクティブなフィルター数 */}
            <View style={styles.summary}>
              <Text style={styles.summaryText}>
                {getActiveFilterCount()}個のフィルターが適用されています
              </Text>
            </View>
          </ScrollView>

          {/* アクションボタン */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>リセット</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.applyButton]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>適用</Text>
            </TouchableOpacity>
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
    maxHeight: '80%',
    ...Platform.select({
      web: {
        maxHeight: '80vh',
      },
    }),
  },
  containerTablet: {
    borderRadius: 24,
    width: '90%',
    maxWidth: 500,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: facilityColors.textMain,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: facilityColors.background,
    borderWidth: 1,
    borderColor: facilityColors.accentSoft,
  },
  optionChipSelected: {
    backgroundColor: facilityColors.primary,
    borderColor: facilityColors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: facilityColors.textMain,
  },
  optionTextSelected: {
    color: 'white',
  },
  dateRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    backgroundColor: facilityColors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: facilityColors.accentSoft,
  },
  dateRangeText: {
    fontSize: 15,
    color: facilityColors.textMain,
  },
  helperText: {
    fontSize: 12,
    color: facilityColors.textSub,
    marginTop: 8,
  },
  summary: {
    padding: 16,
    backgroundColor: facilityColors.background,
    borderRadius: 12,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: facilityColors.textSub,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: facilityColors.accentSoft,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: facilityColors.background,
    borderWidth: 1,
    borderColor: facilityColors.accentSoft,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: facilityColors.textMain,
  },
  applyButton: {
    backgroundColor: facilityColors.primary,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
