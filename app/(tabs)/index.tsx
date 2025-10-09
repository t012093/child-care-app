import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import HeroSection from '../../components/HeroSection';
import TodayScheduleCard from '../../components/TodayScheduleCard';
import NotificationCard from '../../components/NotificationCard';
import ColumnSection from '../../components/ColumnSection';
import KnowledgeSection from '../../components/KnowledgeSection';
import NearbyCarousel from '../../components/NearbyCarousel';
import Footer from '../../components/Footer';
import { HomeSkeleton } from '../../components/SkeletonLoader';
import { colors } from '../../constants/colors';
import { useResponsive } from '../../hooks/useResponsive';

export default function HomeScreen() {
  const router = useRouter();
  const { horizontalPadding, isDesktop } = useResponsive();
  const [isLoading, setIsLoading] = useState(true);

  // In a real app, we would fetch this from a user profile
  const lastName = '山田';
  const childName = '太郎くん';
  const childAge = 2;

  // Sample upcoming reservation
  const upcomingReservation = {
    id: '1',
    facilityName: 'さくら保育園',
    time: '明日 10:00',
    date: '2025-10-01',
    type: '一時預かり',
  };

  useEffect(() => {
    // Simulate initial data loading and image preloading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

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
          onPress={() => router.push('/(tabs)/profile')}
        />

        <NotificationCard
          onNotificationPress={(id) => console.log('Notification pressed:', id)}
          onSeeAllPress={() => console.log('See all notifications')}
        />

        <ColumnSection
          onColumnPress={(id) => router.push(`/column/${id}`)}
          onSeeAllPress={() => router.push('/column')}
        />

        <KnowledgeSection
          onItemPress={(id) => console.log('Knowledge item pressed:', id)}
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