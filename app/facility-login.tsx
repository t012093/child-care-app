import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2, Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { facilityColors } from '@/constants/colors';
import { useAuth, DEMO_ENABLED } from '@/lib/AuthContext';
import { fetchFacilityIdsForStaffUser } from '@/lib/reservationService';
import { supabase } from '@/lib/supabase';

export default function FacilityLoginScreen() {
  const { login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetSending, setIsResetSending] = useState(false);

  const showFacilityLoginError = (message: string, title = 'ログインエラー') => {
    setErrorMessage(message);
    if (Platform.OS !== 'web') {
      Alert.alert(title, message);
    }
  };

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const mapResetPasswordError = (message: string) => {
    const normalized = message.toLowerCase();

    if (normalized.includes('too many requests')) {
      return '送信回数の上限に達しました。少し時間をおいて再度お試しください。';
    }

    if (normalized.includes('rate limit')) {
      return '送信回数の上限に達しました。少し時間をおいて再度お試しください。';
    }

    return message;
  };

  const ensureFacilityAccess = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error('ログイン情報の確認に失敗しました。もう一度お試しください。');
    }

    const scopedFacilityIds = await fetchFacilityIdsForStaffUser(user.id);
    if (scopedFacilityIds.length === 0) {
      throw new Error(
        'このアカウントは施設管理者として未登録です。施設登録または所属設定を確認してください。'
      );
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showFacilityLoginError('メールアドレスとパスワードを入力してください。', '入力エラー');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    let signedIn = false;
    try {
      await login(email.trim(), password);
      signedIn = true;
      await ensureFacilityAccess();
      router.replace('/(facility-tabs)/dashboard' as any);
    } catch (error) {
      if (signedIn) {
        await logout();
      }
      const message = error instanceof Error
        ? error.message
        : 'メールアドレスまたはパスワードが正しくありません。';
      showFacilityLoginError(message);
      console.error('Facility login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/facility-register' as any);
  };

  const sendResetEmail = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('入力エラー', 'パスワード再設定用のメールアドレスを入力してください。');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      Alert.alert('入力エラー', '正しいメールアドレス形式で入力してください。');
      return;
    }

    setIsResetSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);
      if (error) {
        throw new Error(mapResetPasswordError(error.message || 'メール送信に失敗しました。'));
      }

      Alert.alert(
        '送信完了',
        'パスワードリセット用のリンクを送信しました。メールをご確認ください。'
      );
    } catch (error) {
      Alert.alert(
        '送信エラー',
        error instanceof Error
          ? mapResetPasswordError(error.message)
          : 'メールの送信に失敗しました。'
      );
    } finally {
      setIsResetSending(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'パスワードリセット',
      'パスワードリセット用のメールを送信しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '送信',
          onPress: () => {
            void sendResetEmail();
          },
        },
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  const handleGuestLogin = () => {
    Alert.alert(
      'ゲストログイン停止中',
      '権限制御のため、施設画面のゲストログインは現在停止しています。'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={facilityColors.background} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={[facilityColors.background, facilityColors.accentSoft]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ArrowLeft size={24} color={facilityColors.primary} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={[facilityColors.accentSoft, facilityColors.primary]}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Building2 size={40} color={facilityColors.surface} strokeWidth={1.5} />
                </LinearGradient>
              </View>
              <Text style={styles.title}>施設管理者ログイン</Text>
              <Text style={styles.subtitle}>
                施設アカウントでログインして{'\n'}管理機能をご利用ください
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>メールアドレス</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={20} color={facilityColors.textSub} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      if (errorMessage) {
                        setErrorMessage(null);
                      }
                    }}
                    placeholder="facility@example.com"
                    placeholderTextColor={facilityColors.textSub}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>パスワード</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color={facilityColors.textSub} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      if (errorMessage) {
                        setErrorMessage(null);
                      }
                    }}
                    placeholder="パスワードを入力"
                    placeholderTextColor={facilityColors.textSub}
                    secureTextEntry
                  />
                </View>
              </View>

              {errorMessage && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
                disabled={isLoading || isResetSending}
              >
                <Text
                  style={[
                    styles.forgotPasswordText,
                    (isLoading || isResetSending) && styles.disabledForgotPasswordText,
                  ]}
                >
                  {isResetSending ? '送信中...' : 'パスワードを忘れた方'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'ログイン中...' : 'ログイン'}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>または</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Building2 size={20} color={facilityColors.primary} />
                <Text style={styles.registerButtonText}>新規施設登録</Text>
              </TouchableOpacity>

              {DEMO_ENABLED && (
                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={handleGuestLogin}
                  disabled={isLoading}
                >
                  <Text style={styles.guestButtonText}>ゲストとしてログイン（開発用）</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>保護者の方はこちら</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
                <Text style={styles.parentLink}>保護者用ログイン</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: facilityColors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    // Web版での中央配置とレスポンシブ対応
    ...(Platform.OS === 'web' && {
      maxWidth: 500,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  backButton: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
    // Web版では上部パディングを調整
    ...(Platform.OS === 'web' && {
      paddingTop: 40,
      paddingBottom: 40,
    }),
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 24,
    shadowColor: facilityColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: facilityColors.textMain,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: facilityColors.textSub,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: facilityColors.textMain,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: facilityColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: facilityColors.accentSoft,
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
    fontSize: 16,
    color: facilityColors.textMain,
    // Web版では少しコンパクトに
    ...(Platform.OS === 'web' && {
      paddingVertical: 12,
      fontSize: 15,
    }),
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 18,
    fontWeight: '500',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: facilityColors.primary,
    fontWeight: '600',
  },
  disabledForgotPasswordText: {
    opacity: 0.6,
  },
  loginButton: {
    backgroundColor: facilityColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: facilityColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    // Web版では標準的なボタンサイズに
    ...(Platform.OS === 'web' && {
      paddingVertical: 14,
      borderRadius: 8,
      shadowOpacity: 0.2,
      shadowRadius: 6,
    }),
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: facilityColors.surface,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: facilityColors.textSub,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: facilityColors.textSub,
  },
  registerButton: {
    backgroundColor: facilityColors.surface,
    borderWidth: 1,
    borderColor: facilityColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: facilityColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    // Web版での調整
    ...(Platform.OS === 'web' && {
      paddingVertical: 14,
      borderRadius: 8,
      shadowOpacity: 0.08,
      shadowRadius: 3,
    }),
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: facilityColors.primary,
    marginLeft: 8,
  },
  guestButton: {
    backgroundColor: facilityColors.background,
    borderWidth: 1,
    borderColor: facilityColors.textSub,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    // Web版での調整
    ...(Platform.OS === 'web' && {
      paddingVertical: 10,
      borderRadius: 8,
    }),
  },
  guestButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: facilityColors.textSub,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 16,
    color: facilityColors.textSub,
    marginBottom: 8,
  },
  parentLink: {
    fontSize: 16,
    color: facilityColors.primary,
    fontWeight: '600',
  },
});
