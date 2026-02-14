import handleApiReqeust from '@/service/api/handleApiReqeust';
import { getHotels } from '@/service/api/hotel';
import type { Hotel } from '@/types/hotel';
import type { PaginationResult } from '@/types/pageable';
import { useState } from 'react';

const useGetHotels = ({ label, size, sort }: { label: string; size: number; sort: string }) => {
  const [hotelList, setHotelList] = useState<Hotel[]>([]);
  const [page, setPage] = useState<number>(0);
  const [canUseTrigger, setCanUseTrigger] = useState<boolean>(true);

  const handleGetHotels = async () => {
    return await getHotels({ size, page, sort });
  };

  const handleAddHotelsToList = async (): Promise<boolean> => {
    if (!canUseTrigger) return false;
    setCanUseTrigger(false);

    try {
      const result = await handleApiReqeust<PaginationResult<Hotel>>(handleGetHotels);
      if (!result?.content?.length) return false;

      const hotels = result?.content ?? [];
      setPage((prev) => prev + 1);
      setHotelList((prev) => [...prev, ...hotels]);

      // 다음 로딩 허용 (예: 1000ms 뒤에 트리거 활성화)
      setTimeout(() => setCanUseTrigger(true), 1000);

      return true;
    } catch (e) {
      console.error('호텔 불러오기 실패', e);
      return false;
    }
  };

  const hasLabel = (val: string | null) => label === val;

  const setHotelState = ({
    hotelList,
    page,
    canUseTrigger,
  }: {
    hotelList?: Hotel[];
    page?: number;
    canUseTrigger?: boolean;
  }) => {
    if (hotelList !== undefined) setHotelList(hotelList);
    if (page !== undefined) setPage(page);
    if (canUseTrigger !== undefined) setCanUseTrigger(canUseTrigger);
  };

  return {
    hotelList,
    handleAddHotelsToList,
    hasLabel,
    canUseTrigger,
    page,
    setHotelState,
  };
};

export default useGetHotels;
