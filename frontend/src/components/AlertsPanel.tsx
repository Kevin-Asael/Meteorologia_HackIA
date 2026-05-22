import {
  Bot,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  WifiOff,
  X,
} from "lucide-react";
import type { AlertItem } from "../lib/types";

interface AlertsPanelProps {
  open: boolean;
  onClose: () => void;
  alerts: AlertItem[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  onRefresh: () => void;
}

type Severity = "critical" | "high" | "low" | "warning";

function classifySeverity(alertType: string | null): Severity {
  const t = (alertType ?? "").toLowerCase();
  if (t.includes("crítico") || t.includes("critico") || t.includes("critical")) return "critical";
  if (t.includes("alto") || t.includes("high")) return "high";
  if (t.includes("bajo") || t.includes("low")) return "low";
  return "warning";
}

const SEVERITY_STYLES: Record<
  Severity,
  { ring: string; chip: string; dot: string; label: string; Icon: typeof AlertTriangle }
> = {
  critical: {
    ring: "border-l-red-500 bg-red-500/10",
    chip: "bg-red-500/20 text-red-100 border-red-400/40",
    dot: "bg-red-400",
    label: "Crítico",
    Icon: AlertTriangle,
  },
  high: {
    ring: "border-l-orange-400 bg-orange-500/10",
    chip: "bg-orange-500/20 text-orange-100 border-orange-400/40",
    dot: "bg-orange-300",
    label: "Alto",
    Icon: ArrowUp,
  },
  low: {
    ring: "border-l-sky-400 bg-sky-500/10",
    chip: "bg-sky-500/20 text-sky-100 border-sky-400/40",
    dot: "bg-sky-300",
    label: "Bajo",
    Icon: ArrowDown,
  },
  warning: {
    ring: "border-l-amber-400 bg-amber-500/10",
    chip: "bg-amber-500/20 text-amber-100 border-amber-400/40",
    dot: "bg-amber-300",
    label: "Aviso",
    Icon: AlertTriangle,
  },
};

export default function AlertsPanel({
  open,
  onClose,
  alerts,
  loading,
  error,
  lastUpdate,
  onRefresh,
}: AlertsPanelProps) {
  const criticalCount = alerts.filter((a) => classifySeverity(a.alertType) === "critical").length;

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={`
          fixed inset-0 z-[1100] bg-slate-950/30 backdrop-blur-[2px]
          transition-opacity duration-200
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Agente de alertas meteorológicas"
        className={`
          fixed top-0 right-0 z-[1101] h-full w-full sm:w-[400px]
          bg-slate-900/85 backdrop-blur-2xl border-l border-white/10
          shadow-[-20px_0_60px_-10px_rgba(0,0,0,0.5)]
          text-slate-100
          flex flex-col
          transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <header className="relative px-5 py-4 bg-gradient-to-br from-indigo-600/90 via-purple-600/85 to-fuchsia-600/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
              <Bot size={22} aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base leading-tight">Agente IA Agro</h2>
              <p className="text-xs text-indigo-100/90 leading-tight">
                Anomalías en tiempo real
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold leading-none tabular-nums">{alerts.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-indigo-100/80">
                {alerts.length === 1 ? "alerta" : "alertas"}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar panel de alertas"
              className="
                ml-1 p-2 rounded-xl bg-white/10 hover:bg-white/25
                focus:outline-none focus-visible:ring-2 focus-visible:ring-white
                transition
              "
            >
              <X size={16} aria-hidden />
            </button>
          </div>

          {criticalCount > 0 && (
            <div
              role="status"
              className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/25 border border-red-300/30 text-red-50 text-xs"
            >
              <AlertTriangle size={14} aria-hidden />
              <span>
                <strong>{criticalCount}</strong>{" "}
                {criticalCount === 1 ? "alerta crítica activa" : "alertas críticas activas"}
              </span>
            </div>
          )}
        </header>

        <div
          className="flex-1 overflow-y-auto p-3 space-y-2.5 scroll-smooth"
          aria-live="polite"
          aria-busy={loading}
        >
          {loading && alerts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <RefreshCw size={20} className="animate-spin mb-2" aria-hidden />
              <p className="text-sm">Analizando estaciones…</p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-2xl p-4 bg-red-500/15 border border-red-400/30 text-red-100"
            >
              <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                <WifiOff size={14} aria-hidden /> No fue posible consultar el agente
              </div>
              <p className="text-xs text-red-200/90 mb-3">{error}</p>
              <button
                onClick={onRefresh}
                className="
                  inline-flex items-center gap-1.5 text-xs font-semibold
                  px-3 py-1.5 rounded-lg bg-red-500/30 hover:bg-red-500/50
                  border border-red-300/30
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200
                  transition
                "
              >
                <RefreshCw size={12} aria-hidden /> Reintentar
              </button>
            </div>
          )}

          {!loading && !error && alerts.length === 0 && (
            <div className="text-center py-10 px-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-3">
                <CheckCircle2 size={28} className="text-emerald-300" aria-hidden />
              </div>
              <div className="text-sm text-slate-100 font-semibold">Todo en orden</div>
              <div className="text-xs text-slate-400 mt-1">
                No se detectaron anomalías en las estaciones.
              </div>
            </div>
          )}

          {!error &&
            alerts.map((alert, idx) => {
              const sev = classifySeverity(alert.alertType);
              const styles = SEVERITY_STYLES[sev];
              const SevIcon = styles.Icon;
              return (
                <article
                  key={idx}
                  aria-label={`Alerta ${styles.label} en ${alert.stationName ?? "estación"}`}
                  className={`
                    relative rounded-2xl border-l-4 ${styles.ring}
                    border border-white/5 p-3.5
                    hover:bg-white/[0.04] transition
                  `}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full ${styles.dot} shrink-0`} aria-hidden />
                      <h3 className="font-semibold text-sm text-white truncate">
                        {alert.stationName ?? "Estación"}
                      </h3>
                    </div>
                    <span
                      className={`
                        inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                        border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap
                        ${styles.chip}
                      `}
                    >
                      <SevIcon size={10} aria-hidden />
                      {styles.label}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 mb-2.5">
                    <span className="text-slate-400">{alert.parameterName}: </span>
                    <span className="font-bold text-slate-50 tabular-nums">
                      {alert.currentValue !== null ? alert.currentValue.toFixed(2) : "—"}
                      {alert.unit ? ` ${alert.unit}` : ""}
                    </span>
                  </div>

                  {alert.recommendationText && (
                    <div className="flex items-start gap-2 text-xs text-slate-200 leading-snug bg-white/[0.04] border border-white/10 rounded-xl p-2.5">
                      <Lightbulb size={14} className="text-amber-300 shrink-0 mt-0.5" aria-hidden />
                      <p>{alert.recommendationText}</p>
                    </div>
                  )}
                </article>
              );
            })}
        </div>

        <footer className="px-4 py-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/40 shrink-0">
          <span>
            {lastUpdate
              ? `Verificado: ${lastUpdate.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}`
              : "Sin verificar"}
          </span>
          <button
            onClick={onRefresh}
            disabled={loading}
            aria-label="Actualizar alertas"
            className="
              inline-flex items-center gap-1 px-2 py-1 rounded-md
              hover:bg-white/10 disabled:opacity-40
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
              transition
            "
          >
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} aria-hidden />
            Actualizar
          </button>
        </footer>
      </aside>
    </>
  );
}
