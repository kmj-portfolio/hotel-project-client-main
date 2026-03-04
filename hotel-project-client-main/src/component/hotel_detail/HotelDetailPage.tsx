import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import HotelIntro from './HotelIntro';
import HotelMapView from './HotelMapView';
import HotelReviews from './HotelReviews';
import HotelRooms from './HotelRooms';
import LikeListPickerModal from './LikeListPickerModal';

import { getHotelDetail, getHotelRooms } from '@/service/api/hotel';
import { getHotelReviews } from '@/service/api/review';
import useAuthStore from '@/stores/useAuthStore';

import type { HotelDetail } from '@/types/hotel';
import type { RoomInfo } from '@/types/room/room';
import type { Review } from '@/types/review/review';

const HotelDetailPage = () => {
  const { hotelId } = useParams();
  const id = Number(hotelId);
  const { state } = useLocation();
  const checkIn: string = state?.checkIn ?? '';
  const checkOut: string = state?.checkOut ?? '';
  const { role, setLoginModalOpen } = useAuthStore();

  const [hotelDetail, setHotelDetail] = useState<HotelDetail>();
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string>();
  const [showLikeModal, setShowLikeModal] = useState(false);

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

  const handleLikeClick = () => {
    if (!role) {
      setLoginModalOpen(true);
      return;
    }
    setShowLikeModal(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 pb-20">
      {/* onLike는 Customer 또는 비로그인 사용자에게만 전달 (Provider 제외) */}
      <HotelIntro
        hotelDetail={hotelDetail}
        onLike={role !== 'ROLE_PROVIDER' ? handleLikeClick : undefined}
      />

      <LikeListPickerModal
        hotelId={id}
        isOpen={showLikeModal}
        onClose={() => setShowLikeModal(false)}
      />

      <section className="mt-12 border-t border-gray-200 pt-10">
        <HotelRooms
          rooms={rooms}
          hotelId={hotelDetail.hotelId}
          hotelName={hotelDetail.name}
          hotelAddress={hotelDetail.address}
          checkIn={checkIn}
          checkOut={checkOut}
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
