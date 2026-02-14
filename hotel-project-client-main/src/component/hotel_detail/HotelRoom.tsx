import type { Room } from '@/types/room/room';

const HotelRoom = ({ imgPosition }: { imgPosition: 'right' | 'left'; room: Room }) => {
  return (
    <div
      className={`flex ${imgPosition === 'left' ? 'flex-row' : 'flex-row-reverse'} bg-primary-100 h-100 w-full rounded-2xl`}
    >
      <div className="flex flex-4">
        <img
          className={`h-full w-full object-cover ${imgPosition === 'left' ? 'rounded-l-2xl' : 'rounded-r-2xl'} `}
          src={`${imgPosition === 'left' ? 'https://crafto.themezaa.com/hotel-and-resort/wp-content/uploads/sites/19/2024/01/demo-hotel-and-resort-rooms-04.jpg' : 'https://crafto.themezaa.com/hotel-and-resort/wp-content/uploads/sites/19/2024/01/demo-hotel-and-resort-rooms-01.jpg'}`}
        />
      </div>
      <div className="flex flex-3 flex-col">
        <div className="border-primary-400 flex flex-7 flex-col justify-center border-b">
          <div className="text-primary-700 mb-2 pr-16 pl-16 text-2xl">방 타입</div>
          <div className="pr-16 pl-16 text-lg">
            탁 트인 오션뷰를 자랑하는 이 객실은 넓은 킹사이즈 침대와 고급 린넨을 갖추고 있어 편안한
            휴식을 제공합니다. 전용 발코니에서 일출을 감상할 수 있으며, 네스프레소 커피 머신과 무료
            Wi-Fi, 넷플릭스 시청이 가능한 스마트 TV가 구비되어 있습니다.
          </div>
        </div>
        <div className="flex flex-2 items-center justify-center">
          <div className="mr-4 text-2xl font-semibold">
            188,000원 <span className="text-sm font-light">1박 2일 기준</span>
          </div>
          <button className="rounded-lg bg-blue-500 px-4 py-2 hover:bg-blue-600 active:bg-blue-700">
            예약하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelRoom;
