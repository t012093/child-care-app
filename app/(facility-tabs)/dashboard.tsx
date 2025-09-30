import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Calendar, TrendingUp, CheckCircle, Bell, Plus } from 'lucide-react-native';
import FacilityStatCard from '../../components/FacilityStatCard';
import ReservationListItem, { Reservation } from '../../components/ReservationListItem';
import { facilityColors } from '../../constants/colors';
import { useResponsive } from '../../hooks/useResponsive';
import { useRouter } from 'expo-router';

export default function FacilityDashboard() {
  const router = useRouter();
  const { horizontalPadding, isDesktop, maxContentWidth } = useResponsive();

  // サンプルデータ
  const todayReservations: Reservation[] = [
    {
      id: '1',
      time: '09:00',
      childName: '山田太郎',
      parentName: '山田花子',
      status: 'confirmed',
      type: '一時預かり',
    },
    {
      id: '2',
      time: '10:30',
      childName: '佐藤次郎',
      parentName: '佐藤美咲',
      status: 'confirmed',
      type: '一時預かり',
    },
    {
      id: '3',
      time: '14:00',
      childName: '鈴木三郎',
      parentName: '鈴木愛',
      status: 'pending',
      type: '見学',
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
        {/* 統計カードセクション */}
        <View style={[containerStyle, styles.statsSection]}>
          <Text style={styles.sectionTitle}>施設統計</Text>
          <View style={styles.statsGrid}>
            <FacilityStatCard
              icon={Calendar}
              label="本日の予約"
              value={todayReservations.length}
              subtext="件"
              color={facilityColors.primary}
            />
            <FacilityStatCard
              icon={TrendingUp}
              label="今週の予約"
              value={18}
              subtext="件"
              color="#4ECDC4"
            />
            <FacilityStatCard
              icon={CheckCircle}
              label="空き状況"
              value="◯"
              subtext="空きあり"
              color="#10B981"
            />
          </View>
        </View>

        {/* 本日の予約リスト */}
        <View style={[sectionStyle, containerStyle]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>本日の予約</Text>
            <TouchableOpacity onPress={() => router.push('/(facility-tabs)/reservations' as any)}>
              <Text style={styles.seeAllText}>すべて見る</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.reservationList}>
            {todayReservations.map((reservation) => (
              <ReservationListItem
                key={reservation.id}
                reservation={reservation}
                onPress={(id) => console.log('Reservation pressed:', id)}
              />
            ))}
          </View>
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