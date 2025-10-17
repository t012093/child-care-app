import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { Facility } from '../constants/facilities';
import { colors } from '../constants/colors';

interface FacilityMapProps {
  facilities: Facility[];
  selectedFacilityId?: string;
  height?: number;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const SAPPORO_CENTER = { lat: 43.0642, lng: 141.3469 };

export default function FacilityMap({
  facilities,
  selectedFacilityId,
  height = 400,
  center = SAPPORO_CENTER,
  zoom = 13,
}: FacilityMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const mapContainerStyle = useMemo(
    () => ({
      width: '100%',
      height,
    }),
    [height]
  );

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
    }),
    []
  );

  if (loadError) {
    return (
      <View style={[styles.errorContainer, { height }]}>
        <Text style={styles.errorText}>地図の読み込みに失敗しました</Text>
        <Text style={styles.errorSubText}>
          Google Maps APIキーを確認してください
        </Text>
      </View>
    );
  }

  if (!isLoaded) {
    return (
      <View style={[styles.loadingContainer, { height }]}>
        <Text style={styles.loadingText}>地図を読み込んでいます...</Text>
      </View>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={zoom}
      options={mapOptions}
    >
      {facilities.map((facility) => (
        <Marker
          key={facility.id}
          position={{ lat: facility.lat, lng: facility.lng }}
          title={facility.name}
          icon={
            selectedFacilityId === facility.id
              ? {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: colors.accent,
                  fillOpacity: 1,
                  strokeColor: '#fff',
                  strokeWeight: 2,
                }
              : undefined
          }
        />
      ))}
    </GoogleMap>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    color: '#DC2626',
  },
  loadingContainer: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSub,
  },
});
