import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Calendar,
  Search,
  FileQuestion,
  AlertCircle,
  Inbox,
} from 'lucide-react-native';
import { facilityColors } from '../constants/colors';

interface EmptyStateProps {
  type?: 'no-data' | 'no-results' | 'error' | 'empty-search';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: 'calendar' | 'search' | 'file' | 'alert' | 'inbox';
}

export default function EmptyState({
  type = 'no-data',
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  // デフォルトのメッセージを設定
  const getDefaultContent = () => {
    switch (type) {
      case 'no-results':
        return {
          icon: 'search',
          title: '検索結果が見つかりませんでした',
          description: '検索条件を変更して再度お試しください',
        };
      case 'error':
        return {
          icon: 'alert',
          title: 'データの取得に失敗しました',
          description: '時間をおいて再度お試しください',
        };
      case 'empty-search':
        return {
          icon: 'search',
          title: '検索キーワードを入力してください',
          description: '子供名、保護者名、電話番号などで検索できます',
        };
      default:
        return {
          icon: 'inbox',
          title: 'データがありません',
          description: '新しいデータがここに表示されます',
        };
    }
  };

  const defaultContent = getDefaultContent();
  const finalIcon = icon || (defaultContent.icon as any);
  const finalTitle = title || defaultContent.title;
  const finalDescription = description || defaultContent.description;

  const IconComponent = {
    calendar: Calendar,
    search: Search,
    file: FileQuestion,
    alert: AlertCircle,
    inbox: Inbox,
  }[finalIcon];

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <IconComponent size={64} color={facilityColors.textSub} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>{finalTitle}</Text>
      <Text style={styles.description}>{finalDescription}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: facilityColors.surface,
    borderRadius: 16,
    minHeight: 300,
  },
  iconContainer: {
    marginBottom: 24,
    opacity: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: facilityColors.textMain,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: facilityColors.textSub,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  actionButton: {
    marginTop: 24,
    backgroundColor: facilityColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});
