import { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as PortOne from '@portone/browser-sdk/v2';
import { Calendar, Hotel, MapPin, Users } from 'lucide-react';
import Card from '@/component/common/card/Card';
import type {
  ReservationCardProps,
  BookingStatusProps,
  HotelImageProps,
  ReservationStatus,
} from '@/types/ReservationType';
import { formatNumberToWon } from '@/utils/format/formatUtil';
import { createPayment, verifyPayment } from '@/service/api/payment';
import { getCustomerDetails } from '@/service/api/auth';
import type { CustomerDetails } from '@/types/user';


const BookingStatus = memo(({ status }: BookingStatusProps) => {
  const statusConfig: Record<ReservationStatus, { text: string; color: string }> = {
    WAITING_PAYMENT: { text: '결제 대기', color: 'text-amber-500' },
    CONFIRMED: { text: '예약 완료', color: 'text-blue-600' },
    CANCELLED: { text: '예약 취소', color: 'text-red-600' },
    EXPIRED: { text: '기간 만료', color: 'text-gray-500' },
    COMPLETE: { text: '이용 완료', color: 'text-gray-600' },
  };

  const config = statusConfig[status];
  return <span className={`font-bold ${config.color}`}>{config.text}</span>;
});

BookingStatus.displayName = 'BookingStatus';

const HotelImage = memo(({ image, hotelName }: HotelImageProps) => (
  <div className="min-h-[100px] w-24 flex-shrink-0 self-stretch rounded-lg bg-gradient-to-r from-purple-400 to-pink-400">
    <img
      src={image}
      alt={`${hotelName} 이미지`}
      className="h-full w-full rounded-lg object-cover"
      loading="lazy"
    />
  </div>
));

HotelImage.displayName = 'HotelImage';

const ReservationCard = memo(({ booking, onPaymentComplete }: ReservationCardProps) => {
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string>();
  const [customer, setCustomer] = useState<CustomerDetails>();

  useEffect(() => {
    if (booking.reservationStatus === 'WAITING_PAYMENT') {
      getCustomerDetails().then(setCustomer).catch(() => {});
    }
  }, [booking.reservationStatus]);

  const myAmount = Math.ceil(booking.totalPrice / (booking.numberOfParticipants || 1));

  const handlePayNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setPayError(undefined);

    const storeId = import.meta.env.VITE_PORTONE_STORE_ID;
    const channelKey = import.meta.env.VITE_PORTONE_CHANNEL_KEY;
    if (!storeId || !channelKey) {
      setPayError('결제 모듈이 준비되지 않았습니다.');
      return;
    }

    setPaying(true);
    try {
      const payment = await createPayment(booking.reservationId);
      const paymentId = payment.paymentId;

      const response = await PortOne.requestPayment({
        storeId,
        channelKey,
        paymentId,
        orderName: booking.hotelName,
        totalAmount: myAmount,
        currency: 'KRW',
        payMethod: 'CARD',
        customer: {
          fullName: customer?.name,
          email: customer?.email,
          phoneNumber: customer?.phoneNumber,
        },
      });

      if (response?.code !== undefined) {
        setPayError(response.message ?? '결제에 실패했습니다.');
        return;
      }

      await verifyPayment({ paymentId, reservationId: booking.reservationId });
      onPaymentComplete?.();
    } catch (err) {
      setPayError(String(err));
    } finally {
      setPaying(false);
    }
  };

  return (
    <div
      className="cursor-pointer rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      onClick={() => navigate(`/mypage/bookings/${booking.reservationId}`)}
    >
      <Card className="p-6">
        <Card.Header className="mb-4 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Hotel className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600">예약번호: {booking.reservationNumber}</span>
          </div>
          <BookingStatus status={booking.reservationStatus} />
        </Card.Header>

        <Card.Content>
          <div className="flex items-center space-x-4">
            <HotelImage image={booking.hotelMainImageUrl} hotelName={booking.hotelName} />

            <div className="flex-1">
              <div className="mb-1 flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <h3 className="font-semibold text-gray-800">{booking.hotelName}</h3>
              </div>
              <div className="mb-2 text-sm text-gray-500">{booking.hotelAddress}</div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>체크인: {booking.checkInDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>체크아웃: {booking.checkOutDate}</span>
                </div>
              </div>

              <div className="mt-1 flex items-center space-x-1 text-sm text-gray-600">
                <Users className="h-4 w-4 text-gray-400" />
                <span>투숙객 {booking.numberOfParticipants}명</span>
              </div>

              <div className="mt-2 font-bold text-gray-800">
                {formatNumberToWon(booking.totalPrice)}
              </div>
            </div>
          </div>

          {booking.reservationStatus === 'WAITING_PAYMENT' && (
            <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
              {payError && <p className="text-sm text-red-500">{payError}</p>}
              <button
                onClick={handlePayNow}
                disabled={paying}
                className="w-full rounded-xl bg-primary-700 py-3 text-sm font-bold text-white hover:bg-primary-800 disabled:opacity-50"
              >
                {paying ? '처리 중...' : `결제하기 (${formatNumberToWon(myAmount)})`}
              </button>
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
});

ReservationCard.displayName = 'ReservationCard';

export default ReservationCard;
