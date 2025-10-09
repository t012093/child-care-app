import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Star, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors } from '../constants/colors';
import { Facility } from '../constants/facilities';

interface FacilityCardProps {
  facility: Facility;
}

export default function FacilityCard({ facility }: FacilityCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/facility/${facility.id}`)}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: facility.imageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
        priority="low"
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{facility.name}</Text>

        <View style={styles.metaRow}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#FFCA28" fill="#FFCA28" />
            <Text style={styles.rating}>{facility.rating.toFixed(1)}</Text>
          </View>
          {facility.distance && (
            <View style={styles.distanceContainer}>
              <MapPin size={12} color={colors.textSub} />
              <Text style={styles.distance}>{facility.distance}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Platform.OS === 'web' ? 240 : 200,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: colors.accentSoft,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 10,
    lineHeight: 22,
    minHeight: 44,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMain,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  distance: {
    fontSize: 12,
    color: colors.textSub,
  },
});