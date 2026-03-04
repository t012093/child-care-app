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
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';

export default function ParentInfoScreen() {
  const params = useLocalSearchParams();
  const { email, password } = params as { email: string; password: string };

  const [parentName, setParentName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    if (!parentName.trim()) {
      Alert.alert('入力エラー', '保護者のお名前を入力してください。');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('入力エラー', '電話番号を入力してください。');
      return;
    }

    if (!address.trim()) {
      Alert.alert('入力エラー', 'ご住所を入力してください。');
      return;
    }

    if (!emergencyContact.trim()) {
      Alert.alert('入力エラー', '緊急連絡先の方のお名前を入力してください。');
      return;
    }

    if (!emergencyPhone.trim()) {
      Alert.alert('入力エラー', '緊急連絡先の電話番号を入力してください。');
      return;
    }

    // 次の画面に遷移（子ども情報入力）
    router.push({
      pathname: '/(auth)/child-info',
      params: { 
        email,
        password,
        parentName: parentName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        emergencyContact: emergencyContact.trim(),
        emergencyPhone: emergencyPhone.trim(),
      }
    });
  };

  const handleBack = () => {
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
                <View style={styles.progressContainer}>
                  <View style={[styles.progressDot, styles.activeProgressDot]} />
                  <View style={styles.progressLine} />
                  <View style={styles.progressDot} />
                </View>
                <Text style={styles.title}>保護者情報</Text>
                <Text style={styles.subtitle}>
                  施設利用時の連絡先として使用します
                </Text>
              </View>
              <View style={styles.formCard}>
                <View style={styles.formContainer}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>保護者のお名前 *</Text>
                    <TextInput
                      style={styles.input}
                      value={parentName}
                      onChangeText={setParentName}
                      placeholder="山田 太郎"
                      placeholderTextColor={colors.textSub}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>電話番号 *</Text>
                    <TextInput
                      style={styles.input}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="090-1234-5678"
                      placeholderTextColor={colors.textSub}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>ご住所 *</Text>
                    <TextInput
                      style={[styles.input, styles.multilineInput]}
                      value={address}
                      onChangeText={setAddress}
                      placeholder="東京都渋谷区○○○1-2-3"
                      placeholderTextColor={colors.textSub}
                      multiline
                      numberOfLines={2}
                    />
                  </View>

                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>緊急連絡先</Text>
                    <Text style={styles.sectionDescription}>
                      保護者と連絡が取れない場合の連絡先
                    </Text>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>緊急連絡先のお名前 *</Text>
                    <TextInput
                      style={styles.input}
                      value={emergencyContact}
                      onChangeText={setEmergencyContact}
                      placeholder="山田 花子（配偶者・祖父母など）"
                      placeholderTextColor={colors.textSub}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>緊急連絡先の電話番号 *</Text>
                    <TextInput
                      style={styles.input}
                      value={emergencyPhone}
                      onChangeText={setEmergencyPhone}
                      placeholder="090-9876-5432"
                      placeholderTextColor={colors.textSub}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={styles.backButton}
                    onPress={handleBack}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.backButtonText}>戻る</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.nextButton, isLoading && styles.disabledButton]}
                    onPress={handleNext}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.nextButtonText}>
                      {isLoading ? '処理中...' : '次へ'}
                    </Text>
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
    maxWidth: Platform.OS === 'web' ? 560 : undefined,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 24 : 40,
    paddingBottom: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.textSub,
    opacity: 0.3,
  },
  activeProgressDot: {
    backgroundColor: colors.accent,
    opacity: 1,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.textSub,
    opacity: 0.3,
    marginHorizontal: 8,
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
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSub,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 24,
    marginTop: 8,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  nextButton: {
    flex: 2,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
});
