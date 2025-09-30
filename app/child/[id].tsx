import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { ChevronLeft, Calendar, Heart, Activity, User, Camera, Edit3, Shield, Baby } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../lib/AuthContext';

interface ChildData {
  id: string;
  name: string;
  ageMonths: number;
  imageUrl: string;
  birthDate?: string;
  medicalInfo?: string;
  dailyLife?: {
    eating: string;
    weaning: string;
    nursing: string;
    toilet: string;
  };
  vaccines?: {
    progress: number;
    total: number;
  };
  allergies: string[];
  sleep?: {
    wakeUp: string;
    nap: string;
    bedtime: string;
  };
  sizes?: {
    diaper: string;
    clothes: string;
  };
  preferences?: {
    likes: string[];
    dislikes: string[];
  };
  development?: {
    milestones: {
      title: string;
      achieved: boolean;
    }[];
  };
}

// Mock data - In a real app, this would come from your backend
const mockChildren: Record<string, ChildData> = {
  "1": {
    id: "1",
    name: "花田 はな",
    ageMonths: 25,
    birthDate: "2022/05/15",
    imageUrl: "https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=600",
    dailyLife: {
      eating: "スプーン (一部介助)",
      weaning: "カミカミ期",
      nursing: "卒乳済み",
      toilet: "オムツ",
    },
    vaccines: {
      progress: 8,
      total: 10,
    },
    allergies: ["卵", "牛乳"],
    sleep: {
      wakeUp: "7:00",
      nap: "13:00-15:00",
      bedtime: "20:00",
    },
    sizes: {
      diaper: "M",
      clothes: "90cm",
    },
    preferences: {
      likes: ["お絵かき", "ブロック遊び"],
      dislikes: ["大きな音", "暗い場所"],
    },
    development: {
      milestones: [
        { title: "2語文を話す", achieved: true },
        { title: "階段を上る", achieved: true },
        { title: "スプーンで食べる", achieved: true },
        { title: "簡単な指示に従う", achieved: true },
      ],
    },
  },
  "2": {
    id: "2",
    name: "花田 さくら",
    ageMonths: 36,
    birthDate: "2021/04/10",
    imageUrl: "https://images.pexels.com/photos/1912868/pexels-photo-1912868.jpeg?auto=compress&cs=tinysrgb&w=600",
    dailyLife: {
      eating: "箸 (自立)",
      weaning: "完了",
      nursing: "卒乳済み",
      toilet: "トイレ",
    },
    vaccines: {
      progress: 10,
      total: 10,
    },
    allergies: [],
    sleep: {
      wakeUp: "6:30",
      nap: "13:30-15:00",
      bedtime: "20:30",
    },
    sizes: {
      diaper: "パンツ",
      clothes: "95cm",
    },
    preferences: {
      likes: ["歌", "ダンス", "お絵かき"],
      dislikes: ["虫"],
    },
    development: {
      milestones: [
        { title: "3語以上の文を話す", achieved: true },
        { title: "片足で立つ", achieved: true },
        { title: "自分で着替える", achieved: true },
        { title: "トイレを使う", achieved: true },
      ],
    },
  },
};

