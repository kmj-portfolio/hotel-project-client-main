import type { Review } from '@/types/review/review';
import HotelReview from './HotelReview';

const HotelReviews = ({ reviews }: { reviews: Review[] }) => {
  if (!reviews.length) {
    return (
      <div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">리뷰</h2>
        <p className="text-gray-400">아직 작성된 리뷰가 없습니다.</p>
      </div>
    );
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div>
      {/* Header with summary */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          리뷰{' '}
          <span className="text-lg font-normal text-gray-400">({reviews.length}개)</span>
        </h2>
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2">
          <span className="text-2xl font-bold text-primary-700">{avgRating.toFixed(1)}</span>
          <span className="text-sm text-gray-500">/ 5.0</span>
        </div>
      </div>

      {/* Review grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {reviews.map((review) => (
          <HotelReview key={review.reviewId} review={review} />
        ))}
      </div>
    </div>
  );
};

export default HotelReviews;
