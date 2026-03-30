import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TITLE_MAP: Record<string, string> = {
  '/': '홈',
  '/sign-up': '회원가입',
  '/search': '검색',
  '/hotels': '호텔 목록',
  '/booking': '예약',
  '/mypage': '마이페이지',
  '/mypage/payments': '결제 내역',
  '/mypage/bookings': '예약 내역',
  '/mypage/settings': '설정',
  '/mypage/support': '고객센터',
  '/mypage/like': '좋아요 목록',
  '/mypage/reviews': '리뷰 내역',
  '/mypage/hotel': '호텔 관리',
  '/mypage/reservations': '예약 관리',
};

const BASE_TITLE = 'Split Stay';

const usePageTitle = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 동적 경로 처리 (예: /hotels/:hotelId, /mypage/bookings/:id)
    let title = TITLE_MAP[pathname];

    if (!title) {
      if (/^\/hotels\/[^/]+$/.test(pathname)) title = '호텔 상세';
      else if (/^\/mypage\/bookings\/[^/]+$/.test(pathname)) title = '예약 상세';
      else if (/^\/oauth\//.test(pathname)) title = '로그인';
    }

    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
  }, [pathname]);
};

export default usePageTitle;
