import { Star } from 'lucide-react';

interface RatingStartProps {
  max?: number;
  rating?: number;
}

function HalfStar({ size = 12, fill = '#FFB400', stroke = '#FFB400', strokeWidth = 1 }) {
  return (
    <span className="relative">
      <Star size={size} fill="#fff" stroke={stroke} strokeWidth={strokeWidth} />
      <div className="absolute top-0 left-0 h-full w-1/2 overflow-hidden">
        <Star size={size} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </div>
    </span>
  );
}

export function RatingStars({ rating = 0, max = 5 }: RatingStartProps) {
  return (
    <ul className="flex gap-0.5" aria-label={`숙소 평균 별점: ${rating}점`}>
      {Array.from({ length: max }).map((_, idx) => {
        const full = idx + 1 <= Math.floor(rating);
        const half = !full && idx < rating;

        return (
          <li key={idx}>
            {full ? (
              <Star size={12} fill="#FFB400" stroke="#FFB400" strokeWidth={1} />
            ) : half ? (
              <HalfStar size={12} fill="#FFB400" stroke="#FFB400" strokeWidth={1} />
            ) : (
              <Star size={12} fill="#fff" stroke="#FFB400" strokeWidth={1} />
            )}
          </li>
        );
      })}
    </ul>
  );
}
