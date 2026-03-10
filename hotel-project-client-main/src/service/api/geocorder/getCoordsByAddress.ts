import axios from 'axios';

const cache = new Map<string, { lat: string; lon: string }>();

/**
 * Nominatim(OpenStreetMap)을 통해 주소의 좌표값을 패칭하는 함수
 * 동일 주소는 캐시에서 즉시 반환
 *
 * @param address
 * @returns lat, lon
 */
const getCoordsByAddress = async (address: string): Promise<{ lat: string; lon: string }> => {
  const key = address.trim().toLowerCase();

  if (cache.has(key)) {
    return cache.get(key)!;
  }

  const response = await axios.get<{ lat: string; lon: string }[]>(
    'https://nominatim.openstreetmap.org/search',
    {
      params: { format: 'json', q: address, limit: 1, countrycodes: 'kr' },
      headers: { 'Accept-Language': 'ko' },
    },
  );

  const result = response.data[0];
  if (!result) {
    throw new Error(`"${address}"의 위치를 찾을 수 없습니다.`);
  }

  const coords = { lat: result.lat, lon: result.lon };
  cache.set(key, coords);
  return coords;
};

export default getCoordsByAddress;
