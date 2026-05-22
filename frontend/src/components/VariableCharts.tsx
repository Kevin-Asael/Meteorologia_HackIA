import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut, Radar, PolarArea } from "react-chartjs-2";
import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Sun,
  Gauge,
  Sparkles,
} from "lucide-react";
import type { WeatherReading } from "../lib/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend
);

interface VariableChartsProps {
  readings: WeatherReading[];
}

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 900,
    easing: "easeOutQuart" as const,
  },
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        color: "rgba(226, 232, 240, 0.85)",
        font: { size: 11, weight: 600 },
        usePointStyle: true,
        padding: 16,
        boxWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      titleColor: "#fff",
      bodyColor: "#e2e8f0",
      titleFont: { size: 13, weight: 700 },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 10,
      borderColor: "rgba(255,255,255,0.1)",
      borderWidth: 1,
      displayColors: true,
      boxPadding: 4,
    },
  },
  scales: {
    y: {
      ticks: { color: "rgba(226, 232, 240, 0.6)", font: { size: 11 } },
      grid: { color: "rgba(255, 255, 255, 0.06)" },
    },
    x: {
      ticks: { color: "rgba(226, 232, 240, 0.8)", font: { size: 11, weight: 500 } },
      grid: { display: false },
    },
  },
};

const radialOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 900, easing: "easeOutQuart" as const },
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        color: "rgba(226, 232, 240, 0.85)",
        font: { size: 11 },
        padding: 14,
        usePointStyle: true,
        boxWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      titleColor: "#fff",
      bodyColor: "#e2e8f0",
      padding: 12,
      cornerRadius: 10,
    },
  },
  scales: {
    r: {
      angleLines: { color: "rgba(255, 255, 255, 0.1)" },
      grid: { color: "rgba(255, 255, 255, 0.08)" },
      pointLabels: {
        color: "rgba(226, 232, 240, 0.9)",
        font: { size: 11, weight: 600 },
      },
      ticks: {
        color: "rgba(226, 232, 240, 0.5)",
        backdropColor: "transparent",
        font: { size: 9 },
      },
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 900, easing: "easeOutQuart" as const },
  cutout: "65%",
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        color: "rgba(226, 232, 240, 0.85)",
        font: { size: 11 },
        padding: 12,
        usePointStyle: true,
        boxWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      titleColor: "#fff",
      bodyColor: "#e2e8f0",
      padding: 12,
      cornerRadius: 10,
    },
  },
};

function ChartCard({
  title,
  description,
  icon,
  accent,
  children,
  badges,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
  badges?: Array<{ label: string; color: string }>;
}) {
  return (
    <section className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-xl">
      <div className="flex items-start gap-3 mb-4">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${accent}`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          {badges && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {badges.map((b) => (
                <span
                  key={b.label}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${b.color}`}
                >
                  {b.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="h-[320px] bg-slate-950/40 border border-white/5 rounded-2xl p-4">
        {children}
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-20 bg-slate-900/40 rounded-3xl border border-white/10 backdrop-blur-xl h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4" />
      <p className="text-slate-300 font-medium">Sincronizando con estaciones…</p>
      <p className="text-slate-500 text-sm mt-2">
        Obteniendo datos en tiempo real del Carchi
      </p>
    </div>
  );
}

