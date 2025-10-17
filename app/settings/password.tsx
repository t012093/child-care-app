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
} from 'react-native';
import { ChevronLeft, Eye, EyeOff, Lock, CheckCircle, XCircle } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useRouter, Stack } from 'expo-router';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export default function PasswordChangeScreen() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const getPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score: 1, label: '弱い', color: '#EF4444' };
    if (score <= 4) return { score: 2, label: '普通', color: '#F59E0B' };
    return { score: 3, label: '強い', color: '#10B981' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const validatePassword = (): boolean => {
    if (!currentPassword) {
      Alert.alert('エラー', '現在のパスワードを入力してください');
      return false;
    }

    if (!newPassword) {
      Alert.alert('エラー', '新しいパスワードを入力してください');
      return false;
    }

    if (newPassword.length < 8) {
      Alert.alert('エラー', 'パスワードは8文字以上で入力してください');
      return false;
    }

    if (newPassword === currentPassword) {
      Alert.alert('エラー', '新しいパスワードは現在のパスワードと異なるものを設定してください');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('エラー', 'パスワードが一致しません');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setIsSaving(true);

    try {
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        'パスワード変更完了',
        'パスワードを変更しました',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('エラー', 'パスワードの変更に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const passwordRequirements = [
    { text: '8文字以上', met: newPassword.length >= 8 },
    { text: '小文字を含む', met: /[a-z]/.test(newPassword) },
    { text: '大文字を含む', met: /[A-Z]/.test(newPassword) },
    { text: '数字を含む', met: /[0-9]/.test(newPassword) },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'パスワード変更',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={colors.textMain} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Lock size={48} color={colors.accent} />
            <Text style={styles.headerTitle}>パスワードを変更</Text>
            <Text style={styles.headerText}>
              セキュリティのため、定期的なパスワード変更をおすすめします
            </Text>
          </View>

          <View style={styles.form}>
            {/* 現在のパスワード */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>現在のパスワード</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="現在のパスワードを入力"
                  placeholderTextColor={colors.textSub}
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={20} color={colors.textSub} />
                  ) : (
                    <Eye size={20} color={colors.textSub} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* 新しいパスワード */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>新しいパスワード</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="新しいパスワードを入力"
                  placeholderTextColor={colors.textSub}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff size={20} color={colors.textSub} />
                  ) : (
                    <Eye size={20} color={colors.textSub} />
                  )}
                </TouchableOpacity>
              </View>

              {/* パスワード強度インジケーター */}
              {newPassword.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBar}>
                    <View
                      style={[
                        styles.strengthFill,
                        {
                          width: `${(passwordStrength.score / 3) * 100}%`,
                          backgroundColor: passwordStrength.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                    {passwordStrength.label}
                  </Text>
                </View>
              )}
            </View>

            {/* パスワード確認 */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>新しいパスワード（確認）</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="新しいパスワードを再入力"
                  placeholderTextColor={colors.textSub}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={colors.textSub} />
                  ) : (
                    <Eye size={20} color={colors.textSub} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* パスワード要件 */}
            <View style={styles.requirementsCard}>
              <Text style={styles.requirementsTitle}>パスワードの要件</Text>
              {passwordRequirements.map((req, index) => (
                <View key={index} style={styles.requirementItem}>
                  {req.met ? (
                    <CheckCircle size={16} color="#10B981" />
                  ) : (
                    <XCircle size={16} color={colors.textSub} />
                  )}
                  <Text
                    style={[
                      styles.requirementText,
                      req.met && styles.requirementTextMet,
                    ]}
                  >
                    {req.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 変更ボタン */}
          <TouchableOpacity
            style={styles.changeButton}
            onPress={handleChangePassword}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            <Text style={styles.changeButtonText}>
              {isSaving ? '変更中...' : 'パスワードを変更'}
            </Text>
          </TouchableOpacity>

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
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMain,
    marginTop: 16,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 20,
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
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 48,
    fontSize: 16,
    color: colors.textMain,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 14,
    padding: 4,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requirementsCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    color: colors.textSub,
    marginLeft: 8,
  },
  requirementTextMet: {
    color: '#10B981',
    fontWeight: '500',
  },
  changeButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  changeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  footer: {
    height: 40,
  },
});
