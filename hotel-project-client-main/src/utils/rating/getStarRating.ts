/**
 * 평점을 입력받아 [별 개수, 반쪽 별 유무]를 반환
 * 예: 4.3 -> [4, false], 3.7 -> [3, true]
 */
const getStarRating = (num: number): [number, boolean] => {
  const fullStars = Math.floor(num);
  const hasHalfStar = num - fullStars >= 0.5;
  return [fullStars, hasHalfStar];
};

export default getStarRating;