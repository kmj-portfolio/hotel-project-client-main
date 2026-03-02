import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import HotelIntro from './HotelIntro';
import HotelMapView from './HotelMapView';
import HotelReviews from './HotelReviews';
import HotelRooms from './HotelRooms';

import { getHotelDetail, getHotelRooms } from '@/service/api/hotel';
import { getHotelReviews } from '@/service/api/review';

import type { HotelDetail } from '@/types/hotel';
import type { RoomInfo } from '@/types/room/room';
import type { Review } from '@/types/review/review';

const HotelDetailPage = () => {
  const { hotelId } = useParams();
  const id = Number(hotelId);

  const [hotelDetail, setHotelDetail] = useState<HotelDetail>();
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    getHotelDetail(id)
      .then((data) => setHotelDetail(data))
      .catch((err) => setError(String(err)));

    getHotelRooms(id)
      .then((data) => setRooms(data.content))
      .catch(() => setRooms([]));

    getHotelReviews(id)
      .then((data) => setReviews(data.content))
      .catch(() => setReviews([]));
  }, [id]);

  if (error) {
    return <div className="mt-16 text-center text-red-500">{error}</div>;
  }

  if (!hotelDetail) {
    return (
      <div className="mt-16 flex items-center justify-center gap-2 text-gray-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
        <span>로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pb-20">
      <HotelIntro hotelDetail={hotelDetail} />

      <section className="mt-12 border-t border-gray-200 pt-10">
        <HotelRooms
          rooms={rooms}
          hotelId={hotelDetail.hotelId}
          hotelName={hotelDetail.name}
          hotelAddress={hotelDetail.address}
        />
      </section>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <HotelMapView hotelDetail={hotelDetail} />
      </section>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <HotelReviews reviews={reviews} />
      </section>
    </div>
  );
};

export default HotelDetailPage;
