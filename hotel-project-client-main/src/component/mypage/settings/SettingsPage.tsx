import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { ChangePasswordSchema, type ChangePasswordType } from '@/schema/AuthSchema';
import { formatPhoneNumber } from '@/utils/format/formatUtil';
import {
  getCustomerDetails,
  getProviderProfile,
  updatePassword,
  updateNickname,
} from '@/service/api/auth';
import type { CustomerDetails, ProviderProfile } from '@/types/user';
import RHFInput from '@/component/common/input/RHFInput';
import { PrimaryButton } from '@/component/common/button/PrimaryButton';
import useAuthStore from '@/stores/useAuthStore';

const NicknameSchema = z.object({
  nickname: z
    .string({ message: '닉네임을 입력해주세요.' })
    .min(3, { message: '닉네임은 세글자 이상이어야합니다.' })
    .max(16, { message: '닉네임은 최대 16글자 입니다.' }),
});
type NicknameType = z.infer<typeof NicknameSchema>;

const SettingsPage = () => {
  const { role, setUserNickName } = useAuthStore();
  const isProvider = role === 'ROLE_PROVIDER';

  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [pwSuccess, setPwSuccess] = useState('');
  const [nicknameSuccess, setNicknameSuccess] = useState('');

  const {
    control: pwControl,
    handleSubmit: handlePwSubmit,
    formState: pwFormState,
    reset: resetPw,
    setError: setPwError,
  } = useForm<ChangePasswordType>({
    resolver: zodResolver(ChangePasswordSchema),
    mode: 'onSubmit',
  });

  const {
    control: nicknameControl,
    handleSubmit: handleNicknameSubmit,
    formState: nicknameFormState,
    reset: resetNickname,
    setError: setNicknameError,
  } = useForm<NicknameType>({
    resolver: zodResolver(NicknameSchema),
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (isProvider) {
      getProviderProfile().then(setProvider).catch(() => {});
    } else {
      getCustomerDetails().then(setCustomer).catch(() => {});
    }
  }, [isProvider]);

  const onPasswordSubmit = async (data: ChangePasswordType) => {
    try {
      await updatePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      setPwSuccess('비밀번호가 성공적으로 변경되었습니다.');
      resetPw();
    } catch (err) {
      setPwError('root', { message: err as string });
    }
  };

  const onNicknameSubmit = async (data: NicknameType) => {
    try {
      await updateNickname(data.nickname);
      setCustomer((prev) => (prev ? { ...prev, nickname: data.nickname } : prev));
      setUserNickName(data.nickname);
      setNicknameSuccess('닉네임이 성공적으로 변경되었습니다.');
      resetNickname();
    } catch (err) {
      setNicknameError('root', { message: err as string });
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="mb-8 text-3xl font-bold text-gray-800">개인 설정</h1>

      {/* 내 정보 */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-700">내 정보</h2>
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-sm text-gray-500">이메일</p>
            <p className="text-gray-800">
              {isProvider ? provider?.email || '-' : customer?.email || '-'}
            </p>
          </div>
          {isProvider ? (
            <div>
              <p className="mb-1 text-sm text-gray-500">호텔명</p>
              <p className="text-gray-800">{provider?.hotelName || '-'}</p>
            </div>
          ) : (
            <>
              <div>
                <p className="mb-1 text-sm text-gray-500">닉네임</p>
                <p className="text-gray-800">{customer?.nickname || '-'}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-500">전화번호</p>
                <p className="text-gray-800">
                  {customer?.phoneNumber ? formatPhoneNumber(customer.phoneNumber) : '-'}
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 닉네임 변경 — 일반회원 전용 */}
      {!isProvider && (
        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">닉네임 변경</h2>

          {nicknameFormState.errors.root?.message && (
            <p className="mb-4 text-sm text-red-500">{nicknameFormState.errors.root.message}</p>
          )}
          {nicknameSuccess && (
            <p className="mb-4 text-sm text-green-600">{nicknameSuccess}</p>
          )}

          <form className="space-y-4" onSubmit={handleNicknameSubmit(onNicknameSubmit)}>
            <RHFInput
              name="nickname"
              label="새 닉네임"
              type="text"
              placeholder="새 닉네임을 입력해주세요 (3~16자)"
              control={nicknameControl}
            />
            <PrimaryButton full>닉네임 변경</PrimaryButton>
          </form>
        </section>
      )}

      {/* 비밀번호 변경 */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-700">비밀번호 변경</h2>

        {pwFormState.errors.root?.message && (
          <p className="mb-4 text-sm text-red-500">{pwFormState.errors.root.message}</p>
        )}
        {pwSuccess && (
          <p className="mb-4 text-sm text-green-600">{pwSuccess}</p>
        )}

        <form className="space-y-4" onSubmit={handlePwSubmit(onPasswordSubmit)}>
          <RHFInput
            name="currentPassword"
            label="현재 비밀번호"
            type="password"
            placeholder="현재 비밀번호를 입력해주세요"
            control={pwControl}
          />
          <RHFInput
            name="newPassword"
            label="새 비밀번호"
            type="password"
            placeholder="새 비밀번호를 입력해주세요 (최소 8자)"
            control={pwControl}
          />
          <RHFInput
            name="newPasswordConfirm"
            label="새 비밀번호 확인"
            type="password"
            placeholder="새 비밀번호를 다시 입력해주세요"
            control={pwControl}
          />
          <PrimaryButton full>비밀번호 변경</PrimaryButton>
        </form>
      </section>
    </div>
  );
};

export default SettingsPage;
