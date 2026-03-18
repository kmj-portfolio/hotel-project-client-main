export type PaymentStatus = 'READY' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface PaymentResponse {
  paymentId: string;
  paymentAmount: number;
  payMethod: string;
  cardPublisher?: string;
  reservationId: number;
  reservationNumber: string;
  status: PaymentStatus;
  paidAt: string;
}

export interface PaymentListResponse {
  content: PaymentResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface VerifyPaymentRequest {
  paymentId: string;
  reservationId: number;
}

export interface CancelPaymentRequest {
  paymentId: string;
  reason: string;
}
