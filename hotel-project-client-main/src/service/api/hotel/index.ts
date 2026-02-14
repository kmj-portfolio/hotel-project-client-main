import client from '@/service/instance/client';
import handleApiReqeust from '../handleApiReqeust';

import type { PaginationResult } from '@/types/pageable';
import type { HotelItem } from '@/types/hotel';

export const getHotels = async ({
  size,
  page,
  sort,
}: {
  size: number;
  page: number;
  sort: string;
}) => {
  return (await client.get(`api/hotels/list?page=${page}&size=${size}&sort=${sort}`)).data;
};

export const getHotelDetail = async (hotelId: number) => {
  return (await client.get(`/hotels/${hotelId}`)).data;
};

export const getSearchHotels = async (searchQuery: string) => {
  const response = await handleApiReqeust<PaginationResult<HotelItem>>(() =>
    client.get(`/api/hotels/search?${searchQuery}`),
  );
  return response;
};

export const getAllHotels = async (searchQuery: string) => {
  const response = await handleApiReqeust<PaginationResult<HotelItem>>(() =>
    client.get(`/api/hotels/list?${searchQuery}`),
  );
  return response;
};
