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
  setLogout: () => void;
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
      setLogout: () => {
        set({ role: null, nickName: null });
      },
    }),
    {
      name: 'user-info',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useAuthStore;
