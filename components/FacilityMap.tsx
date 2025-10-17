import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Facility } from '../constants/facilities';
import { colors } from '../constants/colors';

interface FacilityMapProps {
  facilities: Facility[];
  selectedFacilityId?: string;
  height?: number;
  center?: { lat: number; lng: number };
  zoom?: number;
}

export default function FacilityMap({
  facilities,
  selectedFacilityId,
  height = 400,
  center,
}: FacilityMapProps) {
  const handleOpenMaps = () => {
    const facility = selectedFacilityId
      ? facilities.find(f => f.id === selectedFacilityId)
      : facilities[0];

    if (facility) {
      const url = `https://maps.google.com/?q=${facility.lat},${facility.lng}`;
      Linking.openURL(url);
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <MapPin size={48} color={colors.accent} />
      <Text style={styles.title}>地図表示</Text>
      <Text style={styles.subtitle}>Web版でインタラクティブな地図をご利用いただけます</Text>
      <TouchableOpacity style={styles.button} onPress={handleOpenMaps}>
        <Text style={styles.buttonText}>Googleマップで開く</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSub,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    marginTop: 16,
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
