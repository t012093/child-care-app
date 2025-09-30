import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Platform,
  Linking
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star, MapPin, Phone, Mail, Navigation } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { sampleFacilities } from '../../constants/facilities';

export default function FacilityDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const facility = sampleFacilities.find(f => f.id === id);

  if (!facility) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>施設が見つかりませんでした</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCall = () => {
    if (facility.phone) {
      Linking.openURL(`tel:${facility.phone}`);
    }
  };

  const handleEmail = () => {
    if (facility.email) {
      Linking.openURL(`mailto:${facility.email}`);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'nursery': return '保育園';
      case 'sick-child': return '病児保育';
      case 'clinic': return 'クリニック';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'nursery': return '#4CAF50';
      case 'sick-child': return '#FF9800';
      case 'clinic': return '#2196F3';
      default: return colors.accent;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {facility.name}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Main Image */}
        <Image source={{ uri: facility.imageUrl }} style={styles.mainImage} />

        {/* Basic Info */}
        <View style={styles.basicInfo}>
          <View style={styles.nameAndType}>
            <Text style={styles.facilityName}>{facility.name}</Text>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: `${getTypeColor(facility.type)}15` }
              ]}
            >
              <Text
                style={[
                  styles.typeText,
                  { color: getTypeColor(facility.type) }
                ]}
              >
                {getTypeLabel(facility.type)}
              </Text>
            </View>
          </View>

          <View style={styles.ratingContainer}>
            <Star size={20} color="#FFCA28" fill="#FFCA28" />
            <Text style={styles.ratingText}>{facility.rating.toFixed(1)}</Text>
            <Text style={styles.ratingSubText}>（評価）</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => router.push('/reserve')}
          >
            <Text style={styles.primaryButtonText}>予約する</Text>
          </TouchableOpacity>

          {facility.phone && (
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleCall}
            >
              <Phone size={18} color={colors.accent} />
              <Text style={styles.secondaryButtonText}>電話</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        {facility.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>施設について</Text>
            <Text style={styles.description}>{facility.description}</Text>
          </View>
        )}

        {/* Contact & Access Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>施設情報</Text>

          <View style={styles.infoItem}>
            <MapPin size={18} color={colors.textSub} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>住所</Text>
              <Text style={styles.infoValue}>{facility.address}</Text>
              {facility.distance && (
                <Text style={styles.infoDistance}>現在地から約 {facility.distance}km</Text>
              )}
            </View>
          </View>

          {facility.phone && (
            <TouchableOpacity style={styles.infoItem} onPress={handleCall}>
              <Phone size={18} color={colors.textSub} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>電話番号</Text>
                <Text style={[styles.infoValue, styles.linkText]}>{facility.phone}</Text>
              </View>
            </TouchableOpacity>
          )}

          {facility.email && (
            <TouchableOpacity style={styles.infoItem} onPress={handleEmail}>
              <Mail size={18} color={colors.textSub} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>メールアドレス</Text>
                <Text style={[styles.infoValue, styles.linkText]}>{facility.email}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Map Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アクセス</Text>
          <View style={styles.mapPlaceholder}>
            <Navigation size={32} color={colors.accent} />
            <Text style={styles.mapText}>地図表示エリア</Text>
            <Text style={styles.mapSubText}>Googleマップ連携予定</Text>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerBackButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  mainImage: {
    width: '100%',
    height: Platform.OS === 'web' ? 300 : 250,
  },
  basicInfo: {
    padding: 16,
    backgroundColor: colors.surface,
  },
  nameAndType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  facilityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMain,
    marginRight: 12,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
    marginLeft: 6,
  },
  ratingSubText: {
    fontSize: 14,
    color: colors.textSub,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: colors.accent,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  secondaryButtonText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    backgroundColor: colors.surface,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMain,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSub,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: colors.textMain,
    lineHeight: 22,
  },
  infoDistance: {
    fontSize: 14,
    color: colors.textSub,
    marginTop: 4,
  },
  linkText: {
    color: colors.accent,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 16,
    color: colors.textMain,
    marginTop: 8,
    fontWeight: '500',
  },
  mapSubText: {
    fontSize: 14,
    color: colors.textSub,
    marginTop: 4,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  notFoundText: {
    fontSize: 18,
    color: colors.textMain,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
});