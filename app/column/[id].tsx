import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Share,
} from 'react-native';
import { ChevronLeft, Clock, Heart, Share2, ChevronRight, ArrowUp } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { mockArticles, categoryColors } from '../../constants/columnData';

export default function ColumnDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const article = mockArticles.find((a) => a.id === id);

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>記事が見つかりませんでした</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const categoryInfo = categoryColors[article.category];

  // 関連記事（同じカテゴリーの他の記事を2つ）
  const relatedArticles = mockArticles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, 2);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\n${article.excerpt}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: 実際の保存処理（AsyncStorageまたはSupabase）
  };

  const scrollToTop = () => {
    // Web環境でのスクロールトップ
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
              <ChevronLeft size={24} color={colors.textMain} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            const offsetY = e.nativeEvent.contentOffset.y;
            setShowScrollTop(offsetY > 300);
          }}
          scrollEventThrottle={16}
        >
          <View style={styles.article}>
            {/* パンくずナビゲーション */}
            <View style={styles.breadcrumb}>
              <TouchableOpacity onPress={() => router.push('/')}>
                <Text style={styles.breadcrumbText}>ホーム</Text>
              </TouchableOpacity>
              <Text style={styles.breadcrumbSeparator}>/</Text>
              <TouchableOpacity onPress={() => router.push('/column')}>
                <Text style={styles.breadcrumbText}>コラム</Text>
              </TouchableOpacity>
              <Text style={styles.breadcrumbSeparator}>/</Text>
              <Text style={[styles.breadcrumbText, styles.breadcrumbCurrent]}>
                {categoryInfo.label}
              </Text>
            </View>

            {/* カテゴリー + 日付 */}
            <View style={styles.categoryDateSection}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color }]}>
                <Text style={styles.categoryBadgeText}>{categoryInfo.label}</Text>
              </View>
              <Text style={styles.publishDate}>
                {new Date(article.publishedAt).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                }).replace(/\//g, '.')}
              </Text>
            </View>

            {/* タイトル */}
            <Text style={styles.articleTitle}>{article.title}</Text>

            {/* アイキャッチ画像 */}
            <View style={styles.heroImageContainer}>
              <Image source={{ uri: article.image }} style={styles.heroImage} />
            </View>

            {/* SNSシェアボタン */}
            <View style={styles.snsShare}>
              <TouchableOpacity style={styles.snsButton} onPress={handleShare}>
                <Share2 size={18} color={colors.surface} />
                <Text style={styles.snsButtonText}>シェア</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.snsButton, isFavorite && styles.snsButtonFavorite]}
                onPress={toggleFavorite}
              >
                <Heart
                  size={18}
                  color={isFavorite ? '#EF4444' : colors.surface}
                  fill={isFavorite ? '#EF4444' : 'transparent'}
                />
                <Text style={[styles.snsButtonText, isFavorite && styles.snsButtonTextFavorite]}>
                  {isFavorite ? '保存済み' : '保存'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 本文 */}
            <View style={styles.articleBody}>
              {article.content.map((block, index) => {
                switch (block.type) {
                  case 'heading':
                    return (
                      <View key={index} style={styles.headingContainer}>
                        <View style={styles.headingBorder} />
                        <Text style={styles.heading}>{block.content as string}</Text>
                      </View>
                    );
                  case 'paragraph':
                    return (
                      <Text key={index} style={styles.paragraph}>
                        {block.content as string}
                      </Text>
                    );
                  case 'highlight':
                    return (
                      <View key={index} style={styles.highlightBox}>
                        <View style={styles.highlightIcon}>
                          <Text style={styles.highlightIconText}>💡</Text>
                        </View>
                        <Text style={styles.highlightText}>{block.content as string}</Text>
                      </View>
                    );
                  case 'list':
                    return (
                      <View key={index} style={styles.list}>
                        {(block.content as string[]).map((item, i) => (
                          <View key={i} style={styles.listItem}>
                            <View style={styles.listBullet}>
                              <Text style={styles.listBulletText}>•</Text>
                            </View>
                            <Text style={styles.listItemText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    );
                  case 'image':
                    return (
                      <View key={index} style={styles.contentImageContainer}>
                        <Image
                          source={{ uri: block.content as string }}
                          style={styles.contentImage}
                        />
                      </View>
                    );
                  default:
                    return null;
                }
              })}
            </View>

            {/* 著者情報セクション */}
            <View style={styles.authorSection}>
              <Text style={styles.authorSectionTitle}>この記事の執筆者</Text>
              <View style={styles.authorCard}>
                <Image source={{ uri: article.author.avatar }} style={styles.authorAvatar} />
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>{article.author.name}</Text>
                  <Text style={styles.authorRole}>{article.author.role}</Text>
                </View>
              </View>
            </View>

            {/* 関連記事 */}
            {relatedArticles.length > 0 && (
              <View style={styles.relatedSection}>
                <Text style={styles.relatedSectionTitle}>関連記事</Text>
                <View style={styles.relatedGrid}>
                  {relatedArticles.map((relatedArticle) => {
                    const relatedCategoryInfo = categoryColors[relatedArticle.category];
                    return (
                      <TouchableOpacity
                        key={relatedArticle.id}
                        style={styles.relatedCard}
                        onPress={() => router.push(`/column/${relatedArticle.id}`)}
                        activeOpacity={0.7}
                      >
                        <Image
                          source={{ uri: relatedArticle.image }}
                          style={styles.relatedImage}
                        />
                        <View style={styles.relatedContent}>
                          <View
                            style={[
                              styles.relatedCategoryBadge,
                              { backgroundColor: relatedCategoryInfo.color },
                            ]}
                          >
                            <Text style={styles.relatedCategoryText}>
                              {relatedCategoryInfo.label}
                            </Text>
                          </View>
                          <Text style={styles.relatedTitle} numberOfLines={2}>
                            {relatedArticle.title}
                          </Text>
                          <View style={styles.relatedMeta}>
                            <Clock size={12} color={colors.textSub} />
                            <Text style={styles.relatedMetaText}>
                              {relatedArticle.readingTime}分
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          <View style={styles.footer} />
        </ScrollView>

        {/* トップへ戻るボタン */}
        {showScrollTop && (
          <TouchableOpacity style={styles.scrollTopButton} onPress={scrollToTop}>
            <ArrowUp size={24} color={colors.surface} />
          </TouchableOpacity>
        )}
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
  article: {
    backgroundColor: colors.surface,
    marginHorizontal: 0,
    marginTop: 0,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: colors.accentSoft,
  },
  breadcrumbText: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '500',
  },
  breadcrumbSeparator: {
    fontSize: 13,
    color: colors.textSub,
    marginHorizontal: 8,
  },
  breadcrumbCurrent: {
    color: colors.textSub,
  },
  categoryDateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.surface,
  },
  publishDate: {
    fontSize: 13,
    color: colors.textSub,
    fontWeight: '500',
  },
  articleTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textMain,
    lineHeight: 38,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  heroImageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.accentSoft,
    marginBottom: 16,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  snsShare: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  snsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.accent,
    borderRadius: 20,
    flex: 1,
  },
  snsButtonFavorite: {
    backgroundColor: '#FEE2E2',
  },
  snsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface,
  },
  snsButtonTextFavorite: {
    color: '#EF4444',
  },
  articleBody: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  headingContainer: {
    marginTop: 32,
    marginBottom: 16,
  },
  headingBorder: {
    width: 40,
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginBottom: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMain,
    lineHeight: 32,
  },
  paragraph: {
    fontSize: 16,
    color: colors.textMain,
    lineHeight: 30,
    marginBottom: 20,
  },
  highlightBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderRadius: 8,
    padding: 16,
    marginVertical: 20,
  },
  highlightIcon: {
    marginRight: 12,
  },
  highlightIconText: {
    fontSize: 20,
  },
  highlightText: {
    flex: 1,
    fontSize: 15,
    color: colors.textMain,
    lineHeight: 26,
    fontWeight: '500',
  },
  list: {
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listBullet: {
    width: 24,
    paddingTop: 2,
  },
  listBulletText: {
    fontSize: 20,
    color: colors.accent,
    fontWeight: '700',
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    color: colors.textMain,
    lineHeight: 28,
  },
  contentImageContainer: {
    marginVertical: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  contentImage: {
    width: '100%',
    height: 220,
    backgroundColor: colors.accentSoft,
  },
  authorSection: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: colors.accentSoft,
    backgroundColor: '#F9FAFB',
  },
  authorSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSub,
    marginBottom: 16,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  authorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 6,
  },
  authorRole: {
    fontSize: 14,
    color: colors.textSub,
    lineHeight: 20,
  },
  relatedSection: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: colors.accentSoft,
  },
  relatedSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 20,
  },
  relatedGrid: {
    gap: 16,
  },
  relatedCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  relatedImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.accentSoft,
  },
  relatedContent: {
    padding: 16,
  },
  relatedCategoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  relatedCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.surface,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    lineHeight: 24,
    marginBottom: 12,
  },
  relatedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  relatedMetaText: {
    fontSize: 13,
    color: colors.textSub,
  },
  scrollTopButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSub,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  footer: {
    height: 40,
  },
});
