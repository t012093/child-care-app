import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';
import { mockArticles, categoryColors } from '../constants/columnData';

interface ColumnSectionProps {
  onColumnPress?: (columnId: string) => void;
  onSeeAllPress?: () => void;
}

export default function ColumnSection({ onColumnPress, onSeeAllPress }: ColumnSectionProps) {
  const { horizontalPadding, isDesktop } = useResponsive();

  // 注目記事またはカテゴリーが異なる最新3記事を取得
  const featuredArticles = mockArticles
    .filter(article => article.isFeatured)
    .slice(0, 3);

  const containerStyle = [
    styles.container,
    {
      marginBottom: isDesktop ? 32 : 16,
    },
    isDesktop && {
      maxWidth: 1024,
      alignSelf: 'center',
      width: '100%',
    },
  ];

  const headerStyle = {
    paddingHorizontal: horizontalPadding,
  };

  const scrollContentStyle = {
    paddingHorizontal: horizontalPadding,
  };

  return (
    <View style={containerStyle}>
      <View style={[styles.header, headerStyle]}>
        <Text style={styles.headerTitle}>おすすめコラム 📝</Text>
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={styles.seeAllText}>すべて見る</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={scrollContentStyle}
      >
        {featuredArticles.map((article) => {
          const categoryInfo = categoryColors[article.category];
          return (
            <TouchableOpacity
              key={article.id}
              style={styles.columnCard}
              onPress={() => onColumnPress?.(article.id)}
              activeOpacity={0.9}
            >
              {/* 画像エリア */}
              <View style={styles.columnImageContainer}>
                <Image
                  source={{ uri: article.image }}
                  style={styles.columnImage}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                  priority="normal"
                />
                {/* カテゴリーバッジ（新デザイン: 透明背景 + ボーダー） */}
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{categoryInfo.label}</Text>
                </View>
              </View>

              {/* コンテンツエリア */}
              <View style={styles.columnContent}>
                {/* 記事ID */}
                <Text style={styles.columnId}>#{article.id}</Text>

                {/* タイトル */}
                <Text style={styles.columnTitle} numberOfLines={2}>
                  {article.title}
                </Text>

                {/* フッター */}
                <View style={styles.columnFooter}>
                  <Text style={styles.columnDate}>{article.date}</Text>
                  {article.tags && article.tags.length > 0 && (
                    <View style={styles.columnTags}>
                      {article.tags.slice(0, 2).map((tag) => (
                        <Text key={tag} style={styles.columnTag}>
                          #{tag}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
  columnCard: {
    width: 280,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  columnImageContainer: {
    width: '100%',
    aspectRatio: 16 / 10,
    position: 'relative',
    backgroundColor: colors.accentSoft,
  },
  columnImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 4,
    zIndex: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  columnContent: {
    padding: 20,
  },
  columnId: {
    fontSize: 12,
    color: colors.textSub,
    marginBottom: 8,
    fontWeight: '500',
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    lineHeight: 24,
    marginBottom: 12,
  },
  columnFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  columnDate: {
    fontSize: 12,
    color: colors.textSub,
    marginBottom: 8,
  },
  columnTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  columnTag: {
    fontSize: 11,
    color: colors.textSub,
  },
});