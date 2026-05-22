import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { WeatherLayer, WeatherReading } from "../lib/types";
import { MAP_CENTER, MAP_DEFAULT_ZOOM, STATIONS } from "../lib/stations";

interface WeatherMapProps {
  readings: WeatherReading[];
  layer: WeatherLayer;
  selectedStationId: number | null;
  onSelect: (stationId: number) => void;
}

function colorFor(layer: WeatherLayer, r: WeatherReading): string {
  switch (layer) {
    case "temperature":
      if (r.temperature <= 8) return "#38bdf8";
      if (r.temperature <= 14) return "#22d3ee";
      if (r.temperature <= 20) return "#34d399";
      if (r.temperature <= 26) return "#fbbf24";
      return "#ef4444";
    case "wind":
      if (r.windSpeed < 2) return "#c4b5fd";
      if (r.windSpeed < 4) return "#a78bfa";
      if (r.windSpeed < 6) return "#8b5cf6";
      return "#6d28d9";
    case "rain":
      if (r.rainfall < 0.5) return "#93c5fd";
      if (r.rainfall < 2) return "#60a5fa";
      if (r.rainfall < 5) return "#3b82f6";
      return "#1d4ed8";
    case "humidity":
      if (r.humidity < 50) return "#5eead4";
      if (r.humidity < 70) return "#2dd4bf";
      if (r.humidity < 85) return "#14b8a6";
      return "#0d9488";
  }
}

function labelFor(layer: WeatherLayer, r: WeatherReading): string {
  switch (layer) {
    case "temperature":
      return `${r.temperature.toFixed(1)}°`;
    case "wind":
      return `${r.windSpeed.toFixed(1)} m/s`;
    case "rain":
      return `${r.rainfall.toFixed(1)} mm`;
    case "humidity":
      return `${r.humidity}%`;
  }
}

function makeStationIcon(
  label: string,
  color: string,
  selected: boolean
): L.DivIcon {
  const scale = selected ? 1.1 : 1;
  const ring = selected ? "0 0 0 4px rgba(255,255,255,0.25)" : "0 4px 16px rgba(0,0,0,0.45)";
  const html = `
    <div style="
      transform: translate(-50%, -50%) scale(${scale});
      display:flex;flex-direction:column;align-items:center;gap:4px;
      font-family: ui-sans-serif, system-ui, sans-serif;
    ">
      <div style="
        background: ${color};
        color: #fff;
        font-weight: 700;
        font-size: 13px;
        padding: 6px 12px;
        border-radius: 999px;
        border: 2px solid rgba(255,255,255,0.85);
        box-shadow: ${ring};
        white-space: nowrap;
      ">${label}</div>
      <div style="
        width: 10px; height: 10px; border-radius: 50%;
        background: ${color};
        border: 2px solid rgba(255,255,255,0.9);
        box-shadow: 0 2px 6px rgba(0,0,0,0.5);
      "></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: "weather-marker",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function WeatherMap({
  readings,
  layer,
  selectedStationId,
  onSelect,
}: WeatherMapProps) {
  const merged = useMemo(() => {
    return STATIONS.map((s) => {
      const r = readings.find((x) => x.stationId === s.id || x.stationCode === s.code);
      return { station: s, reading: r ?? null };
    });
  }, [readings]);

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_DEFAULT_ZOOM}
      minZoom={7}
      maxZoom={15}
      scrollWheelZoom
      zoomControl={false}
      className="absolute inset-0 w-full h-full"
      style={{ background: "#0b1220" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
      />

      {merged.map(({ station, reading }) => {
        const color = reading ? colorFor(layer, reading) : "#64748b";
        const label = reading ? labelFor(layer, reading) : "—";
        const selected = selectedStationId === station.id;
        return (
          <Marker
            key={station.id}
            position={station.coords}
            icon={makeStationIcon(label, color, selected)}
            eventHandlers={{ click: () => onSelect(station.id) }}
          >
            <Tooltip direction="bottom" offset={[0, 14]} opacity={1}>
              <div className="text-xs font-semibold text-slate-800">
                {station.name}
              </div>
              <div className="text-[10px] text-slate-500">
                {station.province} · click para detalles
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
