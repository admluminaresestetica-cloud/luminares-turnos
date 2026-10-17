"use client";

import { Sparkles } from "lucide-react";
import { FONDOS_FESTIVOS } from "../presets/festivosPresets";

interface FestivePickerProps {
  fondoSeleccionado: string;
  onSeleccionarFondo: (valorFondo: string) => void;
}

export function FestivePicker({
  fondoSeleccionado,
  onSeleccionarFondo,
}: FestivePickerProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Fondos Festivos & Temporada
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {FONDOS_FESTIVOS.map((item) => {
          const isSelected = fondoSeleccionado === item.value;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSeleccionarFondo(item.value)}
              className={`h-11 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex items-end p-1.5 ${
                isSelected
                  ? "ring-2 ring-emerald-500 dark:ring-emerald-400 border-transparent scale-102 shadow-sm"
                  : "border-slate-200 dark:border-zinc-700 hover:scale-101"
              }`}
              style={{ background: item.value }}
            >
              <span className="text-[9px] font-bold text-white bg-black/50 backdrop-blur-xs px-1.5 py-0.5 rounded-md w-full truncate text-center">
                {item.nombre}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}