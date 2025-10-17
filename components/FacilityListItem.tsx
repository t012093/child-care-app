import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { MapPin, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors } from '../constants/colors';
import { Facility } from '../constants/facilities';

interface FacilityListItemProps {
  facility: Facility;
}

function FacilityListItem({ facility }: FacilityListItemProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.container}
        onPress={() => router.push(`/facility/${facility.id}`)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          {!imageError ? (
            <Animated.Image
              source={{ uri: facility.imageUrl }}
              style={[styles.image, { opacity: fadeAnim }]}
              onLoad={() => {
                Animated.timing(fadeAnim, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
              }}
              onError={() => {
                setImageError(true);
              }}
            />
          ) : (
            <View style={[styles.image, styles.imageErrorPlaceholder]}>
              <Text style={styles.imageErrorText}>📷</Text>
            </View>
          )}
        </View>

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
  imageContainer: {
    position: 'relative',
    width: Platform.OS === 'web' ? 80 : 60,
    height: Platform.OS === 'web' ? 80 : 60,
  },
  image: {
    width: Platform.OS === 'web' ? 80 : 60,
    height: Platform.OS === 'web' ? 80 : 60,
    borderRadius: 8,
    backgroundColor: colors.accentSoft,
  },
  imageErrorPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  imageErrorText: {
    fontSize: 24,
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

// React.memoで不要な再レンダリングを防止
export default React.memo(FacilityListItem, (prevProps, nextProps) => {
  // IDとimageURLが同じなら再レンダリングしない
  return (
    prevProps.facility.id === nextProps.facility.id &&
    prevProps.facility.imageUrl === nextProps.facility.imageUrl
  );
});