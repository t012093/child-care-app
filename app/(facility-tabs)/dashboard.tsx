import React from 'react';
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

export default function FacilityDashboard() {
  const router = useRouter();
  const { horizontalPadding, isDesktop, maxContentWidth } = useResponsive();
  const stats = useDashboardStats();

  // タイムラインスケジュール用のモックデータ
  const timelineReservations: TimelineReservation[] = [
    {
      id: '1',
      startTime: '09:00',
      endTime: '12:00',
      childName: '山田太郎',
      parentName: '山田花子',
      status: 'confirmed',
      type: '一時預かり',
      allergies: ['卵', '乳製品'],
    },
    {
      id: '2',
      startTime: '10:30',
      endTime: '15:30',
      childName: '佐藤次郎',
      parentName: '佐藤美咲',
      status: 'checked_in',
      type: '一時預かり',
    },
    {
      id: '3',
      startTime: '14:00',
      endTime: '15:00',
      childName: '鈴木三郎',
      parentName: '鈴木愛',
      status: 'pending',
      type: '見学',
      medicalNotes: '喘息の傾向あり',
    },
  ];

  const notifications = [
    {
      id: '1',
      title: '新規予約が入りました',
      description: '佐藤美咲様から10:30の予約',
      time: '5分前',
    },
    {
      id: '2',
      title: 'キャンセル通知',
      description: '田中様の予約がキャンセルされました',
      time: '30分前',
    },
  ];

  const handleCheckIn = (id: string) => {
    console.log('Check in:', id);
    // TODO: 実際のチェックイン処理
  };

  const handleCheckOut = (id: string) => {
    console.log('Check out:', id);
    // TODO: 実際のチェックアウト処理
  };

  const containerStyle = {
    paddingHorizontal: horizontalPadding,
  };

  const sectionStyle = [
    styles.section,
    isDesktop && {
      maxWidth: maxContentWidth,
      alignSelf: 'center',
      width: '100%',
    },
  ];

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
              value={stats.today.total}
              subtext="件"
              color={facilityColors.primary}
              trend={stats.today.trend}
              index={0}
            />
            <FacilityStatCardWithTrend
              icon={TrendingUp}
              label="今週の予約"
              value={stats.thisWeek.total}
              subtext="件"
              color="#4ECDC4"
              trend={stats.thisWeek.trend}
              index={1}
            />
            <FacilityStatCardWithTrend
              icon={CheckCircle}
              label="空き状況"
              value={stats.availability.status}
              subtext={`残り${stats.availability.remainingSlots}枠`}
              color="#10B981"
              index={2}
            />
          </View>
        </View>

        {/* 予約推移グラフ */}
        <View style={[sectionStyle, containerStyle]}>
          <ReservationLineChart data={stats.weeklyReservations} />
        </View>

        {/* 予約タイプ別円グラフと時間帯別棒グラフ */}
        <View style={[containerStyle, styles.chartsRow]}>
          <View style={styles.chartHalf}>
            <ReservationPieChart data={stats.reservationsByType} />
          </View>
          <View style={styles.chartHalf}>
            <HourlyUsageBarChart data={stats.hourlyUsage} />
          </View>
        </View>

        {/* タイムラインスケジュール */}
        <View style={[sectionStyle, containerStyle]}>
          <TimelineSchedule
            reservations={timelineReservations}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        </View>

        {/* 通知セクション */}
        <View style={[sectionStyle, containerStyle]}>
          <View style={styles.sectionHeader}>
            <View style={styles.headerLeft}>
              <Bell size={20} color={facilityColors.primary} />
              <Text style={styles.sectionTitle}>最近の通知</Text>
            </View>
          </View>

          <View style={styles.notificationCard}>
            {notifications.map((notification) => (
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
            ))}
          </View>
        </View>

        {/* クイックアクション */}
        <View style={[sectionStyle, containerStyle, styles.quickActionSection]}>
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