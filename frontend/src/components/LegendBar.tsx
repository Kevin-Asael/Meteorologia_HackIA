import type { WeatherLayer } from "../lib/types";

interface LegendBarProps {
  layer: WeatherLayer;
}

const LEGENDS: Record<
  WeatherLayer,
  { title: string; unit: string; stops: Array<{ color: string; label: string }> }
> = {
  temperature: {
    title: "Temperatura",
    unit: "°C",
    stops: [
      { color: "#38bdf8", label: "≤ 8" },
      { color: "#22d3ee", label: "8–14" },
      { color: "#34d399", label: "14–20" },
      { color: "#fbbf24", label: "20–26" },
      { color: "#ef4444", label: "> 26" },
    ],
  },
  wind: {
    title: "Velocidad del viento",
    unit: "m/s",
    stops: [
      { color: "#c4b5fd", label: "< 2" },
      { color: "#a78bfa", label: "2–4" },
      { color: "#8b5cf6", label: "4–6" },
      { color: "#6d28d9", label: "> 6" },
    ],
  },
  rain: {
    title: "Lluvia (1h)",
    unit: "mm",
    stops: [
      { color: "#93c5fd", label: "< 0.5" },
      { color: "#60a5fa", label: "0.5–2" },
      { color: "#3b82f6", label: "2–5" },
      { color: "#1d4ed8", label: "> 5" },
    ],
  },
  humidity: {
    title: "Humedad relativa",
    unit: "%",
    stops: [
      { color: "#5eead4", label: "< 50" },
      { color: "#2dd4bf", label: "50–70" },
      { color: "#14b8a6", label: "70–85" },
      { color: "#0d9488", label: "> 85" },
    ],
  },
};

export default function LegendBar({ layer }: LegendBarProps) {
  const legend = LEGENDS[layer];
  return (
    <div
      className="
        pointer-events-auto absolute bottom-6 right-6 z-[1000]
        rounded-2xl border border-white/15
        bg-slate-900/60 backdrop-blur-2xl shadow-2xl
        px-4 py-3 text-white
      "
    >
      <div className="text-[11px] uppercase tracking-wider text-slate-300 mb-2">
        {legend.title} <span className="text-slate-400">({legend.unit})</span>
      </div>
      <div className="flex items-center gap-1">
        {legend.stops.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1">
            <div
              className="h-3 w-12 rounded-sm"
              style={{ background: s.color }}
            />
            <div className="text-[10px] text-slate-200 tabular-nums">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
