import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Platform } from 'react-native';
import SearchBar from '../../components/SearchBar';
import FacilityListItem from '../../components/FacilityListItem';
import { colors } from '../../constants/colors';
import { sampleFacilities } from '../../constants/facilities';
import { MapPin, FileSliders as Sliders } from 'lucide-react-native';

export default function ReserveScreen() {
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const isWeb = Platform.OS === 'web';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>施設を探す</Text>
        </View>

        <View style={styles.searchContainer}>
          <SearchBar placeholder="施設名、住所で検索" />

          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => setFilterModalVisible(true)}
          >
            <Sliders size={16} color={colors.textMain} />
            <Text style={styles.filterText}>範囲</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.mapContainer, isWeb && styles.mapContainerWeb]}>
          <View style={styles.mapPlaceholder}>
            <MapPin size={24} color={colors.accent} />
            <Text style={styles.mapText}>Googleマップ表示エリア</Text>
          </View>
        </View>

        <View style={[styles.listHeader, isWeb && styles.listHeaderWeb]}>
          <Text style={styles.listTitle}>近くの施設</Text>
          <Text style={styles.listSubtitle}>{sampleFacilities.length}件見つかりました</Text>
        </View>

        <View style={styles.listContainer}>
          {sampleFacilities.map((facility) => (
            <FacilityListItem key={facility.id} facility={facility} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMain,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterText: {
    fontSize: 14,
    color: colors.textMain,
    marginLeft: 4,
  },
  mapContainer: {
    height: Dimensions.get('window').width - 32,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapContainerWeb: {
    height: 600,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    marginTop: 8,
    color: colors.textSub,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listHeaderWeb: {
    paddingHorizontal: 32,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1024,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
  },
  listSubtitle: {
    fontSize: 14,
    color: colors.textSub,
  },
  listContainer: {
    paddingBottom: 16,
  },
});