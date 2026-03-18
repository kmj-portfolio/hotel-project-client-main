import client from '../instance/client';
import handleApiReqeust from './handleApiReqeust';
import type {
  VerifyPaymentRequest,
  CancelPaymentRequest,
  PaymentListResponse,
  PaymentResponse,
} from '@/types/PaymentType';

export const createPayment = async (reservationId: number) => {
  return await handleApiReqeust<PaymentResponse>(() =>
    client.post('/api/payments', { reservationId }),
  );
};

export const getMyPayments = async (page = 0, size = 20) => {
  return await handleApiReqeust<PaymentListResponse>(() =>
    client.get('/api/payments/my', { params: { page, size } }),
  );
};

export const verifyPayment = async (data: VerifyPaymentRequest) => {
  return await handleApiReqeust<PaymentResponse>(() =>
    client.post('/api/payments/verify', data),
  );
};

export const cancelPayment = async (data: CancelPaymentRequest) => {
  return await handleApiReqeust<string>(() => client.post('/api/payments/cancel', data));
};
