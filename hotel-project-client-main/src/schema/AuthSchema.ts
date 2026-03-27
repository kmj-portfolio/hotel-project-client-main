import { z } from 'zod';

const birthdateRegex = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;

const RequiredValues = ['email', 'name', 'nickname', 'birthdate', 'phoneNumber'] as const;

export const LoginSchema = z.object({
  email: z.string().email({ message: '잘못된 이메일 형식입니다.' }),
  password: z.string(),
});

// 회원가입 베이스 스케마
const RegisterBaseSchema = z.object({
  socialId: z.string().optional(),
  email: z
    .string({ message: '이메일은 필수 입력입니다.' })
    .email({ message: '잘못된 이메일 형식입니다.' }),
  name: z.string({ message: '이름은 필수 입력입니다.' }),

  nickname: z
    .string({ message: '닉네임은 필수 입력입니다.' })
    .min(2, { message: '닉네임은 두글자 이상이어야합니다.' })
    .max(20, { message: '닉네임은 최대 20글자 입니다.' }),
  birthdate: z
    .string({ message: '생년월일은 필수 입력입니다.' })
    .regex(birthdateRegex, '올바른 형식이 아닙니다.'),
  phoneNumber: z
    .string({ message: '전화번호는 필수 입력입니다.' })
    .regex(phoneRegex, '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)'),
});

// oAuth
export const SocialRegisterSchema = RegisterBaseSchema.superRefine((val, ctx) => {
  RequiredValues.forEach((value) => {
    if (!val[value] || val[value].trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [value],
        message: '필수 입력란 입니다.',
      });
    }
  });
});

// 일반 회원가입
export const GeneralRegisterSchema = RegisterBaseSchema.extend({
  password: z
    .string({ message: '비밀번호는 필수 입력입니다.' })
    .min(10, { message: '비밀번호는 최소 10자 이상이어야 합니다.' }),
  passwordConfirm: z
    .string({ message: '비밀번호 확인은 필수 입력입니다.' })
    .min(10, { message: '비밀번호는 최소 10자 이상이어야 합니다.' }),
}).superRefine((val, ctx) => {
  if (val.password !== val.passwordConfirm) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '비밀번호가 일치하지 않습니다.',
      path: ['password'],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '비밀번호가 일치하지 않습니다.',
      path: ['passwordConfirm'],
    });
  }

  if (!val['password'] || val['passwordConfirm'].trim() === '') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '필수 입력란 입니다.',
      path: ['password', 'passwordConfirm'],
    });
  }
});

// 사업자 회원가입
export const ProviderRegisterSchema = z
  .object({
    email: z
      .string({ message: '이메일은 필수 입력입니다.' })
      .email({ message: '잘못된 이메일 형식입니다.' }),
    password: z
      .string({ message: '비밀번호는 필수 입력입니다.' })
      .min(10, { message: '비밀번호는 최소 10자 이상이어야 합니다.' }),
    passwordConfirm: z
      .string({ message: '비밀번호 확인은 필수 입력입니다.' })
      .min(10, { message: '비밀번호는 최소 10자 이상이어야 합니다.' }),
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.passwordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '비밀번호가 일치하지 않습니다.',
        path: ['password'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '비밀번호가 일치하지 않습니다.',
        path: ['passwordConfirm'],
      });
    }
  });

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: '현재 비밀번호를 입력해주세요.' }),
    newPassword: z.string().min(10, { message: '비밀번호는 최소 10자 이상이어야 합니다.' }),
    newPasswordConfirm: z.string().min(10, { message: '비밀번호는 최소 10자 이상이어야 합니다.' }),
  })
  .superRefine((val, ctx) => {
    if (val.newPassword !== val.newPasswordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '비밀번호가 일치하지 않습니다.',
        path: ['newPasswordConfirm'],
      });
    }
  });

export type ChangePasswordType = z.infer<typeof ChangePasswordSchema>;

export type LoginType = z.infer<typeof LoginSchema>;

export type RegisterBaseType = z.infer<typeof RegisterBaseSchema>;

export type SocialRegisterType = z.infer<typeof SocialRegisterSchema>;
export type GeneralRegisterType = z.infer<typeof GeneralRegisterSchema>;
export type ProviderRegisterType = z.infer<typeof ProviderRegisterSchema>;
