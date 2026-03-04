import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Reservation,
  ReservationFilter,
  ReservationSort,
  ReservationStatus,
  ReservationType,
} from '../types/reservation';
import {
  fetchAllReservations,
  markReservationCheckedIn,
  markReservationCheckedOut,
  updateReservationStatusRecord,
} from '../lib/reservationService';

const DEMO_RESERVATIONS: Reservation[] = [
  {
    id: 'demo-1',
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
    id: 'demo-2',
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
    id: 'demo-3',
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
    id: 'demo-4',
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
];

function mergeReservations(base: Reservation[], next: Reservation[]) {
  const map = new Map<string, Reservation>();

  base.forEach((reservation) => {
    map.set(reservation.id, reservation);
  });

  next.forEach((reservation) => {
    map.set(reservation.id, reservation);
  });

  return Array.from(map.values()).sort((left, right) =>
    `${left.date} ${left.startTime}`.localeCompare(`${right.date} ${right.startTime}`)
  );
}

/**
 * 予約管理のためのカスタムフック
 * 実データ取得を優先し、空の場合のみデモデータをフォールバックします。
 */
export function useReservations() {
  const [filter, setFilter] = useState<ReservationFilter>({});
  const [sort, setSort] = useState<ReservationSort>({
    key: 'date',
    order: 'asc',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [allReservations, setAllReservations] = useState<Reservation[]>(DEMO_RESERVATIONS);

  useEffect(() => {
    let isMounted = true;

    const loadReservations = async () => {
      try {
        const storedReservations = await fetchAllReservations();

        if (!isMounted) return;

        if (storedReservations.length > 0) {
          setAllReservations(mergeReservations(DEMO_RESERVATIONS, storedReservations));
        } else {
          setAllReservations(DEMO_RESERVATIONS);
        }
      } catch (error) {
        console.error('Failed to load reservations:', error);
        if (isMounted) {
          setAllReservations(DEMO_RESERVATIONS);
        }
      }
    };

    loadReservations();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredReservations = useMemo(() => {
    let result = [...allReservations];

    if (filter.dateRange) {
      result = result.filter((reservation) => {
        return (
          reservation.date >= filter.dateRange!.start &&
          reservation.date <= filter.dateRange!.end
        );
      });
    }

    if (filter.status && filter.status.length > 0) {
      result = result.filter((reservation) => filter.status!.includes(reservation.status));
    }

    if (filter.type && filter.type.length > 0) {
      result = result.filter((reservation) => filter.type!.includes(reservation.type));
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter((reservation) => {
        return (
          reservation.childName.toLowerCase().includes(query) ||
          reservation.parentName.toLowerCase().includes(query) ||
          reservation.parentPhone?.includes(query) ||
          reservation.parentEmail?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [allReservations, filter]);

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

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      }
      return [...prev, id];
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(sortedReservations.map((reservation) => reservation.id));
  }, [sortedReservations]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const applyLocalStatus = useCallback((id: string, status: ReservationStatus) => {
    setAllReservations((prev) =>
      prev.map((reservation) => {
        if (reservation.id !== id) return reservation;

        if (status === 'checked_in') {
          return {
            ...reservation,
            status,
            checkedInAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        if (status === 'checked_out') {
          return {
            ...reservation,
            status,
            checkedOutAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        return {
          ...reservation,
          status,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const updateStatus = useCallback(async (id: string, status: ReservationStatus) => {
    applyLocalStatus(id, status);

    try {
      if (status === 'confirmed') {
        await updateReservationStatusRecord(id, 'confirmed', {
          confirmed_at: new Date().toISOString(),
        });
      } else if (status === 'cancelled') {
        await updateReservationStatusRecord(id, 'cancelled', {
          cancelled_at: new Date().toISOString(),
          cancelled_by_type: 'facility',
        });
      } else if (status === 'checked_in') {
        await markReservationCheckedIn(id);
      } else if (status === 'checked_out') {
        await markReservationCheckedOut(id);
      }
    } catch (error) {
      console.error('Failed to update reservation:', error);
    }
  }, [applyLocalStatus]);

  const bulkUpdateStatus = useCallback(async (ids: string[], status: ReservationStatus) => {
    ids.forEach((id) => {
      applyLocalStatus(id, status);
    });

    await Promise.all(
      ids.map(async (id) => {
        try {
          if (status === 'confirmed') {
            await updateReservationStatusRecord(id, 'confirmed', {
              confirmed_at: new Date().toISOString(),
            });
          } else if (status === 'cancelled') {
            await updateReservationStatusRecord(id, 'cancelled', {
              cancelled_at: new Date().toISOString(),
              cancelled_by_type: 'facility',
            });
          }
        } catch (error) {
          console.error('Failed to bulk update reservation:', error);
        }
      })
    );
  }, [applyLocalStatus]);

  const checkIn = useCallback(async (id: string) => {
    applyLocalStatus(id, 'checked_in');

    try {
      await markReservationCheckedIn(id);
    } catch (error) {
      console.error('Failed to check in reservation:', error);
    }
  }, [applyLocalStatus]);

  const checkOut = useCallback(async (id: string) => {
    applyLocalStatus(id, 'checked_out');

    try {
      await markReservationCheckedOut(id);
    } catch (error) {
      console.error('Failed to check out reservation:', error);
    }
  }, [applyLocalStatus]);

  const stats = useMemo(() => {
    const total = filteredReservations.length;
    const byStatus = filteredReservations.reduce((acc, reservation) => {
      acc[reservation.status] = (acc[reservation.status] || 0) + 1;
      return acc;
    }, {} as Record<ReservationStatus, number>);

    const byType = filteredReservations.reduce((acc, reservation) => {
      acc[reservation.type] = (acc[reservation.type] || 0) + 1;
      return acc;
    }, {} as Record<ReservationType, number>);

    return {
      total,
      byStatus,
      byType,
    };
  }, [filteredReservations]);

  return {
    allReservations,
    reservations: sortedReservations,
    stats,
    filter,
    setFilter,
    sort,
    setSort,
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    updateStatus,
    bulkUpdateStatus,
    checkIn,
    checkOut,
  };
}
