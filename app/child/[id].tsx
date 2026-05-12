import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Calendar, Heart, Edit3, Baby } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { User, useAuth } from '../../lib/AuthContext';
import { ChildProfile, fetchChildById } from '../../lib/childService';

const FALLBACK_CHILD_IMAGE =
  'https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=600';

function calculateAgeMonths(birthday: string) {
  const birth = new Date(birthday);
  if (Number.isNaN(birth.getTime())) {
    return 0;
  }

  const today = new Date();
  return Math.max(
    0,
    (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
  );
}

function mapDemoChild(child: NonNullable<User['children']>[number]) {
  return {
    id: child.id,
    userId: 'demo-user',
    name: child.name,
    birthday: child.birthDate,
    allergies: child.allergies || [],
    medicalInfo: child.medicalInfo,
    photoUrl: child.photo,
  } as ChildProfile;
}

function InfoCard({
  title,
  children,
  onEdit,
}: {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {onEdit && (
          <TouchableOpacity style={styles.cardEditButton} onPress={onEdit}>
            <Edit3 size={16} color={colors.accent} />
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}

export default function ChildProfileScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const childId = Array.isArray(id) ? id[0] : id;

  const router = useRouter();
  const { user } = useAuth();

  const [child, setChild] = useState<ChildProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadChild = async () => {
      if (!childId) {
        if (!isMounted) return;
        setChild(null);
        setLoadError('お子様IDが指定されていません。');
        setIsLoading(false);
        return;
      }

      if (!user) {
        if (!isMounted) return;
        setChild(null);
        setLoadError('ログイン情報を確認できません。');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        if (user.id === 'demo-user') {
          const demoChild = user.children?.find((item) => item.id === childId);
          if (!isMounted) return;

          if (!demoChild) {
            setChild(null);
            setLoadError('お子様が見つかりませんでした。');
            setIsLoading(false);
            return;
          }

          setChild(mapDemoChild(demoChild));
          setIsLoading(false);
          return;
        }

        const fetched = await fetchChildById(childId, user.id);
        if (!isMounted) return;

        if (!fetched) {
          setChild(null);
          setLoadError('お子様が見つかりませんでした。');
          setIsLoading(false);
          return;
        }

        setChild(fetched);
      } catch (error) {
        if (!isMounted) return;
        setChild(null);
        setLoadError(
          error instanceof Error ? error.message : 'お子様情報の取得に失敗しました。'
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadChild();

    return () => {
      isMounted = false;
    };
  }, [childId, user]);

  const ageMonths = useMemo(() => {
    if (!child) return 0;
    return calculateAgeMonths(child.birthday);
  }, [child]);

  const canEdit = !!childId && !!user && user.id !== 'demo-user';

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.stateText}>お子様情報を読み込んでいます...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!child) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <Baby size={64} color={colors.textSub} />
          <Text style={styles.errorText}>{loadError || 'お子様が見つかりませんでした。'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: child.name,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={colors.textMain} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileSection}>
            <Image source={{ uri: child.photoUrl || FALLBACK_CHILD_IMAGE }} style={styles.avatar} />

            <View style={styles.profileInfo}>
              <View style={styles.nameSection}>
                <Text style={styles.childName}>{child.name}</Text>
                {canEdit && (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push(`/child/edit/${child.id}`)}
                  >
                    <Edit3 size={16} color={colors.accent} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.ageSection}>
                <Calendar size={16} color={colors.textSub} />
                <Text style={styles.childAge}>
                  {Math.floor(ageMonths / 12)}歳{ageMonths % 12}ヶ月
                </Text>
              </View>

              <Text style={styles.birthDate}>
                {new Date(child.birthday).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                生まれ
              </Text>
            </View>
          </View>

          <InfoCard
            title="アレルギー・医療情報"
            onEdit={
              canEdit
                ? () => {
                    router.push(`/child/edit/${child.id}`);
                  }
                : undefined
            }
          >
            <View style={styles.sectionBlock}>
              <View style={styles.sectionTitleRow}>
                <Heart size={16} color={colors.accent} />
                <Text style={styles.sectionTitle}>アレルギー</Text>
              </View>

              {child.allergies.length > 0 ? (
                <View style={styles.tagContainer}>
                  {child.allergies.map((allergy) => (
                    <View key={allergy} style={styles.tag}>
                      <Text style={styles.tagText}>{allergy}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noDataText}>登録されていません</Text>
              )}
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>医療メモ</Text>
              <Text style={styles.medicalText}>{child.medicalInfo || '登録されていません'}</Text>
            </View>
          </InfoCard>

          <InfoCard title="データ連携状況">
            <Text style={styles.noDataText}>
              現在は「名前・生年月日・アレルギー・医療メモ」を実データで管理しています。
            </Text>
          </InfoCard>
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
  scrollContent: {
    paddingBottom: 24,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: colors.textSub,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 8,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButtonText: {
    color: colors.surface,
    fontWeight: '700',
  },
  profileSection: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.accentSoft,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  childName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMain,
    flex: 1,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.accentSoft,
  },
  ageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  childAge: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    marginLeft: 8,
  },
  birthDate: {
    fontSize: 14,
    color: colors.textSub,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  cardEditButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.accentSoft,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
  },
  noDataText: {
    color: colors.textSub,
    fontSize: 14,
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.accentSoft,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  tagText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  medicalText: {
    fontSize: 14,
    color: colors.textMain,
    lineHeight: 20,
  },
});
