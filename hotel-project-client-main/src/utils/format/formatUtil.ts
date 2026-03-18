/**
 * 숫자를 쉼표가 포함된 문자열로 변환합니다.
 * 예: 1000 → "1,000", 12345678 → "12,345,678"
 *
 * @param num 변환할 숫자
 * @returns 쉼표가 포함된 문자열
 */
export const formatNumberWithComma = (num: number): string => {
  return num.toLocaleString();
};

export const formatNumberToWon = (num: number) => {
  return `${num.toLocaleString()}원`;
};

export function formatBirthDate(value: string): string {
  const onlyNums = value.replace(/\D/g, '');
  if (onlyNums.length <= 4) return onlyNums;
  if (onlyNums.length <= 6) return `${onlyNums.slice(0, 4)}-${onlyNums.slice(4)}`;
  return `${onlyNums.slice(0, 4)}-${onlyNums.slice(4, 6)}-${onlyNums.slice(6, 8)}`;
}

export function formatPhoneNumber(value: string): string {
  const onlyNums = value.replace(/\D/g, '');
  if (onlyNums.length <= 3) return onlyNums;
  if (onlyNums.length <= 7) return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
  return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`;
}

export const formatDateToISOstring = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateToYMD = (datetimeStr: string) => {
  if (!datetimeStr) return '';

  const date = new Date(datetimeStr);

  if (isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};
