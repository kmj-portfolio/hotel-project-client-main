import type { Hotel } from '@/types/hotel';
import { create } from 'zustand';

interface HotelState {
  hotelList: Hotel[];
  page: number;
  canUseTrigger: boolean;
  scrollY: number;
  label: string;

  setHotelState: (state: {
    hotelList?: Hotel[];
    page?: number;
    canUseTrigger?: boolean;
    scrollY?: number;
    label?: string;
  }) => void;

  reset: () => void;
}

export const useHotelStore = create<HotelState>((set) => ({
  hotelList: [],
  page: 0,
  canUseTrigger: true,
  scrollY: 0,
  label: '',

  setHotelState: ({ hotelList, page, canUseTrigger, scrollY, label }) =>
    set((state) => ({
      hotelList: hotelList ?? state.hotelList,
      page: page ?? state.page,
      canUseTrigger: canUseTrigger ?? state.canUseTrigger,
      scrollY: scrollY ?? state.scrollY,
      label: label ?? state.label,
    })),

  reset: () =>
    set({
      hotelList: [],
      page: 0,
      canUseTrigger: true,
      scrollY: 0,
      label: '',
    }),
}));
