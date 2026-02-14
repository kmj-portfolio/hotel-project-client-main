export interface HotelDetail {
  hotelId: number;
  name: string;
  address: string;
  description: string;
  latitude: number;
  longitude: number;
  starLevel: number;
  rating: number;
  reviewCount: number;
}

export interface Hotel {
  hotelId: number;
  name: string;
  address: string;
  starLevel: number;
  rating: number;
  reviewCount: number;
}

export interface HotelItem {
  address: string;
  hotelId: number;
  mainImageUrl: string;
  name: string;
  rating: number;
  reviewCount: number;
  starLevel: number;
}
