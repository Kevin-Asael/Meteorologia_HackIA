import { classifyVariable } from "../lib/variables";

interface VariableSelectorProps {
  variables: string[];
  selected: string | null;
  onSelect: (variable: string | null) => void;
}

export default function VariableSelector({
  variables,
  selected,
  onSelect,
}: VariableSelectorProps) {
  return (
    <div className="bg-white/95 backdrop-blur px-3 py-2 rounded-md shadow-lg flex flex-wrap gap-1.5 items-center">
      <span className="text-xs font-semibold text-slate-600 mr-1">Mapa de calor:</span>

      <button
        onClick={() => onSelect(null)}
        className={`text-xs px-2.5 py-1 rounded-full transition ${
          selected === null
            ? "bg-slate-800 text-white"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      >
        Ninguna
      </button>

      {variables?.map((v) => {
        const meta = classifyVariable(v);
        const isActive = selected === v;
        return (
          <button
            key={v}
            onClick={() => onSelect(v)}
            className={`text-xs px-2.5 py-1 rounded-full transition ${
              isActive
                ? "bg-indigo-600 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            title={v}
          >
            {meta.icon} {meta.label}
          </button>
        );
      })}
    </div>
  );
}
