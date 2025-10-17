import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Dimensions, Platform, Modal } from 'react-native';
import SearchBar from '../../components/SearchBar';
import FacilityListItem from '../../components/FacilityListItem';
import FacilityMap from '../../components/FacilityMap';
import FacilityFilter, { FilterOptions } from '../../components/FacilityFilter';
import { colors } from '../../constants/colors';
import { sampleFacilities, filterFacilities } from '../../constants/facilities';
import { FileSliders as Sliders, X, ArrowUpDown } from 'lucide-react-native';

const ITEMS_PER_PAGE = 15;

type SortOption = 'distance' | 'rating' | 'newest';

export default function ReserveScreen() {
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    types: [],
    districts: [],
    ageRanges: [],
    hasSaturday: null,
    capacityRange: null,
  });
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  const isWeb = Platform.OS === 'web';

  // フィルタリング&ソートされた施設リスト（全件）
  const filteredAndSortedFacilities = useMemo(() => {
    const filtered = filterFacilities(sampleFacilities, filters);

    // ソート処理
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          // IDが大きいほど新しいと仮定
          return b.id.localeCompare(a.id);
        default:
          return 0;
      }
    });

    return sorted;
  }, [filters, sortBy]);

  // 表示用リスト（ページネーション適用）
  const displayedFacilities = useMemo(() => {
    return filteredAndSortedFacilities.slice(0, displayCount);
  }, [filteredAndSortedFacilities, displayCount]);

  const handleResetFilters = () => {
    setFilters({
      types: [],
      districts: [],
      ageRanges: [],
      hasSaturday: null,
      capacityRange: null,
    });
    setDisplayCount(ITEMS_PER_PAGE); // フィルタリセット時に表示件数もリセット
  };

  // アクティブなフィルター数
  const activeFilterCount =
    filters.types.length +
    filters.districts.length +
    filters.ageRanges.length +
    (filters.hasSaturday !== null ? 1 : 0) +
    (filters.capacityRange !== null ? 1 : 0);

  // ページネーションハンドラー
  const handleLoadMore = () => {
    if (displayCount < filteredAndSortedFacilities.length) {
      setDisplayCount(prev => prev + ITEMS_PER_PAGE);
    }
  };

  const handleReset = () => {
    setDisplayCount(ITEMS_PER_PAGE);
  };

  // ページネーションフッター
  const renderFooter = () => {
    const hasMore = displayCount < filteredAndSortedFacilities.length;
    const showReset = displayCount > ITEMS_PER_PAGE;

    if (!hasMore && !showReset) {
      return null;
    }

    return (
      <View style={styles.paginationFooter}>
        <Text style={styles.paginationInfo}>
          {displayCount} / {filteredAndSortedFacilities.length}件を表示中
        </Text>

        <View style={styles.paginationButtons}>
          {showReset && (
            <TouchableOpacity
              style={[styles.paginationButton, styles.resetButton]}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>最初に戻る</Text>
            </TouchableOpacity>
          )}

          {hasMore && (
            <TouchableOpacity
              style={[styles.paginationButton, styles.loadMoreButton]}
              onPress={handleLoadMore}
            >
              <Text style={styles.loadMoreButtonText}>
                次の{Math.min(ITEMS_PER_PAGE, filteredAndSortedFacilities.length - displayCount)}件を表示
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // ソートオプションのラベル
  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'distance': return '距離が近い順';
      case 'rating': return '評価が高い順';
      case 'newest': return '新着順';
    }
  };

  // ヘッダーコンポーネント（マップと検索バー）
  const ListHeaderComponent = () => (
    <>
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
          <Text style={styles.filterText}>フィルター</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.mapContainer, isWeb && styles.mapContainerWeb]}>
        <FacilityMap
          facilities={filteredAndSortedFacilities}
          height={isWeb ? 600 : Dimensions.get('window').width - 32}
        />
      </View>

      <View style={[styles.listHeader, isWeb && styles.listHeaderWeb]}>
        <View>
          <Text style={styles.listTitle}>近くの施設</Text>
          <Text style={styles.listSubtitle}>{filteredAndSortedFacilities.length}件見つかりました</Text>
        </View>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortModalVisible(true)}
        >
          <ArrowUpDown size={16} color={colors.textMain} />
          <Text style={styles.sortButtonText}>並び替え</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={displayedFacilities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FacilityListItem facility={item} />}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={renderFooter}
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={5}
        removeClippedSubviews={!isWeb}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
      />

      {/* フィルターモーダル */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>フィルター</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={handleResetFilters}
                style={styles.resetButtonHeader}
              >
                <Text style={styles.resetButtonHeaderText}>リセット</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X size={24} color={colors.textMain} />
              </TouchableOpacity>
            </View>
          </View>
          <FacilityFilter
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
          />
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setFilterModalVisible(false)}
          >
            <Text style={styles.applyButtonText}>適用する</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* ソートモーダル */}
      <Modal
        visible={sortModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
        >
          <View style={styles.sortModalContent}>
            <View style={styles.sortModalHeader}>
              <Text style={styles.modalTitle}>並び替え</Text>
            </View>
            {(['distance', 'rating', 'newest'] as SortOption[]).map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sortOption,
                  sortBy === option && styles.sortOptionActive,
                ]}
                onPress={() => {
                  setSortBy(option);
                  setSortModalVisible(false);
                  setDisplayCount(ITEMS_PER_PAGE); // ソート変更時にリセット
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === option && styles.sortOptionTextActive,
                  ]}
                >
                  {getSortLabel(option)}
                </Text>
                {sortBy === option && (
                  <View style={styles.sortOptionCheck}>
                    <Text style={styles.sortOptionCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContentContainer: {
    flexGrow: 1,
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
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapContainerWeb: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
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
  paginationFooter: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginTop: 8,
  },
  paginationInfo: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 16,
  },
  paginationButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
  },
  paginationButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  loadMoreButton: {
    backgroundColor: colors.accent,
  },
  loadMoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  resetButtonText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  resetButtonHeader: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resetButtonHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  applyButton: {
    margin: 16,
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sortModalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  sortModalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sortOptionActive: {
    backgroundColor: colors.accentSoft,
  },
  sortOptionText: {
    fontSize: 16,
    color: colors.textMain,
  },
  sortOptionTextActive: {
    fontWeight: '600',
    color: colors.accent,
  },
  sortOptionCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortOptionCheckText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
});