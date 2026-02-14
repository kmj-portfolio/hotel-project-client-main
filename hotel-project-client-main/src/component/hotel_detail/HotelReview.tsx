import halfStar from '@/assets/svg/harf-star-left.svg';
import star from '@/assets/svg/star.svg';
import type { Review } from '@/types/review/review';
import getStarRating from '@/utils/rating/getStarRating';

const HotelReview = ({ review }: { review: Review }) => {
  const [fullStars, hasHalfStar] = getStarRating(Number(review.rating));
  console.log(fullStars);

  return (
    <div className="flex w-full flex-col border-b p-4">
      <div className="text-primary-500 text-lg font-semibold">리뷰 작성자 이름</div>
      <div className="mb-4 flex">
        {Array.from({ length: fullStars }).map((_, index) => (
          <img key={index} src={star} />
        ))}
        {hasHalfStar ? <img src={halfStar} /> : null}
      </div>
      <div className="flex-1 leading-relaxed">
        이 호텔 방은 기대 이상이었습니다. 우선 체크인 과정이 매우 원활했고, 직원들도 친절하게 응대해
        주었습니다. 방에 들어서자마자 깨끗하게 정돈된 침대와 넉넉한 크기의 창문이 인상적이었고,
        자연광이 잘 들어와서 실내가 매우 쾌적하게 느껴졌습니다. 욕실은 현대적으로 리모델링되어
        있었고, 샤워 수압이 적당했으며 어메니티도 고급 브랜드로 제공되어 만족스러웠습니다. 특히
        수건이 넉넉하게 구비되어 있었고, 냉장고에는 생수가 무료로 제공되어 편리했습니다. 와이파이
        속도도 빠른 편이었고, 책상 공간이 넓어 업무를 보기에도 불편함이 없었습니다. 침대는 푹신하고
        포근했으며, 베개도 여러 종류가 준비되어 있어 숙면을 취할 수 있었습니다. 에어컨은 조용하게
        작동했고, 방음 상태도 좋아서 복도나 옆방의 소음이 거의 들리지 않았습니다. 한 가지 아쉬운
        점은 방 안의 조명이 조금 어두운 편이라는 것이었지만, 침대 옆 스탠드와 책상 조명을 활용하면
        큰 불편은 없었습니다. 전반적으로 매우 만족스러운 경험이었으며, 다음에도 이 호텔에 다시
        머물고 싶습니다.
      </div>
    </div>
  );
};

export default HotelReview;
