/**
 * key, value 형태의 객체 데이터를 queryString으로 변환 후 반환하는 유틸 함수
 *
 *
 * @param Record

 *
 * @returns string
 */

const buildSearchQuery = (param: Record<string, string>) => {
  const searchParams = new URLSearchParams();
  Object.entries(param).forEach(([key, value]) => {
    // value가 유효한 값일 때
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value.toString());
    }
  });

  return searchParams.toString();
};

export default buildSearchQuery;
