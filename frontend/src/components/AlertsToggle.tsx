import { Bot } from "lucide-react";

interface AlertsToggleProps {
  count: number;
  criticalCount: number;
  onOpen: () => void;
}

export default function AlertsToggle({ count, criticalCount, onOpen }: AlertsToggleProps) {
  const hasCritical = criticalCount > 0;
  return (
    <button
      onClick={onOpen}
      aria-label={`Abrir panel de alertas (${count} ${count === 1 ? "alerta" : "alertas"})`}
      className={`
        pointer-events-auto absolute top-4 right-4 z-[1000]
        flex items-center gap-2 pl-3 pr-4 py-2.5
        rounded-2xl border border-white/15
        bg-slate-900/75 backdrop-blur-2xl
        text-white shadow-2xl
        hover:bg-slate-800/85 hover:scale-[1.02]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
        transition
      `}
    >
      <div
        className={`
          relative w-9 h-9 rounded-xl flex items-center justify-center
          bg-gradient-to-br from-indigo-500 to-fuchsia-500
          ${hasCritical ? "animate-pulse" : ""}
        `}
      >
        <Bot size={18} aria-hidden />
        {count > 0 && (
          <span
            className={`
              absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5
              rounded-full text-[10px] font-bold tabular-nums
              flex items-center justify-center
              ${hasCritical
                ? "bg-red-500 text-white border-2 border-slate-900"
                : "bg-amber-400 text-slate-900 border-2 border-slate-900"
              }
            `}
            aria-hidden
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </div>
      <div className="text-left leading-tight pr-1">
        <div className="text-[11px] uppercase tracking-wider text-slate-300">Agente IA</div>
        <div className="text-sm font-semibold">
          {count === 0 ? "Sin alertas" : `${count} ${count === 1 ? "alerta" : "alertas"}`}
        </div>
      </div>
    </button>
  );
}
