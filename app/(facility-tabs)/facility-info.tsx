import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Building2, MapPin, Phone, Clock, Users, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { facilityColors } from '../../constants/colors';
import { useResponsive } from '../../hooks/useResponsive';
import { useAuth } from '../../lib/AuthContext';
import {
  FacilityProfile,
  fetchFacilityProfileForUser,
  updateFacilityProfile,
} from '../../lib/facilityService';

export default function FacilityInfoScreen() {
  const { horizontalPadding, isDesktop, maxContentWidth, isTablet } = useResponsive();
  const router = useRouter();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [facilityEmail, setFacilityEmail] = useState('');
  const [latestProfile, setLatestProfile] = useState<FacilityProfile | null>(null);

  // フォームの状態
  const [facilityName, setFacilityName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [openingHoursWeekday, setOpeningHoursWeekday] = useState('');
  const [openingHoursSaturday, setOpeningHoursSaturday] = useState('');
  const [capacity, setCapacity] = useState('');

  const applyProfileToForm = (profile: FacilityProfile) => {
    setFacilityId(profile.id);
    setFacilityName(profile.name);
    setAddress(profile.address);
    setPhoneNumber(profile.phone);
    setFacilityEmail(profile.email);
    setOpeningHoursWeekday(profile.openingHoursWeekday);
    setOpeningHoursSaturday(profile.openingHoursSaturday);
    setCapacity(profile.capacity === null ? '' : String(profile.capacity));
  };

  useEffect(() => {
    let isMounted = true;

    const loadFacilityProfile = async () => {
      if (!user) {
        if (!isMounted) return;
        setLoadError('施設アカウントでログインしてください。');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const profile = await fetchFacilityProfileForUser(user.id);
        if (!isMounted) return;
        setLatestProfile(profile);
        applyProfileToForm(profile);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(
          error instanceof Error ? error.message : '施設情報の取得に失敗しました。'
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadFacilityProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSave = async () => {
    if (!facilityId) {
      Alert.alert('保存エラー', '施設情報を取得できないため保存できません。');
      return;
    }

    if (!facilityName.trim()) {
      Alert.alert('入力エラー', '施設名を入力してください。');
      return;
    }

    if (!address.trim()) {
      Alert.alert('入力エラー', '住所を入力してください。');
      return;
    }

    const normalizedCapacity = capacity.trim();
    let capacityValue: number | null = null;
    if (normalizedCapacity) {
      if (!/^\d+$/.test(normalizedCapacity)) {
        Alert.alert('入力エラー', '定員は0以上の整数で入力してください。');
        return;
      }
      capacityValue = Number(normalizedCapacity);
    }

    setIsSaving(true);
    try {
      const updatedProfile = await updateFacilityProfile(facilityId, {
        name: facilityName,
        address,
        phone: phoneNumber,
        openingHoursWeekday,
        openingHoursSaturday,
        capacity: capacityValue,
      });

      setLatestProfile(updatedProfile);
      applyProfileToForm(updatedProfile);
      setIsEditing(false);
      Alert.alert('保存完了', '施設情報を更新しました。');
    } catch (error) {
      Alert.alert(
        '保存エラー',
        error instanceof Error ? error.message : '施設情報の更新に失敗しました。'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (latestProfile) {
      applyProfileToForm(latestProfile);
    }
    setIsEditing(false);
  };

  const handleRetryLoad = async () => {
    if (!user) return;
    setIsLoading(true);
    setLoadError(null);

    try {
      const profile = await fetchFacilityProfileForUser(user.id);
      setLatestProfile(profile);
      applyProfileToForm(profile);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : '施設情報の取得に失敗しました。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle = {
    paddingHorizontal: horizontalPadding,
  };

  const desktopContentStyle = isDesktop
    ? {
        maxWidth: maxContentWidth,
        alignSelf: 'center' as const,
        width: '100%' as const,
      }
    : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, containerStyle]}>
        <View style={styles.headerTop}>
          {/* モバイル版のみ戻るボタン表示 */}
          {!isTablet && (
            <TouchableOpacity
              onPress={() => router.push('/(facility-tabs)/dashboard' as any)}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color={facilityColors.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          <Building2 size={24} color={facilityColors.primary} />
          <Text style={styles.headerTitle}>施設情報</Text>
        </View>

        {!isEditing && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
            disabled={isLoading || Boolean(loadError)}
          >
            <Text style={styles.editButtonText}>編集</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={facilityColors.primary} />
          <Text style={styles.stateText}>施設情報を読み込み中です...</Text>
        </View>
      ) : loadError ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateErrorTitle}>施設情報の取得に失敗しました</Text>
          <Text style={styles.stateText}>{loadError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetryLoad}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>再読み込み</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[containerStyle, desktopContentStyle]}
        >
        <View style={styles.formSection}>
          {/* ログインメール */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <Phone size={20} color={facilityColors.textSub} />
              <Text style={styles.labelText}>ログインメール</Text>
            </View>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={facilityEmail}
              editable={false}
              placeholderTextColor={facilityColors.textSub}
            />
          </View>

          {/* 施設名 */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <Building2 size={20} color={facilityColors.textSub} />
              <Text style={styles.labelText}>施設名</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={facilityName}
              onChangeText={setFacilityName}
              editable={isEditing && !isSaving}
              placeholder="施設名を入力"
              placeholderTextColor={facilityColors.textSub}
            />
          </View>

          {/* 住所 */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <MapPin size={20} color={facilityColors.textSub} />
              <Text style={styles.labelText}>住所</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={address}
              onChangeText={setAddress}
              editable={isEditing && !isSaving}
              placeholder="住所を入力"
              placeholderTextColor={facilityColors.textSub}
              multiline
            />
          </View>

          {/* 電話番号 */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <Phone size={20} color={facilityColors.textSub} />
              <Text style={styles.labelText}>電話番号</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              editable={isEditing && !isSaving}
              placeholder="電話番号を入力"
              placeholderTextColor={facilityColors.textSub}
              keyboardType="phone-pad"
            />
          </View>

          {/* 営業時間（平日） */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <Clock size={20} color={facilityColors.textSub} />
              <Text style={styles.labelText}>営業時間（平日）</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={openingHoursWeekday}
              onChangeText={setOpeningHoursWeekday}
              editable={isEditing && !isSaving}
              placeholder="例: 08:00-18:00"
              placeholderTextColor={facilityColors.textSub}
            />
          </View>

          {/* 営業時間（土曜） */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <Clock size={20} color={facilityColors.textSub} />
              <Text style={styles.labelText}>営業時間（土曜）</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={openingHoursSaturday}
              onChangeText={setOpeningHoursSaturday}
              editable={isEditing && !isSaving}
              placeholder="例: 08:00-18:00 / 未実施"
              placeholderTextColor={facilityColors.textSub}
            />
          </View>

          {/* 定員 */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <Users size={20} color={facilityColors.textSub} />
              <Text style={styles.labelText}>定員</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={capacity}
              onChangeText={setCapacity}
              editable={isEditing && !isSaving}
              placeholder="定員を入力"
              placeholderTextColor={facilityColors.textSub}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelEdit}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              disabled={isSaving}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? '保存中...' : '保存'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: facilityColors.background,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  stateErrorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: facilityColors.textMain,
    textAlign: 'center',
  },
  stateText: {
    fontSize: 14,
    color: facilityColors.textSub,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 4,
    backgroundColor: facilityColors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    backgroundColor: facilityColors.surface,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: facilityColors.accentSoft,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: facilityColors.textMain,
    flex: 1,
  },
  editButton: {
    position: 'absolute',
    right: 24,
    top: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: facilityColors.primary,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  formSection: {
    backgroundColor: facilityColors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  labelText: {
    fontSize: 16,
    fontWeight: '600',
    color: facilityColors.textMain,
  },
  input: {
    backgroundColor: facilityColors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: facilityColors.accentSoft,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: facilityColors.textMain,
  },
  inputDisabled: {
    backgroundColor: facilityColors.surface,
    color: facilityColors.textSub,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: facilityColors.surface,
    borderWidth: 1,
    borderColor: facilityColors.textSub,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: facilityColors.textSub,
  },
  saveButton: {
    flex: 1,
    backgroundColor: facilityColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: facilityColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  footer: {
    height: 40,
  },
});
