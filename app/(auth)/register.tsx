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
import { colors } from '@/constants/colors';
import { sendVerificationCode, verifyVerificationCode } from '@/lib/emailVerification';
import { SUPABASE_CONFIGURED } from '@/lib/supabase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const requiresEmailVerification = SUPABASE_CONFIGURED;

  const showFormError = (message: string, title = '入力エラー') => {
    setErrorMessage(message);
    if (Platform.OS !== 'web') {
      Alert.alert(title, message);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const resetVerificationState = () => {
    setVerificationCode('');
    setIsCodeSent(false);
    setIsEmailVerified(false);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errorMessage) {
      setErrorMessage(null);
    }
    if (isCodeSent || isEmailVerified || verificationCode) {
      resetVerificationState();
    }
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      showFormError('メールアドレスを入力してください。');
      return;
    }

    if (!validateEmail(email.trim())) {
      showFormError('正しいメールアドレスを入力してください。');
      return;
    }

    setErrorMessage(null);
    setIsSendingCode(true);
    try {
      await sendVerificationCode(email.trim());
      setIsCodeSent(true);
      setIsEmailVerified(false);
      if (Platform.OS !== 'web') {
        Alert.alert('認証コードを送信しました', 'メールに届いた6桁の認証コードを入力してください。');
      }
    } catch (error) {
      showFormError(
        error instanceof Error ? error.message : '認証コードの送信に失敗しました。',
        '送信エラー'
      );
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!email.trim() || !validateEmail(email.trim())) {
      showFormError('先に正しいメールアドレスを入力してください。');
      return;
    }

    if (!verificationCode.trim()) {
      showFormError('認証コードを入力してください。');
      return;
    }

    setErrorMessage(null);
    setIsVerifyingCode(true);
    try {
      await verifyVerificationCode(email.trim(), verificationCode.trim());
      setIsEmailVerified(true);
      if (Platform.OS !== 'web') {
        Alert.alert('認証完了', 'メールアドレスの確認が完了しました。');
      }
    } catch (error) {
      showFormError(
        error instanceof Error ? error.message : '認証コードの確認に失敗しました。',
        '認証エラー'
      );
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleNext = async () => {
    if (!email.trim()) {
      showFormError('メールアドレスを入力してください。');
      return;
    }

    if (!validateEmail(email.trim())) {
      showFormError('正しいメールアドレスを入力してください。');
      return;
    }

    if (!password.trim()) {
      showFormError('パスワードを入力してください。');
      return;
    }

    if (password.length < 6) {
      showFormError('パスワードは6文字以上で入力してください。');
      return;
    }

    if (password !== confirmPassword) {
      showFormError('パスワードが一致しません。');
      return;
    }

    if (requiresEmailVerification && !isEmailVerified) {
      showFormError('先にメール認証を完了してください。');
      return;
    }

    setErrorMessage(null);
    // 次の画面に遷移（保護者情報入力）
    router.push({
      pathname: '/(auth)/parent-info',
      params: { email: email.trim(), password }
    });
  };

  const handleLogin = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <LinearGradient
          colors={[colors.background, colors.accentSoft]}
          style={styles.gradient}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="always"
          >
            <View style={styles.contentShell}>
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Text style={styles.logo}>👶</Text>
                </View>
                <Text style={styles.title}>新規登録</Text>
                <Text style={styles.subtitle}>
                  アカウントを作成して{'\n'}便利な機能をご利用ください
                </Text>
              </View>
              <View style={styles.formCard}>
                <View style={styles.formContainer}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>メールアドレス</Text>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={handleEmailChange}
                      placeholder="example@email.com"
                      placeholderTextColor={colors.textSub}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  {requiresEmailVerification && (
                    <>
                      <View style={styles.verificationRow}>
                        <TouchableOpacity
                          style={[
                            styles.secondaryButton,
                            (isSendingCode || isEmailVerified) && styles.disabledButton,
                          ]}
                          onPress={handleSendCode}
                          disabled={isSendingCode || isEmailVerified}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.secondaryButtonText}>
                            {isEmailVerified
                              ? '認証済み'
                              : isSendingCode
                                ? '送信中...'
                                : isCodeSent
                                  ? '再送信'
                                  : '認証コード送信'}
                          </Text>
                        </TouchableOpacity>
                        {isCodeSent && !isEmailVerified ? (
                          <Text style={styles.verificationHint}>6桁コードをメール送信済み</Text>
                        ) : null}
                      </View>

                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>認証コード</Text>
                        <TextInput
                          style={styles.input}
                          value={verificationCode}
                          onChangeText={(value) => {
                            setVerificationCode(value);
                            if (errorMessage) {
                              setErrorMessage(null);
                            }
                          }}
                          placeholder="メールに届いた6桁コード"
                          placeholderTextColor={colors.textSub}
                          keyboardType="number-pad"
                          editable={!isEmailVerified}
                        />
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.secondaryButton,
                          styles.verifyButton,
                          (isVerifyingCode || isEmailVerified) && styles.disabledButton,
                        ]}
                        onPress={handleVerifyCode}
                        disabled={isVerifyingCode || isEmailVerified}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.secondaryButtonText}>
                          {isEmailVerified
                            ? 'メール認証が完了しています'
                            : isVerifyingCode
                              ? '確認中...'
                              : '認証コードを確認'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>パスワード</Text>
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        if (errorMessage) {
                          setErrorMessage(null);
                        }
                      }}
                      placeholder="6文字以上で入力"
                      placeholderTextColor={colors.textSub}
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>パスワード（確認）</Text>
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={(value) => {
                        setConfirmPassword(value);
                        if (errorMessage) {
                          setErrorMessage(null);
                        }
                      }}
                      placeholder="パスワードを再入力"
                      placeholderTextColor={colors.textSub}
                      secureTextEntry
                    />
                  </View>

                  {errorMessage && (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                  )}

                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      {requiresEmailVerification
                        ? 'メール認証が完了すると、次の画面で保護者情報とお子様の情報を入力できます。'
                        : '次の画面で保護者情報とお子様の情報を入力していただきます。'}
                    </Text>
                  </View>

                  <TouchableOpacity 
                    style={[styles.nextButton, isLoading && styles.disabledButton]}
                    onPress={handleNext}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.nextButtonText}>
                      {isLoading ? '処理中...' : '次へ進む'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>すでにアカウントをお持ちの方</Text>
                  <TouchableOpacity onPress={handleLogin}>
                    <Text style={styles.loginLink}>ログイン</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
    backgroundColor: colors.background,
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
    paddingVertical: 24,
  },
  contentShell: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 520 : undefined,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 24 : 40,
    paddingBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
  },
  formCard: {
    ...(Platform.OS === 'web' && {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 24,
      shadowColor: '#11332B',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.08,
      shadowRadius: 32,
      elevation: 6,
    }),
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.textMain,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  verificationRow: {
    marginBottom: 20,
    gap: 10,
  },
  verificationHint: {
    fontSize: 13,
    color: colors.textSub,
    paddingHorizontal: 4,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  verifyButton: {
    marginBottom: 20,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent,
  },
  infoBox: {
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    padding: 16,
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
  infoText: {
    fontSize: 14,
    color: colors.textMain,
    lineHeight: 20,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 16,
    color: colors.textSub,
    marginBottom: 8,
  },
  loginLink: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
  },
});
