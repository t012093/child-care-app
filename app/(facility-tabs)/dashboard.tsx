import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Calendar, TrendingUp, CheckCircle, Bell, Plus } from 'lucide-react-native';
import FacilityStatCardWithTrend from '../../components/FacilityStatCardWithTrend';
import ReservationLineChart from '../../components/charts/LineChart';
import ReservationPieChart from '../../components/charts/PieChart';
import HourlyUsageBarChart from '../../components/charts/BarChart';
import TimelineSchedule, { TimelineReservation } from '../../components/TimelineSchedule';
import { facilityColors } from '../../constants/colors';
import { useResponsive } from '../../hooks/useResponsive';
import { useRouter } from 'expo-router';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useAuth } from '../../lib/AuthContext';
import { Reservation, ReservationStatus } from '../../types/reservation';

function formatRelativeTime(timestamp: string) {
  const diffMs = Date.now() - new Date(timestamp).getTime();

  if (Number.isNaN(diffMs) || diffMs < 0) {
    return 'たった今';
  }

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'たった今';
  if (diffMinutes < 60) return `${diffMinutes}分前`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}時間前`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}日前`;
}

function buildNotificationTitle(status: ReservationStatus) {
  switch (status) {
    case 'pending':
      return '新規予約が入りました';
    case 'cancelled':
      return 'キャンセル通知';
    case 'checked_in':
      return 'チェックインされました';
    case 'checked_out':
      return 'チェックアウトされました';
    case 'confirmed':
    default:
      return '予約が確定しました';
  }
}

function toTimelineReservation(reservation: Reservation): TimelineReservation | null {
  if (reservation.status === 'cancelled') {
    return null;
  }

  return {
    id: reservation.id,
    startTime: reservation.startTime,
    endTime: reservation.endTime,
    childName: reservation.childName,
    parentName: reservation.parentName,
    status: reservation.status,
    type: reservation.type,
    allergies: reservation.allergies,
    medicalNotes: reservation.medicalNotes,
  };
}

