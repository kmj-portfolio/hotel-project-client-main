export type ReservationStatus =
  | 'WAITING_PAYMENT'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'COMPLETE';

export interface ParticipantDetail {
  email: string;
  name: string;
  splitAmount: number;
  paymentStatus: string;
}

export interface ReservedRoomDetail {
  roomId: number;
  roomType: string;
  quantity: number;
  pricePerNight: number;
  nights: number;
  subTotal: number;
}

export interface ReservationDetail {
  reservationId: number;
  reservationNumber: string;
  reservationStatus: ReservationStatus;
  nights: number;
  checkIn: string;
  checkOut: string;
  participants: ParticipantDetail[];
  rooms: ReservedRoomDetail[];
  totalPrice: number;
  pricePaid: number;
  hotelName: string;
  hotelAddress: string;
  hotelMainImageUrl: string;
}

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
  onPaymentComplete?: () => void;
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
