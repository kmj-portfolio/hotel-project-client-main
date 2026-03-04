import Card from '@/component/common/card/Card';
import { usePaymentStore } from '@/stores/usePaymentStore';
import { useReservationStore } from '@/stores/useReservationStore';
import type { ReservationRoom } from '@/types/ReservationType';
import { formatNumberToWon } from '@/utils/format/formatUtil';

const PaymentCard = () => {
  const { payments, reservationId, roomId } = usePaymentStore();
  const { getReservationById } = useReservationStore();
  const reservations = getReservationById(reservationId);

  const targetRoom = reservations?.rooms?.find((room: ReservationRoom) => room.roomId === roomId);
  const paymentData = payments && reservations && targetRoom;

  return (
    <Card className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      {paymentData && (
        <Card.Content>
          <div className="mb-6 flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">총 결제 금액</span>
            <span className="text-2xl font-extrabold text-blue-600">
              {formatNumberToWon(payments.amount)}
            </span>
          </div>
          <div className="space-y-3 bg-gray-100 p-4">
            <ul className="space-y-3">
              <div className="flex justify-between text-sm text-gray-700">
                <span>나의 결제금액</span>
                <span>{formatNumberToWon(payments.amount)}</span>
              </div>
            </ul>
          </div>
          <div className="mt-2 text-left text-xs font-bold text-red-500">
            <div> 총 예약금 = 실제 숙소 전체 금액</div>
            <div> 총 결제금 = 내가 분할 결제하기로 한 금액</div>
          </div>

          <div className="my-4 border-t-1 border-dashed border-blue-500"></div>
          <div className="mb-6 flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">총 예약 금액</span>
            <span className="text-xl font-extrabold text-blue-600">
              {formatNumberToWon(reservations.totalPrice)}
            </span>
          </div>
          <div className="space-y-3 bg-gray-100 p-4">
            <ul className="space-y-3">
              <div className="flex justify-between text-sm text-gray-700">
                <span>투숙객 x {reservations.rooms?.[0]?.participantCount ?? reservations.numberOfParticipants}</span>
                <span>
                  {formatNumberToWon(targetRoom.subtotalPrice * targetRoom.participantCount)}
                </span>
              </div>
              <li className="flex justify-between text-sm text-gray-700">
                <span>할인코드</span>
                <span>0원</span>
              </li>
            </ul>
          </div>
        </Card.Content>
      )}
    </Card>
  );
};

export default PaymentCard;
