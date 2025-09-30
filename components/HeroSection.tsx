import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Platform } from 'react-native';
import { Search, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors } from '../constants/colors';

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

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

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://images.pexels.com/photos/1094763/pexels-photo-1094763.jpeg?auto=compress&cs=tinysrgb&w=1200'
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            {/* キャッチコピー */}
            <View style={styles.catchSection}>
              <Text style={styles.catchTitle}>保活サイト「えんさがそっ♪」で</Text>
              <Text style={styles.catchSubtitle}>「園探し」をより簡単により</Text>
              <Text style={styles.catchSubtitle}>スマートに</Text>
            </View>

            {/* 検索セクション */}
            <View style={styles.searchSection}>
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
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    // Web版での調整
    ...(Platform.OS === 'web' && {
      marginVertical: 20,
    }),
  },
  backgroundImage: {
    height: 400,
    // Web版での高さ調整
    ...(Platform.OS === 'web' && {
      height: 450,
    }),
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 600,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  catchSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  catchTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    // Web版での調整
    ...(Platform.OS === 'web' && {
      fontSize: 22,
    }),
  },
  catchSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    // Web版での調整
    ...(Platform.OS === 'web' && {
      fontSize: 18,
      lineHeight: 28,
    }),
  },
  searchSection: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    // Web版での調整
    ...(Platform.OS === 'web' && {
      padding: 32,
      borderRadius: 12,
    }),
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 20,
    textAlign: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
    // Web版での調整
    ...(Platform.OS === 'web' && {
      maxWidth: 400,
    }),
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textMain,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    height: 50,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    gap: 8,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  locationButtonText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});