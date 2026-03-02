import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/stores/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { role, _hasHydrated, isTokenRestored } = useAuthStore();
  const isAuthenticated = !!role;
  const isReady = _hasHydrated && isTokenRestored;

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      navigate('/error', { replace: true });
    }
  }, [isReady, isAuthenticated, navigate]);

  if (!isReady) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
