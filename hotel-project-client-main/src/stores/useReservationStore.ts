import type { Reservation, ReservationResponse } from '@/types/ReservationType';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ReservationState {
  reservations: Reservation[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  loading: boolean;
  error: string | null;

  setReservations: (response: ReservationResponse) => void;
  deleteReservation: (reservationId: number) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearReservations: () => void;

  // 유틸리티 액션
  getReservationById: (id: number) => Reservation | undefined;
  getReservationsByStatus: (status: Reservation['reservationStatus']) => Reservation[];
  getTotalPaidAmount: () => number;
  getTotalUnpaidAmount: () => number;
}

export const useReservationStore = create<ReservationState>()(
  devtools(
    (set, get) => ({
      reservations: [],
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      pageSize: 20,
      loading: false,
      error: null,

      setReservations: (response: ReservationResponse) => {
        const result = response;
        set({
          reservations: result.content,
          currentPage: result.number,
          totalPages: result.totalPages,
          totalElements: result.totalElements,
          pageSize: result.size,
          loading: false,
          error: null,
        });
      },

      // 예약 삭제
      deleteReservation: (reservationId: number) => {
        set((state) => ({
          reservations: state.reservations.filter(
            (reservation) => reservation.reservationId !== reservationId,
          ),
          totalElements: Math.max(0, state.totalElements - 1),
        }));
      },

      // 현재 페이지 설정
      setCurrentPage: (page: number) => {
        set({ currentPage: page });
      },

      // 페이지 크기 설정
      setPageSize: (size: number) => {
        set({ pageSize: size, currentPage: 0 });
      },

      // 로딩 상태 설정
      setLoading: (loading: boolean) => {
        set({ loading });
      },

      // 에러 상태 설정
      setError: (error: string | null) => {
        set({ error, loading: false });
      },

      // 예약 목록 초기화
      clearReservations: () => {
        set({
          reservations: [],
          currentPage: 0,
          totalPages: 0,
          totalElements: 0,
          error: null,
        });
      },

      // ID로 예약 찾기
      getReservationById: (id: number) => {
        return get().reservations.find((reservation) => reservation.reservationId === id);
      },

      // 상태별 예약 필터링
      getReservationsByStatus: (status: Reservation['reservationStatus']) => {
        return get().reservations.filter((reservation) => reservation.reservationStatus === status);
      },

      // 총 결제 완료 금액 계산
      getTotalPaidAmount: () => {
        return get().reservations.reduce((total, reservation) => total + reservation.pricePaid, 0);
      },

      // 총 미결제 금액 계산
      getTotalUnpaidAmount: () => {
        return get().reservations.reduce(
          (total, reservation) => total + (reservation.totalPrice - reservation.pricePaid),
          0,
        );
      },
    }),
    {
      name: 'reservation-store',
    },
  ),
);

// hook
export const useReservations = () => useReservationStore((state) => state.reservations);
export const useReservationLoading = () => useReservationStore((state) => state.loading);
export const useReservationError = () => useReservationStore((state) => state.error);
export const useReservationPagination = () =>
  useReservationStore((state) => ({
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    totalElements: state.totalElements,
    pageSize: state.pageSize,
  }));
