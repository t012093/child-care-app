import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Platform } from 'react-native';
import { Search, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { isTablet, isDesktop } = useResponsive();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // 実際のアプリでは検索結果ページに遷移
      router.push(`/reserve?keyword=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLocationSearch = () => {
    // 実際のアプリでは位置情報を取得して検索
    router.push('/reserve?location=current');
  };

  const containerStyle = [
    styles.container,
    isTablet && styles.containerTablet,
    isDesktop && styles.containerDesktop,
  ];

  const backgroundImageStyle = [
    styles.backgroundImage,
    isTablet && styles.backgroundImageTablet,
    isDesktop && styles.backgroundImageDesktop,
  ];

  const catchTitleStyle = [
    styles.catchTitle,
    isTablet && styles.catchTitleTablet,
    isDesktop && styles.catchTitleDesktop,
  ];

  const catchSubtitleStyle = [
    styles.catchSubtitle,
    isTablet && styles.catchSubtitleTablet,
    isDesktop && styles.catchSubtitleDesktop,
  ];

  const searchSectionStyle = [
    styles.searchSection,
    isTablet && styles.searchSectionTablet,
    isDesktop && styles.searchSectionDesktop,
  ];

  return (
    <View style={containerStyle}>
      <ImageBackground
        source={require('../assets/images/hero.png')}
        style={backgroundImageStyle}
        resizeMode="cover"
      >
        {/* キャッチコピー - タブレット以上では左側に表示 */}
        {isTablet && (
          <View style={styles.catchSectionTablet}>
            <Text style={catchTitleStyle}>ほいポチで</Text>
            <Text style={catchSubtitleStyle}>「園探し」をより簡単により</Text>
            <Text style={catchSubtitleStyle}>スマートに</Text>
          </View>
        )}

        <View style={styles.overlay}>
          {/* モバイルのみキャッチコピーを中央に表示 */}
          {!isTablet && (
            <View style={styles.catchSection}>
              <Text style={catchTitleStyle}>ほいポチで</Text>
              <Text style={catchSubtitleStyle}>「園探し」をより簡単により</Text>
              <Text style={catchSubtitleStyle}>スマートに</Text>
            </View>
          )}

          {/* 検索セクション */}
          <View style={searchSectionStyle}>
              <Text style={styles.searchTitle}>保育施設を検索する</Text>
              <View style={styles.searchInputContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="駅名、エリア名を入力"
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                />
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearch}
                >
                  <Search size={20} color="white" />
                  <Text style={styles.searchButtonText}>検索</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.locationButton}
                onPress={handleLocationSearch}
              >
                <MapPin size={20} color={colors.accent} />
                <Text style={styles.locationButtonText}>現在地から探す</Text>
              </TouchableOpacity>
            </View>
          </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  containerTablet: {
    marginVertical: 20,
  },
  containerDesktop: {
    marginVertical: 24,
  },
  backgroundImage: {
    height: 400,
  },
  backgroundImageTablet: {
    height: 450,
  },
  backgroundImageDesktop: {
    height: 500,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 0,
  },
  catchSection: {
    marginBottom: 40,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  catchSectionTablet: {
    position: 'absolute',
    top: 80,
    left: 60,
    zIndex: 10,
  },
  catchTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.accent,
    textAlign: 'center',
    marginBottom: 8,
  },
  catchTitleTablet: {
    fontSize: 28,
  },
  catchTitleDesktop: {
    fontSize: 34,
  },
  catchSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent,
    textAlign: 'center',
    lineHeight: 26,
  },
  catchSubtitleTablet: {
    fontSize: 20,
    lineHeight: 30,
  },
  catchSubtitleDesktop: {
    fontSize: 24,
    lineHeight: 36,
  },
  searchSection: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 0,
    padding: 16,
    alignItems: 'center',
  },
  searchSectionTablet: {
    position: 'absolute',
    left: 60,
    bottom: 60,
    width: 320,
    height: 190,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
  },
  searchSectionDesktop: {
    left: 60,
    bottom: 60,
    width: 320,
    height: 190,
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 12,
    textAlign: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.textMain,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    height: 40,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    gap: 6,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    width: '100%',
  },
  locationButtonText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
});