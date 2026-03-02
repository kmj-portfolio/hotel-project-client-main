import { Link } from 'react-router-dom';

import HeartIcon from '../common/icons/HeartIcon';

import { RatingStars } from './RatingStars';
import { formatNumberWithComma } from '@/utils/format/formatUtil';

interface HotelCardProps {
  hotelId: number;
  starLevel: number;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  mainImageUrl?: string;
  liked: boolean;
  handleChangeLike: () => void;
}

const toProxiedUrl = (url?: string) => {
  if (!url) return undefined;
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
};

const HotelCard = ({
  hotelId,
  starLevel,
  name,
  address,
  rating,
  reviewCount,
  mainImageUrl,
  liked,
  handleChangeLike,
}: HotelCardProps) => {
  const imageUrl = toProxiedUrl(mainImageUrl);

  return (
    <Link to={`/hotels/${hotelId}`}>
      <div
        aria-label={name}
        className="hover:border-primary-200 relative flex w-full gap-4 rounded-2xl border border-gray-200 p-4 transition-colors lg:max-w-[300px] lg:flex-col"
      >
        <div className="bg-primary-700 h-[120px] w-[120px] shrink-0 overflow-hidden rounded-2xl lg:h-[200px] lg:w-full">
          {imageUrl && (
            <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="w-full">
          <div className="flex items-center justify-between">
            <p className="text-primary-700 text-xs lg:text-sm">{`${starLevel}성급`}</p>
            <HeartIcon
              like={liked}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleChangeLike();
              }}
              className="z-999 lg:absolute lg:top-8 lg:right-8"
            />
          </div>

          <h3 className="font-bold lg:text-lg">{name}</h3>

          <p className="mb-0.5 text-sm font-light text-gray-500">{address}</p>

          <div className="mb-2 flex items-center gap-1">
            <RatingStars rating={rating} />
            <span className="text-xs text-gray-500">{`(${reviewCount}+)`}</span>
          </div>

          <div className="text-end text-gray-700 lg:text-lg">{`₩${formatNumberWithComma(130000)}`}</div>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
