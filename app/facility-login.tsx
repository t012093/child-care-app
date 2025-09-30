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

export default function FacilityLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください。');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/(facility-tabs)/dashboard' as any);
    } catch (error) {
      Alert.alert('ログインエラー', 'メールアドレスまたはパスワードが正しくありません。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/facility-register' as any);
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
            Alert.alert('送信完了', '登録されたメールアドレスにパスワードリセット用のリンクを送信しました。');
          }
        },
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      // ゲストログインのシミュレーション
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/(facility-tabs)/dashboard' as any);
    } catch (error) {
      Alert.alert('ログインエラー', 'ゲストログインに失敗しました。');
    } finally {
      setIsLoading(false);
    }
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
                    onChangeText={setEmail}
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
                    onChangeText={setPassword}
                    placeholder="パスワードを入力"
                    placeholderTextColor={facilityColors.textSub}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>パスワードを忘れた方</Text>
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

              <TouchableOpacity
                style={styles.guestButton}
                onPress={handleGuestLogin}
                disabled={isLoading}
              >
                <Text style={styles.guestButtonText}>ゲストとしてログイン（開発用）</Text>
              </TouchableOpacity>
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
  forgotPasswordText: {
    fontSize: 14,
    color: facilityColors.primary,
    fontWeight: '600',
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