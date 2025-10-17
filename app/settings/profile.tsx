import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { ChevronLeft, Camera, Save } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.parentInfo?.phone || '');
  const [address, setAddress] = useState(user?.parentInfo?.address || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.parentInfo?.emergencyContact || '');
  const [isSaving, setIsSaving] = useState(false);

  const userAvatar = user?.id === 'demo-user'
    ? "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600"
    : "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600";

  const handleSave = async () => {
    // バリデーション
    if (!name.trim()) {
      Alert.alert('エラー', 'お名前を入力してください');
      return;
    }

    if (phone && !validatePhone(phone)) {
      Alert.alert('エラー', '電話番号の形式が正しくありません');
      return;
    }

    if (emergencyContact && !validatePhone(emergencyContact)) {
      Alert.alert('エラー', '緊急連絡先の形式が正しくありません');
      return;
    }

    setIsSaving(true);

    try {
      await updateUser({
        name,
        parentInfo: {
          phone,
          address,
          emergencyContact,
        },
      });

      Alert.alert('保存完了', 'プロフィールを更新しました', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('エラー', 'プロフィールの更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const validatePhone = (phoneNumber: string): boolean => {
    const phoneRegex = /^[\d\-]+$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleChangePhoto = () => {
    Alert.alert(
      '写真を変更',
      '写真の変更元を選択してください',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'カメラで撮影', onPress: () => console.log('Camera') },
        { text: 'ライブラリから選択', onPress: () => console.log('Library') },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'プロフィール編集',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={colors.textMain} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              style={styles.saveButton}
            >
              <Save size={20} color={colors.accent} />
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* プロフィール写真 */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: userAvatar }}
                style={styles.avatar}
              />
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handleChangePhoto}
              >
                <Camera size={20} color={colors.surface} />
              </TouchableOpacity>
            </View>
            <Text style={styles.changePhotoText}>写真を変更</Text>
          </View>

          {/* フォーム */}
          <View style={styles.form}>
            {/* お名前 */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                お名前 <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="山田 太郎"
                placeholderTextColor={colors.textSub}
              />
            </View>

            {/* メールアドレス */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>メールアドレス</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={user?.email || ''}
                editable={false}
                placeholderTextColor={colors.textSub}
              />
              <Text style={styles.helperText}>
                メールアドレスの変更は「メールアドレス変更」から行えます
              </Text>
            </View>

            {/* 電話番号 */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>電話番号</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="090-1234-5678"
                placeholderTextColor={colors.textSub}
                keyboardType="phone-pad"
              />
            </View>

            {/* 住所 */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>住所</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={address}
                onChangeText={setAddress}
                placeholder="東京都渋谷区○○1-2-3"
                placeholderTextColor={colors.textSub}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* 緊急連絡先 */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>緊急連絡先</Text>
              <TextInput
                style={styles.input}
                value={emergencyContact}
                onChangeText={setEmergencyContact}
                placeholder="080-9876-5432"
                placeholderTextColor={colors.textSub}
                keyboardType="phone-pad"
              />
              <Text style={styles.helperText}>
                緊急時の連絡先を入力してください
              </Text>
            </View>
          </View>

          {/* 保存ボタン（モバイル用） */}
          {Platform.OS !== 'web' && (
            <TouchableOpacity
              style={styles.mobileeSaveButton}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.7}
            >
              <Save size={20} color={colors.surface} />
              <Text style={styles.mobileSaveButtonText}>
                {isSaving ? '保存中...' : '保存する'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.footer} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.accentSoft,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  changePhotoText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
  },
  form: {
    paddingHorizontal: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textMain,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: colors.textSub,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSub,
  },
  mobileeSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 8,
    gap: 8,
  },
  mobileSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  footer: {
    height: 40,
  },
});
