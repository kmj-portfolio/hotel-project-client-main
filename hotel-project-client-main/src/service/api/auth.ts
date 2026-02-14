import client from '@/service/instance/client';

import handleApiReqeust from './handleApiReqeust';

import type { UserRole, UserInfo, WarnResponse, UserStatus } from '@/types/user';
import type { GeneralRegisterType, LoginType, SocialRegisterType } from '@/schema/AuthSchema';

type oAuthIdentity = 'kakao' | 'google';

const getSignUpApiUrl = (role: UserRole) => {
  if (role === 'ROLE_CUSTOMER') {
    return '/api/customers/sign-up';
  } else {
    return '/api/providers/sign-up';
  }
};

export const GeneralSignup = async (role: UserRole, data: GeneralRegisterType) => {
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
  const response = await handleApiReqeust<UserStatus>(() => client.post('/api/users/login', data));
  return response;
};

export const logout = async () => {
  await handleApiReqeust<UserRole>(() => client.post('/api/users/logout'));
};

export const oAuthLogin = async (identifier: oAuthIdentity, code: string) => {
  const response = await handleApiReqeust<WarnResponse>(() =>
    client.post(`/api/customers/${identifier}/login`, { code }),
  );

  return response;
};
