import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/colors';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style
}: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function HeroSectionSkeleton() {
  return (
    <View style={styles.heroContainer}>
      <SkeletonLoader height={400} borderRadius={0} />
    </View>
  );
}

export function CardSkeleton() {
  return (
    <View style={styles.cardContainer}>
      <SkeletonLoader height={80} borderRadius={16} />
    </View>
  );
}

export function ColumnCardSkeleton() {
  return (
    <View style={styles.columnCard}>
      <SkeletonLoader height={160} borderRadius={16} style={styles.columnImage} />
      <View style={styles.columnContent}>
        <SkeletonLoader width="80%" height={16} />
        <SkeletonLoader width="60%" height={12} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function FacilityCardSkeleton() {
  return (
    <View style={styles.facilityCard}>
      <SkeletonLoader height={100} borderRadius={12} style={styles.facilityImage} />
      <View style={styles.facilityContent}>
        <SkeletonLoader width="90%" height={14} />
        <SkeletonLoader width="40%" height={12} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

export function FacilityListItemSkeleton() {
  return (
    <View style={styles.facilityListItem}>
      <SkeletonLoader width={60} height={60} borderRadius={8} />
      <View style={styles.facilityListContent}>
        <SkeletonLoader width="80%" height={16} />
        <SkeletonLoader width="50%" height={12} style={{ marginTop: 8 }} />
      </View>
      <SkeletonLoader width={60} height={32} borderRadius={8} />
    </View>
  );
}

// 予約管理用スケルトン
export function ReservationListItemSkeleton() {
  return (
    <View style={styles.reservationListItem}>
      <View style={styles.timeSection}>
        <SkeletonLoader width={60} height={16} />
      </View>
      <View style={styles.reservationContent}>
        <SkeletonLoader width="70%" height={16} />
        <View style={styles.reservationMeta}>
          <SkeletonLoader width="30%" height={12} />
          <SkeletonLoader width="25%" height={12} />
        </View>
      </View>
    </View>
  );
}

export function ReservationListSkeleton() {
  return (
    <View>
      {[1, 2, 3, 4, 5].map((i) => (
        <ReservationListItemSkeleton key={i} />
      ))}
    </View>
  );
}

export function StatCardSkeleton() {
  return (
    <View style={styles.statCard}>
      <SkeletonLoader width={40} height={40} borderRadius={20} />
      <View style={{ marginTop: 12 }}>
        <SkeletonLoader width="60%" height={12} />
        <SkeletonLoader width="80%" height={24} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function HomeSkeleton() {
  return (
    <View style={styles.homeContainer}>
      {/* Hero Section Skeleton */}
      <HeroSectionSkeleton />

      {/* Today Schedule Card Skeleton */}
      <View style={styles.section}>
        <CardSkeleton />
      </View>

      {/* Notification Card Skeleton */}
      <View style={styles.section}>
        <CardSkeleton />
      </View>

      {/* Column Section Skeleton */}
      <View style={styles.section}>
        <SkeletonLoader width={150} height={20} style={{ marginBottom: 12 }} />
        <View style={styles.horizontalList}>
          <ColumnCardSkeleton />
          <ColumnCardSkeleton />
        </View>
      </View>

      {/* Knowledge Section Skeleton */}
      <View style={styles.section}>
        <SkeletonLoader width={150} height={20} style={{ marginBottom: 12 }} />
        <View style={styles.horizontalList}>
          <View style={styles.knowledgeCard}>
            <SkeletonLoader height={160} borderRadius={16} />
          </View>
          <View style={styles.knowledgeCard}>
            <SkeletonLoader height={160} borderRadius={16} />
          </View>
        </View>
      </View>

      {/* Nearby Carousel Skeleton */}
      <View style={styles.section}>
        <SkeletonLoader width={150} height={20} style={{ marginBottom: 12 }} />
        <View style={styles.horizontalList}>
          <FacilityCardSkeleton />
          <FacilityCardSkeleton />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E4E8',
  },
  homeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroContainer: {
    marginBottom: 16,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cardContainer: {
    marginBottom: 8,
  },
  horizontalList: {
    flexDirection: 'row',
    gap: 12,
  },
  columnCard: {
    width: 280,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  columnImage: {
    width: '100%',
  },
  columnContent: {
    padding: 16,
  },
  knowledgeCard: {
    width: 200,
  },
  facilityCard: {
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  facilityImage: {
    width: '100%',
  },
  facilityContent: {
    padding: 12,
  },
  facilityListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  facilityListContent: {
    flex: 1,
    marginLeft: 12,
  },
  reservationListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  timeSection: {
    marginRight: 12,
  },
  reservationContent: {
    flex: 1,
  },
  reservationMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
});