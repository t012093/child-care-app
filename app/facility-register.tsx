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
import { Building2, Mail, Lock, Phone, MapPin, ArrowLeft } from 'lucide-react-native';
import { facilityColors } from '@/constants/colors';

export default function FacilityRegisterScreen() {
  const [facilityName, setFacilityName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (!facilityName.trim()) {
      Alert.alert('入力エラー', '施設名を入力してください。');
      return;
    }

    if (!email.trim()) {
      Alert.alert('入力エラー', 'メールアドレスを入力してください。');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('入力エラー', '正しいメールアドレスを入力してください。');
      return;
    }

    if (!password.trim()) {
      Alert.alert('入力エラー', 'パスワードを入力してください。');
      return;
    }

    if (password.length < 8) {
      Alert.alert('入力エラー', 'パスワードは8文字以上で入力してください。');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('入力エラー', 'パスワードが一致しません。');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('入力エラー', '電話番号を入力してください。');
      return;
    }

    if (!address.trim()) {
      Alert.alert('入力エラー', '住所を入力してください。');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert(
        '登録完了',
        '施設の新規登録が完了しました。担当者より連絡をお待ちください。',
        [
          {
            text: 'OK',
            onPress: () => router.push('/nursery_entrance' as any),
          },
        ]
      );
    } catch (error) {
      Alert.alert('登録エラー', '登録に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
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
                <Building2 size={40} color={facilityColors.primary} strokeWidth={2} />
              </View>
              <Text style={styles.title}>施設新規登録</Text>
              <Text style={styles.subtitle}>
                施設情報を入力して{'\n'}管理システムを始めましょう
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>施設名 *</Text>
                <View style={styles.inputWrapper}>
                  <Building2 size={20} color={facilityColors.textSub} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={facilityName}
                    onChangeText={setFacilityName}
                    placeholder="〇〇保育園"
                    placeholderTextColor={facilityColors.textSub}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>メールアドレス *</Text>
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
                <Text style={styles.inputLabel}>パスワード *</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color={facilityColors.textSub} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="8文字以上で入力"
                    placeholderTextColor={facilityColors.textSub}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>パスワード（確認） *</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color={facilityColors.textSub} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="パスワードを再入力"
                    placeholderTextColor={facilityColors.textSub}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>電話番号 *</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={20} color={facilityColors.textSub} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="03-1234-5678"
                    placeholderTextColor={facilityColors.textSub}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>住所 *</Text>
                <View style={styles.inputWrapper}>
                  <MapPin size={20} color={facilityColors.textSub} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="東京都〇〇区..."
                    placeholderTextColor={facilityColors.textSub}
                  />
                </View>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  📝 登録後、担当者が内容を確認し、ご連絡いたします。
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.disabledButton]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.registerButtonText}>
                  {isLoading ? '登録中...' : '登録する'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>すでにアカウントをお持ちの方</Text>
              <TouchableOpacity onPress={() => router.push('/facility-login' as any)}>
                <Text style={styles.loginLink}>ログイン</Text>
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
      maxWidth: 600,
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
    backgroundColor: facilityColors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: facilityColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
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
  infoBox: {
    backgroundColor: facilityColors.accentSoft,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: facilityColors.textMain,
    lineHeight: 20,
    textAlign: 'center',
  },
  registerButton: {
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
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: facilityColors.surface,
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
  loginLink: {
    fontSize: 16,
    color: facilityColors.primary,
    fontWeight: '600',
  },
});