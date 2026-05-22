import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { STATIONS, convexHull, expandPolygon } from "../lib/stations";

interface HeatmapLayerProps {
  points: Array<[number, number, number]>;
  max: number;
  gradient: Record<number, string>;
  radius?: number;
  blur?: number;
  /** Pixels added around the convex hull before feathering. */
  hullPadding?: number;
  /** Gaussian blur stdDeviation applied to the polygon mask. Higher = softer edges. */
  edgeFeather?: number;
}

/**
 * Builds a feathered SVG mask (URL-encoded data URI) that contains a single
 * polygon blurred with feGaussianBlur. When applied as `mask-image` on the
 * heatmap canvas, the gradient fades out smoothly at the polygon boundary
 * instead of getting clipped abruptly.
 */
function buildFeatheredMaskUrl(
  polygon: Array<{ x: number; y: number }>,
  width: number,
  height: number,
  feather: number
): string {
  if (polygon.length < 3 || width <= 0 || height <= 0) return "";
  const pts = polygon
    .map((p) => `${Math.round(p.x)},${Math.round(p.y)}`)
    .join(" ");
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}' preserveAspectRatio='none'>` +
    `<defs>` +
    `<filter id='f' x='-25%' y='-25%' width='150%' height='150%'>` +
    `<feGaussianBlur stdDeviation='${feather}'/>` +
    `</filter>` +
    `</defs>` +
    `<polygon points='${pts}' fill='white' filter='url(#f)'/>` +
    `</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

export default function HeatmapLayer({
  points,
  max,
  gradient,
  radius = 60,
  blur = 40,
  hullPadding = 30,
  edgeFeather = 28,
}: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;

    const layer = (L as any).heatLayer(points, {
      radius,
      blur,
      max: max > 0 ? max : 1,
      gradient,
      minOpacity: 0.4,
    });

    layer.addTo(map);

    function findHeatCanvas(): HTMLCanvasElement | null {
      const node = layer._canvas as HTMLCanvasElement | undefined;
      if (node) return node;
      return document.querySelector(
        "canvas.leaflet-heatmap-layer"
      ) as HTMLCanvasElement | null;
    }

    function applyMask() {
      const canvas = findHeatCanvas();
      if (!canvas) return;

      const w = canvas.offsetWidth || canvas.width;
      const h = canvas.offsetHeight || canvas.height;
      if (!w || !h) return;

      const stationPx = STATIONS.map((s) => {
        const point = map.latLngToContainerPoint(
          L.latLng(s.coords[0], s.coords[1])
        );
        return { x: point.x, y: point.y };
      });

      const hull = convexHull(stationPx);
      const padded = expandPolygon(hull, hullPadding);
      if (padded.length < 3) return;

      const url = buildFeatheredMaskUrl(padded, w, h, edgeFeather);
      // Clear any previous hard clip
      canvas.style.clipPath = "none";
      (canvas.style as any).webkitClipPath = "none";

      canvas.style.maskImage = url;
      (canvas.style as any).webkitMaskImage = url;
      canvas.style.maskSize = "100% 100%";
      (canvas.style as any).webkitMaskSize = "100% 100%";
      canvas.style.maskRepeat = "no-repeat";
      (canvas.style as any).webkitMaskRepeat = "no-repeat";
      canvas.style.maskMode = "alpha";
      (canvas.style as any).webkitMaskMode = "alpha";
    }

    function redraw() {
      if (typeof layer.redraw === "function") layer.redraw();
      else if (typeof layer._redraw === "function") layer._redraw();
      applyMask();
    }

    requestAnimationFrame(applyMask);
    map.on("moveend", redraw);
    map.on("zoomend", redraw);
    map.on("resize", redraw);
    map.on("viewreset", redraw);

    return () => {
      map.off("moveend", redraw);
      map.off("zoomend", redraw);
      map.off("resize", redraw);
      map.off("viewreset", redraw);
      map.removeLayer(layer);
    };
  }, [map, points, max, gradient, radius, blur, hullPadding, edgeFeather]);

  return null;
}
