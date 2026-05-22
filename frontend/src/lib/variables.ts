export type VariableCategory =
  | "humedad"
  | "temperatura"
  | "lluvia"
  | "viento"
  | "presion"
  | "radiacion"
  | "default";

export interface VariableMeta {
  category: VariableCategory;
  icon: string;
  label: string;
  gradient: Record<number, string>;
  inverted?: boolean;
}

const HUMIDITY_GRADIENT = {
  0.0: "rgba(255,255,255,0.0)",
  0.25: "rgba(200,225,255,0.55)",
  0.5: "rgba(120,170,255,0.75)",
  0.75: "rgba(40,90,210,0.9)",
  1.0: "rgba(10,30,130,1.0)",
};

const TEMP_GRADIENT = {
  0.0: "rgba(0,120,255,0.6)",
  0.3: "rgba(0,220,180,0.7)",
  0.55: "rgba(255,230,0,0.8)",
  0.8: "rgba(255,140,0,0.9)",
  1.0: "rgba(220,0,30,1.0)",
};

const RAIN_GRADIENT = {
  0.0: "rgba(255,255,255,0.0)",
  0.3: "rgba(160,210,255,0.6)",
  0.6: "rgba(70,140,230,0.8)",
  1.0: "rgba(25,55,170,1.0)",
};

const WIND_GRADIENT = {
  0.0: "rgba(240,240,200,0.4)",
  0.4: "rgba(200,170,255,0.7)",
  0.7: "rgba(150,100,230,0.85)",
  1.0: "rgba(100,40,180,1.0)",
};

const PRESSURE_GRADIENT = {
  0.0: "rgba(180,230,200,0.5)",
  0.5: "rgba(255,200,120,0.7)",
  1.0: "rgba(190,80,40,1.0)",
};

const RADIATION_GRADIENT = {
  0.0: "rgba(255,255,200,0.4)",
  0.5: "rgba(255,200,80,0.75)",
  1.0: "rgba(255,80,0,1.0)",
};

const DEFAULT_GRADIENT = {
  0.0: "rgba(0,255,0,0.3)",
  0.5: "rgba(255,255,0,0.7)",
  1.0: "rgba(255,0,0,1.0)",
};

export function classifyVariable(parameterName: string | null): VariableMeta {
  const n = (parameterName ?? "").toUpperCase();

  if (/(HUMED|HUMID)/.test(n)) {
    return {
      category: "humedad",
      icon: "💧",
      label: "Humedad",
      gradient: HUMIDITY_GRADIENT,
    };
  }
  if (/(TEMP)/.test(n)) {
    return {
      category: "temperatura",
      icon: "🌡",
      label: "Temperatura",
      gradient: TEMP_GRADIENT,
    };
  }
  if (/(LLUVIA|PRECIPIT|RAIN|PLUVI)/.test(n)) {
    return {
      category: "lluvia",
      icon: "🌧",
      label: "Lluvia",
      gradient: RAIN_GRADIENT,
    };
  }
  if (/(VIENTO|WIND|SPEED|VELOC)/.test(n)) {
    return {
      category: "viento",
      icon: "🌬",
      label: "Viento",
      gradient: WIND_GRADIENT,
    };
  }
  if (/(PRESI|PRESS|BAR)/.test(n)) {
    return {
      category: "presion",
      icon: "🎈",
      label: "Presión",
      gradient: PRESSURE_GRADIENT,
    };
  }
  if (/(RADIA|SOLAR|LUMIN)/.test(n)) {
    return {
      category: "radiacion",
      icon: "☀",
      label: "Radiación",
      gradient: RADIATION_GRADIENT,
    };
  }
  return {
    category: "default",
    icon: "📊",
    label: parameterName ?? "Variable",
    gradient: DEFAULT_GRADIENT,
  };
}
