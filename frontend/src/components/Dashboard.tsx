import { useCallback, useEffect, useState } from "react";
import WeatherMap from "./WeatherMap";
import AlertsPanel from "./AlertsPanel";
import AlertsToggle from "./AlertsToggle";
import StationSidebar from "./StationSidebar";
import LayerSelector from "./LayerSelector";
import StatsBar from "./StatsBar";
import MapHint from "./MapHint";
import { getWeatherReadings } from "../lib/api";
import { useAlerts } from "../lib/useAlerts";
import type { WeatherLayer, WeatherReading } from "../lib/types";

const REFRESH_INTERVAL_MS = 60_000;

function criticalFromAlerts(alerts: { alertType: string | null }[]): number {
  return alerts.filter((a) => {
    const t = (a.alertType ?? "").toLowerCase();
    return t.includes("crítico") || t.includes("critico") || t.includes("critical");
  }).length;
}

export default function Dashboard() {
  const [readings, setReadings] = useState<WeatherReading[]>([]);
  const [source, setSource] = useState<"api" | "mock" | null>(null);
  const [layer, setLayer] = useState<WeatherLayer>("temperature");
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const alertsState = useAlerts();

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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (alertsOpen) setAlertsOpen(false);
        else if (selectedStationId !== null) setSelectedStationId(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [alertsOpen, selectedStationId]);

  const selectedReading =
    selectedStationId !== null
      ? readings.find((r) => r.stationId === selectedStationId) ?? null
      : null;

  const criticalCount = criticalFromAlerts(alertsState.alerts);
  const showStationSidebar = selectedStationId !== null && !alertsOpen;

  return (
    <div className="p-4 h-[calc(100vh-72px)]">
      <div className="relative h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#e6ecf2]">
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

        {!alertsOpen && selectedStationId === null && (
          <AlertsToggle
            count={alertsState.alerts.length}
            criticalCount={criticalCount}
            onOpen={() => setAlertsOpen(true)}
          />
        )}

        {showStationSidebar && (
          <StationSidebar
            reading={selectedReading}
            onClose={() => setSelectedStationId(null)}
          />
        )}

        {readings.length > 0 && selectedStationId === null && !alertsOpen && (
          <MapHint />
        )}

        <AlertsPanel
          open={alertsOpen}
          onClose={() => setAlertsOpen(false)}
          alerts={alertsState.alerts}
          loading={alertsState.loading}
          error={alertsState.error}
          lastUpdate={alertsState.lastUpdate}
          onRefresh={alertsState.reload}
        />

        {readings.length === 0 && !loading && (
          <div className="absolute inset-0 z-[900] flex items-center justify-center pointer-events-none">
            <div className="rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-white/15 px-6 py-4 text-white text-sm">
              Sin datos meteorológicos disponibles
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
