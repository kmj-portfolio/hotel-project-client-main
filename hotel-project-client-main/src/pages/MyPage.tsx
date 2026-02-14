import MypageMenu from '@/component/mypage/MypageMenu';
import { Outlet } from 'react-router-dom';

const PaymentPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <MypageMenu />
      {/* 메인 콘텐츠 */}
      <div className="flex-1 p-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
