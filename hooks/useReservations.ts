import { useState, useMemo, useCallback } from 'react';
import {
  Reservation,
  ReservationFilter,
  ReservationSort,
  ReservationStatus,
  ReservationType,
} from '../types/reservation';

/**
 * 予約管理のためのカスタムフック
 * モックデータの提供、フィルタリング、検索、ソート機能を提供
 */
export function useReservations() {
  const [filter, setFilter] = useState<ReservationFilter>({});
  const [sort, setSort] = useState<ReservationSort>({
    key: 'date',
    order: 'asc',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // モックデータ（後でSupabaseに置き換え）
  const allReservations = useMemo<Reservation[]>(() => {
    return [
      {
        id: '1',
        date: '2025-10-25',
        startTime: '09:00',
        endTime: '12:00',
        childId: 'child1',
        childName: '山田太郎',
        childAge: 3,
        childBirthDate: '2022-04-15',
        parentId: 'parent1',
        parentName: '山田花子',
        parentPhone: '090-1234-5678',
        parentEmail: 'yamada@example.com',
        status: 'confirmed',
        type: '一時預かり',
        allergies: ['卵', '乳製品'],
        medicalNotes: '',
        createdAt: '2025-10-20T10:00:00Z',
        updatedAt: '2025-10-20T10:00:00Z',
      },
      {
        id: '2',
        date: '2025-10-25',
        startTime: '10:30',
        endTime: '15:30',
        childId: 'child2',
        childName: '佐藤次郎',
        childAge: 2,
        childBirthDate: '2023-06-20',
        parentId: 'parent2',
        parentName: '佐藤美咲',
        parentPhone: '090-2345-6789',
        parentEmail: 'sato@example.com',
        status: 'checked_in',
        type: '一時預かり',
        createdAt: '2025-10-22T14:00:00Z',
        updatedAt: '2025-10-25T10:30:00Z',
        checkedInAt: '2025-10-25T10:30:00Z',
      },
      {
        id: '3',
        date: '2025-10-25',
        startTime: '14:00',
        endTime: '15:00',
        childId: 'child3',
        childName: '鈴木三郎',
        childAge: 4,
        parentId: 'parent3',
        parentName: '鈴木愛',
        parentPhone: '090-3456-7890',
        status: 'pending',
        type: '見学',
        medicalNotes: '喘息の傾向あり',
        createdAt: '2025-10-24T09:00:00Z',
        updatedAt: '2025-10-24T09:00:00Z',
      },
      {
        id: '4',
        date: '2025-10-25',
        startTime: '15:30',
        endTime: '17:00',
        childId: 'child4',
        childName: '田中四郎',
        childAge: 5,
        parentId: 'parent4',
        parentName: '田中美穂',
        parentPhone: '090-4567-8901',
        status: 'confirmed',
        type: '一時預かり',
        createdAt: '2025-10-23T16:00:00Z',
        updatedAt: '2025-10-23T16:00:00Z',
      },
      {
        id: '5',
        date: '2025-10-25',
        startTime: '16:00',
        endTime: '17:30',
        childId: 'child5',
        childName: '高橋五郎',
        childAge: 3,
        parentId: 'parent5',
        parentName: '高橋さくら',
        parentPhone: '090-5678-9012',
        status: 'cancelled',
        type: '見学',
        createdAt: '2025-10-21T11:00:00Z',
        updatedAt: '2025-10-24T15:00:00Z',
      },
      // 翌日のデータ
      {
        id: '6',
        date: '2025-10-26',
        startTime: '09:30',
        endTime: '11:30',
        childId: 'child6',
        childName: '伊藤六郎',
        childAge: 4,
        parentId: 'parent6',
        parentName: '伊藤美香',
        parentPhone: '090-6789-0123',
        status: 'confirmed',
        type: '相談',
        createdAt: '2025-10-25T08:00:00Z',
        updatedAt: '2025-10-25T08:00:00Z',
      },
      {
        id: '7',
        date: '2025-10-26',
        startTime: '13:00',
        endTime: '16:00',
        childId: 'child7',
        childName: '渡辺七美',
        childAge: 2,
        parentId: 'parent7',
        parentName: '渡辺恵',
        parentPhone: '090-7890-1234',
        status: 'pending',
        type: '一時預かり',
        allergies: ['そば', 'ピーナッツ'],
        createdAt: '2025-10-25T12:00:00Z',
        updatedAt: '2025-10-25T12:00:00Z',
      },
      // 先週のデータ
      {
        id: '8',
        date: '2025-10-20',
        startTime: '10:00',
        endTime: '14:00',
        childId: 'child8',
        childName: '中村八郎',
        childAge: 3,
        parentId: 'parent8',
        parentName: '中村由美',
        parentPhone: '090-8901-2345',
        status: 'checked_out',
        type: '一時預かり',
        createdAt: '2025-10-18T10:00:00Z',
        updatedAt: '2025-10-20T14:00:00Z',
        checkedInAt: '2025-10-20T10:00:00Z',
        checkedOutAt: '2025-10-20T14:00:00Z',
      },
    ];
  }, []);

  // フィルタリング処理
  const filteredReservations = useMemo(() => {
    let result = [...allReservations];

    // 日付範囲フィルタ
    if (filter.dateRange) {
      result = result.filter((r) => {
        return r.date >= filter.dateRange!.start && r.date <= filter.dateRange!.end;
      });
    }

    // ステータスフィルタ
    if (filter.status && filter.status.length > 0) {
      result = result.filter((r) => filter.status!.includes(r.status));
    }

    // タイプフィルタ
    if (filter.type && filter.type.length > 0) {
      result = result.filter((r) => filter.type!.includes(r.type));
    }

    // 検索クエリ
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter((r) => {
        return (
          r.childName.toLowerCase().includes(query) ||
          r.parentName.toLowerCase().includes(query) ||
          r.parentPhone?.includes(query) ||
          r.parentEmail?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [allReservations, filter]);

  // ソート処理
  const sortedReservations = useMemo(() => {
    const result = [...filteredReservations];

    result.sort((a, b) => {
      let comparison = 0;

      switch (sort.key) {
        case 'date':
          comparison = `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`);
          break;
        case 'childName':
          comparison = a.childName.localeCompare(b.childName);
          break;
        case 'parentName':
          comparison = a.parentName.localeCompare(b.parentName);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'createdAt':
          comparison = a.createdAt.localeCompare(b.createdAt);
          break;
      }

      return sort.order === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [filteredReservations, sort]);

  // 選択操作
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(sortedReservations.map((r) => r.id));
  }, [sortedReservations]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // ステータス変更（モック実装）
  const updateStatus = useCallback((id: string, status: ReservationStatus) => {
    console.log('Update status:', id, status);
    // TODO: Supabase実装時にここで実際の更新を行う
  }, []);

  const bulkUpdateStatus = useCallback((ids: string[], status: ReservationStatus) => {
    console.log('Bulk update status:', ids, status);
    // TODO: Supabase実装時にここで実際の更新を行う
  }, []);

  // チェックイン/アウト（モック実装）
  const checkIn = useCallback((id: string) => {
    console.log('Check in:', id);
    // TODO: Supabase実装時にここで実際の更新を行う
  }, []);

  const checkOut = useCallback((id: string) => {
    console.log('Check out:', id);
    // TODO: Supabase実装時にここで実際の更新を行う
  }, []);

  // 統計情報
  const stats = useMemo(() => {
    const total = filteredReservations.length;
    const byStatus = filteredReservations.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<ReservationStatus, number>);

    const byType = filteredReservations.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<ReservationType, number>);

    return {
      total,
      byStatus,
      byType,
    };
  }, [filteredReservations]);

  return {
    // データ
    allReservations,
    reservations: sortedReservations,
    stats,

    // フィルタ・ソート
    filter,
    setFilter,
    sort,
    setSort,

    // 選択
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,

    // アクション
    updateStatus,
    bulkUpdateStatus,
    checkIn,
    checkOut,
  };
}
