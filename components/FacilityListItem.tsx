import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { MapPin, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors } from '../constants/colors';
import { Facility } from '../constants/facilities';

interface FacilityListItemProps {
  facility: Facility;
}

export default function FacilityListItem({ facility }: FacilityListItemProps) {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.container}
        onPress={() => router.push(`/facility/${facility.id}`)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: facility.imageUrl }} style={styles.image} />

        <View style={styles.content}>
          <Text style={styles.name}>{facility.name}</Text>

          <View style={styles.detailsRow}>
            <View style={styles.locationContainer}>
              <MapPin size={14} color={colors.textSub} />
              <Text style={styles.distance}>{facility.distance} km</Text>
            </View>

            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFCA28" fill="#FFCA28" />
              <Text style={styles.rating}>{facility.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.reserveButton}
          onPress={() => router.push(`/facility/${facility.id}`)}
        >
          <Text style={styles.reserveText}>予約</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginVertical: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: Platform.OS === 'web' ? 80 : 60,
    height: Platform.OS === 'web' ? 80 : 60,
    borderRadius: 8,
    backgroundColor: colors.accentSoft,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 6,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  distance: {
    fontSize: 14,
    color: colors.textSub,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: colors.textSub,
    marginLeft: 4,
  },
  reserveButton: {
    backgroundColor: colors.accentSoft,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  reserveText: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 14,
  },
});