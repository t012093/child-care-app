import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import HeroSection from '../../components/HeroSection';
import TodayScheduleCard from '../../components/TodayScheduleCard';
import NotificationCard, { NotificationItem } from '../../components/NotificationCard';
import ColumnSection from '../../components/ColumnSection';
import KnowledgeSection from '../../components/KnowledgeSection';
import NearbyCarousel from '../../components/NearbyCarousel';
import Footer from '../../components/Footer';
import { HomeSkeleton } from '../../components/SkeletonLoader';
import { colors } from '../../constants/colors';
import { useResponsive } from '../../hooks/useResponsive';
import { useAuth } from '../../lib/AuthContext';
import { fetchUserNotifications } from '../../lib/notificationService';
import {
  fetchParentReservations,
  ParentReservationSummary,
} from '../../lib/reservationService';

type HomeReservation = {
  id: string;
  facilityName: string;
  time: string;
  date: string;
  type: string;
  childName: string;
};

const DEMO_UPCOMING_RESERVATION: HomeReservation = {
  id: 'demo-reservation',
  facilityName: 'さくら保育園',
  time: '明日 10:00',
  date: '2026-03-06',
  type: '一時預かり',
  childName: 'デモ太郎',
};

const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'demo-notification-1',
    type: 'message',
    title: 'さくら保育園から返信',
    description: '予約内容の確認が完了しました',
    isUnread: true,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-notification-2',
    type: 'reminder',
    title: '明日の予約リマインダー',
    description: '明日10:00 さくら保育園',
    isUnread: true,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

function parseReservationDateTime(input: ParentReservationSummary) {
  const [year, month, day] = input.date.split('-').map(Number);
  const [hour, minute] = input.startTime.split(':').map(Number);

  if (
    [year, month, day, hour, minute].some((value) => Number.isNaN(value))
  ) {
    return null;
  }

  return new Date(year, month - 1, day, hour, minute, 0);
}

function formatReservationTime(value: Date) {
  const now = new Date();
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const diffDays = Math.round((targetDate.getTime() - nowDate.getTime()) / (24 * 60 * 60 * 1000));
  const hh = `${value.getHours()}`.padStart(2, '0');
  const mm = `${value.getMinutes()}`.padStart(2, '0');

  if (diffDays === 0) return `今日 ${hh}:${mm}`;
  if (diffDays === 1) return `明日 ${hh}:${mm}`;
  if (diffDays === -1) return `昨日 ${hh}:${mm}`;
  return `${value.getMonth() + 1}/${value.getDate()} ${hh}:${mm}`;
}

function selectUpcomingReservation(items: ParentReservationSummary[]) {
  const now = new Date();

  const candidate = items
    .filter((item) => item.status !== 'cancelled' && item.status !== 'checked_out')
    .map((item) => ({
      row: item,
      dateTime: parseReservationDateTime(item),
    }))
    .filter(
      (item): item is { row: ParentReservationSummary; dateTime: Date } =>
        item.dateTime instanceof Date && item.dateTime.getTime() >= now.getTime()
    )
    .sort((left, right) => left.dateTime.getTime() - right.dateTime.getTime())[0];

  if (!candidate) {
    return undefined;
  }

  return {
    id: candidate.row.id,
    facilityName: candidate.row.facilityName,
    time: formatReservationTime(candidate.dateTime),
    date: candidate.row.date,
    type: candidate.row.type,
    childName: candidate.row.childName,
  } as HomeReservation;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { horizontalPadding, isDesktop } = useResponsive();
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingReservation, setUpcomingReservation] = useState<HomeReservation | undefined>();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      setIsLoading(true);

      try {
        if (!user) {
          if (!isMounted) return;
          setUpcomingReservation(undefined);
          setNotifications([]);
          return;
        }

        if (user.id === 'demo-user') {
          if (!isMounted) return;
          setUpcomingReservation(DEMO_UPCOMING_RESERVATION);
          setNotifications(DEMO_NOTIFICATIONS);
          return;
        }

        const [parentReservations, userNotifications] = await Promise.all([
          fetchParentReservations(user.id),
          fetchUserNotifications(user.id, 20),
        ]);

        if (!isMounted) return;
        setUpcomingReservation(selectUpcomingReservation(parentReservations));
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Failed to load home data:', error);
        if (isMounted) {
          setUpcomingReservation(undefined);
          setNotifications([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadHomeData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const childName =
    upcomingReservation?.childName || user?.children?.[0]?.name || 'お子様';

  const sectionHeaderStyle = [
    styles.sectionHeader,
    {
      paddingHorizontal: horizontalPadding,
      paddingTop: isDesktop ? 32 : 24,
    },
    isDesktop && {
      maxWidth: 1024,
      alignSelf: 'center',
      width: '100%',
    },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <HomeSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroSection />

        <TodayScheduleCard
          reservation={upcomingReservation}
          childName={childName}
          onPress={() => router.push('/(tabs)/reserve')}
        />

        <NotificationCard
          notifications={notifications}
          isLoading={isLoading}
          onNotificationPress={() => router.push('/settings/notifications')}
          onSeeAllPress={() => router.push('/settings/notifications')}
        />

        <ColumnSection
          onColumnPress={(id) => router.push(`/column/${id}`)}
          onSeeAllPress={() => router.push('/column')}
        />

        <KnowledgeSection
          onItemPress={() => router.push('/knowledge')}
        />

        <View style={sectionHeaderStyle}>
          <Text style={styles.sectionTitle}>近くの人気施設</Text>
        </View>

        <NearbyCarousel />

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionHeader: {
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  footer: {
    height: 20,
  },
});
