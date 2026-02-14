import kakao from '@/service/instance/kakao';
import type KakaoCoordsResponse from '@/types/kakao/KakaoAddressToCoordsResponse';

/**
 * 카카오 API를 통해 주소의 좌표값을 패칭하는 함수
 *
 * @param adderss
 * @returns lat, lon
 */

const getCoordsByAddress = async (adderss: string) => {
  const response = await kakao.get<KakaoCoordsResponse>(
    `/local/search/address.json?query=${encodeURIComponent(adderss)}`,
  );

  const responseAddress = response.data.documents[0].address;

  return {
    lat: responseAddress.y,
    lon: responseAddress.x,
  };
};

export default getCoordsByAddress;
