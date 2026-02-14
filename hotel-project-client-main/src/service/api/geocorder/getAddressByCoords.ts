import kakao from '@/service/instance/kakao';
import type KakaoAddressResponse from '@/types/kakao/KakaoCoordsToAddressResponse';

/**
 * 카카오 API를 통해 해당 좌표의 주소를 패칭하는 함수
 *
 * @param Object(lat, lon)
 * @returns address_name
 */

const getAddressByCoords = async ({ lat, lon }: { lat: number; lon: number }) => {
  const response = await kakao.get<KakaoAddressResponse>(
    `/local/geo/coord2address.json?input_coord=WGS84&x=${lon}&y=${lat}`,
  );

  return response.data.documents[0].address.address_name;
};

export default getAddressByCoords;
