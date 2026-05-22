import { useEffect, useState, useMemo } from "react";
import VariableCharts from "./VariableCharts";
import { getWeatherReadings } from "../lib/api";
import type { WeatherReading } from "../lib/types";

export default function ChartsView() {
  const [readings, setReadings] = useState<WeatherReading[]>([]);
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

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#0b1220] px-4 py-8">
      <VariableCharts readings={readings} />
    </div>
  );
}
