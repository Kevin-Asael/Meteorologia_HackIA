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
    icon: <Thermometer size={16} />,
    active: "bg-gradient-to-br from-orange-500 to-red-500",
  },
  {
    id: "wind",
    label: "Viento",
    icon: <Wind size={16} />,
    active: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
  },
  {
    id: "rain",
    label: "Lluvia",
    icon: <CloudRain size={16} />,
    active: "bg-gradient-to-br from-sky-500 to-blue-600",
  },
  {
    id: "humidity",
    label: "Humedad",
    icon: <Droplets size={16} />,
    active: "bg-gradient-to-br from-cyan-500 to-teal-500",
  },
];

export default function LayerSelector({ selected, onChange }: LayerSelectorProps) {
  return (
    <div
      className="
        pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]
        rounded-2xl border border-white/15
        bg-slate-900/60 backdrop-blur-2xl shadow-2xl
        px-2 py-2 flex items-center gap-1
      "
    >
      <div className="px-2 text-[11px] uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
        <Layers size={14} /> Capa
      </div>
      <div className="h-6 w-px bg-white/15 mx-1" />
      {LAYERS.map((layer) => {
        const isActive = selected === layer.id;
        return (
          <button
            key={layer.id}
            onClick={() => onChange(layer.id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition
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
  );
}
