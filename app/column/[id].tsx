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
  Platform,
  Dimensions,
} from 'react-native';
import { ChevronLeft, Clock, Heart, Share2, ArrowUp } from 'lucide-react-native';
import { columnColors } from '../../constants/colors';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { mockArticles, categoryColors } from '../../constants/columnData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';
const IS_LARGE_SCREEN = IS_WEB && SCREEN_WIDTH >= 1024;

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

  // 関連記事（同じカテゴリーの他の記事）
  const relatedArticles = mockArticles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  // 人気記事（featured記事）
  const popularArticles = mockArticles
    .filter((a) => a.isFeatured && a.id !== article.id)
    .slice(0, 3);

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
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // メインコンテンツレンダリング
  const renderMainContent = () => (
    <View style={styles.mainContent}>
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
      <View style={styles.metaSection}>
        <Text style={styles.publishDate}>
          {new Date(article.publishedAt).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).replace(/\//g, '.')}
        </Text>
        <View style={[styles.categoryBadge]}>
          <Text style={styles.categoryBadgeText}>{categoryInfo.label}</Text>
        </View>
      </View>

      {/* タイトル */}
      <Text style={styles.articleTitle}>{article.title}</Text>

      {/* リード文 */}
      <View style={styles.leadSection}>
        <Text style={styles.leadText}>{article.excerpt}</Text>
      </View>

      {/* アイキャッチ画像 */}
      <View style={styles.heroImageContainer}>
        <Image source={{ uri: article.image }} style={styles.heroImage} />
      </View>

      {/* 本文 */}
      <View style={styles.articleBody}>
        {article.content.map((block, index) => {
          switch (block.type) {
            case 'heading':
              return (
                <View key={index} style={styles.headingSection}>
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
                  <Text style={styles.highlightText}>{block.content as string}</Text>
                </View>
              );
            case 'list':
              return (
                <View key={index} style={styles.list}>
                  {(block.content as string[]).map((item, i) => (
                    <View key={i} style={styles.listItem}>
                      <Text style={styles.listBullet}>•</Text>
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
                  {block.alt && (
                    <Text style={styles.imageCaption}>{block.alt}</Text>
                  )}
                </View>
              );
            default:
              return null;
          }
        })}
      </View>

      {/* 著者情報セクション */}
      <View style={styles.authorSection}>
        <Text style={styles.authorSectionLabel}>この記事を書いた人</Text>
        <View style={styles.authorCard}>
          <Image source={{ uri: article.author.avatar }} style={styles.authorAvatar} />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{article.author.name}</Text>
            <Text style={styles.authorRole}>{article.author.role}</Text>
          </View>
        </View>
      </View>

      {/* 関連記事（モバイル版） */}
      {!IS_LARGE_SCREEN && relatedArticles.length > 0 && (
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>関連記事</Text>
          <View style={styles.relatedList}>
            {relatedArticles.map((relatedArticle) => {
              const relatedCategoryInfo = categoryColors[relatedArticle.category];
              return (
                <TouchableOpacity
                  key={relatedArticle.id}
                  style={styles.relatedCardMobile}
                  onPress={() => router.push(`/column/${relatedArticle.id}`)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: relatedArticle.image }}
                    style={styles.relatedImageMobile}
                  />
                  <View style={styles.relatedContentMobile}>
                    <Text style={styles.relatedTitleMobile} numberOfLines={2}>
                      {relatedArticle.title}
                    </Text>
                    <Text style={styles.relatedDateMobile}>
                      {relatedArticle.date || relatedArticle.publishedAt}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );

  // サイドバーレンダリング（Web版のみ）
  const renderSidebar = () => {
    if (!IS_LARGE_SCREEN) return null;

    return (
      <View style={styles.sidebar}>
        {/* 関連記事 */}
        {relatedArticles.length > 0 && (
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarTitle}>関連記事</Text>
            <View style={styles.sidebarList}>
              {relatedArticles.map((relatedArticle) => (
                <TouchableOpacity
                  key={relatedArticle.id}
                  style={styles.sidebarCard}
                  onPress={() => router.push(`/column/${relatedArticle.id}`)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: relatedArticle.image }}
                    style={styles.sidebarCardImage}
                  />
                  <View style={styles.sidebarCardContent}>
                    <Text style={styles.sidebarCardTitle} numberOfLines={2}>
                      {relatedArticle.title}
                    </Text>
                    <Text style={styles.sidebarCardDate}>
                      {relatedArticle.date || relatedArticle.publishedAt}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 人気の記事 */}
        {popularArticles.length > 0 && (
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarTitle}>人気の記事</Text>
            <View style={styles.sidebarList}>
              {popularArticles.map((popularArticle, index) => (
                <TouchableOpacity
                  key={popularArticle.id}
                  style={styles.rankingCard}
                  onPress={() => router.push(`/column/${popularArticle.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankBadgeText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.rankingCardTitle} numberOfLines={2}>
                    {popularArticle.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerStyle: {
            backgroundColor: columnColors.background,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
              <ChevronLeft size={24} color={columnColors.textMain} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleShare} style={styles.headerIconButton}>
                <Share2 size={20} color={columnColors.textMain} />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleFavorite} style={styles.headerIconButton}>
                <Heart
                  size={20}
                  color={isFavorite ? columnColors.accent : columnColors.textMain}
                  fill={isFavorite ? columnColors.accent : 'transparent'}
                />
              </TouchableOpacity>
            </View>
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
          <View style={[styles.contentWrapper, IS_LARGE_SCREEN && styles.contentWrapperWeb]}>
            {renderMainContent()}
            {renderSidebar()}
          </View>

          <View style={styles.footer} />
        </ScrollView>

        {/* トップへ戻るボタン */}
        {showScrollTop && IS_WEB && (
          <TouchableOpacity style={styles.scrollTopButton} onPress={scrollToTop}>
            <ArrowUp size={24} color={columnColors.surface} />
          </TouchableOpacity>
        )}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 8,
  },
  headerIconButton: {
    padding: 8,
  },
  contentWrapper: {
    backgroundColor: columnColors.background,
    ...(IS_LARGE_SCREEN && {
      flexDirection: 'row',
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
      paddingHorizontal: 20,
      paddingTop: 40,
      gap: 50,
    }),
  },
  contentWrapperWeb: {
    flexDirection: 'row',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 40,
    gap: 50,
  },
  mainContent: {
    flex: 1,
    backgroundColor: columnColors.surface,
    maxWidth: '100%',
    ...(IS_LARGE_SCREEN && {
      maxWidth: 850,
      flexShrink: 1,
    }),
  },
  // パンくずナビゲーション
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: columnColors.borderGray,
  },
  breadcrumbText: {
    fontSize: 13,
    color: columnColors.accent,
    fontWeight: '500',
  },
  breadcrumbSeparator: {
    fontSize: 13,
    color: columnColors.textSub,
    marginHorizontal: 8,
  },
  breadcrumbCurrent: {
    color: columnColors.textSub,
  },
  // メタ情報
  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  publishDate: {
    fontSize: 13,
    color: columnColors.textSub,
    fontWeight: '500',
    letterSpacing: 0.8,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: columnColors.accent,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: columnColors.accent,
    letterSpacing: 0.8,
  },
  // タイトル
  articleTitle: {
    fontSize: IS_LARGE_SCREEN ? 32 : 24,
    fontWeight: '700',
    color: columnColors.textMain,
    lineHeight: IS_LARGE_SCREEN ? 48 : 36,
    paddingHorizontal: 16,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  // リード文
  leadSection: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  leadText: {
    fontSize: 16,
    lineHeight: 30,
    color: '#555',
    letterSpacing: 0.5,
    padding: 20,
    backgroundColor: columnColors.leadBg,
    borderLeftWidth: 4,
    borderLeftColor: columnColors.accent,
    borderRadius: 4,
  },
  // アイキャッチ画像
  heroImageContainer: {
    width: '100%',
    backgroundColor: columnColors.accentSoft,
    marginBottom: 40,
    ...(IS_LARGE_SCREEN ? {
      height: 450,
    } : {
      aspectRatio: 16 / 9,
    }),
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  // 本文
  articleBody: {
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  headingSection: {
    marginTop: 60,
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 3,
    borderBottomColor: columnColors.accent,
  },
  heading: {
    fontSize: IS_LARGE_SCREEN ? 24 : 20,
    fontWeight: '700',
    color: columnColors.textMain,
    lineHeight: 36,
    letterSpacing: 0.5,
  },
  paragraph: {
    fontSize: 16,
    color: '#333',
    lineHeight: 30,
    marginBottom: 30,
    letterSpacing: 0.5,
  },
  highlightBox: {
    marginVertical: 40,
    padding: 25,
    backgroundColor: columnColors.highlightBg,
    borderLeftWidth: 5,
    borderLeftColor: columnColors.highlightBorder,
    borderRadius: 8,
  },
  highlightText: {
    fontSize: 15,
    color: columnColors.textMain,
    lineHeight: 26,
    fontWeight: '500',
  },
  list: {
    marginBottom: 30,
    paddingLeft: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listBullet: {
    fontSize: 20,
    color: columnColors.textMain,
    marginRight: 12,
    marginTop: -2,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    color: columnColors.textMain,
    lineHeight: 28,
  },
  contentImageContainer: {
    marginVertical: 40,
    alignItems: 'center',
  },
  contentImage: {
    width: '100%',
    height: IS_LARGE_SCREEN ? 350 : 220,
    maxWidth: IS_LARGE_SCREEN ? 800 : '100%',
    backgroundColor: columnColors.accentSoft,
    borderRadius: 8,
  },
  imageCaption: {
    marginTop: 12,
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // 著者情報
  authorSection: {
    marginTop: 80,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 30,
    borderTopWidth: 2,
    borderTopColor: columnColors.borderGray,
  },
  authorSectionLabel: {
    fontSize: 12,
    color: columnColors.textSub,
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  authorCard: {
    flexDirection: 'row',
    gap: 25,
    padding: 30,
    backgroundColor: columnColors.background,
    borderRadius: 12,
  },
  authorAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  authorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 18,
    fontWeight: '700',
    color: columnColors.textMain,
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  authorRole: {
    fontSize: 14,
    color: '#555',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  // 関連記事（モバイル）
  relatedSection: {
    paddingHorizontal: 16,
    paddingVertical: 40,
    borderTopWidth: 2,
    borderTopColor: columnColors.borderGray,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: columnColors.textMain,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: columnColors.accent,
    letterSpacing: 0.8,
  },
  relatedList: {
    gap: 20,
  },
  relatedCardMobile: {
    backgroundColor: columnColors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  relatedImageMobile: {
    width: '100%',
    height: 180,
    backgroundColor: columnColors.accentSoft,
  },
  relatedContentMobile: {
    padding: 15,
  },
  relatedTitleMobile: {
    fontSize: 14,
    fontWeight: '600',
    color: columnColors.textMain,
    lineHeight: 22,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  relatedDateMobile: {
    fontSize: 12,
    color: columnColors.textSub,
    letterSpacing: 0.8,
  },
  // サイドバー（Web版）
  sidebar: {
    width: 290,
    flexShrink: 0,
  },
  sidebarSection: {
    marginBottom: 50,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: columnColors.textMain,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: columnColors.accent,
    letterSpacing: 0.8,
  },
  sidebarList: {
    gap: 20,
  },
  sidebarCard: {
    backgroundColor: columnColors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sidebarCardImage: {
    width: '100%',
    height: 120,
    backgroundColor: columnColors.accentSoft,
  },
  sidebarCardContent: {
    padding: 15,
  },
  sidebarCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: columnColors.textMain,
    lineHeight: 22,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  sidebarCardDate: {
    fontSize: 12,
    color: columnColors.textSub,
    letterSpacing: 0.8,
  },
  // 人気記事ランキング
  rankingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    padding: 15,
    backgroundColor: columnColors.surface,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  rankBadge: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: columnColors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: columnColors.surface,
  },
  rankingCardTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: columnColors.textMain,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  // トップへ戻るボタン
  scrollTopButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: columnColors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // エラー画面
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: columnColors.textSub,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: columnColors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: columnColors.surface,
  },
  footer: {
    height: 40,
  },
});
