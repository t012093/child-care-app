import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import HeroSection from '../../components/HeroSection';
import TodayScheduleCard from '../../components/TodayScheduleCard';
import NotificationCard from '../../components/NotificationCard';
import ColumnSection from '../../components/ColumnSection';
import KnowledgeSection from '../../components/KnowledgeSection';
import CommunityReviewCard from '../../components/CommunityReviewCard';
import NearbyCarousel from '../../components/NearbyCarousel';
import { colors } from '../../constants/colors';

export default function HomeScreen() {
  const router = useRouter();
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
          onColumnPress={(id) => console.log('Column pressed:', id)}
          onSeeAllPress={() => router.push('/(tabs)/board')}
        />

        <KnowledgeSection
          onItemPress={(id) => console.log('Knowledge item pressed:', id)}
        />

        <CommunityReviewCard
          onReviewPress={(id) => console.log('Review pressed:', id)}
          onSeeAllPress={() => router.push('/(tabs)/board')}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>近くの人気施設</Text>
        </View>

        <NearbyCarousel />

        <View style={styles.footer} />
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
    paddingHorizontal: 16,
    paddingTop: 24,
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