import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, CalendarDays, Clock3, UserRound, Building2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Facility } from '@/constants/facilities';
import { useAuth } from '@/lib/AuthContext';
import { fetchFacilityById } from '@/lib/facilityCatalogService';
import { createReservation } from '@/lib/reservationService';
import { ReservationType } from '@/types/reservation';

const RESERVATION_TYPES: ReservationType[] = ['一時預かり', '見学', '相談'];

function formatTomorrow() {
  const value = new Date();
  value.setDate(value.getDate() + 1);
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ReservationCreateScreen() {
  const { facilityId } = useLocalSearchParams();
  const { user } = useAuth();
  const routeFacilityId = Array.isArray(facilityId) ? facilityId[0] : facilityId;

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedChildId, setSelectedChildId] = useState(user?.children?.[0]?.id || '');
  const [date, setDate] = useState(formatTomorrow());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [type, setType] = useState<ReservationType>('一時預かり');
  const [specialRequests, setSpecialRequests] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [facility, setFacility] = useState<Facility | null>(null);
  const [isFacilityLoading, setIsFacilityLoading] = useState(true);
  const [facilityLoadError, setFacilityLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadFacility = async () => {
      if (!routeFacilityId || typeof routeFacilityId !== 'string') {
        if (!isMounted) return;
        setFacility(null);
        setIsFacilityLoading(false);
        return;
      }

      setIsFacilityLoading(true);
      setFacilityLoadError(null);

      try {
        const foundFacility = await fetchFacilityById(routeFacilityId);
        if (!isMounted) return;
        setFacility(foundFacility);
      } catch (error) {
        if (!isMounted) return;
        setFacility(null);
        setFacilityLoadError(
          error instanceof Error ? error.message : '施設情報の取得に失敗しました。'
        );
      } finally {
        if (isMounted) {
          setIsFacilityLoading(false);
        }
      }
    };

    loadFacility();

    return () => {
      isMounted = false;
    };
  }, [routeFacilityId]);

  const selectedChild = useMemo(
    () => user?.children?.find((child) => child.id === selectedChildId),
    [selectedChildId, user?.children]
  );

  const canReserve = !!facility && !!user && !!selectedChild && !isFacilityLoading;

  const validateForm = () => {
    if (!facility) {
      Alert.alert('エラー', '施設情報が見つかりませんでした。');
      return false;
    }

    if (!user) {
      Alert.alert('エラー', 'ログイン状態を確認できませんでした。');
      return false;
    }

    if (!selectedChild) {
      Alert.alert('入力エラー', '予約するお子様を選択してください。');
      return false;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('入力エラー', '利用日は YYYY-MM-DD 形式で入力してください。');
      return false;
    }

    if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
      Alert.alert('入力エラー', '時間は HH:mm 形式で入力してください。');
      return false;
    }

    if (startTime >= endTime) {
      Alert.alert('入力エラー', '終了時刻は開始時刻より後にしてください。');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateForm()) return;
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!facility || !user || !selectedChild) return;

    setIsSubmitting(true);

    try {
      await createReservation({
        facility,
        user,
        child: {
          id: selectedChild.id,
          name: selectedChild.name,
          birthDate: selectedChild.birthDate,
          allergies: selectedChild.allergies,
          medicalInfo: selectedChild.medicalInfo,
        },
        date,
        startTime,
        endTime,
        type,
        notes,
        specialRequests,
      });

      Alert.alert(
        '予約を受け付けました',
        '施設に予約申請を送信しました。プロフィール画面で予約状況を確認できます。',
        [
          {
            text: 'プロフィールを見る',
            onPress: () => router.replace('/(tabs)/profile'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        '予約エラー',
        error instanceof Error ? error.message : '予約の作成に失敗しました。'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFacilityLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>施設情報を読み込み中です</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!facility) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>
            {facilityLoadError || '施設情報が見つかりませんでした'}
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (step === 2 ? setStep(1) : router.back())} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.title}>施設予約</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.stepper}>
        <View style={[styles.stepDot, styles.stepDotActive]} />
        <View style={[styles.stepLine, step === 2 && styles.stepLineActive]} />
        <View style={[styles.stepDot, step === 2 && styles.stepDotActive]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Building2 size={18} color={colors.accent} />
            <Text style={styles.summaryTitle}>{facility.name}</Text>
          </View>
          <Text style={styles.summarySubtext}>{facility.address}</Text>
        </View>

        {step === 1 ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>お子様を選択</Text>
              {user?.children?.length ? (
                <View style={styles.chipGroup}>
                  {user.children.map((child) => (
                    <TouchableOpacity
                      key={child.id}
                      style={[
                        styles.childChip,
                        selectedChildId === child.id && styles.childChipActive,
                      ]}
                      onPress={() => setSelectedChildId(child.id)}
                    >
                      <UserRound
                        size={16}
                        color={selectedChildId === child.id ? colors.surface : colors.accent}
                      />
                      <Text
                        style={[
                          styles.childChipText,
                          selectedChildId === child.id && styles.childChipTextActive,
                        ]}
                      >
                        {child.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyCardText}>登録済みのお子様情報がありません。</Text>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                    <Text style={styles.linkText}>プロフィールで確認</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>予約内容</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>利用日</Text>
                <View style={styles.inputRow}>
                  <CalendarDays size={18} color={colors.textSub} />
                  <TextInput
                    style={styles.input}
                    value={date}
                    onChangeText={setDate}
                    placeholder="2026-03-10"
                    placeholderTextColor={colors.textSub}
                  />
                </View>
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeField}>
                  <Text style={styles.label}>開始</Text>
                  <View style={styles.inputRow}>
                    <Clock3 size={18} color={colors.textSub} />
                    <TextInput
                      style={styles.input}
                      value={startTime}
                      onChangeText={setStartTime}
                      placeholder="09:00"
                      placeholderTextColor={colors.textSub}
                    />
                  </View>
                </View>

                <View style={styles.timeField}>
                  <Text style={styles.label}>終了</Text>
                  <View style={styles.inputRow}>
                    <Clock3 size={18} color={colors.textSub} />
                    <TextInput
                      style={styles.input}
                      value={endTime}
                      onChangeText={setEndTime}
                      placeholder="12:00"
                      placeholderTextColor={colors.textSub}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>利用種別</Text>
              <View style={styles.chipGroup}>
                {RESERVATION_TYPES.map((reservationType) => (
                  <TouchableOpacity
                    key={reservationType}
                    style={[
                      styles.typeChip,
                      type === reservationType && styles.typeChipActive,
                    ]}
                    onPress={() => setType(reservationType)}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        type === reservationType && styles.typeChipTextActive,
                      ]}
                    >
                      {reservationType}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>補足情報</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>施設への要望</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={specialRequests}
                  onChangeText={setSpecialRequests}
                  multiline
                  numberOfLines={4}
                  placeholder="アレルギー対応や当日の伝達事項があれば記入してください"
                  placeholderTextColor={colors.textSub}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>メモ</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  placeholder="ご自身用のメモ"
                  placeholderTextColor={colors.textSub}
                />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>確認</Text>
            <View style={styles.confirmCard}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>施設</Text>
                <Text style={styles.confirmValue}>{facility.name}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>お子様</Text>
                <Text style={styles.confirmValue}>{selectedChild?.name}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>利用日</Text>
                <Text style={styles.confirmValue}>{date}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>時間</Text>
                <Text style={styles.confirmValue}>{startTime} - {endTime}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>種別</Text>
                <Text style={styles.confirmValue}>{type}</Text>
              </View>
              {specialRequests ? (
                <View style={styles.confirmBlock}>
                  <Text style={styles.confirmLabel}>施設への要望</Text>
                  <Text style={styles.confirmMultilineValue}>{specialRequests}</Text>
                </View>
              ) : null}
              {notes ? (
                <View style={styles.confirmBlock}>
                  <Text style={styles.confirmLabel}>メモ</Text>
                  <Text style={styles.confirmMultilineValue}>{notes}</Text>
                </View>
              ) : null}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step === 1 ? (
          <TouchableOpacity
            style={[styles.primaryButton, !canReserve && styles.disabledButton]}
            onPress={handleNext}
            disabled={!canReserve}
          >
            <Text style={styles.primaryButtonText}>確認へ進む</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(1)}>
              <Text style={styles.secondaryButtonText}>入力に戻る</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, styles.primaryButtonCompact, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? '送信中...' : '予約を送信'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 24 : 12,
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerSpacer: {
    width: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 12,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.textSub,
    opacity: 0.3,
  },
  stepDotActive: {
    backgroundColor: colors.accent,
    opacity: 1,
  },
  stepLine: {
    width: 48,
    height: 2,
    backgroundColor: colors.textSub,
    opacity: 0.3,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: colors.accent,
    opacity: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    paddingBottom: 24,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 720 : undefined,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    flex: 1,
  },
  summarySubtext: {
    fontSize: 14,
    color: colors.textSub,
    lineHeight: 20,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 12,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  childChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  childChipActive: {
    backgroundColor: colors.accent,
  },
  childChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  childChipTextActive: {
    color: colors.surface,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
  },
  typeChipActive: {
    backgroundColor: colors.accent,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  typeChipTextActive: {
    color: colors.surface,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textMain,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeField: {
    flex: 1,
  },
  confirmCard: {
    gap: 14,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  confirmLabel: {
    fontSize: 14,
    color: colors.textSub,
    minWidth: 72,
  },
  confirmValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
  },
  confirmBlock: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  confirmMultilineValue: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textMain,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'web' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: colors.background,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 720 : undefined,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 720 : undefined,
  },
  primaryButtonCompact: {
    flex: 1,
    maxWidth: undefined,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  emptyCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  emptyCardText: {
    fontSize: 14,
    color: colors.textSub,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    textAlign: 'center',
  },
});
