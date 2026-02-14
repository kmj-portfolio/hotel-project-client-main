import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/stores/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { role, nickName } = useAuthStore();
  const isAuthenticated = !!role && !!nickName;
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/error', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return <>{children}</>;
};

export default ProtectedRoute;
