import { useController, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { GeneralRegisterSchema, type GeneralRegisterType } from '@/schema/AuthSchema';

import CommonInput from '../../common/input/CommonInput';
import RHFInput from '../../common/input/RHFInput';
import { PrimaryButton } from '@/component/common/button/PrimaryButton';
import { formatBirthDate } from '@/utils/format/formatUtil';

const GeneralRegisterFields = [
  {
    name: 'name' as const,
    label: '이름',
    placeholder: '이름을 입력해주세요.',
  },
  {
    name: 'birthdate' as const,
    label: '생년월일',
    placeholder: 'YYYYMMDD',
  },
  {
    name: 'nickname' as const,
    label: '닉네임',
    placeholder: '사용할 닉네임을 입력해주세요.',
  },
  {
    name: 'email' as const,
    label: '이메일',
    placeholder: '이메일을 입력해주세요',
  },
  {
    name: 'password' as const,
    label: '비밀번호',
    type: 'password',
    placeholder: '비밀번호를 입력해주세요',
  },
  {
    name: 'passwordConfirm' as const,
    label: '비밀번호 확인',
    type: 'password',
    placeholder: '비밀번호 확인',
  },
];

interface GeneralRegisterFormProps {
  onSubmit: (data: GeneralRegisterType) => Promise<string | void>;
}

const GeneralRegisterForm = ({ onSubmit }: GeneralRegisterFormProps) => {
  const { control, handleSubmit, formState, setError } = useForm({
    resolver: zodResolver(GeneralRegisterSchema),
    mode: 'onSubmit',
  });

  const { field: birthField, fieldState } = useController({ name: 'birthdate', control });

  const handleSubmitRegister = async (data: GeneralRegisterType) => {
    const error = await onSubmit(data);

    if (error) {
      setError('root', { message: error });
    }
  };

  return (
    <>
      {formState.errors && formState.errors.root?.message && (
        <p className="text-error py-2 text-sm">{formState.errors.root.message}</p>
      )}
      <form id="sign-up" className="space-y-4" onSubmit={handleSubmit(handleSubmitRegister)}>
        <div className="mb-4 space-y-2">
          {GeneralRegisterFields.map((field) =>
            field.name === 'birthdate' ? (
              (() => {
                return (
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
                );
              })()
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
