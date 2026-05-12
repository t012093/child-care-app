import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Mail, Phone, MapPin, Send, Clock } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

const contactCategories = [
  { id: 'reservation', label: '予約に関するお問い合わせ' },
  { id: 'account', label: 'アカウントについて' },
  { id: 'technical', label: '技術的な問題' },
  { id: 'facility', label: '施設について' },
  { id: 'other', label: 'その他のお問い合わせ' },
];

const SUPPORT_RECIPIENT_ID = process.env.EXPO_PUBLIC_SUPPORT_USER_ID?.trim() || '';

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function mapContactError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('row-level security')) {
    return '送信権限の確認に失敗しました。再ログインしてもう一度お試しください。';
  }

  if (normalized.includes('invalid input syntax for type uuid')) {
    return 'お問い合わせ送信先の設定に不備があります。管理者へお問い合わせください。';
  }

  if (normalized.includes('foreign key')) {
    return 'お問い合わせ送信先の設定に不備があります。管理者へお問い合わせください。';
  }

  return message;
}

export default function ContactScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !category || !trimmedMessage) {
      Alert.alert('入力エラー', 'すべての項目を入力してください');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      Alert.alert('入力エラー', '有効なメールアドレスを入力してください');
      return;
    }

    if (!user) {
      Alert.alert('送信エラー', 'ログイン情報を確認できませんでした。再ログイン後にお試しください。');
      return;
    }

    if (user.id === 'demo-user') {
      Alert.alert('送信不可', 'ゲストユーザーではお問い合わせを送信できません。');
      return;
    }

    const selectedCategory = contactCategories.find((item) => item.id === category);
    const categoryLabel = selectedCategory?.label || category;
    const recipientId = isUuid(SUPPORT_RECIPIENT_ID) ? SUPPORT_RECIPIENT_ID : user.id;
    const supportRouted = recipientId !== user.id;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          sender_type: 'parent',
          recipient_id: recipientId,
          subject: `【お問い合わせ】${categoryLabel}`,
          body: [
            `種別: ${categoryLabel}`,
            `氏名: ${trimmedName}`,
            `返信先メール: ${trimmedEmail}`,
            '',
            trimmedMessage,
          ].join('\n'),
        });

      if (error) {
        throw new Error(mapContactError(error.message || 'お問い合わせの送信に失敗しました。'));
      }

      Alert.alert(
        '送信完了',
        supportRouted
          ? 'お問い合わせを受け付けました。\n2営業日以内にご返信いたします。'
          : 'お問い合わせを受け付けました。\n開発環境のため、運営転送先は未設定の可能性があります。',
        [
          {
            text: 'OK',
            onPress: () => {
              setName('');
              setEmail('');
              setCategory('');
              setMessage('');
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        '送信エラー',
        error instanceof Error
          ? mapContactError(error.message)
          : 'お問い合わせの送信に失敗しました。'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCall = () => {
    Linking.openURL('tel:0312345678');
  };

  const handleEmailLink = () => {
    Linking.openURL('mailto:support@childcare.app');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'お問い合わせ',
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '700',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
              <ChevronLeft size={24} color={colors.textMain} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>お問い合わせ</Text>
            <Text style={styles.heroSubtitle}>
              お困りのことがございましたら{'\n'}お気軽にお問い合わせください
            </Text>
          </View>

          {/* Contact Methods */}
          <View style={styles.contactMethods}>
            <Text style={styles.sectionTitle}>その他のお問い合わせ方法</Text>

            <TouchableOpacity style={styles.contactMethodCard} onPress={handleEmailLink}>
              <View style={[styles.methodIcon, { backgroundColor: '#E3F2FD' }]}>
                <Mail size={24} color="#2196F3" />
              </View>
              <View style={styles.methodContent}>
                <Text style={styles.methodTitle}>メール</Text>
                <Text style={styles.methodText}>support@childcare.app</Text>
                <Text style={styles.methodSubtext}>24時間受付</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactMethodCard} onPress={handleCall}>
              <View style={[styles.methodIcon, { backgroundColor: '#E8F5E9' }]}>
                <Phone size={24} color="#4CAF50" />
              </View>
              <View style={styles.methodContent}>
                <Text style={styles.methodTitle}>電話</Text>
                <Text style={styles.methodText}>03-1234-5678</Text>
                <Text style={styles.methodSubtext}>平日 9:00-18:00</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.contactMethodCard}>
              <View style={[styles.methodIcon, { backgroundColor: '#FFF3E0' }]}>
                <MapPin size={24} color="#FF9800" />
              </View>
              <View style={styles.methodContent}>
                <Text style={styles.methodTitle}>所在地</Text>
                <Text style={styles.methodText}>〒150-0001</Text>
                <Text style={styles.methodText}>東京都渋谷区神宮前1-1-1</Text>
              </View>
            </View>

            <View style={styles.contactMethodCard}>
              <View style={[styles.methodIcon, { backgroundColor: '#F3E5F5' }]}>
                <Clock size={24} color="#9C27B0" />
              </View>
              <View style={styles.methodContent}>
                <Text style={styles.methodTitle}>サポート時間</Text>
                <Text style={styles.methodText}>平日: 9:00-18:00</Text>
                <Text style={styles.methodText}>土日祝: 休業</Text>
              </View>
            </View>
          </View>

          {/* Contact Form */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>お問い合わせフォーム</Text>
            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>お名前 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="山田 太郎"
                  placeholderTextColor={colors.textSub}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>メールアドレス *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  placeholderTextColor={colors.textSub}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>お問い合わせ種別 *</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryChips}
                >
                  {contactCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChip,
                        category === cat.id && styles.categoryChipActive,
                      ]}
                      onPress={() => setCategory(cat.id)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          category === cat.id && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>お問い合わせ内容 *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="お問い合わせ内容をご記入ください"
                  placeholderTextColor={colors.textSub}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              <Text style={styles.note}>
                * は必須項目です。{'\n'}
                お問い合わせ内容によっては、回答までに数日いただく場合がございます。
              </Text>

              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={() => {
                  void handleSubmit();
                }}
                disabled={isSubmitting}
              >
                <Send size={20} color={colors.surface} />
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? '送信中...' : '送信する'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ Link */}
          <View style={styles.faqCta}>
            <Text style={styles.faqCtaTitle}>よくある質問もご確認ください</Text>
            <Text style={styles.faqCtaText}>
              多くのお問い合わせにFAQで回答しております
            </Text>
            <TouchableOpacity
              style={styles.faqButton}
              onPress={() => router.push('/support/faq')}
            >
              <Text style={styles.faqButtonText}>FAQを見る</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
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
  headerBackButton: {
    padding: 8,
  },
  hero: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    paddingVertical: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  heroTitle: {
    fontSize: Platform.OS === 'web' ? 32 : 24,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 24,
  },
  contactMethods: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    paddingVertical: 32,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 20,
  },
  contactMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 4,
  },
  methodText: {
    fontSize: 15,
    color: colors.textMain,
    marginBottom: 2,
  },
  methodSubtext: {
    fontSize: 13,
    color: colors.textSub,
  },
  formSection: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    paddingVertical: 32,
    backgroundColor: colors.surface,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  form: {
    width: '100%',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textMain,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  categoryChips: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryChipText: {
    fontSize: 14,
    color: colors.textSub,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  note: {
    fontSize: 13,
    color: colors.textSub,
    lineHeight: 20,
    marginBottom: 24,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  faqCta: {
    marginTop: 32,
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    paddingVertical: 32,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  faqCtaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
    textAlign: 'center',
  },
  faqCtaText: {
    fontSize: 15,
    color: colors.textSub,
    marginBottom: 20,
    textAlign: 'center',
  },
  faqButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  faqButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  bottomSpacing: {
    height: 32,
  },
});
