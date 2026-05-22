import { useEffect, useState } from "react";
import { MousePointerClick, X } from "lucide-react";

const STORAGE_KEY = "meteo-hint-dismissed-v1";

export default function MapHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEY)) {
        const id = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(id);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="
        pointer-events-auto absolute left-1/2 -translate-x-1/2 top-28 z-[999]
        rounded-2xl border border-white/15
        bg-slate-900/65 backdrop-blur-2xl shadow-2xl
        px-4 py-3 flex items-center gap-3 text-white
        animate-[fadeIn_.25s_ease-out]
      "
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center">
        <MousePointerClick size={16} />
      </div>
      <div className="text-sm pr-2">
        <div className="font-semibold leading-tight">Explora las estaciones</div>
        <div className="text-xs text-slate-300 leading-tight">
          Toca un marcador para ver el clima en detalle
        </div>
      </div>
      <button
        onClick={dismiss}
        className="p-1 rounded-full bg-white/10 hover:bg-white/25 transition"
        aria-label="Cerrar"
      >
        <X size={14} />
      </button>
    </div>
  );
}
