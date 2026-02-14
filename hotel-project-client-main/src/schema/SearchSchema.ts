import { z } from 'zod';

export const SearchSchema = z.object({
  location: z
    .string({ message: '지역을 입력해주세요.' })
    .min(1, { message: '지역을 입력해주세요.' }),
  checkInDate: z
    .string({ message: '날짜를 선택해주세요.' })
    .min(1, { message: '날짜를 선택해주세요.' }),
  checkOutDate: z
    .string({ message: '날짜를 선택해주세요.' })
    .min(1, { message: '날짜를 선택해주세요.' }),
  guestCount: z.string({ message: '인원을 선택해주세요.' }),
});

export type SearchType = z.infer<typeof SearchSchema>;
