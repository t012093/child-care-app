import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../../../constants/colors';
import { useAuth } from '../../../lib/AuthContext';
import { fetchChildById, updateChildProfile } from '../../../lib/childService';

export default function ChildEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const childId = Array.isArray(id) ? id[0] : id;

  const router = useRouter();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [allergiesText, setAllergiesText] = useState('');
  const [medicalInfo, setMedicalInfo] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadChild = async () => {
      if (!childId) {
        if (!isMounted) return;
        setLoadError('お子様IDが指定されていません。');
        setIsLoading(false);
        return;
      }

      if (!user) {
        if (!isMounted) return;
        setLoadError('ログイン情報を確認できません。');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        if (user.id === 'demo-user') {
          const demoChild = user.children?.find((item) => item.id === childId);
          if (!demoChild) {
            if (!isMounted) return;
            setLoadError('お子様が見つかりませんでした。');
            setIsLoading(false);
            return;
          }

          if (!isMounted) return;
          setName(demoChild.name || '');
          setBirthday(demoChild.birthDate || '');
          setAllergiesText((demoChild.allergies || []).join('、'));
          setMedicalInfo(demoChild.medicalInfo || '');
          setIsLoading(false);
          return;
        }

        const child = await fetchChildById(childId, user.id);
        if (!isMounted) return;

        if (!child) {
          setLoadError('お子様が見つかりませんでした。');
          setIsLoading(false);
          return;
        }

        setName(child.name || '');
        setBirthday(child.birthday || '');
        setAllergiesText((child.allergies || []).join('、'));
        setMedicalInfo(child.medicalInfo || '');
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : 'データの取得に失敗しました。');
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

  const handleSave = async () => {
    if (!childId || !user) {
      Alert.alert('保存エラー', 'ログイン情報を確認できません。');
      return;
    }

    if (user.id === 'demo-user') {
      Alert.alert('保存不可', 'ゲストユーザーではお子様情報を更新できません。');
      return;
    }

    if (!name.trim()) {
      Alert.alert('入力エラー', 'お子様の名前を入力してください。');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday.trim())) {
      Alert.alert('入力エラー', '生年月日は YYYY-MM-DD 形式で入力してください。');
      return;
    }

    const allergies = allergiesText
      .split(/[,、]/)
      .map((item) => item.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      await updateChildProfile(childId, user.id, {
        name,
        birthday,
        allergies,
        medicalInfo,
      });

      Alert.alert('保存完了', 'お子様情報を更新しました。', [
        {
          text: 'OK',
          onPress: () => router.replace(`/child/${childId}`),
        },
      ]);
    } catch (error) {
      Alert.alert('保存エラー', error instanceof Error ? error.message : '更新に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.stateText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{loadError}</Text>
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
          headerTitle: 'お子様情報を編集',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={colors.textMain} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formCard}>
            <Text style={styles.label}>お子様の名前 *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="例: 山田 はな"
            />

            <Text style={styles.label}>生年月日 * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={birthday}
              onChangeText={setBirthday}
              placeholder="2021-04-01"
            />

            <Text style={styles.label}>アレルギー（カンマ区切り）</Text>
            <TextInput
              style={styles.input}
              value={allergiesText}
              onChangeText={setAllergiesText}
              placeholder="卵, 乳製品"
            />

            <Text style={styles.label}>医療メモ</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={medicalInfo}
              onChangeText={setMedicalInfo}
              placeholder="必要な医療情報を入力"
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.disabledButton]}
              onPress={() => void handleSave()}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>{isSaving ? '保存中...' : '保存する'}</Text>
            </TouchableOpacity>
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
  scrollContent: {
    padding: 16,
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
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textMain,
  },
  textArea: {
    minHeight: 100,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: colors.accent,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
