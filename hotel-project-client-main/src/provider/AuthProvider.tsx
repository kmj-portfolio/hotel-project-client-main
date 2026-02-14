/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect } from 'react';

import useAuthStore from '@/stores/useAuthStore';
import handleApiReqeust from '@/service/api/handleApiReqeust';
import client from '@/service/instance/client';
import type { UserStatus } from '@/types/user';
import { useLocation } from 'react-router-dom';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUserRole, setUserNickName, role } = useAuthStore();
  const location = useLocation();
  // 로그인 상태 Check
  const handleCheckLoggedIn = async () => {
    try {
      const response = await handleApiReqeust<UserStatus>(() =>
        client.get('/api/users/auth/status'),
      );
      setUserRole(response.role);
      setUserNickName(response.nickName);
    } catch {
      setUserRole(null);
      setUserNickName('');
    }
  };

  useEffect(() => {
    handleCheckLoggedIn();
  }, [location.pathname, role]);

  return <>{children}</>;
};

export default AuthProvider;
