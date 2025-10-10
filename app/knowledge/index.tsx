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
  Image,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Search, Book, Users, Heart, Home, Baby, Briefcase } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  category: 'subsidy' | 'health' | 'education' | 'community' | 'work' | 'facility';
  imageUrl: string;
  date: string;
}

const knowledgeData: KnowledgeItem[] = [
  {
    id: '1',
    title: '保育料の補助金制度について',
    description: '国や自治体が提供する保育料の補助金制度を詳しく解説します。申請方法や必要書類もご案内。',
    category: 'subsidy',
    imageUrl: 'https://images.unsplash.com/photo-1554224311-beee415c201f?w=800&h=600&fit=crop',
    date: '2025-01-10',
  },
  {
    id: '2',
    title: '子供の発達段階と健康チェック',
    description: '0歳から6歳までの子供の発達段階と、各年齢で注意すべき健康ポイントをまとめました。',
    category: 'health',
    imageUrl: 'https://images.unsplash.com/photo-1587393855524-087f83d95bc9?w=800&h=600&fit=crop',
    date: '2025-01-08',
  },
  {
    id: '3',
    title: '幼児教育の基礎知識',
    description: 'モンテッソーリ教育、シュタイナー教育など、様々な教育法の特徴と選び方をご紹介。',
    category: 'education',
    imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
    date: '2025-01-05',
  },
  {
    id: '4',
    title: '地域の子育てコミュニティ',
    description: 'お住まいの地域で参加できる子育てサークルやイベント情報をお届けします。',
    category: 'community',
    imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&h=600&fit=crop',
    date: '2025-01-03',
  },
  {
    id: '5',
    title: '仕事と育児の両立支援制度',
    description: '育児休業、時短勤務、在宅勤務など、働くパパママを支援する制度を解説します。',
    category: 'work',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
    date: '2025-01-01',
  },
  {
    id: '6',
    title: '保育施設の種類と選び方',
    description: '認可保育園、認定こども園、企業主導型保育など、各施設の特徴と選び方のポイント。',
    category: 'facility',
    imageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=600&fit=crop',
    date: '2024-12-28',
  },
  {
    id: '7',
    title: '予防接種スケジュールガイド',
    description: '0歳から必要な予防接種の種類とスケジュールを分かりやすく説明します。',
    category: 'health',
    imageUrl: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&h=600&fit=crop',
    date: '2024-12-25',
  },
  {
    id: '8',
    title: '子供の食育と栄養管理',
    description: '離乳食から幼児食まで、年齢に応じた食育のポイントとレシピをご紹介。',
    category: 'health',
    imageUrl: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&h=600&fit=crop',
    date: '2024-12-20',
  },
  {
    id: '9',
    title: '児童手当と医療費助成制度',
    description: '児童手当の申請方法や、自治体ごとに異なる医療費助成制度について詳しく解説。',
    category: 'subsidy',
    imageUrl: 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?w=800&h=600&fit=crop',
    date: '2024-12-15',
  },
];

const categories = [
  { id: 'all', label: 'すべて', icon: <Home size={20} color={colors.accent} /> },
  { id: 'subsidy', label: '助成金・補助金', icon: <Briefcase size={20} color={colors.accent} /> },
  { id: 'health', label: '健康・発達', icon: <Heart size={20} color={colors.accent} /> },
  { id: 'education', label: '教育', icon: <Book size={20} color={colors.accent} /> },
  { id: 'community', label: 'コミュニティ', icon: <Users size={20} color={colors.accent} /> },
  { id: 'work', label: '仕事と育児', icon: <Briefcase size={20} color={colors.accent} /> },
  { id: 'facility', label: '施設情報', icon: <Baby size={20} color={colors.accent} /> },
];

function KnowledgeCard({ item, onPress }: { item: KnowledgeItem; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.card, Platform.OS === 'web' && styles.cardWeb]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardContent}>
        <Text style={styles.cardDate}>{new Date(item.date).toLocaleDateString('ja-JP')}</Text>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={3}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function KnowledgeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredKnowledge = knowledgeData.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'お役立ち情報',
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
              <Book size={48} color={colors.accent} />
            </View>
            <Text style={styles.heroTitle}>お役立ち情報</Text>
            <Text style={styles.heroSubtitle}>
              子育てに役立つ制度や知識をわかりやすくお届けします
            </Text>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Search size={20} color={colors.textSub} />
              <TextInput
                style={styles.searchInput}
                placeholder="キーワードで検索..."
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
                {category.icon}
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

          {/* Knowledge Grid */}
          <View style={styles.knowledgeGrid}>
            {filteredKnowledge.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>該当する情報が見つかりませんでした</Text>
              </View>
            ) : (
              filteredKnowledge.map((item) => (
                <KnowledgeCard
                  key={item.id}
                  item={item}
                  onPress={() => {
                    // 実際のアプリでは詳細ページに遷移
                    console.log('Knowledge item pressed:', item.id);
                  }}
                />
              ))
            )}
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>もっと詳しく知りたいですか？</Text>
            <Text style={styles.ctaText}>
              子育てコラムでは、専門家による詳しい記事をご覧いただけます
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/column')}
            >
              <Text style={styles.ctaButtonText}>子育てコラムを見る</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
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
  knowledgeGrid: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: Platform.OS === 'web' ? 'wrap' : undefined,
    gap: Platform.OS === 'web' ? 24 : 16,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardWeb: {
    width: 'calc(50% - 12px)',
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
  },
  cardContent: {
    padding: 16,
  },
  cardDate: {
    fontSize: 12,
    color: colors.textSub,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
    lineHeight: 26,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSub,
    lineHeight: 22,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    width: '100%',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSub,
  },
  ctaSection: {
    marginTop: 40,
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    paddingVertical: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 15,
    color: colors.textSub,
    marginBottom: 20,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  bottomSpacing: {
    height: 32,
  },
});
