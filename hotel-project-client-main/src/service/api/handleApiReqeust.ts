import axios, { type AxiosResponse } from 'axios';

import type Response from '@/types/Responsne';

/**
 * 모든 Reqeust 요청을 보낼 때 사용하는 함수,
 * Reqeust Error시 string 타입 에러 메세지만 반환함
 *
 * 해당 함수 호출부에서 try/catch 블럭으로 에러핸들링
 *
 * Response 데이터 타입을 제네릭 형태로 넣어줘야함
 *
 * ex) handleApiReqeust<DataType>(() =>client.get(endPoint))
 * @param function
 * @returns ResponseData
 */

const handleApiReqeust = async <T>(
  fetchApi: () => Promise<AxiosResponse<Response<T>>>,
): Promise<T> => {
  try {
    const response = await fetchApi();
    //FIXME: 개발 완료 후 console 삭제
    console.log(response);
    if (response.data.resultCode === 'SUCCESS') {
      return response.data.result;
    }

    // resultCode != SUCCESS 일 시 모든 요청 throw
    throw response.data.result;
  } catch (error) {
    console.log('handlReqeustError', error);
    if (axios.isAxiosError<Response<T>>(error)) {
      if (error.response && error.response.data.resultCode === 'ERROR') {
        // 요청 에러
        throw error.response.data.result || '요청을 정상적으로 처리하지 못했습니다.';
      }

      if (error.status === 500 || error.status === 403) {
        // 500 -> 서버에러
        throw '서버에서 오류가 발생했습니다.';
      }

      throw error.response?.data.result;
    }

    // 기타 에러
    throw error;
  }
};

export default handleApiReqeust;
