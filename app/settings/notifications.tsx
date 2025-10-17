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
} from 'react-native';
import { ChevronLeft, Bell, Mail, Calendar, MessageSquare, Volume2 } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useRouter, Stack } from 'expo-router';

interface NotificationSetting {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  enabled: boolean;
}

export default function NotificationsScreen() {
  const router = useRouter();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [reservationReminder, setReservationReminder] = useState(true);
  const [facilityNews, setFacilityNews] = useState(true);
  const [messageNotification, setMessageNotification] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSave = () => {
    Alert.alert('保存完了', '通知設定を更新しました', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const notificationSettings: NotificationSetting[] = [
    {
      id: 'push',
      icon: Bell,
      title: 'プッシュ通知',
      description: 'アプリの通知を受け取る',
      enabled: pushEnabled,
    },
    {
      id: 'email',
      icon: Mail,
      title: 'メール通知',
      description: 'メールで通知を受け取る',
      enabled: emailEnabled,
    },
    {
      id: 'reservation',
      icon: Calendar,
      title: '予約リマインダー',
      description: '予約日の前日にお知らせ',
      enabled: reservationReminder,
    },
    {
      id: 'facility',
      icon: Bell,
      title: '施設からのお知らせ',
      description: '施設からの重要なお知らせ',
      enabled: facilityNews,
    },
    {
      id: 'message',
      icon: MessageSquare,
      title: 'メッセージ通知',
      description: '新しいメッセージが届いたときにお知らせ',
      enabled: messageNotification,
    },
    {
      id: 'sound',
      icon: Volume2,
      title: '通知音',
      description: '通知時に音を鳴らす',
      enabled: soundEnabled,
    },
  ];

  const toggleSetting = (id: string) => {
    switch (id) {
      case 'push':
        setPushEnabled(!pushEnabled);
        break;
      case 'email':
        setEmailEnabled(!emailEnabled);
        break;
      case 'reservation':
        setReservationReminder(!reservationReminder);
        break;
      case 'facility':
        setFacilityNews(!facilityNews);
        break;
      case 'message':
        setMessageNotification(!messageNotification);
        break;
      case 'sound':
        setSoundEnabled(!soundEnabled);
        break;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '通知設定',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={colors.textMain} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerText}>
              受け取りたい通知を選択してください
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.card}>
              {notificationSettings.map((setting, index) => {
                const Icon = setting.icon;
                return (
                  <View
                    key={setting.id}
                    style={[
                      styles.settingItem,
                      index < notificationSettings.length - 1 && styles.settingItemBorder,
                    ]}
                  >
                    <View style={styles.settingLeft}>
                      <View style={styles.iconContainer}>
                        <Icon size={20} color={colors.accent} />
                      </View>
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>{setting.title}</Text>
                        <Text style={styles.settingDescription}>{setting.description}</Text>
                      </View>
                    </View>
                    <Switch
                      value={setting.enabled}
                      onValueChange={() => toggleSetting(setting.id)}
                      trackColor={{ false: '#D1D5DB', true: colors.accent }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                );
              })}
            </View>
          </View>

          {/* 注意事項 */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>通知設定について</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                • プッシュ通知を受け取るには、デバイスの設定で通知を許可する必要があります
              </Text>
              <Text style={styles.infoText}>
                • 重要なお知らせは、通知設定に関わらず送信される場合があります
              </Text>
              <Text style={styles.infoText}>
                • 通知音の設定は、デバイスのマナーモード設定に従います
              </Text>
            </View>
          </View>

          {/* 保存ボタン */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Text style={styles.saveButtonText}>設定を保存</Text>
          </TouchableOpacity>

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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerText: {
    fontSize: 14,
    color: colors.textSub,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  card: {
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
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
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
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSub,
    lineHeight: 18,
  },
  infoSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  infoText: {
    fontSize: 13,
    color: colors.textMain,
    lineHeight: 20,
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  footer: {
    height: 40,
  },
});
