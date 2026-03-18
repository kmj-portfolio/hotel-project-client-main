import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Hotel, CreditCard, Moon, ChevronLeft } from 'lucide-react';
import type { ReservationDetail, ReservationStatus } from '@/types/ReservationType';
import { formatNumberToWon } from '@/utils/format/formatUtil';
import { getReservationDetail, cancelReservation } from '@/service/api/reservation';
import { cancelPayment, getMyPayments } from '@/service/api/payment';

const CANCELLABLE: ReservationStatus[] = ['WAITING_PAYMENT', 'CONFIRMED'];

const STATUS_CONFIG: Record<ReservationStatus, { text: string; bg: string; text_color: string }> = {
  WAITING_PAYMENT: { text: '결제 대기', bg: 'bg-amber-100', text_color: 'text-amber-700' },
  CONFIRMED: { text: '예약 완료', bg: 'bg-blue-100', text_color: 'text-blue-700' },
  CANCELLED: { text: '예약 취소', bg: 'bg-red-100', text_color: 'text-red-700' },
  EXPIRED: { text: '기간 만료', bg: 'bg-gray-100', text_color: 'text-gray-600' },
  COMPLETE: { text: '이용 완료', bg: 'bg-green-100', text_color: 'text-green-700' },
};

const PAYMENT_STATUS_TEXT: Record<string, string> = {
  PAID: '결제 완료',
  WAITING_PAYMENT: '결제 대기',
  CANCELLED: '결제 취소',
};

const ReservationDetailPage = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<ReservationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string>();
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    if (!reservationId) return;
    setLoading(true);
    getReservationDetail(Number(reservationId))
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [reservationId]);

  const handleCancel = async () => {
    if (!detail) return;
    setCancelling(true);
    setCancelError(undefined);
    try {
      if (detail.reservationStatus === 'CONFIRMED') {
        const payments = await getMyPayments(0, 100);
        const payment = payments.content.find((p) => p.reservationId === detail.reservationId);
        if (payment) {
          await cancelPayment({ paymentId: payment.paymentId, reason: '예약 취소' });
        }
      }
      await cancelReservation(detail.reservationId);
      navigate('/mypage/bookings');
    } catch (err) {
      setCancelError(String(err));
      setConfirmCancel(false);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">불러오는 중...</div>
    );
  }

  if (!detail) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        예약 정보를 불러올 수 없습니다.
      </div>
    );
  }

  const status = STATUS_CONFIG[detail.reservationStatus];
  const myAmount = Math.ceil(detail.totalPrice / (detail.participants.length || 1));

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/mypage/bookings')}
          className="flex items-center space-x-1 text-gray-500 hover:text-gray-800"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-base">예약 내역</span>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">예약 상세</h2>
        <div className="w-16" />
      </div>

      {/* 상태 + 예약번호 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-base text-gray-500">
          <Hotel className="h-5 w-5" />
          <span>{detail.reservationNumber}</span>
        </div>
        <span className={`rounded-full px-3 py-1 text-base font-semibold ${status.bg} ${status.text_color}`}>
          {status.text}
        </span>
      </div>

      {/* 호텔 이미지 + 정보 */}
      <div className="overflow-hidden rounded-xl border border-gray-100">
        <div className="h-44 w-full bg-gradient-to-r from-purple-400 to-pink-400">
          <img
            src={detail.hotelMainImageUrl}
            alt={detail.hotelName}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="mb-1 text-xl font-bold text-gray-900">{detail.hotelName}</h3>
          <div className="flex items-start space-x-1 text-base text-gray-500">
            <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <span>{detail.hotelAddress}</span>
          </div>
        </div>
      </div>

      {/* 체크인 / 체크아웃 */}
      <div className="rounded-xl border border-gray-100 p-4">
        <h4 className="mb-3 text-base font-semibold text-gray-700">숙박 일정</h4>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-sm text-gray-400">체크인</p>
            <div className="mt-1 flex items-center space-x-1">
              <Calendar className="h-5 w-5 text-gray-400" />
              <p className="text-base font-semibold text-gray-800">{detail.checkIn}</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-sm text-gray-400">
            <Moon className="h-5 w-5" />
            <span>{detail.nights}박</span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">체크아웃</p>
            <div className="mt-1 flex items-center space-x-1">
              <Calendar className="h-5 w-5 text-gray-400" />
              <p className="text-base font-semibold text-gray-800">{detail.checkOut}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 투숙 인원 */}
      <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
        <div className="flex items-center space-x-2 text-base text-gray-700">
          <Users className="h-5 w-5 text-gray-400" />
          <span>투숙 인원</span>
        </div>
        <span className="text-base font-semibold text-gray-900">{detail.participants.length}명</span>
      </div>

      {/* 참여자 목록 */}
      {detail.participants.length > 0 && (
        <div className="rounded-xl border border-gray-100 p-4">
          <h4 className="mb-3 text-base font-semibold text-gray-700">참여자</h4>
          <div className="space-y-2">
            {detail.participants.map((p) => (
              <div key={p.email} className="flex items-center justify-between text-base">
                <div>
                  <span className="font-medium text-gray-800">{p.name}</span>
                  <span className="ml-2 text-gray-400">{p.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">{formatNumberToWon(p.splitAmount)}</span>
                  <span className={`text-sm ${p.paymentStatus === 'PAID' ? 'text-blue-600' : 'text-amber-500'}`}>
                    {PAYMENT_STATUS_TEXT[p.paymentStatus] ?? p.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 객실 정보 */}
      {detail.rooms.length > 0 && (
        <div className="rounded-xl border border-gray-100 p-4">
          <h4 className="mb-3 text-base font-semibold text-gray-700">객실 정보</h4>
          <div className="space-y-2">
            {detail.rooms.map((room) => (
              <div key={room.roomId} className="flex items-center justify-between text-base">
                <span className="text-gray-600">
                  {room.roomType} × {room.quantity}
                </span>
                <span className="font-medium text-gray-800">{formatNumberToWon(room.subTotal)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 결제 금액 */}
      <div className="rounded-xl border border-gray-100 p-4">
        <h4 className="mb-3 text-base font-semibold text-gray-700">결제 정보</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-base">
            <span className="text-gray-600">총 예약 금액</span>
            <span className="font-medium text-gray-800">{formatNumberToWon(detail.totalPrice)}</span>
          </div>
          {detail.participants.length > 1 && (
            <div className="flex items-center justify-between text-base">
              <span className="text-gray-600">인당 결제 금액</span>
              <span className="font-medium text-gray-800">{formatNumberToWon(myAmount)}</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-dashed border-gray-200 pt-3">
          <div className="flex items-center space-x-1 text-gray-700">
            <CreditCard className="h-5 w-5" />
            <span className="text-base font-semibold">내 결제 금액</span>
          </div>
          <span className="text-xl font-extrabold text-primary-700">{formatNumberToWon(myAmount)}</span>
        </div>
      </div>

      {/* 예약 취소 */}
      {CANCELLABLE.includes(detail.reservationStatus) && (
        <div className="pb-2">
          {cancelError && <p className="mb-2 text-base text-red-500">{cancelError}</p>}
          {confirmCancel ? (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmCancel(false)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-base font-medium text-gray-600 hover:bg-gray-50"
              >
                돌아가기
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 rounded-xl bg-red-500 py-3 text-base font-bold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {cancelling ? '취소 중...' : '취소 확인'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmCancel(true)}
              className="w-full rounded-xl border border-red-200 py-3 text-base font-semibold text-red-500 hover:bg-red-50"
            >
              예약 취소
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservationDetailPage;
