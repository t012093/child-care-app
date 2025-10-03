import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import ApplicationCard, { Application } from '../../components/ApplicationCard';
import { colors } from '../../constants/colors';

export default function ApplicationListScreen() {
  const router = useRouter();

  // サンプルデータ
  const [applications] = useState<Application[]>([
    {
      id: '1',
      facilityName: 'さくら保育園',
      applicationType: '入園申請',
      status: 'draft',
      createdAt: '2025-10-01',
      childName: '花田 はな',
    },
    {
      id: '2',
      facilityName: 'ひまわり保育園',
      applicationType: '一時預かり申請',
      status: 'submitted',
      createdAt: '2025-09-28',
      childName: '花田 さくら',
    },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>申請書管理</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {applications.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>申請書一覧</Text>
              <Text style={styles.sectionCount}>{applications.length}件</Text>
            </View>

            {applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onPress={() => router.push(`/application/preview/${application.id}`)}
              />
            ))}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>申請書がありません</Text>
            <Text style={styles.emptySubtext}>
              下のボタンから新しい申請書を作成してください
            </Text>
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/application/new')}
        activeOpacity={0.8}
      >
        <Plus size={24} color="white" />
        <Text style={styles.createButtonText}>新規申請書を作成</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    paddingTop: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMain,
  },
  scrollContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
  },
  sectionCount: {
    fontSize: 14,
    color: colors.textSub,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    height: 100,
  },
  createButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
});
