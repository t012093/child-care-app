import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';
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
        <Text style={styles.name} numberOfLines={1}>{facility.name}</Text>
        <View style={styles.ratingContainer}>
          <Star size={16} color="#FFCA28" fill="#FFCA28" />
          <Text style={styles.rating}>{facility.rating.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 100,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.textSub,
  },
});