import { useEffect, useMemo, useState } from "react";
import {
  Download,
  X,
  Calendar,
  MapPin,
  Tag,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  buildReportCsvUrl,
  getReportMetadata,
  type ReportMetadata,
  type ReportStation,
  type ReportVariable,
} from "../lib/api";

interface ReportBuilderProps {
  open: boolean;
  onClose: () => void;
}

type Preset = "1h" | "24h" | "7d" | "30d" | "custom";

function toLocalISODate(date: Date): string {
  const tzOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
}

function presetRange(preset: Preset): { start: string; end: string } | null {
  if (preset === "custom") return null;
  const now = new Date();
  const end = toLocalISODate(now);
  const start = new Date(now);
  switch (preset) {
    case "1h":
      start.setHours(start.getHours() - 1);
      break;
    case "24h":
      start.setDate(start.getDate() - 1);
      break;
    case "7d":
      start.setDate(start.getDate() - 7);
      break;
    case "30d":
      start.setDate(start.getDate() - 30);
      break;
  }
  return { start: toLocalISODate(start), end };
}

export default function ReportBuilder({ open, onClose }: ReportBuilderProps) {
  const [metadata, setMetadata] = useState<ReportMetadata | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [selectedStations, setSelectedStations] = useState<Set<number>>(new Set());
  const [selectedVariables, setSelectedVariables] = useState<Set<string>>(new Set());
  const [preset, setPreset] = useState<Preset>("7d");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingMeta(true);
    setMetaError(null);
    getReportMetadata()
      .then((m) => {
        if (cancelled) return;
        setMetadata(m);
      })
      .catch((e) => {
        if (cancelled) return;
        setMetaError(e instanceof Error ? e.message : "Error desconocido");
      })
      .finally(() => {
        if (!cancelled) setLoadingMeta(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (preset === "custom") return;
    const r = presetRange(preset);
    if (r) {
      setStartDate(r.start);
      setEndDate(r.end);
    }
  }, [preset]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const stationList = metadata?.stations ?? [];
  const variableList = metadata?.variables ?? [];

  const toggle = <T,>(set: Set<T>, item: T): Set<T> => {
    const next = new Set(set);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    return next;
  };

  function selectAllStations() {
    setSelectedStations(new Set(stationList.map((s) => s.locId)));
  }
  function clearStations() {
    setSelectedStations(new Set());
  }
  function selectAllVariables() {
    setSelectedVariables(
      new Set(variableList.map((v) => v.name ?? "").filter(Boolean))
    );
  }
  function clearVariables() {
    setSelectedVariables(new Set());
  }

  function resetFilters() {
    setSelectedStations(new Set());
    setSelectedVariables(new Set());
    setPreset("7d");
  }

  const summary = useMemo(() => {
    const parts: string[] = [];
    parts.push(
      selectedStations.size === 0
        ? "todas las estaciones"
        : `${selectedStations.size} estación${selectedStations.size === 1 ? "" : "es"}`
    );
    parts.push(
      selectedVariables.size === 0
        ? "todas las variables"
        : `${selectedVariables.size} variable${selectedVariables.size === 1 ? "" : "s"}`
    );
    if (startDate && endDate) parts.push(`${startDate} → ${endDate}`);
    else if (startDate) parts.push(`desde ${startDate}`);
    else if (endDate) parts.push(`hasta ${endDate}`);
    else parts.push("sin rango de fechas");
    return parts.join(" · ");
  }, [selectedStations, selectedVariables, startDate, endDate]);

  async function handleDownload() {
    const url = buildReportCsvUrl({
      locIds: Array.from(selectedStations),
      variables: Array.from(selectedVariables),
      startDate: startDate || null,
      endDate: endDate || null,
    });

    setDownloading(true);
    try {
      // Forzamos descarga vía link temporal — preserva nombre de archivo del header.
      const a = document.createElement("a");
      a.href = url;
      a.rel = "noopener";
      a.download = "";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={`
          fixed inset-0 z-[1200] bg-slate-950/55 backdrop-blur-sm
          transition-opacity duration-200
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Generador de reporte CSV"
        className={`
          fixed left-1/2 top-1/2 z-[1201]
          w-[min(560px,calc(100%-2rem))] max-h-[calc(100vh-3rem)]
          -translate-x-1/2 -translate-y-1/2
          rounded-3xl border border-white/15
          bg-slate-900/90 backdrop-blur-2xl shadow-2xl
          text-slate-100 flex flex-col overflow-hidden
          transition-all duration-200
          ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
        `}
      >
        <header className="relative px-6 py-4 bg-gradient-to-br from-emerald-600/90 via-teal-600/85 to-cyan-600/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center">
              <Download size={22} aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base leading-tight">Generar reporte CSV</h2>
              <p className="text-xs text-emerald-50/85 leading-tight">
                Filtra y descarga el historial meteorológico
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="
                p-2 rounded-xl bg-white/10 hover:bg-white/25
                focus:outline-none focus-visible:ring-2 focus-visible:ring-white
                transition
              "
            >
              <X size={16} aria-hidden />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {metaError && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-100 text-xs"
            >
              <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden />
              <div>
                No fue posible cargar el catálogo de estaciones/variables.
                Puedes seguir generando el CSV sin filtros explícitos.
                <div className="text-amber-200/70 mt-0.5">{metaError}</div>
              </div>
            </div>
          )}

          {/* SECCIÓN: FECHAS */}
          <section aria-label="Rango de fechas">
            <SectionHeader icon={<Calendar size={14} aria-hidden />} title="Rango de fechas" />
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(["1h", "24h", "7d", "30d", "custom"] as Preset[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPreset(p)}
                  aria-pressed={preset === p}
                  className={`
                    px-3 py-1.5 rounded-xl text-xs font-medium transition
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300
                    ${preset === p
                      ? "bg-emerald-500/30 text-emerald-50 border border-emerald-400/60"
                      : "bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10"
                    }
                  `}
                >
                  {p === "1h" && "Última hora"}
                  {p === "24h" && "24 horas"}
                  {p === "7d" && "7 días"}
                  {p === "30d" && "30 días"}
                  {p === "custom" && "Personalizado"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DateField
                label="Desde"
                value={startDate}
                onChange={(v) => {
                  setStartDate(v);
                  setPreset("custom");
                }}
                max={endDate || undefined}
              />
              <DateField
                label="Hasta"
                value={endDate}
                onChange={(v) => {
                  setEndDate(v);
                  setPreset("custom");
                }}
                min={startDate || undefined}
              />
            </div>
          </section>

          {/* SECCIÓN: ESTACIONES */}
          <section aria-label="Estaciones">
            <SectionHeader
              icon={<MapPin size={14} aria-hidden />}
              title="Estaciones"
              right={
                stationList.length > 0 && (
                  <SelectAllBar
                    countSelected={selectedStations.size}
                    countTotal={stationList.length}
                    onAll={selectAllStations}
                    onNone={clearStations}
                  />
                )
              }
            />
            {loadingMeta ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
                <Loader2 size={14} className="animate-spin" aria-hidden /> Cargando estaciones…
              </div>
            ) : stationList.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                Sin estaciones disponibles. Se descargarán todas.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {stationList.map((s) => (
                  <StationChip
                    key={s.locId}
                    station={s}
                    checked={selectedStations.has(s.locId)}
                    onToggle={() =>
                      setSelectedStations((prev) => toggle(prev, s.locId))
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {/* SECCIÓN: VARIABLES */}
          <section aria-label="Variables">
            <SectionHeader
              icon={<Tag size={14} aria-hidden />}
              title="Variables"
              right={
                variableList.length > 0 && (
                  <SelectAllBar
                    countSelected={selectedVariables.size}
                    countTotal={variableList.length}
                    onAll={selectAllVariables}
                    onNone={clearVariables}
                  />
                )
              }
            />
            {loadingMeta ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
                <Loader2 size={14} className="animate-spin" aria-hidden /> Cargando variables…
              </div>
            ) : variableList.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                Sin variables disponibles. Se descargarán todas.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {variableList.map((v) => (
                  <VariableChip
                    key={v.parId}
                    variable={v}
                    checked={!!v.name && selectedVariables.has(v.name)}
                    onToggle={() => {
                      if (!v.name) return;
                      setSelectedVariables((prev) => toggle(prev, v.name as string));
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          {/* RESUMEN */}
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-400/25 px-4 py-3 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-emerald-300 mt-0.5 shrink-0" aria-hidden />
              <div>
                <div className="font-semibold text-emerald-100 mb-0.5">Resumen</div>
                <p className="text-emerald-50/80">{summary}</p>
                <p className="text-emerald-200/60 mt-1 text-[11px]">
                  Tip: deja un filtro vacío para incluir <em>todo</em> en esa dimensión.
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="px-5 py-3 border-t border-white/10 bg-slate-950/40 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={resetFilters}
            className="
              inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg
              text-slate-300 hover:bg-white/5
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
              transition
            "
          >
            <RotateCcw size={13} aria-hidden /> Limpiar
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="
              inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
              bg-gradient-to-br from-emerald-500 to-teal-500
              text-white text-sm font-semibold
              hover:scale-[1.02] active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300
              shadow-lg transition
            "
          >
            {downloading ? (
              <>
                <Loader2 size={15} className="animate-spin" aria-hidden /> Descargando…
              </>
            ) : (
              <>
                <Download size={15} aria-hidden /> Descargar CSV
              </>
            )}
          </button>
        </footer>
      </div>
    </>
  );
}

function SectionHeader({
  icon,
  title,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
        {icon}
        {title}
      </div>
      {right}
    </div>
  );
}

function SelectAllBar({
  countSelected,
  countTotal,
  onAll,
  onNone,
}: {
  countSelected: number;
  countTotal: number;
  onAll: () => void;
  onNone: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="text-slate-400 tabular-nums">
        {countSelected}/{countTotal}
      </span>
      <button
        onClick={onAll}
        className="text-emerald-300 hover:text-emerald-200 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 rounded px-1"
      >
        Todas
      </button>
      <button
        onClick={onNone}
        className="text-slate-400 hover:text-slate-200 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded px-1"
      >
        Ninguna
      </button>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        className="
          mt-1 w-full bg-white/[0.06] border border-white/15
          rounded-xl px-3 py-2 text-sm text-slate-100
          focus:outline-none focus:border-emerald-400 focus:bg-white/[0.1]
          transition
          [color-scheme:dark]
        "
      />
    </label>
  );
}

function StationChip({
  station,
  checked,
  onToggle,
}: {
  station: ReportStation;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={checked}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm transition
        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300
        ${checked
          ? "bg-emerald-500/20 border border-emerald-400/50 text-white"
          : "bg-white/[0.04] border border-white/10 text-slate-200 hover:bg-white/[0.08]"
        }
      `}
    >
      <span
        className={`
          w-4 h-4 rounded border flex items-center justify-center shrink-0
          ${checked ? "bg-emerald-500 border-emerald-400" : "border-white/30 bg-white/5"}
        `}
        aria-hidden
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 5L4 8L9 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="truncate">{station.name ?? `#${station.locId}`}</span>
    </button>
  );
}

function VariableChip({
  variable,
  checked,
  onToggle,
}: {
  variable: ReportVariable;
  checked: boolean;
  onToggle: () => void;
}) {
  const unit = variable.unit ? ` (${variable.unit})` : "";
  return (
    <button
      onClick={onToggle}
      aria-pressed={checked}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition
        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300
        ${checked
          ? "bg-emerald-500/20 border border-emerald-400/50 text-white"
          : "bg-white/[0.04] border border-white/10 text-slate-200 hover:bg-white/[0.08]"
        }
      `}
    >
      <span
        className={`
          w-3 h-3 rounded-full border shrink-0
          ${checked ? "bg-emerald-400 border-emerald-300" : "border-white/30"}
        `}
        aria-hidden
      />
      {variable.name ?? "—"}
      {unit && <span className="text-slate-400">{unit}</span>}
    </button>
  );
}
