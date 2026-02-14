import client from '../instance/client';
import handleApiReqeust from './handleApiReqeust';
import type { Payment, PaymentList } from '@/types/PaymentType';

export const getPaymentsByCustomerId = async (customerId: number) => {
  const response = await handleApiReqeust<PaymentList>(() =>
    client.get(`/api/payments/customers/${customerId}`),
  );
  return response;
};

export const getPaymentsByReservationId = async (reservationId: number) => {
  const response = await handleApiReqeust<Payment>(() =>
    client.get(`/api/payments/reservations/${reservationId}`),
  );
  return response;
};
