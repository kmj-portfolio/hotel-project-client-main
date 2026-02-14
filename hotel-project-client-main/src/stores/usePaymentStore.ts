import { create } from 'zustand';
import type { Payment } from '@/types/PaymentType';

interface PaymentState {
  paymentModal: boolean;
  togglePayment: () => void;
  reservationId: number;
  setReservationId: (reservationId: number) => void;
  roomId: number;
  setRoomId: (roomId: number) => void;
  payments: Payment | null;
  setPayments: (payments: Payment) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  paymentModal: false,
  togglePayment: () => set((state) => ({ paymentModal: !state.paymentModal })),
  reservationId: 0,
  setReservationId: (reservationId) => {
    set({ reservationId: reservationId });
  },
  roomId: 0,
  setRoomId: (roomId) => {
    set({ roomId: roomId });
  },
  payments: null,
  setPayments: (response: Payment) => {
    set({ payments: response });
  },
}));
