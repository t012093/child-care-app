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
  Animated,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Search, ChevronDown, ChevronUp } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'reservation' | 'account' | 'facility' | 'technical' | 'other';
}

const faqData: FAQ[] = [
  {
    id: '1',
    question: '施設の予約をキャンセルしたい場合はどうすればいいですか？',
    answer: 'プロフィール画面から「予約履歴」を選択し、キャンセルしたい予約を選んで「キャンセル」ボタンを押してください。キャンセルポリシーは施設によって異なりますので、必ず確認してください。',
    category: 'reservation',
  },
  {
    id: '2',
    question: '予約の変更はできますか？',
    answer: '予約の変更は、一度キャンセルしてから再度予約する必要があります。キャンセル料が発生する場合がありますので、ご注意ください。',
    category: 'reservation',
  },
  {
    id: '3',
    question: '複数の子供を同時に予約できますか？',
    answer: 'はい、可能です。予約画面で「子供を追加」ボタンから複数のお子様を選択できます。',
    category: 'reservation',
  },
  {
    id: '4',
    question: 'パスワードを忘れてしまいました',
    answer: 'ログイン画面の「パスワードを忘れた方」をタップし、登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。',
    category: 'account',
  },
  {
    id: '5',
    question: 'メールアドレスを変更したいです',
    answer: 'プロフィール画面から「設定」→「アカウント情報」→「メールアドレス変更」で変更できます。新しいメールアドレスに確認メールが送信されます。',
    category: 'account',
  },
  {
    id: '6',
    question: 'アカウントを削除したい場合は？',
    answer: '設定画面の「アカウント削除」から手続きできます。削除すると全てのデータが消去され、復元できませんのでご注意ください。',
    category: 'account',
  },
  {
    id: '7',
    question: '施設の詳細情報を確認するには？',
    answer: '施設一覧または地図から施設を選択すると、詳細ページが表示されます。営業時間、料金、設備、口コミなどの情報が確認できます。',
    category: 'facility',
  },
  {
    id: '8',
    question: '施設にレビューを投稿できますか？',
    answer: '実際に利用した施設にのみ、レビューを投稿できます。予約履歴から該当する施設を選び、「レビューを書く」をタップしてください。',
    category: 'facility',
  },
  {
    id: '9',
    question: 'お気に入り施設を保存できますか？',
    answer: 'はい、施設詳細ページのハートアイコンをタップすると、お気に入りに追加できます。お気に入り一覧はプロフィール画面から確認できます。',
    category: 'facility',
  },
  {
    id: '10',
    question: 'アプリが起動しません',
    answer: 'アプリを完全に終了してから再起動してください。それでも解決しない場合は、アプリを再インストールするか、サポートにお問い合わせください。',
    category: 'technical',
  },
  {
    id: '11',
    question: '通知が届きません',
    answer: 'デバイスの設定で、本アプリの通知が許可されているか確認してください。設定→通知→子育て支援アプリで確認できます。',
    category: 'technical',
  },
  {
    id: '12',
    question: '対応しているOSのバージョンは？',
    answer: 'iOS 13.0以上、Android 8.0以上に対応しています。最新のOSでのご利用を推奨します。',
    category: 'technical',
  },
  {
    id: '13',
    question: '利用料金はかかりますか？',
    answer: 'アプリの利用は無料です。施設の利用料金は各施設の料金体系に従います。',
    category: 'other',
  },
  {
    id: '14',
    question: '子供の情報は安全に管理されますか？',
    answer: 'はい、お子様の個人情報は最新の暗号化技術で保護され、厳重に管理されています。詳しくはプライバシーポリシーをご確認ください。',
    category: 'other',
  },
  {
    id: '15',
    question: 'サポートへの問い合わせ方法は？',
    answer: 'アプリ内の「お問い合わせ」フォームから、またはsupport@childcare.appまでメールでお問い合わせください。',
    category: 'other',
  },
];

const categories = [
  { id: 'all', label: 'すべて' },
  { id: 'reservation', label: '予約について' },
  { id: 'account', label: 'アカウント' },
  { id: 'facility', label: '施設について' },
  { id: 'technical', label: '技術的な問題' },
  { id: 'other', label: 'その他' },
];

function FAQItem({ faq, isOpen, onToggle }: { faq: FAQ; isOpen: boolean; onToggle: () => void }) {
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity style={styles.faqHeader} onPress={onToggle} activeOpacity={0.7}>
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        {isOpen ? (
          <ChevronUp size={20} color={colors.accent} />
        ) : (
          <ChevronDown size={20} color={colors.textSub} />
        )}
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
        </View>
      )}
    </View>
  );
}

export default function FAQScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const filteredFaqs = faqData.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'よくある質問',
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
            <Text style={styles.heroTitle}>よくある質問</Text>
            <Text style={styles.heroSubtitle}>お探しの情報が見つかります</Text>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Search size={20} color={colors.textSub} />
              <TextInput
                style={styles.searchInput}
                placeholder="質問を検索..."
                placeholderTextColor={colors.textSub}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabs}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.id && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    selectedCategory === category.id && styles.categoryTabTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* FAQ List */}
          <View style={styles.faqList}>
            {filteredFaqs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>該当する質問が見つかりませんでした</Text>
              </View>
            ) : (
              filteredFaqs.map((faq) => (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  isOpen={openFaqId === faq.id}
                  onToggle={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                />
              ))
            )}
          </View>

          {/* Contact CTA */}
          <View style={styles.contactCta}>
            <Text style={styles.contactCtaTitle}>問題が解決しませんでしたか？</Text>
            <Text style={styles.contactCtaText}>
              お困りの場合は、お気軽にお問い合わせください
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => router.push('/support/contact')}
            >
              <Text style={styles.contactButtonText}>お問い合わせ</Text>
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
    marginBottom: 24,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
    maxWidth: 500,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: colors.textMain,
  },
  categoryTabs: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    paddingVertical: 20,
    gap: 12,
    alignSelf: 'center',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryTabActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryTabText: {
    fontSize: 14,
    color: colors.textSub,
    fontWeight: '500',
  },
  categoryTabTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  faqList: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  faqItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  faqAnswerText: {
    fontSize: 15,
    color: colors.textSub,
    lineHeight: 24,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSub,
  },
  contactCta: {
    marginTop: 40,
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    paddingVertical: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  contactCtaTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
    textAlign: 'center',
  },
  contactCtaText: {
    fontSize: 15,
    color: colors.textSub,
    marginBottom: 20,
    textAlign: 'center',
  },
  contactButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  bottomSpacing: {
    height: 32,
  },
});
