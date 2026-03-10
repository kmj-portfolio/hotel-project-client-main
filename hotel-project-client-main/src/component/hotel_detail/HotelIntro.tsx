import star from '@/assets/svg/star.svg';
import halfStar from '@/assets/svg/harf-star-left.svg';
import type { HotelDetail } from '@/types/hotel';
import getStarRating from '@/utils/rating/getStarRating';
import { Heart } from 'lucide-react';

const ratingLabel = (rating: number) => {
  if (rating >= 4.5) return '최고';
  if (rating >= 4.0) return '매우 좋음';
  if (rating >= 3.5) return '좋음';
  if (rating >= 3.0) return '보통';
  return '평가됨';
};

const HotelIntro = ({
  hotelDetail,
  onLike,
}: {
  hotelDetail: HotelDetail;
  onLike?: () => void;
}) => {
  const mainImageUrl = hotelDetail.mainPhotoUrl;
  const additionalUrls = (hotelDetail.additionalPhotoUrls ?? []).slice(0, 2);

  const [fullStars, hasHalfStar] = getStarRating(hotelDetail.starLevel);

  return (
    <div>
      {/* ── Like button ── */}
      {onLike && (
        <div className="mb-3 flex justify-end">
          <button
            onClick={onLike}
            className="group flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 active:bg-rose-100"
          >
            <Heart className="h-4 w-4 fill-rose-500 stroke-rose-500 transition-transform group-hover:scale-110" />
            좋아요 목록에 추가하기
          </button>
        </div>
      )}

      {/* ── Photo Gallery ── */}
      {mainImageUrl && (
        <div className="flex h-[300px] gap-2 overflow-hidden rounded-2xl">
          <div className={`overflow-hidden ${additionalUrls.length > 0 ? 'flex-[3]' : 'flex-1'}`}>
            <img
              src={mainImageUrl}
              alt={hotelDetail.name}
              className="h-full w-full object-cover"
            />
          </div>
          {additionalUrls.length > 0 && (
            <div className="flex flex-[2] flex-col gap-2">
              {additionalUrls.map((url, i) => (
                <div key={i} className="min-h-0 flex-1 overflow-hidden">
                  <img
                    src={url}
                    alt={`${hotelDetail.name} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Hotel Header ── */}
      <div className="mt-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {/* Star level icons */}
          <div className="mb-2 flex items-center gap-1">
            {Array.from({ length: fullStars }).map((_, i) => (
              <img key={i} src={star} alt="star" className="h-4 w-4" />
            ))}
            {hasHalfStar && <img src={halfStar} alt="half star" className="h-4 w-4" />}
            <span className="ml-1 text-sm text-gray-500">{hotelDetail.starLevel}성급</span>
          </div>

          <h1 className="text-3xl font-bold text-black">{hotelDetail.name}</h1>

          <p className="mt-2 flex items-center gap-1 text-gray-500">
            <svg
              className="h-4 w-4 shrink-0 text-primary-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            {hotelDetail.address}
          </p>
        </div>

        {/* Rating badge */}
        <div className="shrink-0 overflow-hidden rounded-xl bg-primary-700 text-white">
          <div className="px-5 py-3 text-center">
            <div className="text-3xl font-bold leading-none">
              {hotelDetail.rating.toFixed(1)}
            </div>
            <div className="mt-1 text-sm font-medium">{ratingLabel(hotelDetail.rating)}</div>
          </div>
          <div className="bg-primary-800 px-5 py-1.5 text-center text-xs text-primary-200">
            리뷰 {hotelDetail.reviewCount}개
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      <div className="mt-6 rounded-xl bg-gray-50 p-5">
        <p className="leading-relaxed text-gray-700">{hotelDetail.description}</p>
      </div>
    </div>
  );
};

export default HotelIntro;
