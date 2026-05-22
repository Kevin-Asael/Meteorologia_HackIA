export interface WeatherReading {
  stationId: number;
  stationCode: string;
  stationName: string;
  temperature: number;
  humidity: number;
  solarRadiation: number;
  rainfall: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  timestamp: string;
}

export type WeatherLayer = "temperature" | "wind" | "rain" | "humidity";

export interface AlertItem {
  stationName: string | null;
  parameterName: string | null;
  currentValue: number | null;
  unit: string | null;
  alertType: string | null;
  recommendationText: string | null;
}
