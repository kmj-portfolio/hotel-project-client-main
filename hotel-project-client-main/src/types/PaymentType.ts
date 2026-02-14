export interface PaymentList {
  content: Payment[];
  pageable: PageInfo;
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export interface Payment {
  paymentId: number;
  status: PaymentState;
  paidAt: string;
  amount: number;
  method: string;
  payName: string;
  reservationId: number;
}

export type PaymentState = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'DONE';

export interface PageInfo {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  offset: number;
  paged: boolean;
  unpaged: boolean;
}
