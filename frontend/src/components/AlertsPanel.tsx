import { useEffect, useState } from "react";
import type { AlertItem } from "../lib/types";
import { getAlerts } from "../lib/api";

interface AlertsPanelProps {
  refreshIntervalMs?: number;
}

function severityClasses(alertType: string | null): string {
  const t = (alertType ?? "").toLowerCase();
  if (t.includes("crítico") || t.includes("critico") || t.includes("critical")) {
    return "border-red-500 bg-red-50";
  }
  if (t.includes("alto") || t.includes("high")) {
    return "border-orange-500 bg-orange-50";
  }
  if (t.includes("bajo") || t.includes("low")) {
    return "border-blue-500 bg-blue-50";
  }
  return "border-yellow-500 bg-yellow-50";
}

function severityIcon(alertType: string | null): string {
  const t = (alertType ?? "").toLowerCase();
  if (t.includes("alto") || t.includes("high")) return "↑";
  if (t.includes("bajo") || t.includes("low")) return "↓";
  return "⚠";
}

export default function AlertsPanel({ refreshIntervalMs = 30000 }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getAlerts();
        if (!cancelled) {
          setAlerts(data);
          setError(null);
          setLastUpdate(new Date());
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error desconocido");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, refreshIntervalMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [refreshIntervalMs]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base">🤖 Agente IA Agro</h2>
            <p className="text-xs text-indigo-100">Detección de anomalías en tiempo real</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold leading-none">{alerts.length}</div>
            <div className="text-[10px] text-indigo-100">alertas</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading && (
          <div className="text-sm text-gray-500 text-center py-6">Analizando datos…</div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
            Error al consultar el agente: {error}
          </div>
        )}

        {!loading && !error && alerts.length === 0 && (
          <div className="text-center py-8 px-4">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-sm text-gray-700 font-semibold">Todo en orden</div>
            <div className="text-xs text-gray-500 mt-1">
              No se detectaron anomalías en las estaciones.
            </div>
          </div>
        )}

        {!loading &&
          !error &&
          alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`border-l-4 rounded-r p-3 ${severityClasses(alert.alertType)}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="font-semibold text-sm text-gray-900">
                  {severityIcon(alert.alertType)} {alert.stationName ?? "Estación"}
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-600 whitespace-nowrap">
                  {alert.alertType ?? ""}
                </span>
              </div>

              <div className="text-xs text-gray-700 mb-2">
                <span className="font-semibold">{alert.parameterName}:</span>{" "}
                <span className="font-bold">
                  {alert.currentValue !== null ? alert.currentValue.toFixed(2) : "—"}
                  {alert.unit ? ` ${alert.unit}` : ""}
                </span>
              </div>

              {alert.recommendationText && (
                <div className="text-xs text-gray-700 leading-snug bg-white/60 rounded p-2 border border-white">
                  💡 {alert.recommendationText}
                </div>
              )}
            </div>
          ))}
      </div>

      {lastUpdate && (
        <div className="px-4 py-2 bg-gray-50 border-t text-[10px] text-gray-500 text-center">
          Última verificación: {lastUpdate.toLocaleTimeString("es-EC")}
        </div>
      )}
    </div>
  );
}
