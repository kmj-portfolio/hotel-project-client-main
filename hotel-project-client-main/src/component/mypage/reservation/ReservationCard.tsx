import { memo } from 'react';
import { Calendar, Clock, Hotel, MapPin, Users } from 'lucide-react';
import Card from '@/component/common/card/Card';
import { PrimaryButton } from '@/component/common/button/PrimaryButton';
import type {
  ReservationCardProps,
  BookingStatusProps,
  DateDisplayProps,
  GuestInfoProps,
  HotelImageProps,
  RoomInfoProps,
  BookingStatus,
} from '@/types/ReservationType';
import { formatDateToYMD, formatNumberToWon } from '@/utils/format/formatUtil';
import { usePaymentStore } from '@/stores/usePaymentStore';
import { getPaymentsByReservationId } from '@/service/api/payment';

// 예약 상태 표시 컴포넌트
const BookingStatus = memo(({ status }: BookingStatusProps) => {
  const statusConfig: Record<BookingStatus, { text: string; color: string }> = {
    CONFIRMED: { text: '예약 완료', color: 'text-blue-600 hover:text-blue-700' },
    PENDING: { text: '결제 대기', color: 'text-amber-500 hover:text-amber-600' },
    CANCELLED: { text: '예약 취소', color: 'text-red-600 hover:text-red-700' },
    DONE: { text: '이용 완료', color: 'text-gray-600 hover:text-gray-700' },
  };

  const config = statusConfig[status];

  return <button className={`font-bold ${config.color}`}>{config.text}</button>;
});

BookingStatus.displayName = 'BookingStatus';

// 체크인/체크아웃 날짜 컴포넌트
const DateDisplay = memo(({ date, time }: DateDisplayProps) => (
  <div className="text-center">
    <div className="text-xl font-bold text-gray-800">{date}</div>
    <div className="text-sm text-gray-500">
      <Clock className="inline-flex h-3 w-3" />
      {time}
    </div>
  </div>
));

DateDisplay.displayName = 'DateDisplay';

// 객실 정보 컴포넌트
const RoomInfo = memo(({ roomId, roomType }: RoomInfoProps) => (
  <div className="ml-8">
    <div className="mb-1 flex items-center space-x-2">
      <span className="rounded bg-blue-500 px-2 py-1 text-xs font-bold text-white">Room</span>
      <span className="text-sm font-medium">{roomId}</span>
    </div>
    <div className="text-xs text-gray-500">{roomType}</div>
  </div>
));

RoomInfo.displayName = 'RoomInfo';

// 투숙객 정보 컴포넌트
const GuestInfo = memo(({ userName, quantity, maxOccupancy }: GuestInfoProps) => (
  <div className="ml-8 text-right">
    <div className="font-medium text-gray-800">{userName}</div>
    <div className="text-xs text-gray-500">
      <Users className="inline-flex h-4 w-4 text-gray-400" />
      투숙객 {quantity}명 / 정원 {maxOccupancy}명
    </div>
  </div>
));

GuestInfo.displayName = 'GuestInfo';

// 호텔 이미지 컴포넌트
const HotelImage = memo(({ image, hotelName }: HotelImageProps) => (
  <div className="min-h-[120px] w-28 flex-shrink-0 self-stretch rounded-lg bg-gradient-to-r from-purple-400 to-pink-400">
    <img
      src={image}
      alt={`${hotelName} 이미지`}
      className="h-full w-full rounded-lg object-cover"
      loading="lazy"
    />
  </div>
));

HotelImage.displayName = 'HotelImage';

// 메인 예약 카드 컴포넌트
const ReservationCard = memo(({ booking, onDelete }: ReservationCardProps) => {
  const { setPayments, togglePayment, setReservationId, setRoomId } = usePaymentStore();

  const handleDelete = () => {
    if (onDelete) {
      onDelete(booking.reservationId);
    }
  };

  const handlePayment = async (roomId: number) => {
    setReservationId(booking.reservationId);
    setRoomId(roomId);

    const res = await getPaymentsByReservationId(booking.reservationId);
    setPayments(res);
    if (res) {
      togglePayment();
    }
  };

  return (
    <Card className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* 예약 헤더 */}
      <Card.Header className="mb-4 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Hotel className="h-5 w-5 text-gray-400" />
          <span className="text-gray-600">예약번호: {booking.reservationNumber}</span>
          <Calendar className="h-5 w-5 text-gray-400" />
          <span className="text-gray-600">예약일: {formatDateToYMD(booking.createdAt)}</span>
        </div>
        <BookingStatus status={booking.reservationStatus} />
      </Card.Header>

      {/* 카드 컨텐츠 */}
      {booking.rooms.map((reservationRoom) => (
        <div
          key={reservationRoom.roomId}
          className="cursor-pointer rounded-xl p-4 hover:bg-gray-100"
          onClick={() => {
            handlePayment(reservationRoom.roomId);
          }}
        >
          <Card.Content className="text-right">
            {/* 가격 정보 */}
            <div className="text-lg font-bold text-gray-800">
              결제 금액: {formatNumberToWon(reservationRoom.subtotalPrice)}
            </div>
            <div className="text-xs text-gray-700">
              총 금액: {formatNumberToWon(booking.totalPrice)}
            </div>
            {/* 예약 상세 정보 */}
            <div className="flex items-center space-x-6">
              {/* 호텔 이미지 */}
              <HotelImage image={booking.hotelPhotos} hotelName={booking.hotelName} />

              {/* 예약 정보 */}
              <div className="flex-1">
                <div className="mb-4 flex items-center space-x-4">
                  <MapPin className="h-4 w-4" />
                  <h3 className="text-l text-left font-semibold text-gray-800">
                    {booking.hotelAddress} → {booking.hotelName} ({reservationRoom.roomType})
                  </h3>
                </div>

                <div className="flex items-center space-x-8 rounded-lg bg-indigo-50 p-4">
                  {/* 체크인 날짜 */}
                  <DateDisplay date={booking.checkInDate} time={booking.hotelCheckInTime} />

                  {/* 숙박 기간 표시 */}
                  <div className="flex flex-1 items-center justify-center">
                    <div className="relative h-px w-20 bg-gray-300">
                      <Hotel className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform text-gray-400" />
                      <div className="pt-2 text-center text-sm text-gray-500">
                        {reservationRoom.nights}박 일정
                      </div>
                    </div>
                  </div>

                  {/* 체크아웃 날짜 */}
                  <DateDisplay date={booking.checkOutDate} time={booking.hotelCheckOutTime} />

                  {/* 객실 정보 */}
                  <RoomInfo roomId={reservationRoom.roomId} roomType={reservationRoom.roomType} />

                  {/* 투숙객 정보 */}
                  <GuestInfo
                    userName={booking.userName}
                    quantity={reservationRoom.participantCount}
                    maxOccupancy={reservationRoom.maxOccupancy}
                  />
                </div>
              </div>
            </div>

            {/* 추가 서비스 정보 */}
            <div className="mt-4 border-t border-gray-200 pt-4 text-left">
              <div className="text-sm text-gray-600">
                객실정보 : {reservationRoom.roomDescription}
              </div>
              <div className="text-sm text-gray-600">부가 서비스 (유료)</div>
            </div>
          </Card.Content>
        </div>
      ))}

      {/* 삭제 버튼 */}
      <Card.Footer divider={true}>
        <PrimaryButton size="md" onClick={handleDelete}>
          삭제
        </PrimaryButton>
      </Card.Footer>
    </Card>
  );
});

ReservationCard.displayName = 'BookingCard';

export default ReservationCard;
