import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors } from '../constants/colors';

export default function Footer() {
  const router = useRouter();

  // Web版のみ表示
  if (Platform.OS !== 'web') {
    return null;
  }

  const handleLink = (url: string) => {
    Linking.openURL(url);
  };

  const handleInternalLink = (path: string) => {
    router.push(path as any);
  };

  return (
    <View style={styles.footerWrapper}>
      <View style={styles.container}>
        {/* メインコンテンツ */}
        <View style={styles.mainContent}>
          {/* 会社情報 */}
          <View style={styles.column}>
            <Text style={styles.brandTitle}>子育て支援アプリ</Text>
            <Text style={styles.brandDescription}>
              保育施設の検索・予約から申請書作成まで、{'\n'}
              子育てに必要なサポートを一つのアプリで。
            </Text>
            <View style={styles.socialLinks}>
              <TouchableOpacity
                style={styles.socialIcon}
                onPress={() => handleLink('https://twitter.com')}
              >
                <Twitter size={20} color={colors.textSub} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialIcon}
                onPress={() => handleLink('https://facebook.com')}
              >
                <Facebook size={20} color={colors.textSub} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialIcon}
                onPress={() => handleLink('https://instagram.com')}
              >
                <Instagram size={20} color={colors.textSub} />
              </TouchableOpacity>
            </View>
          </View>

          {/* サービス */}
          <View style={styles.column}>
            <Text style={styles.columnTitle}>サービス</Text>
            <TouchableOpacity style={styles.linkItem} onPress={() => handleInternalLink('/(tabs)/reserve')}>
              <Text style={styles.linkText}>施設検索・予約</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem} onPress={() => handleInternalLink('/application')}>
              <Text style={styles.linkText}>申請書作成</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem} onPress={() => handleInternalLink('/column')}>
              <Text style={styles.linkText}>子育てコラム</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem} onPress={() => handleInternalLink('/(tabs)/index')}>
              <Text style={styles.linkText}>お役立ち情報</Text>
            </TouchableOpacity>
          </View>

          {/* サポート */}
          <View style={styles.column}>
            <Text style={styles.columnTitle}>サポート</Text>
            <TouchableOpacity style={styles.linkItem} onPress={() => handleInternalLink('/support/faq')}>
              <Text style={styles.linkText}>よくある質問</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem} onPress={() => handleInternalLink('/support/guide')}>
              <Text style={styles.linkText}>使い方ガイド</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem} onPress={() => handleInternalLink('/support/contact')}>
              <Text style={styles.linkText}>お問い合わせ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem} onPress={() => handleInternalLink('/legal/privacy')}>
              <Text style={styles.linkText}>プライバシーポリシー</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem} onPress={() => handleInternalLink('/legal/terms')}>
              <Text style={styles.linkText}>利用規約</Text>
            </TouchableOpacity>
          </View>

          {/* お問い合わせ */}
          <View style={styles.column}>
            <Text style={styles.columnTitle}>お問い合わせ</Text>
            <View style={styles.contactItem}>
              <Mail size={16} color={colors.textSub} />
              <Text style={styles.contactText}>support@childcare.app</Text>
            </View>
            <View style={styles.contactItem}>
              <Phone size={16} color={colors.textSub} />
              <Text style={styles.contactText}>03-1234-5678</Text>
            </View>
            <View style={styles.contactItem}>
              <MapPin size={16} color={colors.textSub} />
              <Text style={styles.contactText}>
                東京都渋谷区{'\n'}
                受付時間: 平日 9:00-18:00
              </Text>
            </View>
          </View>
        </View>

        {/* ボトムバー */}
        <View style={styles.bottomBar}>
          <Text style={styles.copyright}>
            © 2025 子育て支援アプリ. All rights reserved.
          </Text>
          <View style={styles.madeWith}>
            <Text style={styles.madeWithText}>Made with</Text>
            <Heart size={14} color="#FF6B6B" fill="#FF6B6B" />
            <Text style={styles.madeWithText}>for parents</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerWrapper: {
    backgroundColor: colors.surface,
    paddingTop: 48,
    paddingBottom: 24,
    marginTop: 64,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  container: {
    maxWidth: 1024,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
  },
  mainContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
    gap: 32,
  },
  column: {
    flex: 1,
    minWidth: 200,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 12,
  },
  brandDescription: {
    fontSize: 14,
    color: colors.textSub,
    lineHeight: 22,
    marginBottom: 20,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 12,
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    transitionProperty: 'background-color',
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 16,
  },
  linkItem: {
    marginBottom: 12,
  },
  linkText: {
    fontSize: 14,
    color: colors.textSub,
    transitionProperty: 'color',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: colors.textSub,
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexWrap: 'wrap',
    gap: 16,
  },
  copyright: {
    fontSize: 13,
    color: colors.textSub,
  },
  madeWith: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  madeWithText: {
    fontSize: 13,
    color: colors.textSub,
  },
});
