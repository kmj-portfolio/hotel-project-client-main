import Card from '@/component/common/card/Card';
import { usePaymentStore } from '@/stores/usePaymentStore';
import { useReservationStore } from '@/stores/useReservationStore';
import { formatNumberToWon } from '@/utils/format/formatUtil';

const PaymentCard = () => {
  const { reservationId } = usePaymentStore();
  const { getReservationById } = useReservationStore();
  const reservations = getReservationById(reservationId);

  return (
    <Card className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      {reservations && (
        <Card.Content>
          <div className="mb-6 flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">총 예약 금액</span>
            <span className="text-xl font-extrabold text-blue-600">
              {formatNumberToWon(reservations.totalPrice)}
            </span>
          </div>
          <div className="space-y-3 bg-gray-100 p-4">
            <ul className="space-y-3">
              <div className="flex justify-between text-sm text-gray-700">
                <span>투숙객 x {reservations.numberOfParticipants}</span>
                <span>{formatNumberToWon(reservations.totalPrice)}</span>
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
