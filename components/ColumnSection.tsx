import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Platform } from 'react-native';
import { Clock } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';

interface ColumnItem {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  imageUrl: string;
}

const sampleColumns: ColumnItem[] = [
  {
    id: '1',
    title: '初めての一時預かり、準備するものは？',
    category: '基本知識',
    date: '2025-09-28',
    readTime: '3分',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80',
  },
  {
    id: '2',
    title: '保育園見学で確認すべき10のポイント',
    category: '保活の進め方',
    date: '2025-09-25',
    readTime: '5分',
    imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80',
  },
  {
    id: '3',
    title: 'キャンセル時のマナーと注意点',
    category: '予約のマナー',
    date: '2025-09-22',
    readTime: '2分',
    imageUrl: 'https://images.unsplash.com/photo-1560421683-6856ea585c78?w=600&q=80',
  },
];

interface ColumnSectionProps {
  onColumnPress?: (columnId: string) => void;
  onSeeAllPress?: () => void;
}

export default function ColumnSection({ onColumnPress, onSeeAllPress }: ColumnSectionProps) {
  const { horizontalPadding, isDesktop } = useResponsive();

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
        {sampleColumns.map((column) => (
          <TouchableOpacity
            key={column.id}
            style={styles.columnCard}
            onPress={() => onColumnPress?.(column.id)}
            activeOpacity={0.8}
          >
            <ImageBackground
              source={{ uri: column.imageUrl }}
              style={styles.columnImage}
              imageStyle={styles.columnImageStyle}
            >
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{column.category}</Text>
              </View>
            </ImageBackground>

            <View style={styles.columnContent}>
              <Text style={styles.columnTitle} numberOfLines={2}>
                {column.title}
              </Text>

              <View style={styles.columnMeta}>
                <View style={styles.metaItem}>
                  <Clock size={14} color={colors.textSub} />
                  <Text style={styles.metaText}>{column.readTime}</Text>
                </View>
                <Text style={styles.dateText}>{column.date}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  columnImage: {
    width: '100%',
    height: 160,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 12,
  },
  columnImageStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  categoryBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.surface,
  },
  columnContent: {
    padding: 16,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    lineHeight: 22,
    marginBottom: 12,
  },
  columnMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSub,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSub,
  },
});