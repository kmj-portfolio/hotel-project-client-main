export type ReservationStatus =
  | 'WAITING_PAYMENT'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'COMPLETE';

// =========================================
// API Response 인터페이스 (ReservationListResponse)
// =========================================

export interface ReservationRoom {
  roomId: number;
  participantCount: number;
  subtotalPrice: number;
}

export interface Reservation {
  reservationId: number;
  reservationNumber: string;
  hotelName: string;
  hotelMainImageUrl: string;
  hotelAddress: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  reservationStatus: ReservationStatus;
  numberOfParticipants: number;
  rooms?: ReservationRoom[];
}

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

export interface ReservationResponse {
  content: Reservation[];
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

// =========================================
// 서브 컴포넌트 Props 인터페이스
// =========================================

export interface BookingStatusProps {
  status: ReservationStatus;
}

export interface HotelImageProps {
  image: string;
  hotelName: string;
}

// =========================================
// 메인 컴포넌트 Props 인터페이스
// =========================================

export interface ReservationCardProps {
  booking: Reservation;
}

// =========================================
// Common Card 컴포넌트 Props 인터페이스
// =========================================

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  shadow?: string;
  border?: string;
  rounded?: string;
  background?: string;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}
