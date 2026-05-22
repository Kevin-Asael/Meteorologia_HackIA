import { useCallback, useEffect, useState } from "react";
import WeatherMap from "./WeatherMap";
import AlertsPanel from "./AlertsPanel";
import StationSidebar from "./StationSidebar";
import LayerSelector from "./LayerSelector";
import LegendBar from "./LegendBar";
import StatsBar from "./StatsBar";
import MapHint from "./MapHint";
import { getWeatherReadings } from "../lib/api";
import type { WeatherLayer, WeatherReading } from "../lib/types";

const REFRESH_INTERVAL_MS = 60_000;

export default function Dashboard() {
  const [readings, setReadings] = useState<WeatherReading[]>([]);
  const [source, setSource] = useState<"api" | "mock" | null>(null);
  const [layer, setLayer] = useState<WeatherLayer>("temperature");
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, source } = await getWeatherReadings();
      setReadings(data);
      setSource(source);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  const selectedReading =
    selectedStationId !== null
      ? readings.find((r) => r.stationId === selectedStationId) ?? null
      : null;

  return (
    <div className="flex flex-col gap-4 p-4 min-h-[calc(100vh-72px)]">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 h-[calc(100vh-100px)]">
        <div className="relative h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0b1220]">
          <WeatherMap
            readings={readings}
            layer={layer}
            selectedStationId={selectedStationId}
            onSelect={setSelectedStationId}
          />

          <StatsBar
            readings={readings}
            source={source}
            lastUpdate={lastUpdate}
            loading={loading}
            onRefresh={load}
          />

          <LayerSelector selected={layer} onChange={setLayer} />
          <LegendBar layer={layer} />

          <StationSidebar
            reading={selectedReading}
            onClose={() => setSelectedStationId(null)}
          />

          {readings.length > 0 && selectedStationId === null && (
            <MapHint />
          )}

          {readings.length === 0 && !loading && (
            <div className="absolute inset-0 z-[900] flex items-center justify-center pointer-events-none">
              <div className="rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-white/15 px-6 py-4 text-white text-sm">
                Sin datos meteorológicos disponibles
              </div>
            </div>
          )}
        </div>

        <div className="h-full">
          <AlertsPanel />
        </div>
      </div>
    </div>
  );
}
