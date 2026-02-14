import type { Room } from '@/types/room/room';
import HotelRoom from './HotelRoom';

const HotelRooms = ({ rooms }: { rooms: Room[] }) => {
  return (
    <div className="flex flex-col gap-8">
      {rooms.length &&
        rooms.map((room, index) => (
          <HotelRoom imgPosition={`${index % 2 == 0 ? 'left' : 'right'}`} room={room} />
        ))}
    </div>
  );
  return <HotelRoom imgPosition="right" room={rooms[0]} />;
};

export default HotelRooms;
