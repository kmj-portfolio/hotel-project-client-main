import ProfileImage from '@/assets/png/profile-default.png';
import useAuthStore from '@/stores/useAuthStore';
import { profileMenuItems, providerProfileMenuItems } from '@/types/common/menuItem';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { logout } from '@/service/api/auth';

const HeaderProfile = () => {
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { setLogout, role, nickName } = useAuthStore();
  const menuItems = role === 'ROLE_PROVIDER' ? providerProfileMenuItems : profileMenuItems;

  const navigate = useNavigate();

  const handleLogout = async () => {
    navigate('/');
    await logout();
    setProfileMenuOpen(false);
    setTimeout(() => setLogout(), 100);
  };

  const handleMenuClick = (href: string) => {
    navigate(href);
    setProfileMenuOpen(false);
  };

  const handleToggleProfileMenu = () => {
    setProfileMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={profileMenuRef}>
      <button
        onClick={handleToggleProfileMenu}
        className="flex cursor-pointer items-center gap-2 rounded-full p-1 transition-colors duration-150 hover:bg-gray-100"
      >
        <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-gray-200">
          <img src={ProfileImage} alt="프로필" className="h-full w-full object-cover" />
        </div>
        {nickName && (
          <span className="hidden text-sm font-medium text-gray-700 md:block">{nickName}</span>
        )}
        <ChevronDown
          className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${
            profileMenuOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 드롭다운 메뉴 */}
      {profileMenuOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuClick(item.href)}
              className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-100"
            >
              {item.label}
            </button>
          ))}
          <hr className="my-2 border-gray-200" />
          <button
            onClick={handleLogout}
            className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-red-600 transition-colors duration-150 hover:bg-red-50"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
};

export default HeaderProfile;
