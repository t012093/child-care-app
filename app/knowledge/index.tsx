import React, { useEffect, useState } from 'react';
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
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Search, Book, Users, Heart, Home, Baby, Briefcase } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { fetchKnowledgeItems, type KnowledgeItem } from '../../lib/knowledgeService';

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
  const [knowledgeData, setKnowledgeData] = useState<KnowledgeItem[]>([]);

  useEffect(() => {
    fetchKnowledgeItems().then(setKnowledgeData).catch(() => {});
  }, []);

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
                    // TODO: ナレッジ詳細ページ実装後に遷移先を更新
                    Alert.alert(item.title, item.description);
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