function InfoCard({
  title,
  icon,
  children,
  onEdit
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onEdit?: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          {icon}
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
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
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const userChild = user?.children?.find(c => c.id === id);
  const mockChild = mockChildren[id as string];

  const child = userChild ? {
    ...mockChild,
    id: userChild.id,
    name: userChild.name,
    birthDate: userChild.birthDate,
    allergies: userChild.allergies || [],
    imageUrl: userChild.photo || mockChild?.imageUrl || "https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=600",
    ageMonths: (() => {
      const birth = new Date(userChild.birthDate);
      const today = new Date();
      return (today.getFullYear() - birth.getFullYear()) * 12 +
             (today.getMonth() - birth.getMonth());
    })(),
    medicalInfo: userChild.medicalInfo
  } : mockChild;

  if (!child) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Baby size={64} color={colors.textSub} />
          <Text style={styles.errorText}>お子様が見つかりませんでした</Text>
          <TouchableOpacity style={styles.backToProfileButton} onPress={() => router.back()}>
            <Text style={styles.backToProfileText}>プロフィールに戻る</Text>
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
        <ScrollView>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: child.imageUrl }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.cameraButton}>
                <Camera size={16} color={colors.surface} />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameSection}>
                <Text style={styles.childName}>{child.name}</Text>
                <TouchableOpacity style={styles.editButton}>
                  <Edit3 size={16} color={colors.accent} />
                </TouchableOpacity>
              </View>
              <View style={styles.ageSection}>
                <Calendar size={16} color={colors.textSub} />
                <Text style={styles.childAge}>
                  {Math.floor(child.ageMonths / 12)}歳{child.ageMonths % 12}ヶ月
                </Text>
              </View>
              {child.birthDate && (
                <Text style={styles.birthDate}>
                  {new Date(child.birthDate).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}生まれ
                </Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <InfoCard
              title="日常生活"
              icon={<Activity size={20} color={colors.accent} />}
              onEdit={() => console.log('Edit daily life')}
            >
              {child.dailyLife ? (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>食事</Text>
                    <Text style={styles.infoValue}>{child.dailyLife.eating}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>離乳食</Text>
                    <Text style={styles.infoValue}>{child.dailyLife.weaning}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>授乳</Text>
                    <Text style={styles.infoValue}>{child.dailyLife.nursing}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>排泄</Text>
                    <Text style={styles.infoValue}>{child.dailyLife.toilet}</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.noDataText}>情報が登録されていません</Text>
              )}
            </InfoCard>

            <InfoCard
              title="予防接種"
              icon={<Shield size={20} color={colors.accent} />}
              onEdit={() => console.log('Edit vaccines')}
            >
              {child.vaccines ? (
                <>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${(child.vaccines.progress / child.vaccines.total) * 100}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {child.vaccines.progress}/{child.vaccines.total} 完了
                  </Text>
                </>
              ) : (
                <Text style={styles.noDataText}>予防接種記録がありません</Text>
              )}
            </InfoCard>

            <InfoCard
              title="アレルギー・医療情報"
              icon={<Heart size={20} color={colors.accent} />}
              onEdit={() => console.log('Edit allergies')}
            >
              <View style={styles.allergySection}>
                <Text style={styles.sectionSubtitle}>アレルギー</Text>
                <View style={styles.tagContainer}>
                  {child.allergies && child.allergies.length > 0 ? (
                    child.allergies.map((allergy, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{allergy}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noDataText}>アレルギーなし</Text>
                  )}
                </View>
              </View>
              {child.medicalInfo && (
                <View style={styles.medicalSection}>
                  <Text style={styles.sectionSubtitle}>医療情報</Text>
                  <Text style={styles.medicalText}>{child.medicalInfo}</Text>
                </View>
              )}
            </InfoCard>

            {child.sleep && (
              <InfoCard
                title="睡眠リズム"
                icon={<User size={20} color={colors.accent} />}
                onEdit={() => console.log('Edit sleep')}
              >
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>起床</Text>
                  <Text style={styles.infoValue}>{child.sleep.wakeUp}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>昼寝</Text>
                  <Text style={styles.infoValue}>{child.sleep.nap}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>就寝</Text>
                  <Text style={styles.infoValue}>{child.sleep.bedtime}</Text>
                </View>
              </InfoCard>
            )}

            {child.sizes && (
              <InfoCard
                title="サイズ情報"
                icon={<Baby size={20} color={colors.accent} />}
                onEdit={() => console.log('Edit sizes')}
              >
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>オムツ</Text>
                  <Text style={styles.infoValue}>{child.sizes.diaper}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>服</Text>
                  <Text style={styles.infoValue}>{child.sizes.clothes}</Text>
                </View>
              </InfoCard>
            )}

            {child.preferences && (
              <InfoCard
                title="好き嫌い"
                icon={<Heart size={20} color={colors.accent} />}
                onEdit={() => console.log('Edit preferences')}
              >
                <View style={styles.preferenceSection}>
                  <Text style={styles.sectionSubtitle}>好きなこと</Text>
                  <View style={styles.tagContainer}>
                    {child.preferences.likes.map((like, index) => (
                      <View key={index} style={[styles.tag, styles.likeTag]}>
                        <Text style={styles.tagText}>{like}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={styles.preferenceSection}>
                  <Text style={styles.sectionSubtitle}>苦手なこと</Text>
                  <View style={styles.tagContainer}>
                    {child.preferences.dislikes.map((dislike, index) => (
                      <View key={index} style={[styles.tag, styles.dislikeTag]}>
                        <Text style={[styles.tagText, styles.dislikeText]}>{dislike}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </InfoCard>
            )}

            {child.development && (
              <InfoCard
                title="発達マイルストーン"
                icon={<Activity size={20} color={colors.accent} />}
                onEdit={() => console.log('Edit development')}
              >
                {child.development.milestones.map((milestone, index) => (
                  <View key={index} style={styles.milestone}>
                    <Text style={styles.milestoneText}>{milestone.title}</Text>
                    <View style={[styles.checkmark, milestone.achieved && styles.checkmarkActive]}>
                      {milestone.achieved && (
                        <Text style={styles.checkmarkIcon}>✓</Text>
                      )}
                    </View>
                  </View>
                ))}
              </InfoCard>
            )}
          </View>
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
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginTop: 24,
  },
  profileSection: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.accentSoft,
  },
  cameraButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.accent,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
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
  section: {
    paddingVertical: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
    marginLeft: 8,
  },
  cardEditButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.accentSoft,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    color: colors.textSub,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: colors.textMain,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.accentSoft,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  tagText: {
    color: colors.accent,
    fontSize: 14,
  },
  noDataText: {
    color: colors.textSub,
    fontSize: 14,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  milestoneText: {
    fontSize: 14,
    color: colors.textMain,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  checkmarkActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmarkIcon: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  backToProfileButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  backToProfileText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
  },
  allergySection: {
    marginBottom: 16,
  },
  medicalSection: {
    marginTop: 8,
  },
  medicalText: {
    fontSize: 14,
    color: colors.textMain,
    lineHeight: 20,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  preferenceSection: {
    marginBottom: 16,
  },
  likeTag: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  dislikeTag: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
    borderWidth: 1,
  },
  dislikeText: {
    color: '#FF9800',
  },
});