import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { WeatherReading } from '../lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface VariableChartsProps {
  readings: WeatherReading[];
}

export default function VariableCharts({ readings }: VariableChartsProps) {
  if (!readings || readings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-slate-900/40 rounded-3xl border border-white/10 backdrop-blur-xl h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-slate-300 font-medium">Sincronizando con estaciones meteorológicas...</p>
        <p className="text-slate-500 text-sm mt-2">Obteniendo datos en tiempo real de Tulcán y sus alrededores</p>
      </div>
    );
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: { size: 12, weight: 'bold' },
          usePointStyle: true,
          padding: 20
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      y: {
        ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { size: 11 } },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 11, weight: '500' } },
        grid: { display: false },
      },
    },
  };

  const temperatureData = useMemo(() => ({
    labels: readings.map(r => r.stationName),
    datasets: [{
      label: 'Temperatura Actual',
      data: readings.map(r => r.temperature),
      backgroundColor: 'rgba(249, 115, 22, 0.7)',
      borderColor: 'rgb(249, 115, 22)',
      borderWidth: 2,
      borderRadius: 8,
      hoverBackgroundColor: 'rgba(249, 115, 22, 0.9)',
    }],
  }), [readings]);

  const humidityRainfallData = useMemo(() => ({
    labels: readings.map(r => r.stationName),
    datasets: [
      {
        label: 'Humedad Relativa (%)',
        data: readings.map(r => r.humidity),
        backgroundColor: 'rgba(14, 165, 233, 0.7)',
        borderColor: 'rgb(14, 165, 233)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Precipitación (mm)',
        data: readings.map(r => r.rainfall),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ],
  }), [readings]);

  const windSolarData = useMemo(() => ({
    labels: readings.map(r => r.stationName),
    datasets: [
      {
        label: 'Velocidad Viento (m/s)',
        data: readings.map(r => r.windSpeed),
        backgroundColor: 'rgba(168, 85, 247, 0.7)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Radiación Solar (W/m²)',
        data: readings.map(r => r.solarRadiation),
        backgroundColor: 'rgba(234, 179, 8, 0.7)',
        borderColor: 'rgb(234, 179, 8)',
        borderWidth: 2,
        borderRadius: 8,
        yAxisID: 'y1',
      }
    ],
  }), [readings]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
      <header className="text-center space-y-2 py-4">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Análisis Climático Detallado</h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Visualización intuitiva de las condiciones actuales procesadas por nuestras estaciones inteligentes.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Card 1: Temperatura */}
        <section className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl transition-all hover:border-orange-500/30">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3 space-y-4">
              <div className="h-12 w-12 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500 text-2xl">🌡</div>
              <h3 className="text-2xl font-bold text-white">Confort Térmico</h3>
              <p className="text-slate-400 leading-relaxed">
                Muestra la temperatura actual en grados Celsius (°C). Es vital para determinar el ciclo de crecimiento de los cultivos y el bienestar general en la zona.
              </p>
              <div className="pt-4 grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="text-xs text-slate-500 uppercase">Promedio</div>
                  <div className="text-xl font-bold text-white">
                    {(readings.reduce((acc, r) => acc + r.temperature, 0) / readings.length).toFixed(1)}°C
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="text-xs text-slate-500 uppercase">Estaciones</div>
                  <div className="text-xl font-bold text-white">{readings.length}</div>
                </div>
              </div>
            </div>
            <div className="lg:w-2/3 h-[400px] bg-black/20 rounded-3xl p-6 border border-white/5">
              <Bar data={temperatureData} options={commonOptions} />
            </div>
          </div>
        </section>

        {/* Card 2: Humedad y Lluvia */}
        <section className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl transition-all hover:border-sky-500/30">
          <div className="flex flex-col lg:flex-row-reverse gap-8">
            <div className="lg:w-1/3 space-y-4 text-right lg:text-left">
              <div className="h-12 w-12 bg-sky-500/20 rounded-2xl flex items-center justify-center text-sky-500 text-2xl ml-auto lg:ml-0">💧</div>
              <h3 className="text-2xl font-bold text-white">Hidratación y Precipitación</h3>
              <p className="text-slate-400 leading-relaxed">
                Comparamos la humedad del aire con la lluvia caída. Una humedad alta sin lluvia puede indicar neblina, mientras que la lluvia directa es esencial para el riego natural.
              </p>
              <div className="pt-4 flex justify-end lg:justify-start gap-3">
                <span className="px-3 py-1 bg-sky-500/10 text-sky-400 rounded-full text-xs font-bold border border-sky-500/20">Humedad: {Math.round(readings.reduce((acc, r) => acc + r.humidity, 0) / readings.length)}%</span>
                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-bold border border-green-500/20">Lluvia Total: {readings.reduce((acc, r) => acc + r.rainfall, 0).toFixed(1)} mm</span>
              </div>
            </div>
            <div className="lg:w-2/3 h-[400px] bg-black/20 rounded-3xl p-6 border border-white/5">
              <Bar data={humidityRainfallData} options={commonOptions} />
            </div>
          </div>
        </section>

        {/* Card 3: Viento y Sol */}
        <section className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl transition-all hover:border-yellow-500/30">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3 space-y-4">
              <div className="h-12 w-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-500 text-2xl">☀</div>
              <h3 className="text-2xl font-bold text-white">Energía y Dinámica</h3>
              <p className="text-slate-400 leading-relaxed">
                Analizamos la fuerza del viento y la intensidad del sol. Estos datos ayudan a predecir la evaporación del suelo y la generación de energía solar.
              </p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2 italic">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  Viento: Medido en metros por segundo.
                </li>
                <li className="flex items-center gap-2 italic">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                  Radiación: Medido en Watts por metro cuadrado.
                </li>
              </ul>
            </div>
            <div className="lg:w-2/3 h-[400px] bg-black/20 rounded-3xl p-6 border border-white/5">
              <Bar 
                data={windSolarData} 
                options={{
                  ...commonOptions,
                  scales: {
                    ...commonOptions.scales,
                    y1: {
                      type: 'linear' as const,
                      display: true,
                      position: 'right' as const,
                      grid: { drawOnChartArea: false },
                      ticks: { color: 'rgba(234, 179, 8, 0.7)', font: { size: 10 } }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
