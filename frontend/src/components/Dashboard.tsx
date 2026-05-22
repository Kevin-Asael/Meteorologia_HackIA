import { useEffect, useState, useMemo } from "react";
import WeatherMap from "./WeatherMap";
import AlertsPanel from "./AlertsPanel";
import VariableCharts from "./VariableCharts";
import VariableSelector from "./VariableSelector";
import StationSidebar from "./StationSidebar";
import { getWeatherReadings } from "../lib/api";
import type { WeatherLayer, WeatherReading } from "../lib/types";

export default function Dashboard() {
  const [readings, setReadings] = useState<WeatherReading[]>([]);
  const [layer, setLayer] = useState<WeatherLayer>("temperature");
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await getWeatherReadings();
        setReadings(data);
      } catch (error) {
        console.error("Error loading readings:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const selectedReading = readings.find((r) => r.stationId === selectedStationId) || null;

  // Extraer nombres de variables disponibles de las mediciones para el selector
  const availableVariables = useMemo(() => {
    const vars = new Set<string>(["Temperatura", "Humedad", "Lluvia", "Viento", "Radiación", "Presión"]);
    return Array.from(vars);
  }, []);

  // Mapear el layer interno a nombres que entiende VariableSelector
  const layerToVar = (l: WeatherLayer): string => {
    const map: Record<WeatherLayer, string> = {
      temperature: "Temperatura",
      humidity: "Humedad",
      rain: "Lluvia",
      wind: "Viento"
    };
    return map[l];
  };

  const varToLayer = (v: string | null): WeatherLayer => {
    if (!v) return "temperature";
    if (v.includes("Temp")) return "temperature";
    if (v.includes("Hum")) return "humidity";
    if (v.includes("Lluv") || v.includes("Rain")) return "rain";
    if (v.includes("Vien") || v.includes("Wind")) return "wind";
    return "temperature";
  };

  return (
    <div className="flex flex-col gap-4 p-4 min-h-[calc(100vh-72px)]">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 h-[calc(100vh-100px)]">
        <div className="relative h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <WeatherMap
            readings={readings}
            layer={layer}
            selectedStationId={selectedStationId}
            onSelect={setSelectedStationId}
          />
          <div className="absolute top-4 left-4 z-[1000]">
            <VariableSelector 
              variables={availableVariables}
              selected={layerToVar(layer)}
              onSelect={(v) => setLayer(varToLayer(v))}
            />
          </div>
          <StationSidebar
            reading={selectedReading}
            onClose={() => setSelectedStationId(null)}
          />
        </div>
        <div className="h-full">
          <AlertsPanel />
        </div>
      </div>
    </div>
  );
}
