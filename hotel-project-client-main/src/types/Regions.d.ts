// 읍면동
export interface RegionEmd {
  id: string;
  name: string;
}

// 시군구
export interface RegionSgg {
  id: string;
  name: string;
  subregions: RegionEmd[];
}

// 시도
export interface RegionSido {
  id: string;
  name: string;
  subregions: RegionSgg;
}

export type Regions = RegionSido[];

export default Regions;
