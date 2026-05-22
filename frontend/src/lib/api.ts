import type { AlertItem, WeatherReading } from "./types";
import { STATIONS } from "./stations";

const API_BASE_URL =
  import.meta.env.PUBLIC_API_BASE_URL ?? "http://localhost:5000";

const REQUEST_TIMEOUT_MS = 4000;

async function request<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`API ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

function jitter(base: number, spread: number): number {
  return base + (Math.random() - 0.5) * spread;
}

function buildMockReadings(): WeatherReading[] {
  const now = new Date().toISOString();
  const baseProfile: Record<string, Partial<WeatherReading>> = {
    TULCAN: { temperature: 12.4, humidity: 78, solarRadiation: 420, rainfall: 2.1, windSpeed: 3.2, windDirection: 145, pressure: 712 },
    HUACA: { temperature: 13.1, humidity: 75, solarRadiation: 460, rainfall: 1.4, windSpeed: 2.8, windDirection: 160, pressure: 713 },
    MIRA: { temperature: 17.6, humidity: 64, solarRadiation: 620, rainfall: 0.2, windSpeed: 4.1, windDirection: 195, pressure: 770 },
    CONCEPCION: { temperature: 21.8, humidity: 58, solarRadiation: 710, rainfall: 0.0, windSpeed: 2.4, windDirection: 210, pressure: 845 },
    CAYAMBE: { temperature: 11.2, humidity: 82, solarRadiation: 380, rainfall: 3.6, windSpeed: 5.6, windDirection: 130, pressure: 720 },
    CUBA: { temperature: 12.0, humidity: 81, solarRadiation: 390, rainfall: 2.9, windSpeed: 3.0, windDirection: 150, pressure: 712 },
  };

  return STATIONS.map((s) => {
    const profile = baseProfile[s.code] ?? {};
    return {
      stationId: s.id,
      stationCode: s.code,
      stationName: s.name,
      temperature: +jitter(profile.temperature ?? 15, 1.5).toFixed(1),
      humidity: Math.max(0, Math.min(100, Math.round(jitter(profile.humidity ?? 70, 5)))),
      solarRadiation: Math.max(0, Math.round(jitter(profile.solarRadiation ?? 500, 60))),
      rainfall: Math.max(0, +jitter(profile.rainfall ?? 1, 1.2).toFixed(1)),
      windSpeed: Math.max(0, +jitter(profile.windSpeed ?? 3, 1.2).toFixed(1)),
      windDirection: Math.round(jitter(profile.windDirection ?? 180, 30)) % 360,
      pressure: Math.round(jitter(profile.pressure ?? 720, 3)),
      timestamp: now,
    };
  });
}

export async function getWeatherReadings(): Promise<{ data: WeatherReading[]; source: "api" | "mock" }> {
  try {
    const rawData = await request<any[]>("/api/WeatherMap/current");
    
    if (!Array.isArray(rawData) || rawData.length === 0) throw new Error("empty");

    const data: WeatherReading[] = rawData.map((s: any) => {
      const getVal = (nameRegex: RegExp) => 
        s.measurements.find((m: any) => nameRegex.test(m.parameterName.toUpperCase()))?.value ?? 0;

      return {
        stationId: s.stationId,
        stationCode: s.stationCode,
        stationName: s.stationName,
        temperature: getVal(/TEMP/),
        humidity: getVal(/HUMED|HUMID/),
        solarRadiation: getVal(/RADIA|SOLAR/),
        rainfall: getVal(/LLUVIA|PRECIPIT|RAIN/),
        windSpeed: getVal(/VIENTO|WIND|VELOC/),
        windDirection: getVal(/DIREC/),
        pressure: getVal(/PRESI|PRESS|BAR/),
        timestamp: s.measurements[0]?.timestamp ?? new Date().toISOString(),
      };
    });

    return { data, source: "api" };
  } catch (error) {
    console.error("API Error, using mocks:", error);
    return { data: buildMockReadings(), source: "mock" };
  }
}

export async function getAlerts(): Promise<AlertItem[]> {
  try {
    return await request<AlertItem[]>("/api/Alerts");
  } catch {
    return [];
  }
}
