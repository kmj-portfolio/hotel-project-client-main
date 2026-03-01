import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import useAuthStore from '@/stores/useAuthStore';

import { ArrowLeft } from 'lucide-react';

import { login, getCustomerDetails, getProviderProfile } from '@/service/api/auth';
import type { LoginType } from '@/schema/AuthSchema';

import Logo from '@/assets/svg/Logo.svg';
import SymbolLogo from '/union.svg';

import Modal from '@/component/modal/Modal';
import LoginForm from '@/component/form/auth/LoginForm';
import { PrimaryButton } from '@/component/common/button/PrimaryButton';
import HeaderProfile from '@/layout/HeaderProfile';

const Header = () => {
  const { setUserRole, role, setUserNickName } = useAuthStore();

  const [modal, setModal] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setModal(false);
  }, [location.pathname]);

  const handleToggleModal = () => {
    setModal((prev) => !prev);
  };

  const onSubmit = async (data: LoginType) => {
    try {
      const { role } = await login(data);
      setUserRole(role);
      if (role === 'ROLE_PROVIDER') {
        const profile = await getProviderProfile();
        setUserNickName(profile.hotelName);
      } else {
        const details = await getCustomerDetails();
        setUserNickName(details.nickname);
      }
      setModal(false);
      navigate('/');
    } catch (err) {
      setFormError(err as string);
    }
  };

  return (
    <>
      <header className="flex w-full items-center justify-between p-4 md:py-6">
        <h1>
          <Link to="/">
            <img src={Logo} className="hidden w-[140px] md:block" alt="stay split logo" />
            <img src={SymbolLogo} className="size-12 md:hidden" alt="stay split logo" />
          </Link>
        </h1>
        <nav className="flex items-center gap-2">
          {role === null ? (
            <>
              <Link
                to="/sign-up"
                className="border-primary-500 text-primary-500 hover:text-primary-600 hover:border-primary-600 active:text-primary-700 active:border-primary-700 block cursor-pointer rounded-xl border bg-white px-4 py-1.5 text-sm transition-colors duration-150"
              >
                회원가입
              </Link>
              <PrimaryButton size="sm" onClick={handleToggleModal}>
                로그인
              </PrimaryButton>
            </>
          ) : (
            <HeaderProfile />
          )}
        </nav>
      </header>

      {modal && (
        <Modal isOpen={modal} onClose={handleToggleModal} full>
          <div className="h-full md:h-auto">
            <div aria-label="modal-header">
              <ArrowLeft
                aria-label="닫기"
                role="button"
                onClick={handleToggleModal}
                className="absolute top-5 left-5 cursor-pointer md:top-5"
                strokeWidth={1}
              />
              <h4 className="text-center">로그인</h4>
            </div>

            <div
              aria-label="modal-content"
              className="flex h-[90svh] flex-col justify-center md:h-auto"
            >
              <LoginForm onSubmit={onSubmit} formError={formError} />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Header;
