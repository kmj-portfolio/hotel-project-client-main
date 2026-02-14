import { Link } from 'react-router-dom';
import HeartIcon from '../common/icons/HeartIcon';
import { RatingStars } from '../card/RatingStars';
import type { Hotel } from '@/types/hotel';

const HotelCard = ({
  hotel,
  handleChangeLike,
  handleHotelClick,
}: {
  hotel: Hotel;
  handleChangeLike: () => void;
  handleHotelClick: () => void;
}) => {
  return (
    <Link to={`/hotels/${hotel.hotelId}`}>
      <div
        aria-label={hotel.name}
        className="hover:border-primary-200 relative flex w-full gap-4 rounded-2xl border border-gray-200 p-4 transition-colors lg:max-w-[300px] lg:flex-col"
        onClick={handleHotelClick}
      >
        <div className="bg-primary-700 h-[120px] w-[120px] shrink-0 rounded-2xl lg:h-[200px] lg:w-full">
          <img
            className="h-full w-full rounded-2xl object-cover"
            src={`data:image/webp;base64,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`}
          />
        </div>
        <div className="w-full">
          <div className="flex items-center justify-between">
            <HeartIcon
              like={true}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleChangeLike();
              }}
              className="z-999 lg:absolute lg:top-8 lg:right-8"
            />
          </div>

          <h3 className="font-bold lg:text-lg">{hotel.name}</h3>

          <p className="mb-0.5 text-sm font-light text-gray-500">{hotel.address}</p>

          <div className="mb-2 flex items-center gap-1">
            <RatingStars rating={1.2} />
            <span className="text-xs text-gray-500">{`${hotel.reviewCount > 1000 ? '999+' : hotel.reviewCount}`}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
