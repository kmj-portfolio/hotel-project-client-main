import GeneralRegisterForm from '@/component/form/auth/GeneralRegisterForm';
import type { GeneralRegisterType } from '@/schema/AuthSchema';
import { GeneralSignup, login } from '@/service/api/auth';
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

  const handleSubmit = async (data: GeneralRegisterType) => {
    try {
      const response = await GeneralSignup(role, data);
      if (response.id) {
        await login({ email: data.email, password: data.password });
        return navigate('/');
      }

      navigate('/login');
    } catch (error) {
      return error as string;
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
        <GeneralRegisterForm onSubmit={handleSubmit} />
      </div>
    </section>
  );
};

export default SignUpPage;
