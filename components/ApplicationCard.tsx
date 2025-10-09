import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { FileText, ChevronRight } from 'lucide-react-native';
import { colors } from '../constants/colors';

export interface Application {
  id: string;
  facilityName: string;
  applicationType: '入園申請' | '一時預かり申請' | 'その他';
  status: 'draft' | 'submitted';
  createdAt: string;
  childName?: string;
}

interface ApplicationCardProps {
  application: Application;
  onPress: () => void;
}

export default function ApplicationCard({ application, onPress }: ApplicationCardProps) {
  const statusConfig = {
    draft: {
      label: '作成中',
      color: colors.textSub,
      backgroundColor: '#F3F4F6',
    },
    submitted: {
      label: '提出済み',
      color: colors.success,
      backgroundColor: '#D1FAE5',
    },
  };

  const status = statusConfig[application.status];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <FileText size={24} color={colors.accent} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.facilityName}>{application.facilityName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.backgroundColor }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.applicationType}>{application.applicationType}</Text>

        {application.childName && (
          <Text style={styles.childName}>対象: {application.childName}</Text>
        )}

        <Text style={styles.date}>{application.createdAt}</Text>
      </View>

      <ChevronRight size={20} color={colors.textSub} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: Platform.OS === 'web' ? 32 : 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  applicationType: {
    fontSize: 14,
    color: colors.textSub,
    marginBottom: 4,
  },
  childName: {
    fontSize: 13,
    color: colors.textSub,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: colors.textSub,
  },
});
