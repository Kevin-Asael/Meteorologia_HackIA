export const MAP_CENTER: [number, number] = [0.8116, -77.7174];
export const MAP_DEFAULT_ZOOM = 10;

export interface StationLocation {
  id: number;
  name: string;
  code: string;
  coords: [number, number];
  altitude: number;
  province: string;
}

export const STATIONS: StationLocation[] = [
  {
    id: 1,
    name: "Tulcán",
    code: "TULCAN",
    coords: [0.8128, -77.7172],
    altitude: 2950,
    province: "Carchi",
  },
  {
    id: 2,
    name: "Huaca",
    code: "HUACA",
    coords: [0.7335, -77.7144],
    altitude: 2940,
    province: "Carchi",
  },
  {
    id: 3,
    name: "Mira",
    code: "MIRA",
    coords: [0.5575, -77.9531],
    altitude: 2400,
    province: "Carchi",
  },
  {
    id: 4,
    name: "Concepción",
    code: "CONCEPCION",
    coords: [0.647, -78.0152],
    altitude: 1500,
    province: "Imbabura",
  },
  {
    id: 5,
    name: "Cayambe",
    code: "CAYAMBE",
    coords: [0.0411, -78.145],
    altitude: 2830,
    province: "Pichincha",
  },
  {
    id: 6,
    name: "Cuba",
    code: "CUBA",
    coords: [0.715, -77.7935],
    altitude: 2950,
    province: "Carchi",
  },
];

export function findStationByCode(code: string | null): StationLocation | undefined {
  if (!code) return undefined;
  const norm = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return STATIONS.find((s) => s.code.replace(/[^A-Z0-9]/g, "") === norm);
}
