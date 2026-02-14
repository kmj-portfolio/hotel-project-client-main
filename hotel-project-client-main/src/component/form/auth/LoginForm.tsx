import { Link } from 'react-router-dom';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoginSchema, type LoginType } from '@/schema/AuthSchema';

import Kakao from '../../../assets/icons/Kakao.svg';
import Google from '../../../assets/icons/Google.svg';

import RHFInput from '../../common/input/RHFInput';
import { PrimaryButton } from '../../common/button/PrimaryButton';

interface LoginFormProps {
  onSubmit: (data: LoginType) => void;
  formError?: string;
}

const LoginFeilds = [
  {
    name: 'email' as const,
    label: '이메일',
    placeholder: '이메일을 입력해주세요',
  },
  {
    name: 'password' as const,
    label: '비밀번호',
    type: 'password',
    placeholder: '비밀번호를 입력해주세요',
  },
];

const oAuthLogin = [
  {
    id: 'kakao',
    path: import.meta.env.VITE_KAKAO_AUTH_URL,
    imageSrc: Kakao,
  },
  {
    id: 'google',
    path: `${import.meta.env.VITE_GOOGLE_AUTH_URL}?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile&state=google`,
    imageSrc: Google,
  },
];

const LoginForm = ({ onSubmit, formError }: LoginFormProps) => {
  const { control, handleSubmit, formState, clearErrors } = useForm({
    resolver: zodResolver(LoginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  // Focus 했을 때 Error Clear
  const handleFocus = () => {
    clearErrors('root');
  };

  return (
    <>
      <form
        onFocus={handleFocus}
        onSubmit={handleSubmit(onSubmit)}
        className="border-gray-primary border-b py-8"
      >
        <div className="mb-4">
          {/* Form Field */}
          {LoginFeilds.map((field) => (
            <div key={field.name} className="first:mb-4">
              <RHFInput
                name={field.name}
                label={field.label}
                type={field.type}
                placeholder={field.placeholder}
                control={control}
              />
            </div>
          ))}
          {formError && <p className="text-error pt-2 text-sm">{formError}</p>}
        </div>

        {/* Form Submit */}
        <PrimaryButton disabled={!formState.isValid} full>
          로그인
        </PrimaryButton>

        {/* Signup */}
        <div className="pt-1 text-right text-sm">
          <span>회원이 아니신가요?</span>
          <Link
            className="text-primary-500 hover:text-primary-600 pl-1 transition-colors"
            to={'/sign-up'}
          >
            가입하기
          </Link>
        </div>
      </form>

      {/* oAuth Buttons */}
      <div className="pt-8 pb-4">
        <p className="mb-4 text-center text-gray-500">간편 로그인</p>
        <div className="flex items-center justify-center gap-10">
          {oAuthLogin.map((oAuth) => (
            <a href={oAuth.path} key={oAuth.id} aria-label={`${oAuth.id} login button`}>
              <img src={oAuth.imageSrc} alt={oAuth.id} className="size-12" />
            </a>
          ))}
        </div>
      </div>
    </>
  );
};

export default LoginForm;
