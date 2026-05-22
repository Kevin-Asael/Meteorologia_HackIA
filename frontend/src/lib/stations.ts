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

// Convex hull (Andrew's monotone chain) — used to clip the heatmap so it only
// renders between the stations and not as blobs outside the cluster.
type Pt = { x: number; y: number };

function cross(o: Pt, a: Pt, b: Pt): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

export function convexHull(points: Pt[]): Pt[] {
  const pts = [...points].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
  if (pts.length <= 1) return pts;

  const lower: Pt[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper: Pt[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

// Expand polygon outward by `padding` pixels relative to its centroid so the
// clip mask is a bit larger than the exact station hull (avoids harsh edges).
export function expandPolygon(poly: Pt[], padding: number): Pt[] {
  if (poly.length === 0) return poly;
  const cx = poly.reduce((s, p) => s + p.x, 0) / poly.length;
  const cy = poly.reduce((s, p) => s + p.y, 0) / poly.length;
  return poly.map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return {
      x: p.x + (dx / len) * padding,
      y: p.y + (dy / len) * padding,
    };
  });
}
