import type { RoomInfo } from '@/types/room/room';
import HotelRoom from './HotelRoom';

interface HotelRoomsProps {
  rooms: RoomInfo[];
  hotelId: number;
  hotelName: string;
  hotelAddress: string;
  checkIn: string;
  checkOut: string;
}

const HotelRooms = ({ rooms, hotelId, hotelName, hotelAddress, checkIn, checkOut }: HotelRoomsProps) => {
  if (!rooms.length) {
    return (
      <div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">객실</h2>
        <p className="text-gray-400">등록된 객실이 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        객실 <span className="text-lg font-normal text-gray-400">({rooms.length}개)</span>
      </h2>
      <div className="flex flex-col gap-4">
        {rooms.map((room) => (
          <HotelRoom
            key={room.roomId}
            room={room}
            hotelId={hotelId}
            hotelName={hotelName}
            hotelAddress={hotelAddress}
            checkIn={checkIn}
            checkOut={checkOut}
          />
        ))}
      </div>
    </div>
  );
};

export default HotelRooms;
