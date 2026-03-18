import type { ReservationDetail, ReservationResponse, ReservationStatus } from '@/types/ReservationType';
import client from '../instance/client';
import handleApiReqeust from './handleApiReqeust';

export interface ReservationParams {
  status?: ReservationStatus;
  afterDate?: string;
  page?: number;
  size?: number;
}

export interface CreateReservationRequest {
  hotelId: number;
  roomsAndQuantities: { roomId: number; quantity: number }[];
  checkInDate: string;
  checkOutDate: string;
  nicknames: string[];
  isSplitPayment: boolean;
}

export const createReservation = async (data: CreateReservationRequest) => {
  return await handleApiReqeust<{ reservationId: number; reservationNumber: string }>(() =>
    client.post('/api/reservations', data),
  );
};

export const getReservationInfo = async (params?: ReservationParams) => {
  const response = await handleApiReqeust<ReservationResponse>(() =>
    client.get('/api/reservations', {
      params: {
        status: params?.status,
        afterDate: params?.afterDate,
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    }),
  );
  return response;
};

const ALL_STATUSES: ReservationStatus[] = [
  'WAITING_PAYMENT',
  'CONFIRMED',
  'CANCELLED',
  'EXPIRED',
  'COMPLETE',
];

export const getAllReservations = async (params?: Omit<ReservationParams, 'status'>) => {
  const responses = await Promise.all(
    ALL_STATUSES.map((status) => getReservationInfo({ ...params, status, size: 100 })),
  );

  const combined = responses.flatMap((r) => r.content);
  combined.sort((a, b) => b.reservationId - a.reservationId);

  return {
    ...responses[0],
    content: combined,
    totalElements: responses.reduce((sum, r) => sum + r.totalElements, 0),
    numberOfElements: combined.length,
    empty: combined.length === 0,
    totalPages: 1,
    number: 0,
  } as ReservationResponse;
};

export const getReservationDetail = async (reservationId: number) => {
  return await handleApiReqeust<ReservationDetail>(() =>
    client.get(`/api/reservations/${reservationId}`),
  );
};

export const confirmReservation = async (reservationId: number) => {
  return await handleApiReqeust<{ reservationId: number; reservationNumber: string }>(() =>
    client.post(`/api/reservations/confirmation/${reservationId}`),
  );
};

export const cancelReservation = async (reservationId: number) => {
  return await handleApiReqeust<string>(() =>
    client.put(`/api/reservations/${reservationId}`),
  );
};
