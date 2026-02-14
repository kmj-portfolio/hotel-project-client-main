export type BookingStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'DONE';

// =========================================
// Store 인터페이스
// =========================================

export interface ReservationRoom {
  reservationRoomId: number;
  roomId: number;
  roomType: string;
  maxOccupancy: number;
  quantity: number;
  pricePerNight: number;
  nights: number;
  subtotalPrice: number;
  roomDescription?: string;
  participantCount: number;
}

export interface Reservation {
  reservationId: number;
  userName: string;
  reservationNumber: string;
  checkInDate: string;
  checkOutDate: string;
  reservationStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'DONE';
  totalPrice: number;
  pricePaid: number;
  createdAt: string;
  hotelName: string;
  hotelAddress: string;
  hotelPhotos: string;
  hotelCheckInTime: string;
  hotelCheckOutTime: string;
  rooms: ReservationRoom[];
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
  status: BookingStatus;
}

export interface DateDisplayProps {
  date: string;
  time: string;
}

export interface RoomInfoProps {
  roomId: number;
  roomType: string;
}

export interface GuestInfoProps {
  userName: string;
  quantity: number;
  maxOccupancy: number;
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
  onDelete?: (bookingId: number) => void;
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
