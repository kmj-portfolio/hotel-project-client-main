import halfStar from '@/assets/svg/harf-star-left.svg';
import star from '@/assets/svg/star.svg';
import type { HotelDetail } from '@/types/hotel';
import getStarRating from '@/utils/rating/getStarRating';

const HotelIntro = ({ hotelDetail }: { hotelDetail: HotelDetail }) => {
  console.log(hotelDetail);
  const [fullStars, hasHalfStar] = getStarRating(Number(hotelDetail.rating));

  // 설명, 좋아요, 가장 싼 가격
  // 이미지는 나중에 생각하기 성급까지 넣고 싶지는 않다 수고해라
  return (
    <div className="flex w-full flex-col items-center">
      <div className="text-primary-500 flex justify-between">
        <div className="mb-2 text-lg font-bold">{hotelDetail.name}</div>
      </div>
      <div className="text-gray-primary mb-4">{hotelDetail.address}</div>
      <div className="mb-2 flex w-200 justify-center text-2xl text-black">
        {hotelDetail.description}
      </div>
      <div className="flex h-20 w-225 items-center justify-between rounded-[4rem] border border-gray-300 bg-white">
        <div className="flex flex-1 items-center justify-center">
          <div className="mr-4 text-2xl">{`평점: `}</div>
          {Array.from({ length: fullStars }).map(() => (
            <img className="h-8 w-8" src={star} />
          ))}
          {hasHalfStar ? <img className="h-8 w-8" src={halfStar} /> : null}
        </div>
        <div className="h-3/5 border-r border-gray-300" />
        <div className="flex flex-1 justify-center text-2xl">
          {hotelDetail.reviewCount}개의 리뷰
        </div>
      </div>
    </div>
  );
};

export default HotelIntro;
