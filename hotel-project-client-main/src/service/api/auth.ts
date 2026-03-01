import client, { setAccessToken } from '@/service/instance/client';

import handleApiReqeust from './handleApiReqeust';

import type { UserRole, UserInfo, WarnResponse, UserStatus, LoginResponse, CustomerDetails, ProviderProfile } from '@/types/user';
import type { GeneralRegisterType, ProviderRegisterType, LoginType, SocialRegisterType, ChangePasswordType } from '@/schema/AuthSchema';

type oAuthIdentity = 'kakao' | 'google';

const getSignUpApiUrl = (role: UserRole) => {
  if (role === 'ROLE_CUSTOMER') {
    return '/api/customers/sign-up';
  } else {
    return '/api/providers/sign-up';
  }
};

export const GeneralSignup = async (role: UserRole, data: GeneralRegisterType | ProviderRegisterType) => {
  const response = await handleApiReqeust<UserInfo>(() => client.post(getSignUpApiUrl(role), data));

  return response;
};

export const SocialSignup = async (data: SocialRegisterType, accountType: string) => {
  //FIXME: 서버의 getGoolgleProfile에서 유저 정보 가져오면 수정되어야함.
  const response = await handleApiReqeust<UserInfo>(() =>
    client.post('/api/customers/oauth/signup', { ...data, accountType: accountType }),
  );

  return response;
};

export const login = async (data: LoginType) => {
  const response = await handleApiReqeust<LoginResponse>(() => client.post('/api/auth/login', data));
  setAccessToken(response.accessToken);
  return response;
};

export const getAuthStatus = async () => {
  const response = await handleApiReqeust<UserStatus>(() => client.get('/api/auth/status'));
  return response;
};

export const getCustomerDetails = async () => {
  const response = await handleApiReqeust<CustomerDetails>(() => client.get('/api/customers/my'));
  return response;
};

export const getProviderProfile = async () => {
  const response = await handleApiReqeust<ProviderProfile>(() => client.get('/api/providers/profile'));
  return response;
};

export const updatePassword = async (data: Omit<ChangePasswordType, 'newPasswordConfirm'>) => {
  const response = await handleApiReqeust<string>(() => client.put('/api/auth/pw', data));
  return response;
};

export const updateNickname = async (nickname: string) => {
  const response = await handleApiReqeust<string>(() =>
    client.put('/api/customers/nickname', { nickname }),
  );
  return response;
};

export const logout = async () => {
  await handleApiReqeust<UserRole>(() => client.post('/api/auth/logout'));
  setAccessToken(null);
};

export const oAuthLogin = async (identifier: oAuthIdentity, code: string) => {
  const response = await handleApiReqeust<WarnResponse>(() =>
    client.post(`/api/customers/${identifier}/login`, { code }),
  );

  return response;
};
