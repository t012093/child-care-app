import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Calendar, Filter } from 'lucide-react-native';
import ReservationListItem, { Reservation } from '../../components/ReservationListItem';
import { facilityColors } from '../../constants/colors';
import { useResponsive } from '../../hooks/useResponsive';

type FilterTab = 'today' | 'week' | 'month' | 'all';

export default function ReservationsScreen() {
  const { horizontalPadding, isDesktop, maxContentWidth } = useResponsive();
  const [selectedFilter, setSelectedFilter] = useState<FilterTab>('today');

  // サンプルデータ
  const allReservations: Reservation[] = [
    {
      id: '1',
      time: '09:00',
      childName: '山田太郎',
      parentName: '山田花子',
      status: 'confirmed',
      type: '一時預かり',
    },
    {
      id: '2',
      time: '10:30',
      childName: '佐藤次郎',
      parentName: '佐藤美咲',
      status: 'confirmed',
      type: '一時預かり',
    },
    {
      id: '3',
      time: '14:00',
      childName: '鈴木三郎',
      parentName: '鈴木愛',
      status: 'pending',
      type: '見学',
    },
    {
      id: '4',
      time: '15:30',
      childName: '田中四郎',
      parentName: '田中美穂',
      status: 'confirmed',
      type: '一時預かり',
    },
    {
      id: '5',
      time: '16:00',
      childName: '高橋五郎',
      parentName: '高橋さくら',
      status: 'cancelled',
      type: '見学',
    },
  ];

  const containerStyle = {
    paddingHorizontal: horizontalPadding,
  };

  const contentStyle = [
    isDesktop && {
      maxWidth: maxContentWidth,
      alignSelf: 'center',
      width: '100%',
    },
  ];

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'today', label: '本日' },
    { key: 'week', label: '今週' },
    { key: 'month', label: '今月' },
    { key: 'all', label: 'すべて' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, containerStyle]}>
        <View style={styles.headerTop}>
          <Calendar size={24} color={facilityColors.primary} />
          <Text style={styles.headerTitle}>予約管理</Text>
        </View>

        {/* フィルタータブ */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {filterTabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterTab,
                  selectedFilter === tab.key && styles.filterTabActive,
                ]}
                onPress={() => setSelectedFilter(tab.key)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    selectedFilter === tab.key && styles.filterTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={facilityColors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[containerStyle, contentStyle]}
      >
        <View style={styles.reservationSection}>
          <Text style={styles.countText}>{allReservations.length}件の予約</Text>

          <View style={styles.reservationList}>
            {allReservations.map((reservation) => (
              <ReservationListItem
                key={reservation.id}
                reservation={reservation}
                onPress={(id) => console.log('Reservation detail:', id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: facilityColors.background,
  },
  header: {
    backgroundColor: facilityColors.surface,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: facilityColors.accentSoft,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: facilityColors.textMain,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterScrollContent: {
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: facilityColors.background,
    borderWidth: 1,
    borderColor: facilityColors.accentSoft,
  },
  filterTabActive: {
    backgroundColor: facilityColors.primary,
    borderColor: facilityColors.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: facilityColors.textSub,
  },
  filterTabTextActive: {
    color: 'white',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: facilityColors.background,
    borderWidth: 1,
    borderColor: facilityColors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reservationSection: {
    paddingTop: 16,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: facilityColors.textSub,
    marginBottom: 12,
  },
  reservationList: {
    gap: 0,
  },
  footer: {
    height: 40,
  },
});