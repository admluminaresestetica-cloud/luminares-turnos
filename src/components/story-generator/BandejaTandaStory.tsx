"use client";

import { Trash2, Eye, Layers, Eraser } from "lucide-react";
import { PiezaTandaStory } from "@/types/story";

interface BandejaTandaStoryProps {
  piezas: PiezaTandaStory[];
  piezaSeleccionadaId: string | null;
  onSeleccionarPieza: (pieza: PiezaTandaStory) => void;
  onEliminarPieza: (id: string) => void;
  onLimpiarTanda: () => void;
}

export function BandejaTandaStory({
  piezas,
  piezaSeleccionadaId,
  onSeleccionarPieza,
  onEliminarPieza,
  onLimpiarTanda,
}: BandejaTandaStoryProps) {
  if (piezas.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/60 px-4 py-2.5 text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Tanda vacía: podés ir sumando varias imágenes con{" "}
            <strong className="text-slate-700 dark:text-zinc-200">Agregar a la tanda</strong> y
            compartirlas todas juntas.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-100">
            Imágenes creadas en la tanda ({piezas.length})
          </span>
        </div>

        <button
          type="button"
          onClick={onLimpiarTanda}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
        >
          <Eraser className="h-3.5 w-3.5" />
          <span>Limpiar tanda</span>
        </button>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
        {piezas.map((pieza, index) => {
          const activa = pieza.id === piezaSeleccionadaId;
          return (
            <div
              key={pieza.id}
              className={`group relative shrink-0 w-20 rounded-xl border p-1.5 transition-all ${
                activa
                  ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/30"
                  : "border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70"
              }`}
            >
              <button
                type="button"
                onClick={() => onSeleccionarPieza(pieza)}
                title={`Ver ${pieza.etiqueta}`}
                className="block w-full aspect-[4/5] rounded-lg overflow-hidden bg-slate-200 dark:bg-zinc-900 cursor-pointer"
              >
                <img
                  src={pieza.dataUrl}
                  alt={pieza.etiqueta}
                  className="h-full w-full object-cover"
                />
              </button>

              <div className="mt-1 flex items-center justify-between gap-1 px-0.5">
                <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 truncate">
                  #{index + 1} · {pieza.formato}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => onSeleccionarPieza(pieza)}
                    title="Inspeccionar"
                    className="p-0.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEliminarPieza(pieza.id)}
                    title="Quitar de la tanda"
                    className="p-0.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}