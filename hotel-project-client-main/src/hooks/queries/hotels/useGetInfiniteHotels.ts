import { getAllHotels } from '@/service/api/hotel';
import buildSearchQuery from '@/utils/buildSearchQuery';
import { useInfiniteQuery } from '@tanstack/react-query';

const useGetInfiniteAllHotels = () => {
  return useInfiniteQuery({
    queryKey: ['hotels', 'all'],
    queryFn: async ({ pageParam }) => {
      return await getAllHotels(buildSearchQuery({ page: pageParam.toString(), size: '10' }));
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.last ? undefined : lastPage.pageable.pageNumber + 1;
    },
  });
};

export default useGetInfiniteAllHotels;
