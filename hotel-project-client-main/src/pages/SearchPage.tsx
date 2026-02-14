import HotelCard from '@/component/card/HotelCard';
import CardSkeleton from '@/component/common/card/ui/CardSkeleton';
import hotelKeys from '@/hooks/queries/hotels/hotelKeys';
import useObserver from '@/hooks/useObserver';
import type { SearchTerm } from '@/layout/SearchLayout';
import { getSearchHotels } from '@/service/api/hotel';
import buildSearchQuery from '@/utils/buildSearchQuery';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRouteLoaderData } from 'react-router-dom';

const SearchPage = () => {
  const { location, lat, lon, guestCount, checkInDate, checkOutDate } =
    useRouteLoaderData<SearchTerm>('search')!;

  const { data, hasNextPage, isLoading, fetchNextPage } = useInfiniteQuery({
    queryKey: hotelKeys.searchHotels({ location, guestCount, checkInDate, checkOutDate }),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      return await getSearchHotels(
        buildSearchQuery({
          lat,
          lon,
          guestCount,
          checkInDate,
          checkOutDate,
          page: pageParam.toString(),
          size: '10',
        }),
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
        <p className="flex h-full items-center justify-center">검색 결과가 존재하지 않습니다</p>
      )}
      {!isLoading && searchResults.length > 0 && (
        <ul className="flex flex-col gap-4 lg:grid lg:grid-cols-5">
          {searchResults.map((hotel) => (
            <li key={hotel.hotelId} className="w-full">
              <HotelCard {...hotel} liked={true} handleChangeLike={() => {}} />
            </li>
          ))}
        </ul>
      )}

      <div className="min-h-[1px] w-full" ref={ref} />
    </div>
  );
};

export default SearchPage;
