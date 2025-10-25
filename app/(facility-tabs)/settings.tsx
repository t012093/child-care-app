import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Settings as SettingsIcon, User, Bell, Lock, HelpCircle, LogOut, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { facilityColors } from '../../constants/colors';
import { useResponsive } from '../../hooks/useResponsive';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const { horizontalPadding, isDesktop, maxContentWidth, isTablet } = useResponsive();

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: () => {
            // ログアウト処理
            router.push('/facility-login' as any);
          },
        },
      ]
    );
  };

  const containerStyle = {
    paddingHorizontal: horizontalPadding,
  };

  const contentStyle = [
    isDesktop && {
      maxWidth: maxContentWidth,
      alignSelf: 'center',
      width: '100%',
    },
  ];

  const settingsSections = [
    {
      title: 'アカウント',
      items: [
        {
          icon: User,
          label: 'プロフィール編集',
          onPress: () => console.log('Profile edit'),
        },
        {
          icon: Lock,
          label: 'パスワード変更',
          onPress: () => console.log('Password change'),
        },
      ],
    },
    {
      title: '通知設定',
      items: [
        {
          icon: Bell,
          label: '通知設定',
          onPress: () => console.log('Notification settings'),
        },
      ],
    },
    {
      title: 'サポート',
      items: [
        {
          icon: HelpCircle,
          label: 'ヘルプ・お問い合わせ',
          onPress: () => console.log('Help'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, containerStyle]}>
        <View style={styles.headerTop}>
          {/* モバイル版のみ戻るボタン表示 */}
          {!isTablet && (
            <TouchableOpacity
              onPress={() => router.push('/(facility-tabs)/dashboard' as any)}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color={facilityColors.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          <SettingsIcon size={24} color={facilityColors.primary} />
          <Text style={styles.headerTitle}>設定</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[containerStyle, contentStyle]}
      >
        {/* 施設情報カード */}
        <View style={styles.facilityCard}>
          <View style={styles.facilityIconContainer}>
            <User size={32} color={facilityColors.primary} />
          </View>
          <View style={styles.facilityInfo}>
            <Text style={styles.facilityName}>さくら保育園</Text>
            <Text style={styles.facilityEmail}>sakura@example.com</Text>
          </View>
        </View>

        {/* 設定セクション */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.settingItem,
                      itemIndex < section.items.length - 1 && styles.settingItemBorder,
                    ]}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.settingItemLeft}>
                      <View style={styles.iconContainer}>
                        <Icon size={20} color={facilityColors.primary} />
                      </View>
                      <Text style={styles.settingItemLabel}>{item.label}</Text>
                    </View>
                    <ChevronRight size={20} color={facilityColors.textSub} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* ログアウトボタン */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>ログアウト</Text>
        </TouchableOpacity>

        {/* バージョン情報 */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>バージョン 1.0.0</Text>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: facilityColors.background,
  },
  header: {
    backgroundColor: facilityColors.surface,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: facilityColors.accentSoft,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: facilityColors.textMain,
  },
  facilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: facilityColors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  facilityIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: facilityColors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  facilityInfo: {
    flex: 1,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: '700',
    color: facilityColors.textMain,
    marginBottom: 4,
  },
  facilityEmail: {
    fontSize: 14,
    color: facilityColors.textSub,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: facilityColors.textMain,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: facilityColors.surface,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: facilityColors.accentSoft,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: facilityColors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: facilityColors.textMain,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: facilityColors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    marginBottom: 16,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 13,
    color: facilityColors.textSub,
  },
  footer: {
    height: 40,
  },
});