import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { colors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';

const menuItems = [
  { label: '保育施設を検索する', path: '/reserve' },
  { label: 'マイページ', path: '/profile' },
  {
    label: '保活コラム',
    path: '/column',
    subMenu: [
      { label: '保活について知ろう！', path: '/column#step' },
      { label: '育休応援コンテンツ', path: '/column#book' },
      { label: '働き方・生まれ月で見る保活', path: '/column#birth' },
      { label: '保活のおすすめ記事', path: '/column#recommend' },
      { label: 'エリア別保活情報', path: '/column#area' },
    ]
  },
  { label: 'お困りのときはこちら', path: '/contact' },
];

export default function WebHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { isTablet } = useResponsive();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  // モバイルでは表示しない
  if (!isTablet) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* ロゴ */}
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => router.push('/')}
        >
          <Text style={styles.logoText}>ほいポチ</Text>
        </TouchableOpacity>

        {/* メニュー */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const hasSubMenu = 'subMenu' in item && item.subMenu;

            return (
              <View
                key={item.path}
                style={styles.menuItemWrapper}
                onPointerEnter={() => hasSubMenu && setHoveredMenu(item.path)}
                onPointerLeave={() => hasSubMenu && setHoveredMenu(null)}
              >
                <TouchableOpacity
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => router.push(item.path as any)}
                >
                  <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>

                {/* サブメニュー */}
                {hasSubMenu && hoveredMenu === item.path && (
                  <View style={styles.subMenu}>
                    {item.subMenu.map((subItem) => (
                      <TouchableOpacity
                        key={subItem.path}
                        style={styles.subMenuItem}
                        onPress={() => router.push(subItem.path as any)}
                      >
                        <Text style={styles.subMenuText}>{subItem.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          {/* 施設担当者向けボタン */}
          <TouchableOpacity
            style={styles.facilityButton}
            onPress={() => router.push('/nursery_entrance' as any)}
          >
            <Text style={styles.facilityButtonText}>施設担当者さまはこちら</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    width: '100%',
  },
  logoContainer: {
    paddingVertical: 8,
    marginLeft: 120,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 120,
  },
  menuItemWrapper: {
    position: 'relative',
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
  },
  menuItemActive: {
    backgroundColor: '#F0FAF8',
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMain,
  },
  menuTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  subMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 240,
    paddingVertical: 8,
    zIndex: 1000,
    marginTop: 4,
  },
  subMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  subMenuText: {
    fontSize: 14,
    color: colors.textMain,
  },
  facilityButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  facilityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});