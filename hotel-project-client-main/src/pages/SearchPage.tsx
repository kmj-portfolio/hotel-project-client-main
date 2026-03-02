import HotelCard from '@/component/card/HotelCard';
import CardSkeleton from '@/component/common/card/ui/CardSkeleton';
import hotelKeys from '@/hooks/queries/hotels/hotelKeys';
import useObserver from '@/hooks/useObserver';
import type { SearchTerm } from '@/layout/SearchLayout';
import { getSearchHotels } from '@/service/api/hotel';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRouteLoaderData } from 'react-router-dom';
import { SearchX } from 'lucide-react';

const SearchPage = () => {
  const { location, lat, lon, guestCount, checkInDate, checkOutDate } =
    useRouteLoaderData<SearchTerm>('search')!;

  const { data, hasNextPage, isLoading, fetchNextPage } = useInfiniteQuery({
    queryKey: hotelKeys.searchHotels({ location, guestCount, checkInDate, checkOutDate }),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      return await getSearchHotels(
        {
          checkIn: checkInDate,
          checkOut: checkOutDate,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          numGuest: parseInt(guestCount),
          minPrice: 0,
          maxPrice: 999999999,
          numStar: 0,
        },
        pageParam,
        10,
      );
    },
    getNextPageParam: (lastPage) => {
      return lastPage.last ? undefined : lastPage.pageable.pageNumber + 1;
    },
  });

  const { ref, isView } = useObserver();

  useEffect(() => {
    if (isView && hasNextPage) {
      fetchNextPage();
    }
  }, [isView, fetchNextPage, hasNextPage]);

  const searchResults = data?.pages.flatMap((data) => data.content) || [];

  return (
    <div className="flex h-full flex-col justify-between px-4">
      {isLoading && (
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-5">
          <CardSkeleton />
        </div>
      )}
      {!isLoading && searchResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <SearchX className="mb-4 h-16 w-16 opacity-30" />
          <p className="text-lg font-medium text-gray-500">검색 결과가 없습니다</p>
          <p className="mt-1 text-sm">
            {location ? (
              <><span className="font-semibold text-gray-600">"{location}"</span> 지역에 해당하는 호텔을 찾지 못했습니다.</>
            ) : (
              '다른 지역이나 날짜로 다시 검색해보세요.'
            )}
          </p>
          <p className="mt-1 text-sm">다른 지역이나 날짜로 다시 검색해보세요.</p>
        </div>
      )}
      {!isLoading && searchResults.length > 0 && (
        <ul className="flex flex-col gap-4 lg:grid lg:grid-cols-5">
          {searchResults.map((hotel) => (
            <li key={hotel.hotelId} className="w-full">
              <HotelCard
                {...hotel}
                liked={true}
                handleChangeLike={() => {}}
                checkIn={checkInDate}
                checkOut={checkOutDate}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="min-h-[1px] w-full" ref={ref} />
    </div>
  );
};

export default SearchPage;
