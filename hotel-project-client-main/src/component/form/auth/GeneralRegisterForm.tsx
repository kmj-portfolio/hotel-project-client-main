import { useController, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  GeneralRegisterSchema,
  ProviderRegisterSchema,
  type GeneralRegisterType,
  type ProviderRegisterType,
} from '@/schema/AuthSchema';

import CommonInput from '../../common/input/CommonInput';
import RHFInput from '../../common/input/RHFInput';
import { PrimaryButton } from '@/component/common/button/PrimaryButton';
import { formatBirthDate, formatPhoneNumber } from '@/utils/format/formatUtil';
import type { UserRole } from '@/types/user';

const CustomerFields = [
  { name: 'name' as const, label: '이름', placeholder: '이름을 입력해주세요.' },
  { name: 'birthdate' as const, label: '생년월일', placeholder: 'YYYYMMDD' },
  { name: 'nickname' as const, label: '닉네임', placeholder: '사용할 닉네임을 입력해주세요.' },
  { name: 'phoneNumber' as const, label: '전화번호', placeholder: '010-1234-5678' },
  { name: 'email' as const, label: '이메일', placeholder: '이메일을 입력해주세요' },
  { name: 'password' as const, label: '비밀번호', type: 'password', placeholder: '비밀번호를 입력해주세요' },
  { name: 'passwordConfirm' as const, label: '비밀번호 확인', type: 'password', placeholder: '비밀번호 확인' },
];

const ProviderFields = [
  { name: 'email' as const, label: '이메일', placeholder: '이메일을 입력해주세요' },
  { name: 'password' as const, label: '비밀번호', type: 'password', placeholder: '비밀번호를 입력해주세요' },
  { name: 'passwordConfirm' as const, label: '비밀번호 확인', type: 'password', placeholder: '비밀번호 확인' },
];

interface GeneralRegisterFormProps {
  role: UserRole;
  onSubmit: (data: GeneralRegisterType | ProviderRegisterType) => Promise<string | void>;
}

const GeneralRegisterForm = ({ role, onSubmit }: GeneralRegisterFormProps) => {
  const isProvider = role === 'ROLE_PROVIDER';
  const schema = isProvider ? ProviderRegisterSchema : GeneralRegisterSchema;
  const fields = isProvider ? ProviderFields : CustomerFields;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control, handleSubmit, formState, setError } = useForm<GeneralRegisterType, any, GeneralRegisterType>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    mode: 'onSubmit',
  });

  // always call useController (hooks rule) but only render for customers
  const { field: birthField, fieldState } = useController({ name: 'birthdate', control });
  const { field: phoneField, fieldState: phoneFieldState } = useController({ name: 'phoneNumber', control });

  const handleSubmitRegister = async (data: GeneralRegisterType) => {
    const error = await onSubmit(data);
    if (error) {
      setError('root', { message: error });
    }
  };

  return (
    <>
      {formState.errors?.root?.message && (
        <p className="text-error py-2 text-sm">{formState.errors.root.message}</p>
      )}
      <form id="sign-up" className="space-y-4" onSubmit={handleSubmit(handleSubmitRegister)}>
        <div className="mb-4 space-y-2">
          {fields.map((field) =>
            field.name === 'birthdate' ? (
              <div key="birthdate">
                <CommonInput
                  {...birthField}
                  value={birthField.value ?? ''}
                  label={field.label}
                  maxLength={10}
                  placeholder={field.placeholder}
                  onChange={(e) => birthField.onChange(formatBirthDate(e.target.value))}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              </div>
            ) : field.name === 'phoneNumber' ? (
              <div key="phoneNumber">
                <CommonInput
                  {...phoneField}
                  value={phoneField.value ?? ''}
                  label={field.label}
                  maxLength={13}
                  placeholder={field.placeholder}
                  onChange={(e) => phoneField.onChange(formatPhoneNumber(e.target.value))}
                  error={!!phoneFieldState.error}
                  errorMessage={phoneFieldState.error?.message}
                />
              </div>
            ) : (
              <div key={field.name}>
                <RHFInput {...field} placeholder={field.placeholder} control={control} />
              </div>
            ),
          )}
        </div>
        <PrimaryButton form="sign-up" full>
          가입하기
        </PrimaryButton>
      </form>
    </>
  );
};

export default GeneralRegisterForm;
