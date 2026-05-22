import { Activity, MapPin, RefreshCw, Wifi, WifiOff } from "lucide-react";
import type { WeatherReading } from "../lib/types";

interface StatsBarProps {
  readings: WeatherReading[];
  source: "api" | "mock" | null;
  lastUpdate: Date | null;
  loading: boolean;
  onRefresh: () => void;
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export default function StatsBar({
  readings,
  source,
  lastUpdate,
  loading,
  onRefresh,
}: StatsBarProps) {
  const tempAvg = avg(readings.map((r) => r.temperature));
  const humAvg = avg(readings.map((r) => r.humidity));
  const rainTotal = readings.reduce((a, r) => a + r.rainfall, 0);

  return (
    <div
      className="
        pointer-events-auto absolute top-4 left-4 z-[1000]
        rounded-2xl border border-white/15
        bg-slate-900/60 backdrop-blur-2xl shadow-2xl
        px-4 py-3 text-white
      "
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center">
          <Activity size={14} />
        </div>
        <div>
          <div className="text-sm font-bold leading-none">Meteorología Carchi</div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
            {source === "api" ? (
              <>
                <Wifi size={10} className="text-emerald-400" /> En vivo
              </>
            ) : source === "mock" ? (
              <>
                <WifiOff size={10} className="text-amber-400" /> Datos simulados
              </>
            ) : (
              <>Cargando…</>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-1">
        <Stat label="Estaciones" value={`${readings.length}`} icon={<MapPin size={11} />} />
        <Stat label="Temp. media" value={`${tempAvg.toFixed(1)}°`} />
        <Stat label="Humedad" value={`${humAvg.toFixed(0)}%`} />
        <Stat label="Lluvia 1h" value={`${rainTotal.toFixed(1)} mm`} />
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
        <div className="text-[10px] text-slate-400">
          {lastUpdate
            ? `Act. ${lastUpdate.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
            : "—"}
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-slate-300 hover:text-white disabled:opacity-40 transition"
          aria-label="Actualizar"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
