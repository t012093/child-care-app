import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Settings, Briefcase } from 'lucide-react-native';
import ApplicationCard, { Application } from '../../components/ApplicationCard';
import Footer from '../../components/Footer';
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
        {Platform.OS === 'web' && (
          <TouchableOpacity
            style={styles.mappingButton}
            onPress={() => router.push('/application/mapping/temporary_care_application')}
          >
            <Settings size={20} color={colors.accent} />
            <Text style={styles.mappingButtonText}>マッピング設定</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* 就労証明書セクション */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryTitleContainer}>
              <Briefcase size={20} color={colors.accent} />
              <Text style={styles.categoryTitle}>就労証明書</Text>
            </View>
            <TouchableOpacity
              style={styles.categoryButton}
              onPress={() => router.push('/application/employment/new')}
            >
              <Plus size={16} color={colors.accent} />
              <Text style={styles.categoryButtonText}>作成</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.categoryDescription}>
            保育園申請に必要な就労証明書を簡単に作成できます。
            {Platform.OS === 'web' && 'Web版では自動入力機能をご利用いただけます。'}
          </Text>
        </View>

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

        <Footer />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMain,
  },
  mappingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    gap: 6,
  },
  mappingButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  scrollContainer: {
    flex: 1,
  },
  categorySection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: Platform.OS === 'web' ? 32 : 16,
    marginTop: 16,
    marginBottom: 24,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.accentSoft,
    gap: 4,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  categoryDescription: {
    fontSize: 14,
    color: colors.textSub,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    paddingVertical: 12,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
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
    left: Platform.OS === 'web' ? 'auto' : 16,
    right: Platform.OS === 'web' ? 'auto' : 16,
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
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: Platform.OS === 'web' ? '100%' : undefined,
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
    marginHorizontal: Platform.OS === 'web' ? 32 : 0,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
});