export default function VariableCharts({ readings }: VariableChartsProps) {
  const stationLabels = useMemo(() => readings.map((r) => r.stationName), [readings]);

  const tempLineData = useMemo(
    () => ({
      labels: stationLabels,
      datasets: [
        {
          label: "Temperatura actual",
          data: readings.map((r) => r.temperature),
          borderColor: "rgb(249, 115, 22)",
          backgroundColor: "rgba(249, 115, 22, 0.25)",
          pointBackgroundColor: "rgb(249, 115, 22)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 9,
          tension: 0.4,
          fill: true,
          borderWidth: 3,
        },
      ],
    }),
    [readings, stationLabels]
  );

  const humidityRainBar = useMemo(
    () => ({
      labels: stationLabels,
      datasets: [
        {
          label: "Humedad (%)",
          data: readings.map((r) => r.humidity),
          backgroundColor: "rgba(14, 165, 233, 0.7)",
          borderColor: "rgb(14, 165, 233)",
          borderWidth: 2,
          borderRadius: 10,
        },
        {
          label: "Lluvia (mm)",
          data: readings.map((r) => r.rainfall),
          backgroundColor: "rgba(34, 197, 94, 0.7)",
          borderColor: "rgb(34, 197, 94)",
          borderWidth: 2,
          borderRadius: 10,
        },
      ],
    }),
    [readings, stationLabels]
  );

  const humidityDoughnut = useMemo(() => {
    const buckets = { Seca: 0, Moderada: 0, Húmeda: 0, "Muy húmeda": 0 };
    for (const r of readings) {
      if (r.humidity < 50) buckets.Seca++;
      else if (r.humidity < 70) buckets.Moderada++;
      else if (r.humidity < 85) buckets["Húmeda"]++;
      else buckets["Muy húmeda"]++;
    }
    return {
      labels: Object.keys(buckets),
      datasets: [
        {
          data: Object.values(buckets),
          backgroundColor: [
            "rgba(94, 234, 212, 0.85)",
            "rgba(45, 212, 191, 0.85)",
            "rgba(20, 184, 166, 0.85)",
            "rgba(15, 118, 110, 0.9)",
          ],
          borderColor: "rgba(15, 23, 42, 1)",
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    };
  }, [readings]);

  const radarData = useMemo(() => {
    if (readings.length === 0) return null;
    const top = readings.slice(0, 4);
    const colors = [
      { border: "rgb(249, 115, 22)", bg: "rgba(249, 115, 22, 0.18)" },
      { border: "rgb(14, 165, 233)", bg: "rgba(14, 165, 233, 0.18)" },
      { border: "rgb(168, 85, 247)", bg: "rgba(168, 85, 247, 0.18)" },
      { border: "rgb(34, 197, 94)", bg: "rgba(34, 197, 94, 0.18)" },
    ];
    return {
      labels: ["Temp °C", "Humedad %", "Lluvia mm", "Viento m/s", "Sol W/m² /10"],
      datasets: top.map((r, i) => ({
        label: r.stationName,
        data: [
          r.temperature,
          r.humidity,
          r.rainfall,
          r.windSpeed,
          r.solarRadiation / 10,
        ],
        borderColor: colors[i % colors.length].border,
        backgroundColor: colors[i % colors.length].bg,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: colors[i % colors.length].border,
      })),
    };
  }, [readings]);

  const windPolar = useMemo(
    () => ({
      labels: stationLabels,
      datasets: [
        {
          label: "Viento m/s",
          data: readings.map((r) => r.windSpeed),
          backgroundColor: readings.map((_, i) => {
            const palette = [
              "rgba(168, 85, 247, 0.7)",
              "rgba(139, 92, 246, 0.7)",
              "rgba(124, 58, 237, 0.7)",
              "rgba(109, 40, 217, 0.7)",
              "rgba(91, 33, 182, 0.7)",
              "rgba(76, 29, 149, 0.7)",
            ];
            return palette[i % palette.length];
          }),
          borderColor: "rgba(255, 255, 255, 0.15)",
          borderWidth: 2,
        },
      ],
    }),
    [readings, stationLabels]
  );

  const solarBar = useMemo(
    () => ({
      labels: stationLabels,
      datasets: [
        {
          label: "Radiación solar (W/m²)",
          data: readings.map((r) => r.solarRadiation),
          backgroundColor: readings.map((r) => {
            const pct = Math.min(1, r.solarRadiation / 800);
            const r1 = Math.round(255 * pct);
            const g1 = Math.round(220 - 100 * pct);
            return `rgba(${r1}, ${g1}, 40, 0.8)`;
          }),
          borderColor: "rgba(234, 179, 8, 0.9)",
          borderWidth: 2,
          borderRadius: 10,
        },
      ],
    }),
    [readings, stationLabels]
  );

  if (!readings || readings.length === 0) return <LoadingState />;

  const tempAvg = readings.reduce((a, r) => a + r.temperature, 0) / readings.length;
  const humAvg = readings.reduce((a, r) => a + r.humidity, 0) / readings.length;
  const rainTotal = readings.reduce((a, r) => a + r.rainfall, 0);

  return (
    <div className="max-w-[1500px] mx-auto space-y-8 pb-12">
      <header className="text-center space-y-2 py-4">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-indigo-300 mb-1">
          <Sparkles size={14} />
          Análisis multidimensional
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Visualización climática del Carchi
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Datos procesados de {readings.length} estaciones agrícolas inteligentes
          en tiempo real.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Tendencia de temperatura"
          description="Comparación de °C entre todas las estaciones."
          icon={<Thermometer size={20} className="text-orange-400" aria-hidden />}
          accent="bg-orange-500/15 border border-orange-400/30"
          badges={[
            {
              label: `Promedio ${tempAvg.toFixed(1)}°C`,
              color: "bg-orange-500/15 text-orange-200 border-orange-400/30",
            },
          ]}
        >
          <Line data={tempLineData} options={commonOptions} />
        </ChartCard>

        <ChartCard
          title="Distribución de humedad"
          description="Cuántas estaciones caen en cada categoría."
          icon={<Droplets size={20} className="text-sky-400" aria-hidden />}
          accent="bg-sky-500/15 border border-sky-400/30"
          badges={[
            {
              label: `Media ${humAvg.toFixed(0)}%`,
              color: "bg-sky-500/15 text-sky-200 border-sky-400/30",
            },
          ]}
        >
          <Doughnut data={humidityDoughnut} options={doughnutOptions} />
        </ChartCard>

        <ChartCard
          title="Humedad vs Lluvia"
          description="Relación entre humedad relativa y precipitación."
          icon={<CloudRain size={20} className="text-emerald-400" aria-hidden />}
          accent="bg-emerald-500/15 border border-emerald-400/30"
          badges={[
            {
              label: `${rainTotal.toFixed(1)} mm total`,
              color: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
            },
          ]}
        >
          <Bar data={humidityRainBar} options={commonOptions} />
        </ChartCard>

        <ChartCard
          title="Velocidad del viento"
          description="Distribución polar por estación."
          icon={<Wind size={20} className="text-violet-400" aria-hidden />}
          accent="bg-violet-500/15 border border-violet-400/30"
        >
          <PolarArea data={windPolar} options={radialOptions} />
        </ChartCard>

        <ChartCard
          title="Perfil multivariable"
          description="Las primeras 4 estaciones comparadas en 5 dimensiones."
          icon={<Gauge size={20} className="text-fuchsia-400" aria-hidden />}
          accent="bg-fuchsia-500/15 border border-fuchsia-400/30"
        >
          {radarData ? <Radar data={radarData} options={radialOptions} /> : null}
        </ChartCard>

        <ChartCard
          title="Radiación solar"
          description="Intensidad lumínica W/m² (color según valor)."
          icon={<Sun size={20} className="text-amber-400" aria-hidden />}
          accent="bg-amber-500/15 border border-amber-400/30"
        >
          <Bar data={solarBar} options={commonOptions} />
        </ChartCard>
      </div>
    </div>
  );
}
