import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../constants/colors';

export interface FilterOptions {
  types: string[];
  districts: string[];
  ageRanges: string[];
  hasSaturday: boolean | null;
  capacityRange: string | null;
}

interface FacilityFilterProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

const facilityTypes = [
  { id: 'temporary-care', label: '一時保育' },
  { id: 'licensed', label: '認可保育所' },
  { id: 'nursery', label: '保育園' },
  { id: 'sick-child', label: '病児保育' },
  { id: 'clinic', label: 'クリニック' },
];

const districts = [
  { id: 'central', label: '中央区' },
  { id: 'north', label: '北区' },
  { id: 'east', label: '東区' },
  { id: 'white-stone', label: '白石区' },
  { id: 'atsubetsu', label: '厚別区' },
  { id: 'toyohira', label: '豊平区' },
  { id: 'kiyota', label: '清田区' },
  { id: 'south', label: '南区' },
  { id: 'west', label: '西区' },
  { id: 'teine', label: '手稲区' },
];

const ageRanges = [
  { id: 'newborn', label: '産休明け～' },
  { id: '0-6months', label: '生後6か月～' },
  { id: '1year', label: '1歳児～' },
  { id: '2year', label: '2歳児～' },
  { id: '3year', label: '3歳児～' },
];

const capacityRanges = [
  { id: 'small', label: '少人数（1-10名）' },
  { id: 'medium', label: '中規模（11-30名）' },
  { id: 'large', label: '大規模（31名以上）' },
];

export default function FacilityFilter({ filters, onFilterChange, onReset }: FacilityFilterProps) {
  const toggleType = (typeId: string) => {
    const newTypes = filters.types.includes(typeId)
      ? filters.types.filter(t => t !== typeId)
      : [...filters.types, typeId];
    onFilterChange({ ...filters, types: newTypes });
  };

  const toggleDistrict = (districtId: string) => {
    const newDistricts = filters.districts.includes(districtId)
      ? filters.districts.filter(d => d !== districtId)
      : [...filters.districts, districtId];
    onFilterChange({ ...filters, districts: newDistricts });
  };

  const toggleAgeRange = (ageId: string) => {
    const newAges = filters.ageRanges.includes(ageId)
      ? filters.ageRanges.filter(a => a !== ageId)
      : [...filters.ageRanges, ageId];
    onFilterChange({ ...filters, ageRanges: newAges });
  };

  const toggleSaturday = () => {
    const newValue = filters.hasSaturday === null ? true : filters.hasSaturday ? false : null;
    onFilterChange({ ...filters, hasSaturday: newValue });
  };

  const setCapacityRange = (range: string | null) => {
    onFilterChange({ ...filters, capacityRange: range });
  };

  return (
    <ScrollView style={styles.container}>
      {/* 施設タイプ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>施設タイプ</Text>
        <View style={styles.chipContainer}>
          {facilityTypes.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.chip,
                filters.types.includes(type.id) && styles.chipActive,
              ]}
              onPress={() => toggleType(type.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  filters.types.includes(type.id) && styles.chipTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 区 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>区</Text>
        <View style={styles.chipContainer}>
          {districts.map(district => (
            <TouchableOpacity
              key={district.id}
              style={[
                styles.chip,
                filters.districts.includes(district.id) && styles.chipActive,
              ]}
              onPress={() => toggleDistrict(district.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  filters.districts.includes(district.id) && styles.chipTextActive,
                ]}
              >
                {district.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 土曜日対応 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>営業日</Text>
        <TouchableOpacity
          style={[
            styles.chip,
            filters.hasSaturday === true && styles.chipActive,
          ]}
          onPress={toggleSaturday}
        >
          <Text
            style={[
              styles.chipText,
              filters.hasSaturday === true && styles.chipTextActive,
            ]}
          >
            土曜日対応
          </Text>
        </TouchableOpacity>
      </View>

      {/* 定員規模 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>定員規模</Text>
        <View style={styles.chipContainer}>
          {capacityRanges.map(range => (
            <TouchableOpacity
              key={range.id}
              style={[
                styles.chip,
                filters.capacityRange === range.id && styles.chipActive,
              ]}
              onPress={() =>
                setCapacityRange(filters.capacityRange === range.id ? null : range.id)
              }
            >
              <Text
                style={[
                  styles.chipText,
                  filters.capacityRange === range.id && styles.chipTextActive,
                ]}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSub,
  },
  chipTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
});
