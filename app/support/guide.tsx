import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  ChevronLeft,
  BookOpen,
  UserPlus,
  Search,
  Calendar,
  FileText,
  Settings,
  HelpCircle,
} from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface GuideSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  steps: string[];
}

const guideData: GuideSection[] = [
  {
    id: 'registration',
    icon: <UserPlus size={32} color={colors.accent} />,
    title: '1. 新規登録とログイン',
    description: 'アカウントを作成して、サービスを利用開始しましょう',
    steps: [
      '「新規登録」ボタンをタップ',
      'メールアドレスとパスワードを入力',
      '保護者情報（お名前、電話番号など）を入力',
      'お子様の情報（お名前、生年月日など）を登録',
      '利用規約とプライバシーポリシーに同意',
      '登録完了！ログインしてサービスをご利用いただけます',
    ],
  },
  {
    id: 'search',
    icon: <Search size={32} color={colors.accent} />,
    title: '2. 施設の検索',
    description: 'お近くの保育施設を簡単に見つけることができます',
    steps: [
      'ホーム画面またはタブバーから「予約」を選択',
      '地図上で施設を確認するか、リストから探す',
      '検索バーでキーワードや施設名で絞り込み',
      'フィルター機能で条件を指定（種別、距離、評価など）',
      '施設をタップして詳細情報を確認',
      'お気に入り登録で後から簡単にアクセス',
    ],
  },
  {
    id: 'reservation',
    icon: <Calendar size={32} color={colors.accent} />,
    title: '3. 施設の予約',
    description: 'オンラインで簡単に予約ができます',
    steps: [
      '施設詳細ページで「予約する」ボタンをタップ',
      '希望の日時を選択',
      'お子様を選択（複数選択可能）',
      '利用時間や特記事項を入力',
      '予約内容を確認',
      '「予約確定」をタップして完了',
      '予約確認メールが届きます',
    ],
  },
  {
    id: 'application',
    icon: <FileText size={32} color={colors.accent} />,
    title: '4. 申請書の作成',
    description: '入園申請書などの書類を簡単に作成できます',
    steps: [
      'ホーム画面またはメニューから「申請書作成」を選択',
      '作成したい申請書の種類を選ぶ',
      '必要情報を入力（保護者情報、お子様情報など）',
      '入力内容を確認',
      'PDFでプレビュー・ダウンロード',
      '印刷して施設に提出、またはデータで送信',
    ],
  },
  {
    id: 'profile',
    icon: <Settings size={32} color={colors.accent} />,
    title: '5. プロフィール管理',
    description: 'アカウント情報やお子様の情報を管理しましょう',
    steps: [
      'タブバーから「プロフィール」を選択',
      '保護者情報の編集：名前、電話番号、メールアドレスなど',
      'お子様情報の編集：名前、生年月日、アレルギー情報など',
      'お子様の追加：「子供を追加」ボタンから登録',
      '設定：通知設定、パスワード変更、アカウント削除など',
      '変更を保存して完了',
    ],
  },
  {
    id: 'support',
    icon: <HelpCircle size={32} color={colors.accent} />,
    title: '6. サポートとお問い合わせ',
    description: '困ったときはこちらから',
    steps: [
      'よくある質問（FAQ）で解決方法を検索',
      '見つからない場合は「お問い合わせ」フォームから質問',
      'カテゴリーを選択して具体的な内容を記入',
      '2営業日以内に返信が届きます',
      '緊急の場合は電話サポートもご利用いただけます',
      '電話: 03-1234-5678（平日 9:00-18:00）',
    ],
  },
];

function GuideCard({ guide }: { guide: GuideSection }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.guideCard}>
      <TouchableOpacity
        style={styles.guideHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.guideIconContainer}>{guide.icon}</View>
        <View style={styles.guideHeaderText}>
          <Text style={styles.guideTitle}>{guide.title}</Text>
          <Text style={styles.guideDescription}>{guide.description}</Text>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.guideContent}>
          {guide.steps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.expandButton}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.expandButtonText}>
          {isExpanded ? '閉じる' : '詳しく見る'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function GuideScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '使い方ガイド',
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
            <View style={styles.heroIcon}>
              <BookOpen size={48} color={colors.accent} />
            </View>
            <Text style={styles.heroTitle}>使い方ガイド</Text>
            <Text style={styles.heroSubtitle}>
              アプリの基本的な使い方をステップバイステップで解説します
            </Text>
          </View>

          {/* Quick Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>💡 便利なヒント</Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>
                • 施設をお気に入り登録すると、すぐにアクセスできます
              </Text>
              <Text style={styles.tipText}>
                • プッシュ通知を有効にすると、予約リマインダーが届きます
              </Text>
              <Text style={styles.tipText}>
                • お子様の情報は一度登録すれば、次回から自動入力されます
              </Text>
              <Text style={styles.tipText}>
                • 申請書のデータは保存されるので、繰り返し使えます
              </Text>
            </View>
          </View>

          {/* Guide Cards */}
          <View style={styles.guideList}>
            {guideData.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </View>

          {/* Help CTA */}
          <View style={styles.helpCta}>
            <Text style={styles.helpCtaTitle}>さらに詳しいサポートが必要ですか？</Text>
            <Text style={styles.helpCtaText}>
              よくある質問や直接お問い合わせいただけます
            </Text>
            <View style={styles.helpButtons}>
              <TouchableOpacity
                style={[styles.helpButton, styles.helpButtonPrimary]}
                onPress={() => router.push('/support/faq')}
              >
                <Text style={styles.helpButtonTextPrimary}>FAQ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.helpButton, styles.helpButtonSecondary]}
                onPress={() => router.push('/support/contact')}
              >
                <Text style={styles.helpButtonTextSecondary}>お問い合わせ</Text>
              </TouchableOpacity>
            </View>
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
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
  tipsSection: {
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
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  tipText: {
    fontSize: 15,
    color: colors.textMain,
    lineHeight: 24,
    marginBottom: 8,
  },
  guideList: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  guideCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  guideHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  guideIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  guideHeaderText: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 4,
  },
  guideDescription: {
    fontSize: 14,
    color: colors.textSub,
    lineHeight: 20,
  },
  guideContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.surface,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: colors.textMain,
    lineHeight: 22,
  },
  expandButton: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  helpCta: {
    marginTop: 32,
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    paddingVertical: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  helpCtaTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
    textAlign: 'center',
  },
  helpCtaText: {
    fontSize: 15,
    color: colors.textSub,
    marginBottom: 20,
    textAlign: 'center',
  },
  helpButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  helpButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  helpButtonPrimary: {
    backgroundColor: colors.accent,
  },
  helpButtonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  helpButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  helpButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  bottomSpacing: {
    height: 32,
  },
});
