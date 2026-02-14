import RadioInput from '@/component/common/input/RadioInput';
import { useEffect, useState } from 'react';

import HotelCard from '@/component/card/HotelCard';
import SearchForm from '@/component/form/SearchForm';

import useGetInfiniteAllHotels from '@/hooks/queries/hotels/useGetInfiniteHotels';
import CardSkeleton from '@/component/common/card/ui/CardSkeleton';
import useObserver from '@/hooks/useObserver';

const CategoryGroup = [
  {
    id: 'seoul',
    label: '서울',
  },
  {
    id: 'incheon',
    label: '인천',
  },
];

const HomePage = () => {
  const [radio, setRadio] = useState('seoul');
  const [like, setLike] = useState(false);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetching } = useGetInfiniteAllHotels();
  const { ref, isView } = useObserver();

  useEffect(() => {
    if (isView && hasNextPage) {
      fetchNextPage();
    }
  }, [isView, fetchNextPage, hasNextPage]);

  return (
    <section className="w-full px-4">
      {/* Banner */}

      <div className="relative">
        <div className="relative mb-20 hidden h-[250px] w-full flex-col items-center justify-center rounded-2xl bg-[url('/main-banner.png')] bg-cover bg-center bg-no-repeat text-white md:flex md:h-[300px]">
          <p className="font-bold md:text-2xl">당신의 여행을 더 스마트하게,</p>
          <p className="text-sm md:text-lg">가장 합리적인 호텔 예약, StaySplit</p>
        </div>
        <div className="mx-auto w-full md:absolute md:top-[82%] md:left-1/2 md:max-w-[1200px] md:-translate-x-1/2 md:px-8">
          <SearchForm />
        </div>
      </div>

      <div className="w-full">
        <h3 className="mb-2 font-bold md:text-lg">지금 인기가 가장 많은 숙소</h3>
        <ul
          aria-label="지역 카테고리"
          className="mb-4 flex flex-nowrap items-center gap-2 overflow-x-scroll"
        >
          {CategoryGroup.map((category) => (
            <li key={category.id}>
              <RadioInput
                name="category"
                id={category.id}
                label={category.label}
                checked={radio === category.id}
                onChange={(e) => setRadio(e.currentTarget.id)}
              />
            </li>
          ))}
        </ul>
        <ul className="flex flex-col gap-4 lg:grid lg:grid-cols-5">
          {!isLoading &&
            data?.pages
              .flatMap((el) => el.content)
              .map((hotel) => (
                <li key={hotel.hotelId} className="w-full">
                  <HotelCard
                    {...hotel}
                    liked={like}
                    handleChangeLike={() => setLike((prev) => !prev)}
                  />
                </li>
              ))}
          {isFetching && <CardSkeleton />}
        </ul>
        {/* Observer */}
        <div className="min-h-[1px] w-full" ref={ref} />
      </div>
    </section>
  );
};

export default HomePage;
