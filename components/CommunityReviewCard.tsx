import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Star, MapPin } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { fetchRecentReviews, type CommunityReview } from '../lib/reviewService';

interface CommunityReviewCardProps {
  onReviewPress?: (reviewId: string) => void;
  onSeeAllPress?: () => void;
}

export default function CommunityReviewCard({
  onReviewPress,
  onSeeAllPress,
}: CommunityReviewCardProps) {
  const [reviews, setReviews] = useState<CommunityReview[]>([]);

  useEffect(() => {
    fetchRecentReviews(3).then(setReviews).catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>みんなの口コミ ⭐</Text>
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={styles.seeAllText}>すべて見る</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {reviews.map((review) => (
          <TouchableOpacity
            key={review.id}
            style={styles.reviewCard}
            onPress={() => onReviewPress?.(review.id)}
            activeOpacity={0.7}
          >
            <View style={styles.reviewHeader}>
              <Text style={styles.userName}>{review.userName}</Text>
              <View style={styles.ratingContainer}>
                {[...Array(review.rating)].map((_, index) => (
                  <Star
                    key={index}
                    size={14}
                    color="#FFB84D"
                    fill="#FFB84D"
                  />
                ))}
              </View>
            </View>

            <Text style={styles.facilityName}>{review.facilityName}</Text>

            <Text style={styles.comment} numberOfLines={3}>
              {review.comment}
            </Text>

            <View style={styles.locationContainer}>
              <MapPin size={12} color={colors.textSub} />
              <Text style={styles.location}>{review.location}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    width: 280,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  facilityName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 8,
  },
  comment: {
    fontSize: 14,
    color: colors.textMain,
    lineHeight: 20,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 12,
    color: colors.textSub,
  },
});