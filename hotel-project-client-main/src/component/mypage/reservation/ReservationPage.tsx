import { useCallback, useEffect, useState } from 'react';
import TabNavigation from '@/component/common/Tab/TabNavigation';
import ReservationCard from '@/component/mypage/reservation/ReservationCard';
import { getReservationInfo, getAllReservations } from '@/service/api/reservation';
import { useReservationStore } from '@/stores/useReservationStore';
import type { ReservationStatus } from '@/types/ReservationType';

type TabLabel = '전체' | '결제 대기' | '예약 완료' | '이용 완료' | '예약 취소';

const TAB_STATUS_MAP: Record<TabLabel, ReservationStatus | undefined> = {
  전체: undefined,
  '결제 대기': 'WAITING_PAYMENT',
  '예약 완료': 'CONFIRMED',
  '이용 완료': 'COMPLETE',
  '예약 취소': 'CANCELLED',
};

const ReservationPage = () => {
  const { reservations, setReservations } = useReservationStore();
  const [activeTab, setActiveTab] = useState<TabLabel>('전체');

  const tabs: TabLabel[] = ['전체', '결제 대기', '예약 완료', '이용 완료', '예약 취소'];

  const fetchData = useCallback(async () => {
    const status = TAB_STATUS_MAP[activeTab];
    const response =
      status === undefined ? await getAllReservations() : await getReservationInfo({ status });
    setReservations(response);
  }, [activeTab, setReservations]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as TabLabel);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">예약 내역</h1>
      </div>
      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="space-y-6">
        {reservations.length === 0 ? (
          <p className="py-12 text-center text-gray-400">예약 내역이 없습니다.</p>
        ) : (
          reservations.map((booking) => (
            <ReservationCard
              booking={booking}
              key={booking.reservationId}
              onPaymentComplete={fetchData}
            />
          ))
        )}
      </div>
    </>
  );
};

export default ReservationPage;
