import star from '@/assets/svg/star.svg';
import halfStar from '@/assets/svg/harf-star-left.svg';
import type { Review } from '@/types/review/review';
import getStarRating from '@/utils/rating/getStarRating';

const HotelReview = ({ review }: { review: Review }) => {
  const [fullStars, hasHalfStar] = getStarRating(review.rating);

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
            {review.nickname.charAt(0)}
          </div>
          <span className="font-semibold text-gray-900">{review.nickname}</span>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: fullStars }).map((_, i) => (
            <img key={i} src={star} alt="star" className="h-4 w-4" />
          ))}
          {hasHalfStar && <img src={halfStar} alt="half star" className="h-4 w-4" />}
          <span className="ml-1 text-sm font-medium text-gray-500">
            {review.rating.toFixed(1)}
          </span>
        </div>
      </div>
      <p className="line-clamp-4 text-sm leading-relaxed text-gray-600">{review.content}</p>
    </div>
  );
};

export default HotelReview;
