/**
 * 
 * 쿼리스트링을 key, value 형태의 객체 데이터로 반환하는 유틸 함수
 *
 * @param (url, schema : {key : defaultValue})

 *
 * @returns Record<string, string>
 */

const extractSearchParams = <T extends Record<string, string>>(url: string, schema: T) => {
  const searchParams = new URL(url).searchParams;

  return Object.entries(schema).reduce((result, [key, defaultValue]) => {
    result[key as keyof T] = (searchParams.get(key) ?? defaultValue) as T[keyof T];

    return result;
  }, {} as T);
};

export default extractSearchParams;
