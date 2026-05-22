import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { WeatherLayer, WeatherReading } from "../lib/types";
import { MAP_CENTER, MAP_DEFAULT_ZOOM, STATIONS } from "../lib/stations";
import HeatmapLayer from "./HeatmapLayer";

interface WeatherMapProps {
  readings: WeatherReading[];
  layer: WeatherLayer;
  selectedStationId: number | null;
  onSelect: (stationId: number) => void;
}

const GRADIENTS: Record<WeatherLayer, Record<number, string>> = {
  temperature: {
    0.0: "rgba(56,189,248,0.0)",
    0.15: "rgba(56,189,248,0.7)",
    0.35: "rgba(52,211,153,0.85)",
    0.55: "rgba(251,191,36,0.9)",
    0.75: "rgba(251,113,36,0.95)",
    1.0: "rgba(239,68,68,1)",
  },
  wind: {
    0.0: "rgba(196,181,253,0.0)",
    0.2: "rgba(196,181,253,0.75)",
    0.5: "rgba(167,139,250,0.9)",
    0.8: "rgba(139,92,246,0.95)",
    1.0: "rgba(109,40,217,1)",
  },
  rain: {
    0.0: "rgba(147,197,253,0.0)",
    0.2: "rgba(147,197,253,0.8)",
    0.5: "rgba(96,165,250,0.9)",
    0.8: "rgba(59,130,246,0.95)",
    1.0: "rgba(29,78,216,1)",
  },
  humidity: {
    0.0: "rgba(94,234,212,0.0)",
    0.2: "rgba(94,234,212,0.75)",
    0.5: "rgba(45,212,191,0.9)",
    0.8: "rgba(20,184,166,0.95)",
    1.0: "rgba(13,148,136,1)",
  },
};

// Escalas absolutas para que el color sea consistente sin importar el rango actual
const LAYER_SCALE: Record<WeatherLayer, { min: number; max: number }> = {
  temperature: { min: 0, max: 30 },
  wind: { min: 0, max: 12 },
  rain: { min: 0, max: 15 },
  humidity: { min: 0, max: 100 },
};

function getMetric(layer: WeatherLayer, r: WeatherReading): number {
  switch (layer) {
    case "temperature": return r.temperature;
    case "wind": return r.windSpeed;
    case "rain": return r.rainfall;
    case "humidity": return r.humidity;
  }
}

function colorFor(layer: WeatherLayer, r: WeatherReading): string {
  switch (layer) {
    case "temperature":
      if (r.temperature <= 8) return "#0284c7";
      if (r.temperature <= 14) return "#0891b2";
      if (r.temperature <= 20) return "#059669";
      if (r.temperature <= 26) return "#d97706";
      return "#dc2626";
    case "wind":
      if (r.windSpeed < 2) return "#7c3aed";
      if (r.windSpeed < 4) return "#6d28d9";
      if (r.windSpeed < 6) return "#5b21b6";
      return "#4c1d95";
    case "rain":
      if (r.rainfall < 0.5) return "#3b82f6";
      if (r.rainfall < 2) return "#2563eb";
      if (r.rainfall < 5) return "#1d4ed8";
      return "#1e3a8a";
    case "humidity":
      if (r.humidity < 50) return "#14b8a6";
      if (r.humidity < 70) return "#0d9488";
      if (r.humidity < 85) return "#0f766e";
      return "#115e59";
  }
}

function labelFor(layer: WeatherLayer, r: WeatherReading): string {
  switch (layer) {
    case "temperature": return `${r.temperature.toFixed(1)}°`;
    case "wind": return `${r.windSpeed.toFixed(1)} m/s`;
    case "rain": return `${r.rainfall.toFixed(1)} mm`;
    case "humidity": return `${r.humidity}%`;
  }
}

function layerEffectHTML(layer: WeatherLayer, color: string, windDeg: number | null): string {
  switch (layer) {
    case "temperature":
      return `
        <div class="layer-effect layer-effect-temp" style="--effect-color: ${color}">
          <span></span><span></span><span></span><span></span>
        </div>`;
    case "rain":
      return `
        <div class="layer-effect layer-effect-rain" style="--effect-color: ${color}">
          <span></span><span></span><span></span><span></span>
        </div>`;
    case "humidity":
      return `
        <div class="layer-effect layer-effect-humidity" style="--effect-color: ${color}">
          <span></span><span></span><span></span>
        </div>`;
    case "wind":
      if (windDeg === null) return "";
      return `
        <div class="layer-effect layer-effect-wind">
          <div class="wind-arrow-rot" style="transform: rotate(${windDeg}deg)">
            <div class="wind-arrow-pulse">
              <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
                <path d="M7 0L13 14H8V20H6V14H1L7 0Z" fill="${color}" stroke="white" stroke-width="1.5"/>
              </svg>
            </div>
          </div>
        </div>`;
  }
}

function makeStationIcon(
  label: string,
  color: string,
  selected: boolean,
  layer: WeatherLayer,
  windDeg: number | null
): L.DivIcon {
  const scale = selected ? 1.12 : 1;
  const ring = selected
    ? "0 0 0 5px rgba(255,255,255,0.6), 0 0 24px rgba(0,0,0,0.35)"
    : "0 6px 18px rgba(0,0,0,0.35)";

  const effect = layerEffectHTML(layer, color, windDeg);

  const html = `
    <div style="position:relative;transform: translate(-50%, -50%) scale(${scale});display:flex;flex-direction:column;align-items:center;gap:4px;font-family: ui-sans-serif, system-ui, sans-serif;">
      ${effect}
      <div style="
        position:relative;
        background: ${color};
        color: #fff;
        font-weight: 700;
        font-size: 13px;
        padding: 6px 12px;
        border-radius: 999px;
        border: 2px solid #fff;
        box-shadow: ${ring};
        white-space: nowrap;
        text-shadow: 0 1px 2px rgba(0,0,0,0.45);
        z-index: 2;
      ">${label}</div>
      <div style="
        position:relative;
        width: 12px; height: 12px; border-radius: 50%;
        background: ${color};
        border: 2.5px solid #fff;
        box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        z-index: 2;
      "></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: `weather-marker${selected ? " is-selected" : ""}`,
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

  const heat = useMemo(() => {
    const { max } = LAYER_SCALE[layer];
    const points: Array<[number, number, number]> = [];
    for (const { station, reading } of merged) {
      if (!reading) continue;
      const value = getMetric(layer, reading);
      const v = Math.max(0, value);
      points.push([station.coords[0], station.coords[1], v]);
    }
    return { points, max };
  }, [merged, layer]);

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_DEFAULT_ZOOM}
      minZoom={7}
      maxZoom={15}
      scrollWheelZoom
      zoomControl={false}
      className="absolute inset-0 w-full h-full"
      style={{ background: "#e6ecf2" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
      />

      {heat.points.length > 0 && (
        <HeatmapLayer
          key={layer}
          points={heat.points}
          max={heat.max}
          gradient={GRADIENTS[layer]}
          radius={120}
          blur={90}
          hullPadding={30}
          edgeFeather={32}
        />
      )}

      <ZoomControl position="bottomright" />

      {merged.map(({ station, reading }) => {
        const color = reading ? colorFor(layer, reading) : "#64748b";
        const label = reading ? labelFor(layer, reading) : "—";
        const selected = selectedStationId === station.id;
        const windDeg = layer === "wind" && reading ? reading.windDirection : null;
        return (
          <Marker
            key={`${station.id}-${layer}`}
            position={station.coords}
            icon={makeStationIcon(label, color, selected, layer, windDeg)}
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
