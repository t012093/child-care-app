import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Lock,
  Mail,
  Bell,
  Phone,
  Moon,
  Globe,
  Trash2,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
  Baby,
  Plus,
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';

interface SettingItem {
  icon: React.ComponentType<any>;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'キャッシュクリア',
      'アプリのキャッシュをクリアしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'クリア',
          style: 'destructive',
          onPress: () => {
            Alert.alert('完了', 'キャッシュをクリアしました');
          },
        },
      ]
    );
  };

  const settingsSections: SettingSection[] = [
    {
      title: 'アカウント設定',
      items: [
        {
          icon: User,
          label: 'プロフィール編集',
          onPress: () => router.push('/settings/profile'),
          showChevron: true,
        },
        {
          icon: Lock,
          label: 'パスワード変更',
          onPress: () => router.push('/settings/password'),
          showChevron: true,
        },
        {
          icon: Mail,
          label: 'メールアドレス変更',
          onPress: () => console.log('Email change'),
          showChevron: true,
        },
      ],
    },
    {
      title: '子供の情報',
      items: [
        {
          icon: Baby,
          label: 'お子様情報管理',
          onPress: () => router.push('/(tabs)/profile'),
          showChevron: true,
        },
        {
          icon: Plus,
          label: 'お子様を追加',
          onPress: () => console.log('Add child'),
          showChevron: true,
        },
      ],
    },
    {
      title: '通知設定',
      items: [
        {
          icon: Bell,
          label: 'プッシュ通知',
          onPress: () => router.push('/settings/notifications'),
          showChevron: true,
        },
        {
          icon: Phone,
          label: '通知管理',
          onPress: () => router.push('/settings/notifications'),
          showChevron: true,
        },
      ],
    },
    {
      title: 'アプリ設定',
      items: [
        {
          icon: Moon,
          label: 'ダークモード',
          onPress: () => setDarkMode(!darkMode),
          showChevron: false,
          rightElement: (
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#D1D5DB', true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          ),
        },
        {
          icon: Globe,
          label: '言語設定',
          onPress: () => console.log('Language settings'),
          showChevron: true,
        },
        {
          icon: Trash2,
          label: 'キャッシュクリア',
          onPress: handleClearCache,
          showChevron: true,
        },
      ],
    },
    {
      title: 'サポート',
      items: [
        {
          icon: HelpCircle,
          label: 'ヘルプ・FAQ',
          onPress: () => console.log('Help'),
          showChevron: true,
        },
        {
          icon: Phone,
          label: 'お問い合わせ',
          onPress: () => console.log('Contact'),
          showChevron: true,
        },
        {
          icon: FileText,
          label: '利用規約',
          onPress: () => console.log('Terms'),
          showChevron: true,
        },
        {
          icon: Shield,
          label: 'プライバシーポリシー',
          onPress: () => console.log('Privacy'),
          showChevron: true,
        },
      ],
    },
  ];

  const userName = user?.name || 'ゲストユーザー';
  const userEmail = user?.email || '';
  const userAvatar = user?.id === 'demo-user'
    ? "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600"
    : "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600";

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '設定',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={colors.textMain} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ユーザー情報カード */}
          <View style={styles.userCard}>
            <Image
              source={{ uri: userAvatar }}
              style={styles.userAvatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userEmail}>{userEmail}</Text>
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
                          <Icon size={20} color={colors.accent} />
                        </View>
                        <Text style={styles.settingItemLabel}>{item.label}</Text>
                      </View>
                      {item.rightElement || (
                        item.showChevron !== false && (
                          <ChevronRight size={20} color={colors.textSub} />
                        )
                      )}
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSub,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: colors.surface,
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
    borderBottomColor: colors.accentSoft,
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
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 16,
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
    color: colors.textSub,
  },
  footer: {
    height: 40,
  },
});
