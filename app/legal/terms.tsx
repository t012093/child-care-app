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
import { ChevronLeft, FileText } from 'lucide-react-native';
import { colors } from '../../constants/colors';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '利用規約',
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
              <FileText size={48} color={colors.accent} />
            </View>
            <Text style={styles.heroTitle}>利用規約</Text>
            <Text style={styles.heroSubtitle}>最終更新日: 2025年1月1日</Text>
          </View>

          <View style={styles.content}>
            {/* Introduction */}
            <View style={styles.section}>
              <Text style={styles.paragraph}>
                この利用規約（以下「本規約」といいます）は、子育て支援アプリ（以下「当サービス」といいます）の利用条件を定めるものです。ユーザーの皆様には、本規約に同意の上、当サービスをご利用いただきます。
              </Text>
            </View>

            {/* Section 1 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>第1条 適用</Text>
              <Text style={styles.paragraph}>
                1. 本規約は、ユーザーと当サービス運営者との間の当サービスの利用に関わる一切の関係に適用されます。
              </Text>
              <Text style={styles.paragraph}>
                2. 当サービスは、本規約のほか、当サービスの利用に関するガイドラインや個別規定（以下「個別規定」といいます）を定めることがあります。これらの個別規定は本規約の一部を構成するものとします。
              </Text>
              <Text style={styles.paragraph}>
                3. 本規約の規定と個別規定の規定が異なる場合、個別規定において特段の定めがない限り、個別規定が優先されるものとします。
              </Text>
            </View>

            {/* Section 2 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>第2条 利用登録</Text>
              <Text style={styles.paragraph}>
                1. 当サービスの利用を希望する方は、本規約に同意の上、当サービスが定める方法により利用登録を申請し、承認を受けることで利用登録が完了します。
              </Text>
              <Text style={styles.paragraph}>
                2. 当サービスは、以下のいずれかに該当する場合、利用登録の申請を承認しないことがあります。
              </Text>
              <Text style={styles.bulletItem}>• 登録情報に虚偽の内容が含まれる場合</Text>
              <Text style={styles.bulletItem}>• 本規約に違反したことがある者からの申請である場合</Text>
              <Text style={styles.bulletItem}>• 反社会的勢力に属する者からの申請である場合</Text>
              <Text style={styles.bulletItem}>• その他、当サービスが不適切と判断した場合</Text>
            </View>

            {/* Section 3 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>第3条 アカウント情報の管理</Text>
              <Text style={styles.paragraph}>
                1. ユーザーは、自己の責任において、アカウント情報を適切に管理するものとします。
              </Text>
              <Text style={styles.paragraph}>
                2. ユーザーは、アカウント情報を第三者に利用させてはなりません。
              </Text>
              <Text style={styles.paragraph}>
                3. アカウント情報の管理不十分、使用上の過誤、第三者の使用等によって生じた損害について、当サービスは一切の責任を負いません。
              </Text>
            </View>

            {/* Section 4 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>第4条 利用料金</Text>
              <Text style={styles.paragraph}>
                1. 当サービスの基本機能は無料でご利用いただけます。
              </Text>
              <Text style={styles.paragraph}>
                2. 施設の利用料金は、各施設の料金体系に従うものとします。
              </Text>
              <Text style={styles.paragraph}>
                3. 当サービスが有料機能を提供する場合、料金は別途定めるものとします。
              </Text>
            </View>

            {/* Section 5 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>第5条 禁止事項</Text>
              <Text style={styles.paragraph}>
                ユーザーは、当サービスの利用にあたり、以下の行為をしてはなりません。
              </Text>
              <Text style={styles.bulletItem}>• 法令または公序良俗に違反する行為</Text>
              <Text style={styles.bulletItem}>• 犯罪行為に関連する行為</Text>
              <Text style={styles.bulletItem}>• 虚偽の情報を登録する行為</Text>
              <Text style={styles.bulletItem}>
                • 他のユーザーや第三者の知的財産権、肖像権、プライバシー権、名誉その他の権利を侵害する行為
              </Text>
              <Text style={styles.bulletItem}>
                • 当サービスのネットワークまたはシステム等に過度な負荷をかける行為
              </Text>
              <Text style={styles.bulletItem}>
                • 当サービスの運営を妨害するおそれのある行為
              </Text>
              <Text style={styles.bulletItem}>
                • 不正アクセスまたは不正アクセスを試みる行為
              </Text>
              <Text style={styles.bulletItem}>
                • 他のユーザーに関する個人情報等を収集または蓄積する行為
              </Text>
              <Text style={styles.bulletItem}>
                • 他のユーザーに成りすます行為
              </Text>
              <Text style={styles.bulletItem}>
                • 反社会的勢力に対する利益供与その他協力行為
              </Text>
              <Text style={styles.bulletItem}>
                • その他、当サービスが不適切と判断する行為
              </Text>
            </View>

            {/* Section 6 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>第6条 本サービスの提供の停止等</Text>
              <Text style={styles.paragraph}>
                当サービスは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく、本サービスの全部または一部の提供を停止または中断することができます。
              </Text>
              <Text style={styles.bulletItem}>
                • 本サービスに係るシステムの保守点検または更新を行う場合
              </Text>
              <Text style={styles.bulletItem}>
                • 地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合
              </Text>
              <Text style={styles.bulletItem}>
                • その他、当サービスが本サービスの提供が困難と判断した場合
              </Text>
            </View>

            {/* Section 7 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>第7条 利用制限および登録抹消</Text>
              <Text style={styles.paragraph}>
                当サービスは、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、ユーザーに対して、本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができます。
              </Text>
              <Text style={styles.bulletItem}>• 本規約のいずれかの条項に違反した場合</Text>
              <Text style={styles.bulletItem}>• 登録情報に虚偽の事実があることが判明した場合</Text>
              <Text style={styles.bulletItem}>
                • その他、当サービスが本サービスの利用を適当でないと判断した場合
              </Text>
            </View>

            {/* Section 8 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>第8条 保証の否認および免責事項</Text>
              <Text style={styles.paragraph}>
                1. 当サービスは、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます）がないことを保証しません。
              </Text>
              <Text style={styles.paragraph}>
                2. 当サービスは、本サービスに起因してユーザーに生じたあらゆる損害について、当サービスの故意または重過失による場合を除き、一切の責任を負いません。
              </Text>
            </View>

            {/* Section 9 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>第9条 サービス内容の変更等</Text>
              <Text style={styles.paragraph}>
                当サービスは、ユーザーへの事前の告知をもって、本サービスの内容を変更、追加または廃止することがあります。
              </Text>
            </View>

            {/* Section 10 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>第10条 利用規約の変更</Text>
              <Text style={styles.paragraph}>
                1. 当サービスは、必要と判断した場合には、ユーザーへの事前の通知なく、いつでも本規約を変更することができます。
              </Text>
              <Text style={styles.paragraph}>
                2. 変更後の本規約は、当サービスがアプリ内で通知した時点より効力を生じるものとします。
              </Text>
              <Text style={styles.paragraph}>
                3. 本規約の変更後、本サービスの利用を継続した場合には、変更後の本規約に同意したものとみなされます。
              </Text>
            </View>

            {/* Section 11 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>第11条 個人情報の取扱い</Text>
              <Text style={styles.paragraph}>
                当サービスは、本サービスの利用によって取得する個人情報については、別途定める「プライバシーポリシー」に従い適切に取り扱います。
              </Text>
            </View>

            {/* Section 12 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>第12条 準拠法・裁判管轄</Text>
              <Text style={styles.paragraph}>
                1. 本規約の解釈にあたっては、日本法を準拠法とします。
              </Text>
              <Text style={styles.paragraph}>
                2. 本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </Text>
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
