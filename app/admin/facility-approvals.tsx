import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle2, XCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuth } from '@/lib/AuthContext';
import {
  fetchPendingFacilities,
  isFacilityApprovalAdmin,
  moderateFacilityApproval,
  PendingFacility,
} from '@/lib/facilityApprovalService';

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function FacilityCard({
  item,
  onApprove,
  onReject,
  isUpdating,
}: {
  item: PendingFacility;
  onApprove: () => void;
  onReject: () => void;
  isUpdating: boolean;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.meta}>登録日時: {formatDateTime(item.createdAt)}</Text>
      <Text style={styles.meta}>種別: {item.type}</Text>
      <Text style={styles.meta}>都道府県: {item.prefecture || '-'}</Text>
      <Text style={styles.meta}>市区町村: {item.district || '-'}</Text>
      <Text style={styles.meta}>住所: {item.address || '-'}</Text>
      <Text style={styles.meta}>電話: {item.phone || '-'}</Text>
      <Text style={styles.meta}>メール: {item.email || '-'}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.approveButton, isUpdating && styles.disabledButton]}
          onPress={onApprove}
          disabled={isUpdating}
        >
          <CheckCircle2 size={16} color={colors.surface} />
          <Text style={styles.buttonText}>承認</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rejectButton, isUpdating && styles.disabledButton]}
          onPress={onReject}
          disabled={isUpdating}
        >
          <XCircle size={16} color={colors.surface} />
          <Text style={styles.buttonText}>却下</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FacilityApprovalsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [items, setItems] = useState<PendingFacility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isAdmin = isFacilityApprovalAdmin(user?.id);

  const loadData = useCallback(async (refresh = false) => {
    if (!user?.id) {
      setItems([]);
      setLoadError('ログイン情報を確認できません。');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (!isAdmin) {
      setItems([]);
      setLoadError('この画面を表示する権限がありません。');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setLoadError(null);

    try {
      const pending = await fetchPendingFacilities(user.id);
      setItems(pending);
    } catch (error) {
      setItems([]);
      setLoadError(error instanceof Error ? error.message : '承認待ち一覧の取得に失敗しました。');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAdmin, user?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleDecision = async (facilityId: string, decision: 'approve' | 'reject') => {
    if (!user?.id || updatingId) {
      return;
    }

    setUpdatingId(facilityId);
    try {
      await moderateFacilityApproval(user.id, facilityId, decision);
      setItems((prev) => prev.filter((item) => item.id !== facilityId));
      Alert.alert('更新完了', decision === 'approve' ? '施設を承認しました。' : '施設を却下しました。');
    } catch (error) {
      Alert.alert('更新エラー', error instanceof Error ? error.message : '更新に失敗しました。');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '施設承認管理',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={colors.textMain} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.stateText}>承認待ち施設を読み込み中...</Text>
          </View>
        ) : loadError ? (
          <View style={styles.centerState}>
            <Text style={styles.errorText}>{loadError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => void loadData()}>
              <Text style={styles.retryButtonText}>再読み込み</Text>
            </TouchableOpacity>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={styles.stateTitle}>承認待ち施設はありません</Text>
            <Text style={styles.stateText}>新規申請が届くとここに表示されます。</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => void loadData(true)}
                tintColor={colors.accent}
              />
            }
          >
            {items.map((item) => (
              <FacilityCard
                key={item.id}
                item={item}
                isUpdating={updatingId === item.id}
                onApprove={() => {
                  void handleDecision(item.id, 'approve');
                }}
                onReject={() => {
                  void handleDecision(item.id, 'reject');
                }}
              />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 8,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSub,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingVertical: 10,
  },
  approveButton: {
    backgroundColor: '#16A34A',
  },
  rejectButton: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
  stateText: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 4,
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: colors.surface,
    fontWeight: '700',
  },
});
