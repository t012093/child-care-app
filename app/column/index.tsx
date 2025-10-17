import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  Animated,
  ImageBackground,
} from 'react-native';
import { Search, ChevronLeft } from 'lucide-react-native';
import { columnColors } from '../../constants/colors';
import { useRouter, Stack } from 'expo-router';
import { mockArticles, categoryColors, type ArticleCategory } from '../../constants/columnData';
import Footer from '../../components/Footer';

export default function ColumnListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [displayedCount, setDisplayedCount] = useState(6);

  // 全タグを取得
  const allTags = Array.from(
    new Set(mockArticles.flatMap((article) => article.tags || []))
  );

  // 人気のカテゴリー（サンプルデザインに合わせて）
  const popularCategories: ArticleCategory[] = ['parenting', 'education', 'nutrition', 'health'];

  // フィルタリング
  const filteredArticles = mockArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => article.tags?.includes(tag));
    return matchesSearch && matchesCategory && matchesTags;
  });

  const displayedArticles = filteredArticles.slice(0, displayedCount);
  const hasMore = displayedCount < filteredArticles.length;

  const handleLoadMore = () => {
    setDisplayedCount((prev) => Math.min(prev + 6, filteredArticles.length));
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // アニメーション用のFadeIn
  const FadeInView = ({ children, delay = 0, style }: any) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          style,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        {children}
      </Animated.View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '保育コラム',
          headerStyle: {
            backgroundColor: columnColors.background,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '700',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
              <ChevronLeft size={24} color={columnColors.textMain} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ヒーローセクション */}
          <View style={styles.hero}>
            <ImageBackground
              source={{
                uri: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1600&h=900&fit=crop&q=80',
              }}
              style={styles.heroBackground}
              imageStyle={styles.heroBackgroundImage}
            >
              <View style={styles.heroOverlay} />
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>保育コラム</Text>
                <Text style={styles.heroSubtitle}>子どもたちの成長を支えるヒントがここに</Text>

                {/* 検索バー */}
                <View style={styles.searchBar}>
                  <Search size={20} color={columnColors.textSub} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="🔍 キーワードで検索..."
                    placeholderTextColor={columnColors.textSub}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                {/* 人気のカテゴリー */}
                <View style={styles.popularCategories}>
                  <Text style={styles.popularCategoriesLabel}>人気のカテゴリー</Text>
                  <View style={styles.popularCategoriesList}>
                    {popularCategories.map((cat) => {
                      const catInfo = categoryColors[cat];
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.heroCategoryTag,
                            selectedCategory === cat && {
                              backgroundColor: columnColors.accent,
                            },
                          ]}
                          onPress={() =>
                            setSelectedCategory(selectedCategory === cat ? 'all' : cat)
                          }
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.heroCategoryText,
                              selectedCategory === cat && styles.heroCategoryTextActive,
                            ]}
                          >
                            {catInfo.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>

          {/* タグフィルター */}
          {allTags.length > 0 && (
            <View style={styles.tagFilterSection}>
              <Text style={styles.tagFilterLabel}>タグで絞り込み</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tagFilterList}
              >
                {allTags.slice(0, 10).map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagChip,
                      selectedTags.includes(tag) && styles.tagChipActive,
                    ]}
                    onPress={() => toggleTag(tag)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.tagChipText,
                        selectedTags.includes(tag) && styles.tagChipTextActive,
                      ]}
                    >
                      #{tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* コラムグリッド */}
          <View style={styles.columnGrid}>
            {displayedArticles.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>該当するコラムが見つかりませんでした</Text>
              </View>
            ) : (
              displayedArticles.map((article, index) => {
                const categoryInfo = categoryColors[article.category];
                return (
                  <FadeInView
                    key={article.id}
                    delay={index * 50}
                    style={[
                      styles.columnCard,
                      Platform.OS === 'web' && styles.columnCardWeb,
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.columnCardInner}
                      onPress={() => router.push(`/column/${article.id}`)}
                      activeOpacity={0.9}
                    >
                      {/* 画像 */}
                      <View style={styles.columnImageContainer}>
                        <Image
                          source={{ uri: article.image }}
                          style={styles.columnImage}
                          resizeMode="cover"
                        />
                        {/* カテゴリーバッジ */}
                        <View style={styles.columnCategoryBadge}>
                          <Text style={styles.columnCategoryText}>{categoryInfo.label}</Text>
                        </View>
                      </View>

                      {/* コンテンツ */}
                      <View style={styles.columnContent}>
                        <Text style={styles.columnId}>#{article.id}</Text>
                        <Text style={styles.columnTitle} numberOfLines={2}>
                          {article.title}
                        </Text>
                        <Text style={styles.columnExcerpt} numberOfLines={3}>
                          {article.excerpt}
                        </Text>

                        {/* フッター */}
                        <View style={styles.columnFooter}>
                          <Text style={styles.columnDate}>{article.date}</Text>
                          {article.tags && article.tags.length > 0 && (
                            <View style={styles.columnTags}>
                              {article.tags.slice(0, 3).map((tag) => (
                                <Text key={tag} style={styles.columnTag}>
                                  #{tag}
                                </Text>
                              ))}
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  </FadeInView>
                );
              })
            )}
          </View>

          {/* もっと見るボタン */}
          {hasMore && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
              activeOpacity={0.8}
            >
              <Text style={styles.loadMoreText}>もっと見る</Text>
            </TouchableOpacity>
          )}

          <Footer />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: columnColors.background,
  },
  headerBackButton: {
    padding: 8,
  },
  // ヒーローセクション
  hero: {
    width: '100%',
    minHeight: Platform.OS === 'web' ? 450 : 350,
    marginBottom: 40,
  },
  heroBackground: {
    width: '100%',
    minHeight: Platform.OS === 'web' ? 450 : 350,
  },
  heroBackgroundImage: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250, 249, 244, 0.92)',
  },
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  heroTitle: {
    fontSize: Platform.OS === 'web' ? 42 : 30,
    fontWeight: '700',
    color: columnColors.textMain,
    marginBottom: 15,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: Platform.OS === 'web' ? 18 : 15,
    color: columnColors.textSub,
    marginBottom: 40,
    textAlign: 'center',
  },
  // 検索バー
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: columnColors.surface,
    borderRadius: 50,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    width: '100%',
    maxWidth: 600,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: columnColors.textMain,
  },
  // 人気のカテゴリー
  popularCategories: {
    alignItems: 'center',
    width: '100%',
  },
  popularCategoriesLabel: {
    fontSize: 13,
    color: columnColors.textSub,
    marginBottom: 15,
  },
  popularCategoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  heroCategoryTag: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: columnColors.surface,
    borderWidth: 2,
    borderColor: columnColors.accent,
    borderRadius: 25,
  },
  heroCategoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: columnColors.accent,
  },
  heroCategoryTextActive: {
    color: columnColors.surface,
  },
  // タグフィルター
  tagFilterSection: {
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: columnColors.background,
  },
  tagFilterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: columnColors.textSub,
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    marginBottom: 12,
  },
  tagFilterList: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: columnColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: columnColors.accentSoft,
    marginRight: 8,
  },
  tagChipActive: {
    backgroundColor: columnColors.accentSoft,
    borderColor: columnColors.accent,
  },
  tagChipText: {
    fontSize: 12,
    color: columnColors.textSub,
    fontWeight: '500',
  },
  tagChipTextActive: {
    color: columnColors.accent,
    fontWeight: '600',
  },
  // コラムグリッド
  columnGrid: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: Platform.OS === 'web' ? 'wrap' : undefined,
    gap: Platform.OS === 'web' ? 30 : 20,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1200 : undefined,
    marginBottom: 40,
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
    width: '100%',
  },
  emptyText: {
    fontSize: 16,
    color: columnColors.textSub,
  },
  columnCard: {
    width: '100%',
    marginBottom: 20,
  },
  columnCardWeb: {
    width: 'calc(33.333% - 20px)',
    maxWidth: 380,
    marginBottom: 0,
  },
  columnCardInner: {
    backgroundColor: columnColors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  columnImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: columnColors.accentSoft,
  },
  columnImage: {
    width: '100%',
    height: '100%',
  },
  columnCategoryBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: columnColors.accent,
    borderRadius: 4,
  },
  columnCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: columnColors.accent,
  },
  columnContent: {
    padding: Platform.OS === 'web' ? 30 : 25,
  },
  columnId: {
    fontSize: 12,
    color: columnColors.textSub,
    marginBottom: 10,
    fontWeight: '500',
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: columnColors.textMain,
    lineHeight: Platform.OS === 'web' ? 30 : 28,
    marginBottom: 15,
  },
  columnExcerpt: {
    fontSize: 13,
    color: columnColors.textSub,
    lineHeight: Platform.OS === 'web' ? 24 : 22,
    marginBottom: 20,
  },
  columnFooter: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  columnDate: {
    fontSize: 12,
    color: columnColors.textSub,
    marginBottom: 12,
  },
  columnTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  columnTag: {
    fontSize: 12,
    color: columnColors.textSub,
  },
  // もっと見るボタン
  loadMoreButton: {
    width: 220,
    alignSelf: 'center',
    paddingVertical: 16,
    paddingHorizontal: 40,
    backgroundColor: columnColors.accent,
    borderRadius: 30,
    marginBottom: 60,
    shadowColor: columnColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  loadMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: columnColors.surface,
    textAlign: 'center',
  },
});
