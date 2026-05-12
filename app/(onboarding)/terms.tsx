import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/lib/AuthContext';
import { colors } from '@/constants/colors';

export default function TermsScreen() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const { completeOnboarding } = useAuth();

  const handleComplete = async () => {
    if (!agreedToTerms || !agreedToPrivacy) {
      Alert.alert(
        '同意が必要です',
        '利用規約とプライバシーポリシーへの同意が必要です。',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    try {
      await completeOnboarding();
      router.replace('/(auth)/login');
    } catch {
      Alert.alert('エラー', 'オンボーディングの完了に失敗しました。');
    }
  };

  const CheckBox = ({ 
    checked, 
    onPress, 
    children 
  }: { 
    checked: boolean; 
    onPress: () => void; 
    children: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkedCheckbox]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxText}>{children}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <LinearGradient
        colors={[colors.background, colors.accentSoft]}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>利用規約・プライバシーポリシー</Text>
            <Text style={styles.subtitle}>
              安心・安全にご利用いただくために{'\n'}ご確認をお願いします
            </Text>
          </View>

          {/* Terms Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📜 利用規約</Text>
            <View style={styles.contentCard}>
              <Text style={styles.contentText}>
                本アプリケーションをご利用いただく際の基本的なルールです。{'\n\n'}
                
                <Text style={styles.bold}>• 適切な利用</Text>{'\n'}
                施設予約やコミュニティ機能は、本来の目的に沿ってご利用ください。{'\n\n'}
                
                <Text style={styles.bold}>• 個人情報の取り扱い</Text>{'\n'}
                お客様の個人情報は適切に管理し、第三者に提供することはありません。{'\n\n'}
                
                <Text style={styles.bold}>• 禁止事項</Text>{'\n'}
                迷惑行為、不適切な投稿、虚偽の情報提供は禁止されています。{'\n\n'}
                
                <Text style={styles.bold}>• サービスの変更・停止</Text>{'\n'}
                サービスの改善のため、機能の変更や一時的な停止を行う場合があります。
              </Text>
            </View>
          </View>

          {/* Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔒 プライバシーポリシー</Text>
            <View style={styles.contentCard}>
              <Text style={styles.contentText}>
                お客様の個人情報保護に関する方針です。{'\n\n'}
                
                <Text style={styles.bold}>• 収集する情報</Text>{'\n'}
                アカウント情報、お子様の基本情報、利用履歴を収集します。{'\n\n'}
                
                <Text style={styles.bold}>• 利用目的</Text>{'\n'}
                サービス提供、予約管理、安全確保、サービス改善のためです。{'\n\n'}
                
                <Text style={styles.bold}>• 情報の共有</Text>{'\n'}
                法律で義務づけられた場合を除き、第三者と情報を共有しません。{'\n\n'}
                
                <Text style={styles.bold}>• セキュリティ</Text>{'\n'}
                最新の暗号化技術を使用し、情報の安全性を確保しています。
              </Text>
            </View>
          </View>

          {/* Checkboxes */}
          <View style={styles.agreementSection}>
            <CheckBox
              checked={agreedToTerms}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              利用規約に同意する
            </CheckBox>
            
            <CheckBox
              checked={agreedToPrivacy}
              onPress={() => setAgreedToPrivacy(!agreedToPrivacy)}
            >
              プライバシーポリシーに同意する
            </CheckBox>
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={[
              styles.completeButton,
              (!agreedToTerms || !agreedToPrivacy) && styles.disabledButton
            ]} 
            onPress={handleComplete}
            disabled={!agreedToTerms || !agreedToPrivacy}
          >
            <Text style={[
              styles.completeButtonText,
              (!agreedToTerms || !agreedToPrivacy) && styles.disabledButtonText
            ]}>
              同意して完了
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 12,
  },
  contentCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contentText: {
    fontSize: 14,
    color: colors.textSub,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
    color: colors.textMain,
  },
  agreementSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.textSub,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkedCheckbox: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  checkboxText: {
    fontSize: 16,
    color: colors.textMain,
    fontWeight: '600',
    flex: 1,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  completeButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: colors.textSub,
    opacity: 0.5,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  disabledButtonText: {
    color: colors.surface,
  },
});
