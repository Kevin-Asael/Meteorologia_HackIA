import {
  X,
  Thermometer,
  Droplets,
  Sun,
  CloudRain,
  Wind,
  Gauge,
  MapPin,
  Compass,
} from "lucide-react";
import type { WeatherReading } from "../lib/types";
import { findStationByCode } from "../lib/stations";

interface StationSidebarProps {
  reading: WeatherReading | null;
  onClose: () => void;
}

function compassDir(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return dirs[Math.round(deg / 45) % 8];
}

function thermColor(t: number): string {
  if (t <= 8) return "from-sky-500 to-cyan-400";
  if (t <= 15) return "from-cyan-500 to-emerald-400";
  if (t <= 22) return "from-emerald-400 to-amber-400";
  if (t <= 28) return "from-amber-400 to-orange-500";
  return "from-orange-500 to-red-600";
}

interface MetricProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  accent: string;
}

function Metric({ icon, label, value, hint, accent }: MetricProps) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-md hover:bg-white/10 transition">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-300">
        <span className="flex items-center gap-1.5">
          <span className={accent}>{icon}</span>
          {label}
        </span>
        {hint && <span className="text-slate-400 normal-case">{hint}</span>}
      </div>
      <div className="mt-1 text-2xl font-semibold text-white tabular-nums">{value}</div>
    </div>
  );
}

export default function StationSidebar({ reading, onClose }: StationSidebarProps) {
  if (!reading) return null;
  const station = findStationByCode(reading.stationCode);

  return (
    <aside
      className="
        pointer-events-auto absolute top-4 right-4 z-[1000]
        w-[340px] max-h-[calc(100vh-2rem)] overflow-y-auto
        rounded-3xl border border-white/15
        bg-slate-900/55 backdrop-blur-2xl shadow-2xl
        text-white
        animate-[fadeIn_.18s_ease-out]
      "
    >
      <header className={`relative px-5 pt-5 pb-4 rounded-t-3xl bg-gradient-to-br ${thermColor(reading.temperature)}`}>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/15 hover:bg-white/30 transition"
        >
          <X size={16} />
        </button>
        <div className="flex items-center gap-1.5 text-xs text-white/90">
          <MapPin size={12} />
          {station?.province ?? "Ecuador"}{station?.altitude ? ` · ${station.altitude} msnm` : ""}
        </div>
        <h2 className="text-2xl font-bold mt-1">{reading.stationName}</h2>
        <div className="mt-3 flex items-end gap-3">
          <div className="text-6xl font-extralight leading-none tabular-nums">
            {reading.temperature.toFixed(1)}
            <span className="text-2xl align-top ml-1">°C</span>
          </div>
          <div className="pb-1.5 text-sm text-white/90">
            <div>Humedad {reading.humidity}%</div>
            <div>Lluvia {reading.rainfall.toFixed(1)} mm</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 p-4">
        <Metric
          icon={<Thermometer size={14} />}
          label="Temperatura"
          value={`${reading.temperature.toFixed(1)}°C`}
          accent="text-orange-300"
        />
        <Metric
          icon={<Droplets size={14} />}
          label="Humedad"
          value={`${reading.humidity}%`}
          accent="text-sky-300"
        />
        <Metric
          icon={<Sun size={14} />}
          label="Radiación"
          value={`${reading.solarRadiation}`}
          hint="W/m²"
          accent="text-amber-300"
        />
        <Metric
          icon={<CloudRain size={14} />}
          label="Lluvia"
          value={`${reading.rainfall.toFixed(1)}`}
          hint="mm"
          accent="text-blue-300"
        />
        <Metric
          icon={<Wind size={14} />}
          label="Viento"
          value={`${reading.windSpeed.toFixed(1)}`}
          hint="m/s"
          accent="text-violet-300"
        />
        <Metric
          icon={<Compass size={14} />}
          label="Dirección"
          value={compassDir(reading.windDirection)}
          hint={`${reading.windDirection}°`}
          accent="text-violet-300"
        />
        <div className="col-span-2">
          <Metric
            icon={<Gauge size={14} />}
            label="Presión"
            value={`${reading.pressure}`}
            hint="hPa"
            accent="text-emerald-300"
          />
        </div>
      </div>

      <footer className="px-5 pb-4 pt-1 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Estación #{reading.stationId}</span>
        <span>
          {new Date(reading.timestamp).toLocaleTimeString("es-EC", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </footer>
    </aside>
  );
}
