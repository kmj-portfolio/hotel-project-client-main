import { createBrowserRouter } from 'react-router-dom';

import Provider from '@/provider/Provider';
import Layout from '@/layout/Layout';
import HotelsPage from '@/component/hotels/HotelsPage';
import HotelDetailPage from '@/component/hotel_detail/HotelDetailPage';
import HomePage from '@/pages/HomePage';
import SignUpPage from '@/pages/SignUpPage';
import LoginFallbackPage from '@/pages/LoginFallbackPage';
import SearchLayout, { searchLoader } from '@/layout/SearchLayout';
import SearchPage from '@/pages/SearchPage';
import PaymentPage from '@/component/mypage/payment/PaymentPage';
import MyPage from '@/pages/MyPage';
import ErrorPage from '@/pages/ErrorPage';
import ProtectedRoute from './ProtectedRouter';
import ReservationPage from '@/component/mypage/reservation/ReservationPage';
import SettingsPage from '@/component/mypage/settings/SettingsPage';
import SupportPage from '@/component/mypage/support/SupportPage';
import LikePage from '@/component/mypage/like/LikePage';
import ReviewsPage from '@/component/mypage/review/ReviewsPage';
import HotelManagePage from '@/component/mypage/hotel/HotelManagePage';
import BookingPage from '@/component/booking/BookingPage';
import MypageIndex from './MypageIndex';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Provider>
        <Layout />
      </Provider>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '/error',
        element: <ErrorPage />,
      },
      {
        path: '/sign-up',
        element: <SignUpPage />,
      },
      {
        path: '/search',
        id: 'search',
        element: <SearchLayout />,
        loader: searchLoader,
        children: [{ index: true, element: <SearchPage /> }],
      },
      {
        path: '/oauth/:identifier',
        element: <LoginFallbackPage />,
      },
      {
        path: 'hotels',
        element: <HotelsPage />,
      },
      {
        path: 'hotels/:hotelId',
        element: <HotelDetailPage />,
      },
      {
        path: 'booking',
        element: <BookingPage />,
      },
      {
        path: 'mypage',
        element: (
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <MypageIndex />,
          },
          {
            path: 'payments',
            element: (
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'bookings',
            element: (
              <ProtectedRoute>
                <ReservationPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'settings',
            element: (
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'support',
            element: (
              <ProtectedRoute>
                <SupportPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'like',
            element: (
              <ProtectedRoute>
                <LikePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'reviews',
            element: (
              <ProtectedRoute>
                <ReviewsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'hotel',
            element: (
              <ProtectedRoute>
                <HotelManagePage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      //[컴포넌트에서 발생하는 오류는 ErrorPage로 이동]
      //  전역구독(observable)은 모든 state변경시 모든 컴포넌트에서 반응하여 리랜더링 발생 (성능, 설정복잡도)
      //  설정 할 페이지에만 적용가능 하며, 페이지 변경시에 상태체크가 가능.
      //  case1: 로그인 되지 않은 상태로(useAuthStore=null) 마이페이지(결제내역,예약내역 등), 결제 등 접근, ... -> <ProtectedRoute>로
      //  case2: 비정상적인 상태 등 error처리
    ],
  },
]);
