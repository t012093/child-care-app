import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import FacilityHeroSection from '../components/FacilityHeroSection';
import FacilityFeatureCard from '../components/FacilityFeatureCard';
import { Calendar, Users, BarChart3, MessageCircle, ArrowLeft } from 'lucide-react-native';
import { facilityColors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';

export default function NurseryEntranceScreen() {
  const router = useRouter();
  const { isTablet, horizontalPadding } = useResponsive();

  const features = [
    {
      icon: Calendar,
      title: '予約管理',
      description: '一時預かりや見学の予約を一元管理。空き状況の更新も簡単です。',
    },
    {
      icon: Users,
      title: '施設情報更新',
      description: '施設の基本情報、写真、スタッフ紹介などをいつでも更新できます。',
    },
    {
      icon: BarChart3,
      title: '利用統計',
      description: '予約状況や利用者数の推移をグラフで確認。経営判断に役立ちます。',
    },
    {
      icon: MessageCircle,
      title: '利用者対応',
      description: '保護者からの問い合わせに迅速に対応。コミュニケーションをスムーズに。',
    },
  ];

  const sectionStyle = [
    styles.section,
    { paddingHorizontal: horizontalPadding },
  ];

  const featuresContainerStyle = [
    styles.featuresContainer,
    isTablet && styles.featuresContainerTablet,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 戻るボタン */}
        <View style={sectionStyle}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={facilityColors.primary} />
            <Text style={styles.backButtonText}>戻る</Text>
          </TouchableOpacity>
        </View>

        <FacilityHeroSection />

        {/* 主要機能セクション */}
        <View style={sectionStyle}>
          <Text style={styles.sectionTitle}>主要機能</Text>
          <Text style={styles.sectionSubtitle}>
            保育施設の運営をサポートする充実の機能
          </Text>

          <View style={featuresContainerStyle}>
            {features.map((feature, index) => (
              <FacilityFeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </View>
        </View>

        {/* 導入実績セクション */}
        <View style={[sectionStyle, styles.statsSection]}>
          <Text style={styles.sectionTitle}>導入実績</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>導入施設数</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>満足度</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50,000+</Text>
              <Text style={styles.statLabel}>利用者数</Text>
            </View>
          </View>
        </View>

        {/* お問い合わせセクション */}
        <View style={[sectionStyle, styles.contactSection]}>
          <Text style={styles.contactTitle}>お問い合わせ</Text>
          <Text style={styles.contactText}>
            サービスについてのご質問や、導入のご相談はこちらからお問い合わせください。
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => router.push('/contact' as any)}
          >
            <MessageCircle size={20} color="white" />
            <Text style={styles.contactButtonText}>お問い合わせフォーム</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: facilityColors.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: facilityColors.primary,
  },
  section: {
    paddingVertical: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: facilityColors.textMain,
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: facilityColors.textSub,
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresContainer: {
    gap: 16,
  },
  featuresContainerTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statsSection: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: facilityColors.primary,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: facilityColors.textSub,
  },
  contactSection: {
    backgroundColor: facilityColors.accentSoft,
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 16,
    marginVertical: 40,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: facilityColors.textMain,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: facilityColors.textSub,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: facilityColors.accent,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    gap: 8,
    shadowColor: facilityColors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  footer: {
    height: 40,
  },
});