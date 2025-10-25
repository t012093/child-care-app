import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import {
  Calendar,
  Filter,
  ChevronLeft,
  Search,
  CheckSquare,
  Check,
  XCircle,
  Download,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import ReservationListItem from '../../components/ReservationListItem';
import ReservationDetailModal from '../../components/ReservationDetailModal';
import ReservationFilterModal from '../../components/ReservationFilterModal';
import SearchBar from '../../components/SearchBar';
import MonthCalendar from '../../components/calendar/MonthCalendar';
import WeekCalendar from '../../components/calendar/WeekCalendar';
import DayCalendar from '../../components/calendar/DayCalendar';
import { facilityColors } from '../../constants/colors';
import { useResponsive } from '../../hooks/useResponsive';
import { useReservations } from '../../hooks/useReservations';
import { CalendarViewType, Reservation } from '../../types/reservation';

type ViewTab = CalendarViewType;

export default function ReservationsScreen() {
  const { horizontalPadding, isDesktop, maxContentWidth, isTablet } = useResponsive();
  const router = useRouter();

  // 予約データ管理
  const {
    reservations,
    stats,
    filter,
    setFilter,
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    updateStatus,
    bulkUpdateStatus,
    checkIn,
    checkOut,
  } = useReservations();

  // UI状態管理
  const [selectedView, setSelectedView] = useState<ViewTab>('list');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // カレンダー用の状態
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today.substring(0, 7)); // YYYY-MM
  const [currentWeekStart, setCurrentWeekStart] = useState(today);

  // 検索処理
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilter({
      ...filter,
      searchQuery: query,
    });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilter({
      ...filter,
      searchQuery: undefined,
    });
  };

  // 予約詳細表示
  const handleReservationPress = (id: string) => {
    if (selectionMode) return;
    const reservation = reservations.find((r) => r.id === id);
    if (reservation) {
      setSelectedReservation(reservation);
      setShowDetailModal(true);
    }
  };

  // 選択モード切り替え
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      clearSelection();
    }
  };

  // 一括操作
  const handleBulkApprove = () => {
    bulkUpdateStatus(selectedIds, 'confirmed');
    setSelectionMode(false);
    clearSelection();
  };

  const handleBulkCancel = () => {
    bulkUpdateStatus(selectedIds, 'cancelled');
    setSelectionMode(false);
    clearSelection();
  };

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

  const viewTabs: { key: ViewTab; label: string }[] = [
    { key: 'list', label: 'リスト' },
    { key: 'day', label: '日' },
    { key: 'week', label: '週' },
    { key: 'month', label: '月' },
  ];

  const activeFilterCount = [
    filter.status?.length || 0,
    filter.type?.length || 0,
    filter.dateRange ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={[styles.header, containerStyle]}>
        <View style={styles.headerTop}>
          {!isTablet && (
            <TouchableOpacity
              onPress={() => router.push('/(facility-tabs)/dashboard' as any)}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color={facilityColors.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          <Calendar size={24} color={facilityColors.primary} />
          <Text style={styles.headerTitle}>予約管理</Text>
        </View>

        {/* ビュー切り替えタブ */}
        <View style={styles.viewTabs}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.viewTabsScroll}
          >
            {viewTabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.viewTab,
                  selectedView === tab.key && styles.viewTabActive,
                ]}
                onPress={() => setSelectedView(tab.key)}
              >
                <Text
                  style={[
                    styles.viewTabText,
                    selectedView === tab.key && styles.viewTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* フィルター・検索・選択モードボタン */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Filter size={20} color={facilityColors.primary} />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {selectedView === 'list' && (
              <TouchableOpacity
                style={[
                  styles.headerActionButton,
                  selectionMode && styles.headerActionButtonActive,
                ]}
                onPress={toggleSelectionMode}
              >
                <CheckSquare
                  size={20}
                  color={selectionMode ? 'white' : facilityColors.primary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 検索バー（リストビュー時のみ表示） */}
        {selectedView === 'list' && (
          <View style={styles.searchSection}>
            <SearchBar
              value={searchQuery}
              onChangeText={handleSearch}
              onClear={handleClearSearch}
              placeholder="子供名、保護者名、電話番号で検索"
            />
          </View>
        )}
      </View>

      {/* メインコンテンツ */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[containerStyle, contentStyle]}
      >
        {/* 統計情報 */}
        <View style={styles.statsSection}>
          <Text style={styles.statsText}>
            全{stats.total}件{searchQuery ? `（検索結果）` : ''}
          </Text>
        </View>

        {/* ビューコンテンツ */}
        {selectedView === 'list' && (
          <View style={styles.listSection}>
            {reservations.length > 0 ? (
              <View style={styles.reservationList}>
                {reservations.map((reservation) => (
                  <ReservationListItem
                    key={reservation.id}
                    reservation={reservation}
                    onPress={handleReservationPress}
                    selectionMode={selectionMode}
                    isSelected={selectedIds.includes(reservation.id)}
                    onToggleSelection={toggleSelection}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? '検索条件に一致する予約が見つかりませんでした'
                    : '予約がありません'}
                </Text>
              </View>
            )}
          </View>
        )}

        {selectedView === 'month' && (
          <View style={styles.calendarSection}>
            <MonthCalendar
              reservations={reservations}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          </View>
        )}

        {selectedView === 'week' && (
          <View style={styles.calendarSection}>
            <WeekCalendar
              reservations={reservations}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              currentWeek={currentWeekStart}
              onWeekChange={setCurrentWeekStart}
            />
          </View>
        )}

        {selectedView === 'day' && (
          <View style={styles.calendarSection}>
            <DayCalendar
              reservations={reservations}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onReservationPress={handleReservationPress}
              onCheckIn={checkIn}
              onCheckOut={checkOut}
            />
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>

      {/* 選択モード時のフローティングアクションバー */}
      {selectionMode && selectedIds.length > 0 && (
        <View style={styles.floatingActionBar}>
          <View style={styles.floatingBarContent}>
            <Text style={styles.selectedCountText}>{selectedIds.length}件選択中</Text>
            <View style={styles.floatingBarActions}>
              <TouchableOpacity
                style={styles.floatingBarButton}
                onPress={selectAll}
              >
                <Text style={styles.floatingBarButtonText}>全選択</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.floatingBarButton, styles.approveButton]}
                onPress={handleBulkApprove}
              >
                <Check size={18} color="white" />
                <Text style={styles.floatingBarActionText}>承認</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.floatingBarButton, styles.cancelButton]}
                onPress={handleBulkCancel}
              >
                <XCircle size={18} color="white" />
                <Text style={styles.floatingBarActionText}>キャンセル</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 詳細モーダル */}
      <ReservationDetailModal
        reservation={selectedReservation}
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onUpdateStatus={updateStatus}
        onCheckIn={checkIn}
        onCheckOut={checkOut}
      />

      {/* フィルターモーダル */}
      <ReservationFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filter={filter}
        onApplyFilter={setFilter}
      />
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
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: facilityColors.textMain,
  },
  viewTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  viewTabsScroll: {
    gap: 8,
    flexGrow: 1,
  },
  viewTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: facilityColors.background,
    borderWidth: 1,
    borderColor: facilityColors.accentSoft,
  },
  viewTabActive: {
    backgroundColor: facilityColors.primary,
    borderColor: facilityColors.primary,
  },
  viewTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: facilityColors.textSub,
  },
  viewTabTextActive: {
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: facilityColors.background,
    borderWidth: 1,
    borderColor: facilityColors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerActionButtonActive: {
    backgroundColor: facilityColors.primary,
    borderColor: facilityColors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },
  searchSection: {
    marginTop: 8,
  },
  statsSection: {
    paddingVertical: 12,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: facilityColors.textSub,
  },
  listSection: {
    flex: 1,
  },
  reservationList: {
    gap: 0,
  },
  calendarSection: {
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: facilityColors.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: facilityColors.textSub,
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    height: 80,
  },
  floatingActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: facilityColors.surface,
    borderTopWidth: 1,
    borderTopColor: facilityColors.accentSoft,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  selectedCountText: {
    fontSize: 16,
    fontWeight: '700',
    color: facilityColors.textMain,
  },
  floatingBarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  floatingBarButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: facilityColors.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  floatingBarButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: facilityColors.textMain,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  floatingBarActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});
