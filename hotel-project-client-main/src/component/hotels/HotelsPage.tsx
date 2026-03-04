import { useState, useEffect, useCallback } from 'react';
import HotelCardList from './HotelCardList';
import HotelCard from './HotelCard';
import { HotelScrollTrigger } from './HotelScrollTrigger';
import HotelsBanner from './HotelsBanner';
import HotelsSearchOptionBar from './HotelsSearchOptionBar';
import useGetHotels from '@/hooks/useGetHotels';
import { useHotelStore } from '@/stores/useHotelsStore';
import { useNavigationType } from 'react-router-dom';

const HotelsPage = () => {
  const hotelStore = useHotelStore();
  const navigationType = useNavigationType();

  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [option, setOption] = useState<string>('이름 순');

  // 각 정렬 옵션별 훅
  const HotelsByNameOrder = useGetHotels({ label: '이름 순', size: 20, sort: 'name,asc' });
  const HotelsByReviewOrder = useGetHotels({ label: '리뷰 순', size: 20, sort: 'reviewCount,asc' });
  const HotelsByRatingOrder = useGetHotels({ label: '평점 순', size: 20, sort: 'rating,asc' });

  // 현재 보여주고 있는 호텔 정렬 유형 반환
  const getCurrentHotels = useCallback(() => {
    if (HotelsByNameOrder.hasLabel(option)) return HotelsByNameOrder;
    if (HotelsByReviewOrder.hasLabel(option)) return HotelsByReviewOrder;
    return HotelsByRatingOrder;
  }, [HotelsByNameOrder, HotelsByRatingOrder, HotelsByReviewOrder, option]);

  // 현재 보여주고 있는 호텔 정렬 리스트에 호텔 추가
  const triggerHotelLoad = useCallback(async () => {
    await getCurrentHotels().handleAddHotelsToList();
  }, [getCurrentHotels]);

  // 호텔 카드 클릭시 작동할 하는 페이지 캐싱
  const handleHotelClick = useCallback(() => {
    const current = getCurrentHotels();
    hotelStore.setHotelState({
      hotelList: current.hotelList,
      page: current.page,
      canUseTrigger: current.canUseTrigger,
      scrollY: window.scrollY,
      label: option,
    });
  }, [option, getCurrentHotels, hotelStore]);

  useEffect(() => {
    if (hotelStore.label) {
      setOption(hotelStore.label);
    }
    // 위치 정보 가져오기
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition({ lat, lng });
      },
      (err) => {
        console.error('위치 정보 가져오기 실패:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // option null이면 실행 안함.
    if (option === null) return;

    const current = getCurrentHotels();
    // option 페이지가 캐싱되어있다면 해당 캐싱된 데이터를 가져옴
    // 가져오는 조건은 브라우저의 뒤로가기를 사용하였을 경우임.
    if (option === hotelStore.label && navigationType === 'POP') {
      current.setHotelState({
        canUseTrigger: hotelStore.canUseTrigger,
        page: hotelStore.page,
        hotelList: hotelStore.hotelList,
      });
      hotelStore.reset();
      requestAnimationFrame(() => {
        window.scrollTo({
          top: hotelStore.scrollY,
          behavior: 'smooth',
        });
      });
      return;
    }
    // option 페이지가 캐싱되어 있지 않다면 api요청을 통해 가져옴.
    if (current.hotelList.length === 0) {
      triggerHotelLoad();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [option]);

  const { hotelList, handleAddHotelsToList } = getCurrentHotels();

  return (
    <section className="w-full px-4">
      <HotelsBanner />
      <HotelsSearchOptionBar option={option} setOption={setOption} />

      <div className="mb-8 border-b border-gray-300 pb-1 font-sans text-4xl">호텔 목록</div>
      <div className="flex justify-center">
        {hotelList.length > 0 ? (
          <HotelCardList>
            {hotelList.map((hotel, index) => (
              <HotelCard
                handleHotelClick={handleHotelClick}
                key={index}
                hotel={hotel}
                handleChangeLike={() => {}}
              />
            ))}
            <HotelScrollTrigger onVisible={handleAddHotelsToList} />
          </HotelCardList>
        ) : (
          <div>호텔이 존재하지 않습니다.</div>
        )}
      </div>
    </section>
  );
};

export default HotelsPage;
