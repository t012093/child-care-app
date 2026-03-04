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
import { useAuth } from '@/lib/AuthContext';
import { colors } from '@/constants/colors';

export default function ChildInfoScreen() {
  const params = useLocalSearchParams();
  const { 
    email, 
    password, 
    parentName, 
    phoneNumber, 
    address, 
    emergencyContact, 
    emergencyPhone 
  } = params as {
    email: string;
    password: string;
    parentName: string;
    phoneNumber: string;
    address: string;
    emergencyContact: string;
    emergencyPhone: string;
  };

  const [childName, setChildName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalInfo, setMedicalInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();

  const validateBirthDate = (date: string) => {
    const regex = /^\d{4}\/\d{2}\/\d{2}$/;
    if (!regex.test(date)) return false;
    
    const [year, month, day] = date.split('/').map(Number);
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    
    return inputDate <= today && 
           inputDate.getFullYear() === year &&
           inputDate.getMonth() === month - 1 &&
           inputDate.getDate() === day;
  };

  const handleComplete = async () => {
    if (!childName.trim()) {
      Alert.alert('入力エラー', 'お子様のお名前を入力してください。');
      return;
    }

    if (!birthDate.trim()) {
      Alert.alert('入力エラー', '生年月日を入力してください。');
      return;
    }

    if (!validateBirthDate(birthDate)) {
      Alert.alert('入力エラー', '生年月日は正しい形式（例: 2020/04/15）で入力してください。');
      return;
    }

    setIsLoading(true);
    try {
      // ユーザーデータを作成して登録
      const userData = {
        email,
        password,
        name: parentName,
        parentInfo: {
          phone: phoneNumber,
          address,
          emergencyContact: emergencyPhone,
        },
        children: [{
          id: Date.now().toString(),
          name: childName.trim(),
          birthDate,
          allergies: allergies.trim() ? allergies.trim().split('、').map(a => a.trim()) : [],
          medicalInfo: medicalInfo.trim() || undefined,
        }],
      };

      await register(userData);
      router.replace('/(tabs)/profile');
    } catch (error) {
      Alert.alert('登録エラー', error instanceof Error ? error.message : '登録に失敗しました。');
    } finally {
      setIsLoading(false);
    }
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
                  <View style={[styles.progressDot, styles.completedProgressDot]} />
                  <View style={[styles.progressLine, styles.completedProgressLine]} />
                  <View style={[styles.progressDot, styles.activeProgressDot]} />
                </View>
                <Text style={styles.title}>お子様の情報</Text>
                <Text style={styles.subtitle}>
                  安全なご利用のために必要な情報です
                </Text>
              </View>
              <View style={styles.formCard}>
                <View style={styles.formContainer}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>お子様のお名前 *</Text>
                    <TextInput
                      style={styles.input}
                      value={childName}
                      onChangeText={setChildName}
                      placeholder="山田 次郎"
                      placeholderTextColor={colors.textSub}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>生年月日 *</Text>
                    <TextInput
                      style={styles.input}
                      value={birthDate}
                      onChangeText={setBirthDate}
                      placeholder="2020/04/15"
                      placeholderTextColor={colors.textSub}
                      keyboardType="numeric"
                    />
                    <Text style={styles.helperText}>形式: YYYY/MM/DD</Text>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>アレルギー情報</Text>
                    <TextInput
                      style={[styles.input, styles.multilineInput]}
                      value={allergies}
                      onChangeText={setAllergies}
                      placeholder="例: 卵、牛乳、小麦（複数の場合は「、」で区切ってください）"
                      placeholderTextColor={colors.textSub}
                      multiline
                      numberOfLines={3}
                    />
                    <Text style={styles.helperText}>アレルギーがない場合は空欄で構いません</Text>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>医療情報・かかりつけ医</Text>
                    <TextInput
                      style={[styles.input, styles.multilineInput]}
                      value={medicalInfo}
                      onChangeText={setMedicalInfo}
                      placeholder="例: ○○クリニック（Dr.△△）、持病、服用中の薬など"
                      placeholderTextColor={colors.textSub}
                      multiline
                      numberOfLines={3}
                    />
                    <Text style={styles.helperText}>緊急時に必要な医療情報があれば記入してください</Text>
                  </View>

                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      すべての情報は暗号化され、安全に保存されます。{'\n'}
                      施設利用時の安全確保と緊急時対応のためにのみ使用されます。
                    </Text>
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
                    style={[styles.completeButton, isLoading && styles.disabledButton]}
                    onPress={handleComplete}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.completeButtonText}>
                      {isLoading ? '登録中...' : '登録完了'}
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
  completedProgressDot: {
    backgroundColor: colors.success,
    opacity: 1,
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
  completedProgressLine: {
    backgroundColor: colors.success,
    opacity: 1,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: colors.textSub,
    marginTop: 4,
    marginLeft: 4,
  },
  infoBox: {
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: colors.textMain,
    lineHeight: 20,
    textAlign: 'center',
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
  completeButton: {
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
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
});
