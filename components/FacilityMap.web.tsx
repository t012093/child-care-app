import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
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

function MissingApiKeyFallback({
  facilities,
  selectedFacilityId,
  center,
  height,
}: FacilityMapProps) {
  const fallbackFacility = selectedFacilityId
    ? facilities.find((facility) => facility.id === selectedFacilityId)
    : facilities[0];

  const target = fallbackFacility
    ? { lat: fallbackFacility.lat, lng: fallbackFacility.lng }
    : center;

  const handleOpenGoogleMaps = () => {
    const url = `https://maps.google.com/?q=${target.lat},${target.lng}`;

    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    void Linking.openURL(url);
  };

  return (
    <View style={[styles.errorContainer, { height }]}>
      <Text style={styles.errorText}>地図プレビューは未設定です</Text>
      <Text style={styles.errorSubText}>
        `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` を設定すると埋め込み地図を表示できます
      </Text>
      <TouchableOpacity style={styles.linkButton} onPress={handleOpenGoogleMaps}>
        <Text style={styles.linkButtonText}>Googleマップで開く</Text>
      </TouchableOpacity>
    </View>
  );
}

function LoadedFacilityMap({
  facilities,
  selectedFacilityId,
  height = 400,
  center = SAPPORO_CENTER,
  zoom = 13,
  googleMapsApiKey,
}: FacilityMapProps & { googleMapsApiKey: string }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey,
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

export default function FacilityMap({
  facilities,
  selectedFacilityId,
  height = 400,
  center = SAPPORO_CENTER,
  zoom = 13,
}: FacilityMapProps) {
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

  if (!googleMapsApiKey) {
    return (
      <MissingApiKeyFallback
        facilities={facilities}
        selectedFacilityId={selectedFacilityId}
        height={height}
        center={center}
        zoom={zoom}
      />
    );
  }

  return (
    <LoadedFacilityMap
      facilities={facilities}
      selectedFacilityId={selectedFacilityId}
      height={height}
      center={center}
      zoom={zoom}
      googleMapsApiKey={googleMapsApiKey}
    />
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
    textAlign: 'center',
    maxWidth: 360,
    lineHeight: 20,
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
  linkButton: {
    marginTop: 16,
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  linkButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});
