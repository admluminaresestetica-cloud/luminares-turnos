"use client";

import { useState } from "react";
import { LayoutGrid, Layers, Image as ImageIcon } from "lucide-react";
import { LayoutCollage, PiezaTandaStory } from "@/types/story";

export interface OpcionImagenCollage {
  id: string;
  etiqueta: string;
  origen: "producto" | "tanda";
  url: string;
}

interface SelectorCollageProps {
  layout: LayoutCollage;
  celdas: string[];
  opcionesDisponibles: OpcionImagenCollage[];
  piezasTanda: PiezaTandaStory[];
  onChangeLayout: (layout: LayoutCollage) => void;
  onChangeCelda: (indiceCelda: number, url: string) => void;
}

const LAYOUTS: { id: LayoutCollage; label: string; cantidad: number }[] = [
  { id: "2-cols", label: "2 fotos", cantidad: 2 },
  { id: "3-mix", label: "3 fotos", cantidad: 3 },
  { id: "4-grid", label: "4 fotos (2x2)", cantidad: 4 },
];

export function SelectorCollage({
  layout,
  celdas,
  opcionesDisponibles,
  piezasTanda,
  onChangeLayout,
  onChangeCelda,
}: SelectorCollageProps) {
  const [celdaActiva, setCeldaActiva] = useState<number>(0);

  const cantidadActual = LAYOUTS.find((l) => l.id === layout)?.cantidad ?? 2;
  const indiceSeguro = Math.min(celdaActiva, cantidadActual - 1);
  const valorCeldaActual = celdas[indiceSeguro] || opcionesDisponibles[0]?.url || "";

  const itemsProducto = opcionesDisponibles.filter((o) => o.origen === "producto");
  const itemsTanda = opcionesDisponibles.filter((o) => o.origen === "tanda");

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/70 p-3">
      <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-zinc-100">
        <LayoutGrid className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Configurar collage</span>
      </div>

      {/* Selector de distribución */}
      <div className="grid grid-cols-3 gap-1.5">
        {LAYOUTS.map((item) => {
          const activa = layout === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onChangeLayout(item.id);
                if (indiceSeguro >= item.cantidad) {
                  setCeldaActiva(0);
                }
              }}
              className={`rounded-xl px-2 py-1.5 text-[11px] font-bold transition-all cursor-pointer border ${
                activa
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                  : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Selector de celda a editar */}
      <div className="space-y-1.5">
        <span className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
          Elegí qué espacio editar:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: cantidadActual }).map((_, idx) => {
            const seleccionada = idx === indiceSeguro;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCeldaActiva(idx)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer border ${
                  seleccionada
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300"
                    : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                }`}
              >
                Espacio #{idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Miniaturas disponibles para asignar a la celda activa */}
      <div className="space-y-2">
        {itemsProducto.length > 0 && (
          <div className="space-y-1">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              <ImageIcon className="h-3 w-3" />
              Fotos del producto
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {itemsProducto.map((op) => {
                const elegida = valorCeldaActual === op.url;
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => onChangeCelda(indiceSeguro, op.url)}
                    title={op.etiqueta}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      elegida
                        ? "border-emerald-500 ring-2 ring-emerald-500/30"
                        : "border-slate-200 dark:border-zinc-700 opacity-85 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={op.url}
                      alt={op.etiqueta}
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {itemsTanda.length > 0 && (
          <div className="space-y-1">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <Layers className="h-3 w-3" />
              Piezas ya creadas en la tanda ({piezasTanda.length})
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {itemsTanda.map((op) => {
                const elegida = valorCeldaActual === op.url;
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => onChangeCelda(indiceSeguro, op.url)}
                    title={op.etiqueta}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      elegida
                        ? "border-emerald-500 ring-2 ring-emerald-500/30"
                        : "border-slate-200 dark:border-zinc-700 opacity-85 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={op.url}
                      alt={op.etiqueta}
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}