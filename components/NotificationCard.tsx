import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, MessageCircle, Calendar } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';

export interface NotificationItem {
  id: string;
  type: 'message' | 'reminder' | 'info';
  title: string;
  description: string;
  isUnread?: boolean;
  createdAt: string;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'message':
      return MessageCircle;
    case 'reminder':
      return Calendar;
    default:
      return Bell;
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case 'message':
      return '#4ECDC4';
    case 'reminder':
      return '#FFB84D';
    default:
      return colors.accent;
  }
};

function formatRelativeTime(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return 'たった今';
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}分前`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}時間前`;
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}日前`;

  return date.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
  });
}

interface NotificationCardProps {
  notifications?: NotificationItem[];
  isLoading?: boolean;
  onNotificationPress?: (notificationId: string) => void;
  onSeeAllPress?: () => void;
}

export default function NotificationCard({
  notifications = [],
  isLoading = false,
  onNotificationPress,
  onSeeAllPress,
}: NotificationCardProps) {
  const { horizontalPadding, isDesktop, maxContentWidth } = useResponsive();
  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const containerStyle = [
    styles.container,
    {
      marginHorizontal: horizontalPadding,
      marginBottom: isDesktop ? 32 : 16,
    },
    isDesktop && {
      alignSelf: 'center',
      maxWidth: maxContentWidth,
      width: '100%',
    },
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Bell size={20} color={colors.accent} />
          <Text style={styles.headerTitle}>お知らせ</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={styles.seeAllText}>すべて見る</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.notificationList}>
        {isLoading ? (
          <Text style={styles.emptyText}>読み込み中...</Text>
        ) : notifications.length === 0 ? (
          <Text style={styles.emptyText}>通知はまだありません</Text>
        ) : (
          notifications.slice(0, 2).map((notification) => {
          const Icon = getIcon(notification.type);
          const iconColor = getIconColor(notification.type);

          return (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                notification.isUnread && styles.notificationUnread,
              ]}
              onPress={() => onNotificationPress?.(notification.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                <Icon size={20} color={iconColor} />
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationTime}>
                    {formatRelativeTime(notification.createdAt)}
                  </Text>
                </View>
                <Text style={styles.notificationDescription}>
                  {notification.description}
                </Text>
              </View>

              {notification.isUnread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.surface,
  },
  seeAllText: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600',
  },
  notificationList: {
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSub,
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  notificationUnread: {
    backgroundColor: `${colors.accent}08`,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textSub,
  },
  notificationDescription: {
    fontSize: 13,
    color: colors.textSub,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginLeft: 8,
    marginTop: 16,
  },
});
