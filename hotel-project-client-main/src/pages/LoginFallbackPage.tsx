import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import type { SocialRegisterType } from '@/schema/AuthSchema';

import useAuthStore from '@/stores/useAuthStore';

import { oAuthLogin, SocialSignup } from '@/service/api/auth';

import SignupForm from '@/component/form/auth/SocialRegisterForm';
import Modal from '@/component/modal/Modal';
import ModalHeader from '@/component/modal/ModalHeader';
import ModalWrapper from '@/component/modal/ModalWrapper';
import { PrimaryButton } from '@/component/common/button/PrimaryButton';
import type { UserRole } from '@/types/user';

const LoginFallbackPage = () => {
  const [error, setError] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);
  const [defaultValues, setDefaultValues] = useState<Partial<SocialRegisterType>>({});
  const { identifier } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserRole } = useAuthStore();

  const code = searchParams.get('code');
  const googleAuth = () => {
    const authPath = import.meta.env.VITE_GOOGLE_AUTH_URL;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    const scope = 'openid email profile';
    const state = 'google';

    const authUrl = `${authPath}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(
      scope,
    )}&state=${state}`;

    window.location.href = authUrl;
  };

  useEffect(() => {
    if (!code || !identifier) {
      navigate('/');
      return;
    }
  }, [code, identifier, navigate]);

  useEffect(() => {
    const handleoAuthLogin = async () => {
      try {
        const res = await oAuthLogin(identifier as 'kakao' | 'google', code as string);
        if (res.code === 'ADDITIONAL_INFO_REQUIRED') {
          const data = res.data;
          const socialId = data.match(/socialId:(\d+)/)?.[1]?.trim() || '';
          const email = data.match(/email:\s*([^,]+)/)?.[1].trim() || '';
          const name = data.match(/name:\s*(.+)$/)?.[1].trim() || '';
          setDefaultValues({ email, name, socialId });
          setUserRole(null);
          setModal(true);
        } else {
          setUserRole(res.data as UserRole);
          navigate('/');
        }
      } catch (_error) {
        setError(true);
      }
    };

    handleoAuthLogin();
  }, [code, identifier, navigate, setUserRole]);

  const handleSubmit = async (data: SocialRegisterType) => {
    try {
      // 1. 소셜 회원가입
      await SocialSignup(data, identifier as 'kakao' | 'google');
    } catch (error) {
      setUserRole(null);
      return error as string;
    }
    try {
      //2.구글auth는 code값 재사용 불가로 가입 후, 한번 더 인증해야 함.
      //oAuthLogin은 useEffect에서만 수행
      if (identifier === 'google') {
        googleAuth();
        return;
      }
    } catch {
      //2-1. 회원가입 후 로그인(구글인증)에서 오류나는경우
      //FIXME:에러페이지 구현 후 추가 필수
    }
    //3. 성공/실패와 무관하게 항상 이동
    navigate('/');
  };

  return (
    <section className="h-full">
      {error && (
        <div className="flex h-full flex-1 flex-col items-center justify-center">
          <div>
            <p className="mb-2">가입이 완료되지 않았습니다.</p>
            <PrimaryButton size="sm" onClick={() => navigate('/')} full>
              홈으로 돌아가기
            </PrimaryButton>
          </div>
        </div>
      )}
      {modal && (
        <Modal isOpen={modal} onClose={() => setModal(false)} full>
          <ModalWrapper>
            <ModalHeader
              onClick={() => {
                setModal(false);
                setError(true);
              }}
              headerTitle="회원가입"
            />

            <div className="flex-1 py-4">
              <SignupForm onSubmit={handleSubmit} defaultValues={defaultValues} />
            </div>

            <PrimaryButton size="md" type="submit" form="sign-up-social" full>
              가입하기
            </PrimaryButton>
          </ModalWrapper>
        </Modal>
      )}
    </section>
  );
};

export default LoginFallbackPage;
