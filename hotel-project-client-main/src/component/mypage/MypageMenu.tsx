import useAuthStore from '@/stores/useAuthStore';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { accountMenuItems, myInfoMenuItems } from '@/types/common/menuItem';

const MypageMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { nickName } = useAuthStore();

  const [isMyReservationOpen, setIsMyReservationOpen] = useState(true);
  const [isMyAccountOpen, setIsMyAccountOpen] = useState(true);
  // 업데이트 알림 상태 관리
  const [notifications, setNotifications] = useState(true);

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const handleMenuFold = (section: 'reservation' | 'account') => {
    if (section === 'reservation') {
      setIsMyReservationOpen((prev) => !prev);
    } else if (section === 'account') {
      setIsMyAccountOpen((prev) => !prev);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    //FIXME: 서버응답이 있을 때 만
    setNotifications(true);
  }, []);

  return (
    <div className="w-80 rounded-lg border-t border-gray-200 bg-white pt-2 shadow-sm">
      <div className="p-6">
        <div className="mb-8 flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
            <User className="h-5 w-5 text-white" />
          </div>
          <span className="font-medium text-gray-800">{nickName}</span>
        </div>

        <div className="mb-4 cursor-pointer space-y-1">
          <h3
            className="mb-4 text-lg font-semibold text-gray-800"
            onClick={() => handleMenuFold('reservation')}
          >
            My 예약 {isMyReservationOpen ? '▲' : '▼'}
          </h3>
          <div
            className={`overflow-hidden transition-all duration-700 ease-in-out ${
              isMyReservationOpen
                ? 'max-h-96 opacity-100'
                : 'max-h-0 scale-y-0 opacity-0 transition-opacity delay-800'
            }`}
          >
            {isMyReservationOpen &&
              myInfoMenuItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleMenuClick(item.href)}
                  className={`cursor-pointer rounded px-4 py-2.5 transition-colors ${
                    isActive(item.href)
                      ? 'border-l-4 border-blue-600 bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </div>
              ))}
          </div>
        </div>

        <div className="cursor-pointer space-y-1">
          <h3
            className="mb-4 text-lg font-semibold text-gray-800"
            onClick={() => handleMenuFold('account')}
          >
            My 계정 {isMyAccountOpen ? '▲' : '▼'}
          </h3>
          <div
            className={`overflow-hidden transition-all duration-700 ease-in-out ${
              isMyAccountOpen
                ? 'max-h-96 opacity-100'
                : 'max-h-0 scale-y-0 opacity-0 transition-opacity delay-800'
            }`}
          >
            {isMyAccountOpen &&
              accountMenuItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleMenuClick(item.href)}
                  className={`flex cursor-pointer items-center justify-between rounded px-4 py-2.5 transition-colors ${
                    isActive(item.href)
                      ? 'border-l-4 border-blue-600 bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.name}</span>
                  {item.name === '알림' && notifications && (
                    <span className="rounded bg-red-500 px-2 py-1 text-xs text-white">NEW</span>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MypageMenu;
