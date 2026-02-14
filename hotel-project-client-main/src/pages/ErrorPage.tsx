import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';
import useAuthStore from '@/stores/useAuthStore';
import Logo from '@/assets/svg/Logo.svg';

const ErrorPage = () => {
  const navigate = useNavigate();
  const { role, nickName } = useAuthStore();

  // 에러 메시지 결정
  const getErrorMessage = () => {
    if (!role || !nickName) {
      return '로그인이 필요합니다';
    }
    return '잘못된 접근입니다.';
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 메인 컨테이너 */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* SplitStay 로고 영역 */}
          <div className="mb-12 text-center">
            <div className="mb-4 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <img src={Logo} className="hidden w-[140px] md:block" alt="stay split logo" />
              </div>
            </div>
          </div>

          {/* 에러 카드 */}
          <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            {/* 에러 아이콘 */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            {/* 에러 메시지 */}
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-2xl font-bold text-gray-900">오류가 발생했습니다.</h1>
              <p className="text-gray-600">{getErrorMessage()}</p>
            </div>

            {/* 홈으로 버튼 */}
            <button
              onClick={handleGoHome}
              className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">홈으로</span>
            </button>
          </div>

          {/* 추가 정보 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">문제가 지속되면 고객센터로 문의해주세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
