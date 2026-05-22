import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

interface HeatmapLayerProps {
  points: Array<[number, number, number]>;
  max: number;
  gradient: Record<number, string>;
  radius?: number;
  blur?: number;
}

export default function HeatmapLayer({
  points,
  max,
  gradient,
  radius = 60,
  blur = 40,
}: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;

    const layer = (L as any)
      .heatLayer(points, {
        radius,
        blur,
        max: max > 0 ? max : 1,
        gradient,
        minOpacity: 0.35,
      })
      .addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, points, max, gradient, radius, blur]);

  return null;
}