export default function FacilityDashboard() {
  const router = useRouter();
  const { horizontalPadding, isDesktop, maxContentWidth } = useResponsive();
  const { user } = useAuth();
  const {
    today,
    thisWeek,
    availability,
    weeklyReservations,
    reservationsByType,
    hourlyUsage,
    isLoading,
    loadError,
    scopedFacilityIds,
    todayReservations,
    recentReservations,
    checkIn,
    checkOut,
  } = useDashboardStats();
  const [processingReservationId, setProcessingReservationId] = useState<string | null>(null);

  const timelineReservations = useMemo(() => (
    todayReservations
      .map(toTimelineReservation)
      .filter((reservation): reservation is TimelineReservation => reservation !== null)
  ), [todayReservations]);

  const notifications = useMemo(() => (
    recentReservations.map((reservation) => ({
      id: reservation.id,
      title: buildNotificationTitle(reservation.status),
      description: `${reservation.parentName}様 ${reservation.startTime}〜${reservation.endTime} (${reservation.type})`,
      time: formatRelativeTime(reservation.updatedAt),
    }))
  ), [recentReservations]);

  const handleCheckIn = async (id: string) => {
    if (processingReservationId) return;

    setProcessingReservationId(id);
    try {
      await checkIn(id);
    } finally {
      setProcessingReservationId(null);
    }
  };

  const handleCheckOut = async (id: string) => {
    if (processingReservationId) return;

    setProcessingReservationId(id);
    try {
      await checkOut(id);
    } finally {
      setProcessingReservationId(null);
    }
  };

  const containerStyle = {
    paddingHorizontal: horizontalPadding,
  };

  const desktopSectionStyle = isDesktop
    ? {
        maxWidth: maxContentWidth,
        alignSelf: 'center' as const,
        width: '100%' as const,
      }
    : undefined;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>ダッシュボードを読み込み中です</Text>
          <Text style={styles.stateDescription}>予約データを取得しています...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>施設アカウントでログインしてください</Text>
          <Text style={styles.stateDescription}>ログイン後に施設ダッシュボードを表示できます。</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>ダッシュボードの取得に失敗しました</Text>
          <Text style={styles.stateDescription}>{loadError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (scopedFacilityIds.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>所属施設が見つかりません</Text>
          <Text style={styles.stateDescription}>施設登録・所属設定を確認してください。</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 統計カードセクション（トレンド付き） */}
        <View style={[containerStyle, styles.statsSection]}>
          <Text style={styles.sectionTitle}>施設統計</Text>
          <View style={styles.statsGrid}>
            <FacilityStatCardWithTrend
              icon={Calendar}
              label="本日の予約"
              value={today.total}
              subtext="件"
              color={facilityColors.primary}
              trend={today.trend}
              index={0}
            />
            <FacilityStatCardWithTrend
              icon={TrendingUp}
              label="今週の予約"
              value={thisWeek.total}
              subtext="件"
              color="#4ECDC4"
              trend={thisWeek.trend}
              index={1}
            />
            <FacilityStatCardWithTrend
              icon={CheckCircle}
              label="空き状況"
              value={availability.status}
              subtext={`残り${availability.remainingSlots}枠`}
              color="#10B981"
              index={2}
            />
          </View>
        </View>

        {/* 予約推移グラフ */}
        <View style={[styles.section, desktopSectionStyle, containerStyle]}>
          <ReservationLineChart data={weeklyReservations} />
        </View>

        {/* 予約タイプ別円グラフと時間帯別棒グラフ */}
        <View style={[containerStyle, styles.chartsRow]}>
          <View style={styles.chartHalf}>
            <ReservationPieChart data={reservationsByType} />
          </View>
          <View style={styles.chartHalf}>
            <HourlyUsageBarChart data={hourlyUsage} />
          </View>
        </View>

        {/* タイムラインスケジュール */}
        <View style={[styles.section, desktopSectionStyle, containerStyle]}>
          <TimelineSchedule
            reservations={timelineReservations}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        </View>

        {/* 通知セクション */}
        <View style={[styles.section, desktopSectionStyle, containerStyle]}>
          <View style={styles.sectionHeader}>
            <View style={styles.headerLeft}>
              <Bell size={20} color={facilityColors.primary} />
              <Text style={styles.sectionTitle}>最近の通知</Text>
            </View>
          </View>

          <View style={styles.notificationCard}>
            {notifications.length === 0 ? (
              <Text style={styles.emptyNotificationText}>通知はまだありません</Text>
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={styles.notificationItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationTime}>{notification.time}</Text>
                    </View>
                    <Text style={styles.notificationDescription}>{notification.description}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* クイックアクション */}
        <View style={[styles.section, desktopSectionStyle, containerStyle, styles.quickActionSection]}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/(facility-tabs)/reservations' as any)}
          >
            <Plus size={20} color="white" />
            <Text style={styles.quickActionText}>新規予約を確認</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: facilityColors.background,
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: facilityColors.textMain,
    textAlign: 'center',
    marginBottom: 8,
  },
  stateDescription: {
    fontSize: 14,
    color: facilityColors.textSub,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  statsSection: {
    paddingTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: facilityColors.textMain,
    marginBottom: 12,
  },
  sectionHeader: {
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
  seeAllText: {
    fontSize: 14,
    color: facilityColors.primary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  chartsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  chartHalf: {
    flex: 1,
  },
  reservationList: {
    backgroundColor: facilityColors.surface,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationCard: {
    backgroundColor: facilityColors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: facilityColors.accentSoft,
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
    color: facilityColors.textMain,
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: facilityColors.textSub,
  },
  notificationDescription: {
    fontSize: 13,
    color: facilityColors.textSub,
    lineHeight: 18,
  },
  emptyNotificationText: {
    fontSize: 14,
    color: facilityColors.textSub,
    textAlign: 'center',
    paddingVertical: 8,
  },
  quickActionSection: {
    marginTop: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: facilityColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    shadowColor: facilityColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  footer: {
    height: 40,
  },
});
