import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  ChevronLeft,
  Heart,
  Target,
  Users,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react-native';
import { colors } from '../../constants/colors';

export default function AboutScreen() {
  const router = useRouter();

  const handleEmail = () => {
    Linking.openURL('mailto:info@childcare.app');
  };

  const handlePhone = () => {
    Linking.openURL('tel:0312345678');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '会社概要',
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
              <Heart size={48} color={colors.accent} fill={colors.accent} />
            </View>
            <Text style={styles.heroTitle}>子育て支援アプリ</Text>
            <Text style={styles.heroSubtitle}>
              すべての親子に、安心と笑顔を届けるために
            </Text>
          </View>

          <View style={styles.content}>
            {/* Mission Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Target size={24} color={colors.accent} />
                </View>
                <Text style={styles.sectionTitle}>ミッション</Text>
              </View>
              <Text style={styles.paragraph}>
                私たちは、子育てに関わるすべての方々が、より安心して、より楽しく子育てができる社会の実現を目指しています。
              </Text>
              <Text style={styles.paragraph}>
                保育施設の検索から予約、申請書作成まで、煩雑な手続きをシンプルにし、親御さんが本当に大切なこと—お子様との時間—に集中できる環境を作ります。
              </Text>
            </View>

            {/* Vision Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Heart size={24} color={colors.accent} />
                </View>
                <Text style={styles.sectionTitle}>ビジョン</Text>
              </View>
              <Text style={styles.paragraph}>
                テクノロジーの力で、子育てのハードルを下げ、すべての家庭に笑顔を届けます。
              </Text>
              <View style={styles.visionList}>
                <View style={styles.visionItem}>
                  <View style={styles.visionBullet} />
                  <Text style={styles.visionText}>
                    いつでも、どこでも、簡単に保育施設を探せる
                  </Text>
                </View>
                <View style={styles.visionItem}>
                  <View style={styles.visionBullet} />
                  <Text style={styles.visionText}>
                    複雑な申請書類を、スマホひとつで作成できる
                  </Text>
                </View>
                <View style={styles.visionItem}>
                  <View style={styles.visionBullet} />
                  <Text style={styles.visionText}>
                    信頼できる子育て情報に、いつでもアクセスできる
                  </Text>
                </View>
                <View style={styles.visionItem}>
                  <View style={styles.visionBullet} />
                  <Text style={styles.visionText}>
                    地域のコミュニティと繋がり、支え合える
                  </Text>
                </View>
              </View>
            </View>

            {/* Services Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Users size={24} color={colors.accent} />
                </View>
                <Text style={styles.sectionTitle}>サービス内容</Text>
              </View>

              <View style={styles.serviceCard}>
                <Text style={styles.serviceTitle}>🔍 施設検索・予約</Text>
                <Text style={styles.serviceDescription}>
                  お住まいの地域の保育施設を簡単に検索。地図表示や詳細情報で、最適な施設が見つかります。オンライン予約で時間を節約。
                </Text>
              </View>

              <View style={styles.serviceCard}>
                <Text style={styles.serviceTitle}>📝 申請書自動作成</Text>
                <Text style={styles.serviceDescription}>
                  入園申請書や就労証明書など、複雑な書類をスマホで簡単に作成。一度入力した情報は保存され、次回から自動入力。
                </Text>
              </View>

              <View style={styles.serviceCard}>
                <Text style={styles.serviceTitle}>📚 子育てコラム</Text>
                <Text style={styles.serviceDescription}>
                  専門家による信頼できる子育て情報を毎日更新。発達、健康、教育など、幅広いテーマをカバー。
                </Text>
              </View>

              <View style={styles.serviceCard}>
                <Text style={styles.serviceTitle}>💡 お役立ち情報</Text>
                <Text style={styles.serviceDescription}>
                  助成金制度、予防接種スケジュール、地域のイベント情報など、知っておきたい情報をわかりやすく提供。
                </Text>
              </View>
            </View>

            {/* Stats Section */}
            <View style={styles.statsSection}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>10,000+</Text>
                <Text style={styles.statLabel}>登録ユーザー</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>500+</Text>
                <Text style={styles.statLabel}>提携施設</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>98%</Text>
                <Text style={styles.statLabel}>満足度</Text>
              </View>
            </View>

            {/* Company Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>会社情報</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>会社名</Text>
                  <Text style={styles.infoValue}>株式会社 子育て支援</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>設立</Text>
                  <Text style={styles.infoValue}>2024年10月</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>所在地</Text>
                  <Text style={styles.infoValue}>
                    〒150-0001{'\n'}
                    東京都渋谷区神宮前1-1-1
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>事業内容</Text>
                  <Text style={styles.infoValue}>
                    子育て支援プラットフォームの開発・運営{'\n'}
                    保育施設マッチングサービス
                  </Text>
                </View>
              </View>
            </View>

            {/* Contact Section */}
            <View style={styles.contactSection}>
              <Text style={styles.contactTitle}>お問い合わせ</Text>
              <Text style={styles.contactSubtitle}>
                サービスに関するご質問、ご要望など、お気軽にご連絡ください
              </Text>

              <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
                <View style={styles.contactIcon}>
                  <Mail size={24} color={colors.accent} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>メール</Text>
                  <Text style={styles.contactValue}>info@childcare.app</Text>
                </View>
                <ExternalLink size={20} color={colors.textSub} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactCard} onPress={handlePhone}>
                <View style={styles.contactIcon}>
                  <Phone size={24} color={colors.accent} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>電話</Text>
                  <Text style={styles.contactValue}>03-1234-5678</Text>
                  <Text style={styles.contactNote}>平日 9:00-18:00</Text>
                </View>
                <ExternalLink size={20} color={colors.textSub} />
              </TouchableOpacity>

              <View style={styles.contactCard}>
                <View style={styles.contactIcon}>
                  <MapPin size={24} color={colors.accent} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>所在地</Text>
                  <Text style={styles.contactValue}>
                    〒150-0001{'\n'}
                    東京都渋谷区神宮前1-1-1
                  </Text>
                </View>
              </View>
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
    paddingVertical: 48,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: Platform.OS === 'web' ? 36 : 28,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 26,
  },
  content: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    paddingVertical: 32,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textMain,
  },
  paragraph: {
    fontSize: 16,
    color: colors.textMain,
    lineHeight: 26,
    marginBottom: 16,
  },
  visionList: {
    marginTop: 16,
  },
  visionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  visionBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: 12,
    marginTop: 8,
  },
  visionText: {
    flex: 1,
    fontSize: 16,
    color: colors.textMain,
    lineHeight: 24,
  },
  serviceCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 15,
    color: colors.textSub,
    lineHeight: 24,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSub,
  },
  infoValue: {
    flex: 1,
    fontSize: 15,
    color: colors.textMain,
    lineHeight: 22,
  },
  contactSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 24,
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: 15,
    color: colors.textSub,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: colors.textSub,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textMain,
    lineHeight: 22,
  },
  contactNote: {
    fontSize: 12,
    color: colors.textSub,
    marginTop: 2,
  },
  bottomSpacing: {
    height: 32,
  },
});
