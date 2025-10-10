import React from 'react';
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
import { ChevronLeft, Shield } from 'lucide-react-native';
import { colors } from '../../constants/colors';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'プライバシーポリシー',
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
              <Shield size={48} color={colors.accent} />
            </View>
            <Text style={styles.heroTitle}>プライバシーポリシー</Text>
            <Text style={styles.heroSubtitle}>最終更新日: 2025年1月1日</Text>
          </View>

          <View style={styles.content}>
            {/* Introduction */}
            <View style={styles.section}>
              <Text style={styles.paragraph}>
                子育て支援アプリ（以下「当サービス」といいます）は、ユーザーの皆様の個人情報保護を重要視し、個人情報の保護に関する法律（個人情報保護法）、その他の関連法令を遵守し、適切に取り扱います。
              </Text>
            </View>

            {/* Section 1 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. 収集する情報</Text>
              <Text style={styles.paragraph}>
                当サービスでは、以下の情報を収集します：
              </Text>

              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>1.1 アカウント情報</Text>
                <Text style={styles.bulletItem}>• お名前</Text>
                <Text style={styles.bulletItem}>• メールアドレス</Text>
                <Text style={styles.bulletItem}>• 電話番号</Text>
                <Text style={styles.bulletItem}>• パスワード（暗号化）</Text>
                <Text style={styles.bulletItem}>• プロフィール写真（任意）</Text>
              </View>

              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>1.2 お子様の情報</Text>
                <Text style={styles.bulletItem}>• お名前</Text>
                <Text style={styles.bulletItem}>• 生年月日</Text>
                <Text style={styles.bulletItem}>• 性別</Text>
                <Text style={styles.bulletItem}>• アレルギー情報</Text>
                <Text style={styles.bulletItem}>• 健康状態に関する情報</Text>
                <Text style={styles.bulletItem}>• 写真（任意）</Text>
              </View>

              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>1.3 利用情報</Text>
                <Text style={styles.bulletItem}>• 予約履歴</Text>
                <Text style={styles.bulletItem}>• 検索履歴</Text>
                <Text style={styles.bulletItem}>• アプリの利用状況</Text>
                <Text style={styles.bulletItem}>• 位置情報（許可された場合）</Text>
                <Text style={styles.bulletItem}>• デバイス情報（OS、機種など）</Text>
              </View>
            </View>

            {/* Section 2 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. 情報の利用目的</Text>
              <Text style={styles.paragraph}>
                収集した個人情報は、以下の目的で利用します：
              </Text>
              <Text style={styles.bulletItem}>• サービスの提供・運営</Text>
              <Text style={styles.bulletItem}>• 施設の予約管理</Text>
              <Text style={styles.bulletItem}>• お子様の安全確保</Text>
              <Text style={styles.bulletItem}>• ユーザーサポート</Text>
              <Text style={styles.bulletItem}>• サービスの改善・新機能開発</Text>
              <Text style={styles.bulletItem}>• 統計データの作成（個人を特定できない形式）</Text>
              <Text style={styles.bulletItem}>• 重要なお知らせの送信</Text>
              <Text style={styles.bulletItem}>• 不正利用の防止</Text>
            </View>

            {/* Section 3 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. 情報の共有</Text>
              <Text style={styles.paragraph}>
                当サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供しません：
              </Text>
              <Text style={styles.bulletItem}>
                • ユーザーの同意を得た場合
              </Text>
              <Text style={styles.bulletItem}>
                • 予約された施設への必要最小限の情報提供
              </Text>
              <Text style={styles.bulletItem}>
                • 法令に基づく開示が必要な場合
              </Text>
              <Text style={styles.bulletItem}>
                • 人の生命、身体または財産の保護のために必要な場合
              </Text>
            </View>

            {/* Section 4 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. 情報の保護</Text>
              <Text style={styles.paragraph}>
                当サービスは、個人情報の漏洩、滅失、毀損を防止するため、以下のセキュリティ対策を実施しています：
              </Text>
              <Text style={styles.bulletItem}>
                • SSL/TLS暗号化通信の使用
              </Text>
              <Text style={styles.bulletItem}>
                • パスワードの暗号化保存
              </Text>
              <Text style={styles.bulletItem}>
                • アクセス制限とログ管理
              </Text>
              <Text style={styles.bulletItem}>
                • 定期的なセキュリティ監査
              </Text>
              <Text style={styles.bulletItem}>
                • 従業員への教育・研修
              </Text>
            </View>

            {/* Section 5 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Cookie・分析ツール</Text>
              <Text style={styles.paragraph}>
                当サービスでは、サービス向上のため、Cookieや分析ツールを使用する場合があります。これらのツールは、匿名化された情報のみを収集し、個人を特定することはありません。
              </Text>
            </View>

            {/* Section 6 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. ユーザーの権利</Text>
              <Text style={styles.paragraph}>
                ユーザーは、以下の権利を有します：
              </Text>
              <Text style={styles.bulletItem}>
                • 自己の個人情報の開示請求
              </Text>
              <Text style={styles.bulletItem}>
                • 個人情報の訂正・追加・削除
              </Text>
              <Text style={styles.bulletItem}>
                • 個人情報の利用停止・消去
              </Text>
              <Text style={styles.bulletItem}>
                • アカウントの削除
              </Text>
              <Text style={styles.paragraph}>
                これらの権利行使については、アプリ内設定またはお問い合わせフォームからご連絡ください。
              </Text>
            </View>

            {/* Section 7 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. お子様の情報について</Text>
              <Text style={styles.paragraph}>
                当サービスは、13歳未満のお子様から直接個人情報を収集しません。お子様の情報は、保護者の方により入力・管理されます。保護者の方には、お子様の情報を適切に管理いただくようお願いいたします。
              </Text>
            </View>

            {/* Section 8 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. プライバシーポリシーの変更</Text>
              <Text style={styles.paragraph}>
                当サービスは、必要に応じて本ポリシーを変更することがあります。重要な変更がある場合は、アプリ内通知またはメールでお知らせします。変更後も継続してサービスをご利用いただくことで、変更内容に同意したものとみなされます。
              </Text>
            </View>

            {/* Section 9 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. お問い合わせ</Text>
              <Text style={styles.paragraph}>
                個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください：
              </Text>
              <View style={styles.contactBox}>
                <Text style={styles.contactText}>子育て支援アプリ 個人情報保護窓口</Text>
                <Text style={styles.contactText}>メール: privacy@childcare.app</Text>
                <Text style={styles.contactText}>電話: 03-1234-5678</Text>
                <Text style={styles.contactText}>受付時間: 平日 9:00-18:00</Text>
              </View>
            </View>

            {/* Last Updated */}
            <View style={styles.lastUpdated}>
              <Text style={styles.lastUpdatedText}>
                制定日: 2024年10月1日{'\n'}
                最終改定日: 2025年1月1日
              </Text>
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
    fontSize: 14,
    color: colors.textSub,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    paddingVertical: 32,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 12,
  },
  subsection: {
    marginTop: 16,
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: colors.textMain,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletItem: {
    fontSize: 15,
    color: colors.textMain,
    lineHeight: 24,
    marginBottom: 6,
    paddingLeft: 8,
  },
  contactBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  contactText: {
    fontSize: 15,
    color: colors.textMain,
    lineHeight: 24,
  },
  lastUpdated: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 24,
  },
  lastUpdatedText: {
    fontSize: 13,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 32,
  },
});
