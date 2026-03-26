export interface UserInfo {
  id: number;
  email: string;
  name: string;
  birthDate: string;
  nickname: string;
}

export interface CustomerDetails {
  id: number;
  email: string;
  name: string;
  phoneNumber: string;
  birthdate: string;
  nickname: string;
}

export type UserRole = 'ROLE_PROVIDER' | 'ROLE_CUSTOMER' | null;

export interface UserStatus {
  email: string;
  role: UserRole;
  loggedIn: boolean;
}

export interface LoginResponse {
  accessToken: string;
  role: UserRole;
}

export interface ProviderProfile {
  email: string;
  hotelName: string | null;
  hotelId: number | null;
}

export interface WarnResponse {
  code: string;
  data: string;
}

export interface GoogleLoginResponse {
  needsSignup: boolean;
  accessToken: string | null;
  role: string | null;
  socialId: string | null;
  email: string | null;
  name: string | null;
}
