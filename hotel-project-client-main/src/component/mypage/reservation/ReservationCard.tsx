import { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as PortOne from '@portone/browser-sdk/v2';
import { Calendar, Hotel, MapPin, Star, Users } from 'lucide-react';
import Card from '@/component/common/card/Card';
import type {
  ReservationCardProps,
  BookingStatusProps,
  HotelImageProps,
  ReservationStatus,
} from '@/types/ReservationType';
import { formatNumberToWon } from '@/utils/format/formatUtil';
import { createPayment, subscribePaymentSse } from '@/service/api/payment';
import { getCustomerDetails } from '@/service/api/auth';
import { getReservationDetail } from '@/service/api/reservation';
import { createReview } from '@/service/api/review';
import type { CustomerDetails } from '@/types/user';


const BookingStatus = memo(({ status }: BookingStatusProps) => {
  const statusConfig: Record<ReservationStatus, { text: string; color: string }> = {
    WAITING_PAYMENT: { text: '결제 대기', color: 'text-amber-500' },
    CONFIRMED: { text: '예약 완료', color: 'text-blue-600' },
    CANCELLED: { text: '예약 취소', color: 'text-red-600' },
    EXPIRED: { text: '결제 시간 만료', color: 'text-gray-500' },
    COMPLETE: { text: '이용 완료', color: 'text-green-600' },
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

const StarPicker = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-6 w-6 cursor-pointer ${(hovered || value) >= s ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
        />
      ))}
    </div>
  );
};

const ReservationCard = memo(({ booking }: ReservationCardProps) => {
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [payError, setPayError] = useState<string>();
  const [customer, setCustomer] = useState<CustomerDetails>();
  const [myPaymentDone, setMyPaymentDone] = useState(false);

  // Review state
  const [showReview, setShowReview] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string>();
  const [reviewDone, setReviewDone] = useState(false);

  useEffect(() => {
    if (booking.reservationStatus === 'WAITING_PAYMENT') {
      Promise.all([
        getCustomerDetails(),
        getReservationDetail(booking.reservationId),
      ])
        .then(([customerDetails, detail]) => {
          setCustomer(customerDetails);
          const me = detail.participants.find((p) => p.email === customerDetails.email);
          if (me?.paymentStatus === 'PAID') setMyPaymentDone(true);
        })
        .catch(() => {});
    }
  }, [booking.reservationStatus, booking.reservationId]);

  const handleOpenReview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!customer) {
      const details = await getCustomerDetails().catch(() => undefined);
      setCustomer(details);
    }
    setShowReview(true);
  };

  const handleSubmitReview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!reviewContent.trim()) return;
    setReviewSubmitting(true);
    setReviewError(undefined);
    try {
      let customerId = customer?.id;
      if (customerId === undefined) {
        const details = await getCustomerDetails();
        setCustomer(details);
        customerId = details.id;
      }
      if (!booking.hotelId) {
        throw '호텔 정보를 찾을 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요.';
      }
      await createReview({
        customerId,
        hotelId: booking.hotelId,
        content: reviewContent.trim(),
        rating: reviewRating,
      });
      setReviewDone(true);
      setShowReview(false);
    } catch (err) {
      setReviewError(typeof err === 'string' ? err : '리뷰 등록에 실패했습니다.');
    } finally {
      setReviewSubmitting(false);
    }
  };

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

      // Open SSE connection before PortOne so we don't miss the backend event
      const abortController = new AbortController();
      const ssePromise = subscribePaymentSse(paymentId, abortController.signal);

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
        abortController.abort();
        setPayError(response.message ?? '결제에 실패했습니다.');
        return;
      }

      setProcessingPayment(true);
      await ssePromise;
      navigate(`/mypage/bookings/${booking.reservationId}`);
    } catch (err) {
      setProcessingPayment(false);
      setPayError(String(err));
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <div
        className="relative cursor-pointer rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
        onClick={() => navigate(`/mypage/bookings/${booking.reservationId}`)}
      >
        {processingPayment && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-white/90">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            <p className="text-sm font-semibold text-gray-700">결제 처리 중...</p>
          </div>
        )}
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

            {booking.reservationStatus === 'WAITING_PAYMENT' && !myPaymentDone && (
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

            {booking.reservationStatus === 'COMPLETE' && (
              <div className="mt-4 border-t border-gray-100 pt-4" onClick={(e) => e.stopPropagation()}>
                {reviewDone ? (
                  <p className="text-center text-sm font-medium text-green-600">리뷰가 등록되었습니다.</p>
                ) : (
                  <button
                    onClick={handleOpenReview}
                    className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-sky-100 hover:border-sky-300 hover:text-sky-700"
                  >
                    리뷰 작성하기
                  </button>
                )}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {showReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => { setShowReview(false); setReviewError(undefined); }}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-xl font-semibold text-gray-800">리뷰 작성</h3>
            <p className="mb-6 text-sm text-gray-500">{booking.hotelName}</p>
            <div className="space-y-5">
              <div className="flex justify-center">
                <StarPicker value={reviewRating} onChange={setReviewRating} />
              </div>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="이용 후기를 작성해주세요."
                rows={6}
                className="w-full rounded-xl border border-gray-200 p-4 text-sm outline-none focus:border-blue-400"
              />
              {reviewError && <p className="text-xs text-red-500">{reviewError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowReview(false); setReviewError(undefined); }}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm text-gray-600 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={reviewSubmitting || !reviewContent.trim()}
                  className="flex-1 rounded-xl bg-primary-700 py-3 text-sm font-bold text-white hover:bg-primary-800 disabled:opacity-50"
                >
                  {reviewSubmitting ? '등록 중...' : '리뷰 등록'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

ReservationCard.displayName = 'ReservationCard';

export default ReservationCard;
