import type { UserRole } from '@/types/user';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
interface useAuthInterface {
  role: UserRole;
  setUserRole: (role: UserRole) => void;
  removeUserRole: () => void;
  nickName: string | null;
  setUserNickName: (email: string) => void;
  removeUserNickName: () => void;
  providerHotelId: number | null;
  setProviderHotelId: (id: number | null) => void;
  setLogout: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  isTokenRestored: boolean;
  setTokenRestored: () => void;
}

const useAuthStore = create<useAuthInterface>()(
  persist(
    (set) => ({
      role: null,
      setUserRole: (role) => {
        set({ role });
      },
      removeUserRole: () => {
        set({ role: null });
      },
      nickName: null,
      setUserNickName: (nickName) => set({ nickName }),
      removeUserNickName: () => set({ nickName: null }),
      providerHotelId: null,
      setProviderHotelId: (id) => set({ providerHotelId: id }),
      setLogout: () => {
        set({ role: null, nickName: null, providerHotelId: null });
      },
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      isTokenRestored: false,
      setTokenRestored: () => set({ isTokenRestored: true }),
    }),
    {
      name: 'user-info',
      storage: createJSONStorage(() => localStorage),
      // Only persist user data — runtime flags must not be saved to localStorage
      partialize: (state) => ({
        role: state.role,
        nickName: state.nickName,
        providerHotelId: state.providerHotelId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export default useAuthStore;
