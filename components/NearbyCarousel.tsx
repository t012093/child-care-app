import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import FacilityCard from './FacilityCard';
import { colors } from '../constants/colors';
import { sampleFacilities } from '../constants/facilities';
import { useResponsive } from '../hooks/useResponsive';

export default function NearbyCarousel() {
  const { horizontalPadding, isDesktop } = useResponsive();

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

  return (
    <View style={containerStyle}>
      <View style={[styles.header, headerStyle]}>
        <Text style={styles.title}>あなたの近くの施設</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={scrollContentStyle}
      >
        {sampleFacilities.map((facility) => (
          <FacilityCard key={facility.id} facility={facility} />
        ))}
      </ScrollView>
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
});