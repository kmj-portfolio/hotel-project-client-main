/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useRef } from 'react';

import useAuthStore from '@/stores/useAuthStore';
import handleApiReqeust from '@/service/api/handleApiReqeust';
import client, { setAccessToken } from '@/service/instance/client';
import type { UserStatus, LoginResponse } from '@/types/user';
import { useLocation } from 'react-router-dom';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUserRole, setUserNickName, setTokenRestored, isTokenRestored } = useAuthStore();
  const location = useLocation();
  const isMounted = useRef(false);
  // Prevents the double-call that React 18 Strict Mode causes in development
  const isRestoringRef = useRef(false);

  // 앱 시작 시 1회만 실행 — refreshToken 쿠키로 accessToken 복원
  const restoreAccessToken = async () => {
    if (isRestoringRef.current) return;
    isRestoringRef.current = true;
    try {
      const response = await handleApiReqeust<LoginResponse>(() =>
        client.post('/api/auth/refresh'),
      );
      setAccessToken(response.accessToken);
      // Only update role if the refresh endpoint explicitly returns one.
      // The refresh endpoint may only return accessToken; role is already
      // correctly stored in localStorage from the original login.
      if (response.role) {
        setUserRole(response.role);
      }
    } catch {
      // Refresh failed — clear the in-memory token but keep the role from localStorage.
      // ProtectedRoute will still render for users who were previously logged in.
      // Individual API calls will re-attempt the refresh via the response interceptor.
      setAccessToken(null);
    } finally {
      setTokenRestored();
    }
  };

  // 로그인 상태 Check (라우트 변경마다)
  const handleCheckLoggedIn = async () => {
    try {
      const response = await handleApiReqeust<UserStatus>(() =>
        client.get('/api/auth/status'),
      );
      setUserRole(response.role);
    } catch {
      setUserRole(null);
      setUserNickName('');
    }
  };

  useEffect(() => {
    restoreAccessToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    // Don't check auth status while token restoration is still in progress
    if (!isTokenRestored) return;
    handleCheckLoggedIn();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
};

export default AuthProvider;
