import { Navigate } from 'react-router-dom';
import useAuthStore from '@/stores/useAuthStore';

const MypageIndex = () => {
  const { role } = useAuthStore();
  return <Navigate to={role === 'ROLE_PROVIDER' ? '/mypage/hotel' : '/mypage/bookings'} replace />;
};

export default MypageIndex;
