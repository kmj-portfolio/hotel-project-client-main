export default interface KakaoCoordsResponse {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };

  documents: { address: KakaoGeocodeAddress; road_address: KakaoGeocodeRoadAddress }[];
}

interface KakaoGeocodeAddress {
  address_name: string;
  b_code: string;
  h_code: string;
  main_address_no: string;
  mountain_yn: string;
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_h_name: string;
  region_3depth_name: string;
  sub_address_no: string;
  x: string;
  y: string;
}

interface KakaoGeocodeRoadAddress {
  address: string;
  address_name: string;
  address_type: string;
  road_address: string;
  x: string;
  y: string;
}
