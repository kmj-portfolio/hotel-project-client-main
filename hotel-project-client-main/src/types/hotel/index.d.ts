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
  mainPhotoUrl?: string;
  additionalPhotoUrls?: string[];
}

export interface PhotoDetailResponse {
  photoId: number;
  displayType: string;
  uploadedFileName: string;
  photoUrl: string;
}

export interface Hotel {
  hotelId: number;
  name: string;
  address: string;
  starLevel: number;
  rating: number;
  reviewCount: number;
}

export interface CreateHotelRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  starLevel: number;
}

export interface UpdateHotelRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  starLevel: number;
}

export interface CreateHotelResponse {
  hotelId: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  starLevel: number;
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
