import type { ReservationResponse } from '@/types/ReservationType';
import client from '../instance/client';
import handleApiReqeust from './handleApiReqeust';

export const getReservationInfo = async () => {
  const response = await handleApiReqeust<ReservationResponse>(() =>
    client.get('/api/reservations'),
  );
  return response;
};
