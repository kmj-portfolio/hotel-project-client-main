import GeneralRegisterForm from '@/component/form/auth/GeneralRegisterForm';
import type { GeneralRegisterType, ProviderRegisterType } from '@/schema/AuthSchema';
import { GeneralSignup } from '@/service/api/auth';
import type { UserRole } from '@/types/user';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const getButtonStyle = (currentState: boolean) => {
  const baseStyle = 'w-full cursor-pointer rounded-full py-2 transition-colors ';
  const activeStyle = 'text-white bg-primary-500';

  if (currentState) {
    return baseStyle + activeStyle;
  } else {
    return baseStyle;
  }
};

const SignUpPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('ROLE_CUSTOMER');

  const handleSubmit = async (data: GeneralRegisterType | ProviderRegisterType) => {
    try {
      const response = await GeneralSignup(role, data);

      alert('회원가입이 완료되었습니다.');
      navigate('/');
    } catch (error: unknown) {
      // React Error #31 방지: 에러 객체가 폼 컴포넌트로 넘어가지 않도록 문자열로 안전하게 변환
      if (typeof error === 'string') {
        return error;
      }

      if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
      }

      return '회원가입 처리 중 오류가 발생했습니다.';
    }
  };

  return (
    <section className="mx-auto flex h-full w-full max-w-[500px] flex-col justify-between px-4">
      <div>
        <h3 className="text-primary-500 text-lg font-bold">StaySplit에 오신 걸 환영합니다 !</h3>
        <p className="text-gray-600">가입 하기 전, 간단한 정보를 입력해주세요</p>
      </div>

      <div className="flex-1">
        <div className="border-gray-primary mt-4 mb-2 flex items-center overflow-hidden rounded-full border">
          <button
            onClick={() => setRole('ROLE_CUSTOMER')}
            className={getButtonStyle(role === 'ROLE_CUSTOMER')}
          >
            일반회원
          </button>
          <button
            onClick={() => setRole('ROLE_PROVIDER')}
            className={getButtonStyle(role === 'ROLE_PROVIDER')}
          >
            사업자
          </button>
        </div>
        <GeneralRegisterForm key={role} role={role} onSubmit={handleSubmit} />
      </div>
    </section>
  );
};

export default SignUpPage;