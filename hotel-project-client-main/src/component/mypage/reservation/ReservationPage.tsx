import { useCallback, useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import TabNavigation from '@/component/common/Tab/TabNavigation';
import ReservationCard from '@/component/mypage/reservation/ReservationCard';
import { getReservationInfo } from '@/service/api/reservation';
import { useReservationStore } from '@/stores/useReservationStore';
import PaymentPage from '../payment/PaymentDetail';
import { usePaymentStore } from '@/stores/usePaymentStore';

const ReservationPage = () => {
  const { paymentModal, togglePayment } = usePaymentStore();
  const { reservations, setReservations } = useReservationStore();
  const [activeTab, setActiveTab] = useState('전체');

  const tabs = ['전체', '결제 대기', '결제 완료', '리뷰 작성'];
  const today = new Date();

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const filteredBookings = reservations.filter((booking) => {
    const status = booking.reservationStatus;
    const checkOutDate = new Date(booking.checkOutDate.replace(/년|월/g, '-').replace(/일/g, ''));

    if (activeTab === '전체') return true;
    if (activeTab === '결제 대기') return status === 'PENDING';
    if (activeTab === '결제 완료') return status === 'CONFIRMED';
    if (activeTab === '리뷰 작성') {
      return status === 'CONFIRMED' && checkOutDate < today;
    }
    return true;
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await getReservationInfo();
      setReservations(response);
    };
    fetchData();
  }, []);

  return (
    <>
      {paymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={togglePayment}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-50" />
          <PaymentPage />
        </div>
      )}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-800">예약 내역</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">예약을 찾을 수 없으신가요?</span>
          <Download className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      {/* 예약 카드 목록 */}
      <div className="space-y-6">
        {filteredBookings.map((booking) => (
          <ReservationCard booking={booking} key={booking.reservationId} />
        ))}
      </div>
    </>
  );
};

export default ReservationPage;
