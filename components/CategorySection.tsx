import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BookOpen, Heart, Briefcase } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors } from '../constants/colors';

interface CategoryItem {
  id: string;
  title: string;
  icon: any;
  articles: {
    title: string;
    path: string;
  }[];
}

const categories: CategoryItem[] = [
  {
    id: 'basic',
    title: '基本知識を知ろう',
    icon: BookOpen,
    articles: [
      { title: '保活とは?始める前に知っておきたい基本的な知識やポイント', path: '/column/article/39714' },
      { title: '保育園の種類と特徴を理解して家庭にあった施設を選ぼう!', path: '/column/article/68840' },
      { title: '保活の年間スケジュールは?効率良く進めるためのポイントを解説', path: '/column/article/01122' },
      { title: '保活に重要な指数(点数)とは?点数の計算方法や加点方法について解説', path: '/column/article/37733' },
    ]
  },
  {
    id: 'process',
    title: '保活の進め方',
    icon: Briefcase,
    articles: [
      { title: '保活を進めるために役所で聞くべきことは?市役所を最大限に活用する方法を解説', path: '/column/article/81160' },
      { title: '後悔しない保育園の選び方について事前に確認しておくべきポイントを解説', path: '/column/article/56197' },
      { title: '保育園の見学で確認するべきポイントとは?準備すべき物や注意点を解説', path: '/column/article/95888' },
      { title: '保育園への申し込み方法は?申請の流れや必要書類を解説', path: '/column/article/18518' },
    ]
  },
  {
    id: 'admission',
    title: '入園に向けて/待機児童になったら',
    icon: Heart,
    articles: [
      { title: '保育園以外に預けられる施設を一時保育の注意点とあわせて紹介', path: '/column/article/33058' },
      { title: '保育園の入園準備に必要なものとは?年齢別リストや注意点をご紹介', path: '/column/article/62856' },
      { title: '認可保育園に落ちたらどうする?次に進むためにやるべき行動とは', path: '/column/article/65777' },
    ]
  },
];

export default function CategorySection() {
  const router = useRouter();

  const handleArticlePress = (path: string) => {
    router.push(path);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>保活について知ろう！</Text>
      <View style={styles.categoriesContainer}>
        {categories.map((category, index) => {
          const Icon = category.icon;

          return (
            <View key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Icon size={24} color={colors.accent} strokeWidth={2} />
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </View>
              <View style={styles.articlesList}>
                {category.articles.map((article, articleIndex) => (
                  <TouchableOpacity
                    key={articleIndex}
                    style={styles.articleItem}
                    onPress={() => handleArticlePress(article.path)}
                  >
                    <Text style={styles.articleTitle} numberOfLines={2}>
                      {article.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 32,
    paddingHorizontal: 16,
    // Web版での調整
    ...(Platform.OS === 'web' && {
      paddingHorizontal: 24,
      marginVertical: 40,
    }),
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: 24,
    // Web版での調整
    ...(Platform.OS === 'web' && {
      fontSize: 28,
      marginBottom: 32,
    }),
  },
  categoriesContainer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 16,
    // Web版でのレスポンシブ対応
    ...(Platform.OS === 'web' && {
      flexWrap: 'wrap',
      justifyContent: 'center',
    }),
  },
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    // Web版での3列レイアウト
    ...(Platform.OS === 'web' && {
      flex: 1,
      minWidth: 300,
      maxWidth: 350,
      marginBottom: 16,
    }),
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  categoryTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    // Web版での調整
    ...(Platform.OS === 'web' && {
      fontSize: 16,
    }),
  },
  articlesList: {
    gap: 12,
  },
  articleItem: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  articleTitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMain,
    // Web版での調整
    ...(Platform.OS === 'web' && {
      fontSize: 13,
      lineHeight: 18,
    }),
  },
});