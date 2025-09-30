import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Users, Baby } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';

interface KnowledgeItem {
  id: string;
  icon: 'book' | 'users' | 'baby';
  title: string;
  description: string;
  imageUrl: string;
  gradientColors: string[];
}

const knowledgeItems: KnowledgeItem[] = [
  {
    id: '1',
    icon: 'book',
    title: '一時預かりとは？',
    description: '基本的な仕組みと利用方法',
    imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80',
    gradientColors: ['rgba(126, 87, 194, 0.85)', 'rgba(98, 60, 167, 0.85)'],
  },
  {
    id: '2',
    icon: 'users',
    title: '予約のマナー',
    description: 'キャンセルルールと注意点',
    imageUrl: 'https://images.unsplash.com/photo-1560421683-6856ea585c78?w=400&q=80',
    gradientColors: ['rgba(78, 205, 196, 0.85)', 'rgba(52, 172, 164, 0.85)'],
  },
  {
    id: '3',
    icon: 'baby',
    title: 'よくある質問',
    description: '困ったときのFAQ',
    imageUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=400&q=80',
    gradientColors: ['rgba(255, 184, 77, 0.85)', 'rgba(255, 138, 101, 0.85)'],
  },
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'book':
      return BookOpen;
    case 'users':
      return Users;
    case 'baby':
      return Baby;
    default:
      return BookOpen;
  }
};

interface KnowledgeSectionProps {
  onItemPress?: (itemId: string) => void;
}

export default function KnowledgeSection({ onItemPress }: KnowledgeSectionProps) {
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
        <Text style={styles.headerTitle}>はじめての方へ 📚</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={scrollContentStyle}
      >
        {knowledgeItems.map((item) => {
          const Icon = getIcon(item.icon);
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onItemPress?.(item.id)}
              activeOpacity={0.8}
            >
              <ImageBackground
                source={{ uri: item.imageUrl }}
                style={styles.card}
                imageStyle={styles.cardImage}
              >
                <LinearGradient
                  colors={item.gradientColors}
                  style={styles.cardGradient}
                >
                  <View style={styles.iconContainer}>
                    <Icon size={28} color="white" />
                  </View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDescription}>{item.description}</Text>
                </LinearGradient>
              </ImageBackground>
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
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  card: {
    width: 200,
    height: 160,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  cardImage: {
    borderRadius: 16,
  },
  cardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardDescription: {
    fontSize: 13,
    color: 'white',
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});