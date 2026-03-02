import type { RoomInfo } from '@/types/room/room';
import { formatNumberWithComma } from '@/utils/format/formatUtil';
import useAuthStore from '@/stores/useAuthStore';

const toProxiedUrl = (url?: string) => {
  if (!url) return undefined;
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
};

const HotelRoom = ({ room }: { room: RoomInfo }) => {
  const role = useAuthStore((s) => s.role);
  const imageUrl = toProxiedUrl(room.mainImageUrl);

  return (
    <div className="flex h-[200px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="h-full w-56 shrink-0 overflow-hidden bg-primary-100">
        {imageUrl ? (
          <img src={imageUrl} alt={room.roomType} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-100">
            <svg
              className="h-10 w-10 text-primary-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{room.roomType}</h3>
          <p className="mt-1 text-sm text-gray-400">
            최대 {room.maxOccupancy}인 · 잔여 {room.totalQuantity}실
          </p>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">
            {room.description}
          </p>
        </div>
      </div>

      {/* Price & CTA */}
      <div className="flex w-44 shrink-0 flex-col items-end justify-between border-l border-gray-100 p-5">
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            ₩{formatNumberWithComma(room.price)}
          </div>
          <div className="mt-0.5 text-xs text-gray-400">1박 기준</div>
        </div>
        {role !== 'ROLE_PROVIDER' && (
          <button className="w-full rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-800 active:bg-primary-900">
            예약하기
          </button>
        )}
      </div>
    </div>
  );
};

export default HotelRoom;
