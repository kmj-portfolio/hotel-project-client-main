import { useEffect, useState } from 'react';
import HotelIntro from './HotelIntro';
import { useParams } from 'react-router-dom';
import { getHotelDetail } from '@/service/api/hotel';
import handleApiReqeust from '@/service/api/handleApiReqeust';
import HotelReviews from './HotelReviews';
import HotelRooms from './HotelRooms';
import HotelMapView from './HotelMapView';
import type { HotelDetail } from '@/types/hotel';
import type { Review } from '@/types/review/review';
import type { Room } from '@/types/room/room';

const reviews: Review[] = [
  {
    reviewId: 1,
    customerId: 101,
    hotelId: 501,
    nickname: '여행자1',
    content: '정말 만족스러운 숙소였어요. 다시 오고 싶어요!',
    rating: 5,
  },
  {
    reviewId: 2,
    customerId: 102,
    hotelId: 501,
    nickname: '김철수',
    content: '방이 조금 좁았지만 위치가 좋아서 괜찮았어요.',
    rating: 4,
  },
  {
    reviewId: 3,
    customerId: 103,
    hotelId: 501,
    nickname: '여행러버',
    content: '청결 상태가 아쉬웠습니다.',
    rating: 2,
  },
];

const rooms: Room[] = [
  {
    hotelId: 1,
    hotelName: '서울 프리미엄 호텔',
    roomType: '디럭스 트윈',
    maxOccupancy: 3,
    price: 120000,
  },
  {
    hotelId: 2,
    hotelName: '부산 오션뷰 리조트',
    roomType: '오션뷰 스위트',
    maxOccupancy: 4,
    price: 250000,
  },
  {
    hotelId: 3,
    hotelName: '제주 하이클래스 호텔',
    roomType: '패밀리룸',
    maxOccupancy: 5,
    price: 180000,
  },
];

const HotelDetailPage = () => {
  const params = useParams();
  const { hotelId } = params;

  const [hotelDetail, setHotelDetail] = useState<HotelDetail>();

  const handleGetHotelDetail = async () => {
    return await getHotelDetail(Number(hotelId));
  };

  useEffect(() => {
    handleApiReqeust<HotelDetail>(handleGetHotelDetail).then((data) => {
      setHotelDetail(data);
      console.log(data);
    });
  }, []);

  if (!hotelDetail) {
    return null;
  }

  return (
    <div className="border-gray-primary mt-4 flex flex-col items-center gap-8 border-r border-l px-16">
      {hotelDetail && <HotelIntro hotelDetail={hotelDetail} />}
      {<HotelMapView hotelDetail={hotelDetail} />}
      {rooms && <HotelRooms rooms={rooms} />}
      {reviews && <HotelReviews reviews={reviews} />}
    </div>
  );
};

export default HotelDetailPage;
