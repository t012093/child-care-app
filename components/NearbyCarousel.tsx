import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import FacilityCard from './FacilityCard';
import { colors } from '../constants/colors';
import { Facility } from '../constants/facilities';
import { useResponsive } from '../hooks/useResponsive';
import { fetchPublicFacilities } from '../lib/facilityCatalogService';

export default function NearbyCarousel() {
  const { horizontalPadding, isDesktop } = useResponsive();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(true);
  const [facilityLoadError, setFacilityLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadFacilities = async () => {
      setIsLoadingFacilities(true);
      setFacilityLoadError(null);

      try {
        const loadedFacilities = await fetchPublicFacilities();
        if (!isMounted) return;
        setFacilities(loadedFacilities);
      } catch (error) {
        if (!isMounted) return;
        setFacilities([]);
        setFacilityLoadError(
          error instanceof Error ? error.message : '施設情報の取得に失敗しました。'
        );
      } finally {
        if (isMounted) {
          setIsLoadingFacilities(false);
        }
      }
    };

    loadFacilities();

    return () => {
      isMounted = false;
    };
  }, []);

  const popularFacilities = useMemo(
    () => [...facilities]
      .sort((left, right) => {
        if (right.rating !== left.rating) {
          return right.rating - left.rating;
        }
        const rightCreatedAt = Date.parse(right.createdAt || '');
        const leftCreatedAt = Date.parse(left.createdAt || '');
        const normalizedRight = Number.isFinite(rightCreatedAt) ? rightCreatedAt : 0;
        const normalizedLeft = Number.isFinite(leftCreatedAt) ? leftCreatedAt : 0;
        return normalizedRight - normalizedLeft;
      })
      .slice(0, 12),
    [facilities]
  );

  const containerStyle = [
    styles.container,
    isDesktop && {
      maxWidth: 1024,
      alignSelf: 'center',
      width: '100%',
    },
  ];

  const headerStyle = {
    paddingHorizontal: horizontalPadding,
  };

  const scrollContentStyle = {
    paddingLeft: horizontalPadding,
    paddingRight: 4,
    paddingBottom: 8,
  };

  const stateCardStyle = [
    styles.stateCard,
    {
      marginHorizontal: horizontalPadding,
    },
  ];

  return (
    <View style={containerStyle}>
      <View style={[styles.header, headerStyle]}>
        <Text style={styles.title}>あなたの近くの施設</Text>
      </View>
      {isLoadingFacilities ? (
        <View style={stateCardStyle}>
          <Text style={styles.stateTitle}>施設情報を読み込み中です</Text>
          <Text style={styles.stateDescription}>しばらくお待ちください</Text>
        </View>
      ) : facilityLoadError ? (
        <View style={stateCardStyle}>
          <Text style={styles.stateTitle}>施設情報の取得に失敗しました</Text>
          <Text style={styles.stateDescription}>{facilityLoadError}</Text>
        </View>
      ) : popularFacilities.length === 0 ? (
        <View style={stateCardStyle}>
          <Text style={styles.stateTitle}>表示できる施設がありません</Text>
          <Text style={styles.stateDescription}>施設が登録されるとここに表示されます</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={scrollContentStyle}
        >
          {popularFacilities.map((facility) => (
            <FacilityCard key={facility.id} facility={facility} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
  },
  stateCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  stateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
    textAlign: 'center',
  },
  stateDescription: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 18,
  },
});
