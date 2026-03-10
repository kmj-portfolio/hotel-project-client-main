import client from '@/service/instance/client';
import handleApiReqeust from '../handleApiReqeust';

import type { PaginationResult } from '@/types/pageable';
import type { HotelDetail, HotelItem } from '@/types/hotel';

export const getHotels = async ({
  size,
  page,
  sort,
}: {
  size: number;
  page: number;
  sort: string;
}) => {
  return (await client.get(`/api/hotels/list?page=${page}&size=${size}&sort=${sort}`)).data;
};

export const getHotelDetail = async (hotelId: number) => {
  return handleApiReqeust<HotelDetail>(() => client.get(`/api/hotels/${hotelId}`));
};

export interface HotelSearchBody {
  checkIn: string;
  checkOut: string;
  latitude: number;
  longitude: number;
  numGuest: number;
  minPrice: number;
  maxPrice: number;
  numStar: number;
}

export const getSearchHotels = async (body: HotelSearchBody, page: number, size: number) => {
  const response = await handleApiReqeust<PaginationResult<HotelItem>>(() =>
    client.post(`/api/hotels/search`, body, { params: { page, size } }),
  );
  return response;
};

export const getAllHotels = async (searchQuery: string) => {
  const response = await handleApiReqeust<PaginationResult<HotelItem>>(() =>
    client.get(`/api/hotels/list?${searchQuery}`),
  );
  return response;
};
