import { Thermometer, Wind, CloudRain, Droplets, Layers } from "lucide-react";
import type { WeatherLayer } from "../lib/types";

interface LayerSelectorProps {
  selected: WeatherLayer;
  onChange: (layer: WeatherLayer) => void;
}

const LAYERS: Array<{
  id: WeatherLayer;
  label: string;
  icon: React.ReactNode;
  active: string;
}> = [
  {
    id: "temperature",
    label: "Temperatura",
    icon: <Thermometer size={16} aria-hidden />,
    active: "bg-gradient-to-br from-orange-500 to-red-500",
  },
  {
    id: "wind",
    label: "Viento",
    icon: <Wind size={16} aria-hidden />,
    active: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
  },
  {
    id: "rain",
    label: "Lluvia",
    icon: <CloudRain size={16} aria-hidden />,
    active: "bg-gradient-to-br from-sky-500 to-blue-600",
  },
  {
    id: "humidity",
    label: "Humedad",
    icon: <Droplets size={16} aria-hidden />,
    active: "bg-gradient-to-br from-cyan-500 to-teal-500",
  },
];

const LEGENDS: Record<
  WeatherLayer,
  { unit: string; stops: Array<{ color: string; label: string }> }
> = {
  temperature: {
    unit: "°C",
    stops: [
      { color: "#38bdf8", label: "≤8" },
      { color: "#22d3ee", label: "8–14" },
      { color: "#34d399", label: "14–20" },
      { color: "#fbbf24", label: "20–26" },
      { color: "#ef4444", label: ">26" },
    ],
  },
  wind: {
    unit: "m/s",
    stops: [
      { color: "#c4b5fd", label: "<2" },
      { color: "#a78bfa", label: "2–4" },
      { color: "#8b5cf6", label: "4–6" },
      { color: "#6d28d9", label: ">6" },
    ],
  },
  rain: {
    unit: "mm",
    stops: [
      { color: "#93c5fd", label: "<0.5" },
      { color: "#60a5fa", label: "0.5–2" },
      { color: "#3b82f6", label: "2–5" },
      { color: "#1d4ed8", label: ">5" },
    ],
  },
  humidity: {
    unit: "%",
    stops: [
      { color: "#5eead4", label: "<50" },
      { color: "#2dd4bf", label: "50–70" },
      { color: "#14b8a6", label: "70–85" },
      { color: "#0d9488", label: ">85" },
    ],
  },
};

export default function LayerSelector({ selected, onChange }: LayerSelectorProps) {
  const legend = LEGENDS[selected];

  return (
    <div
      role="toolbar"
      aria-label="Capa meteorológica"
      className="
        pointer-events-auto absolute bottom-5 left-1/2 -translate-x-1/2 z-[1000]
        rounded-2xl border border-white/15
        bg-slate-900/70 backdrop-blur-2xl shadow-2xl
        text-white
        max-w-[calc(100%-2rem)]
      "
    >
      <div className="px-2 py-2 flex items-center gap-1 flex-wrap">
        <div className="px-2 text-[11px] uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Layers size={14} aria-hidden /> Capa
        </div>
        <div className="h-6 w-px bg-white/15 mx-1" />
        {LAYERS.map((layer) => {
          const isActive = selected === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => onChange(layer.id)}
              aria-pressed={isActive}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition
                focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
                ${isActive
                  ? `${layer.active} text-white shadow-lg`
                  : "text-slate-200 hover:bg-white/10"
                }
              `}
            >
              {layer.icon}
              <span className="hidden sm:inline">{layer.label}</span>
            </button>
          );
        })}
      </div>

      <div className="px-3 pb-2 pt-1 border-t border-white/10 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider text-slate-400">
          Escala ({legend.unit})
        </span>
        <div className="flex items-center gap-px rounded-md overflow-hidden">
          {legend.stops.map((s) => (
            <div
              key={s.label}
              title={`${s.label} ${legend.unit}`}
              className="h-2.5 w-9"
              style={{ background: s.color }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-300 tabular-nums">
          {legend.stops.map((s) => (
            <span key={s.label}>{s.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
