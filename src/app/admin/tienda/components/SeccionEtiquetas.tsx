"use client";

import { useState } from "react";
import { Plus, Tag, X } from "lucide-react";

interface SeccionEtiquetasProps {
  etiquetas: string[];
  setEtiquetas: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function SeccionEtiquetas({ etiquetas, setEtiquetas }: SeccionEtiquetasProps) {
  const [inputEtiqueta, setInputEtiqueta] = useState("");

  const agregarEtiqueta = () => {
    const valorLimpio = inputEtiqueta.trim();
    if (!valorLimpio) return;
    if (etiquetas.includes(valorLimpio)) {
      setInputEtiqueta("");
      return;
    }
    setEtiquetas((prev) => [...prev, valorLimpio]);
    setInputEtiqueta("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      agregarEtiqueta();
    }
  };

  const eliminarEtiqueta = (index: number) => {
    setEtiquetas((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="sm:col-span-2 space-y-2.5">
      <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300">
        Etiquetas / Tags del Producto{" "}
        <span className="font-normal text-gray-400 dark:text-zinc-500">
          (aparecen arriba de la foto pública)
        </span>
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputEtiqueta}
          onChange={(e) => setInputEtiqueta(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ej: Hipoalergénico, Piel Sensible..."
          className="h-11 w-full min-w-0 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3.5 text-xs font-medium text-gray-900 dark:text-zinc-100 outline-none transition-colors focus:border-[#0E6E55]"
        />
        <button
          type="button"
          onClick={agregarEtiqueta}
          className="h-11 shrink-0 rounded-xl bg-[#0E6E55] px-4 text-xs font-bold text-white transition-all hover:bg-[#0A5340] active:scale-95 flex items-center gap-1.5 whitespace-nowrap shadow-xs"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Agregar</span>
        </button>
      </div>

      {/* Tira de Etiquetas (Chips) */}
      {etiquetas.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {etiquetas.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 pl-3 pr-1.5 text-xs font-bold text-[#0E6E55] dark:text-emerald-400"
            >
              <Tag className="h-3 w-3 shrink-0" />
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => eliminarEtiqueta(idx)}
                className="flex h-5 w-5 items-center justify-center rounded-full text-[#0E6E55]/60 dark:text-emerald-400/60 transition-colors hover:bg-red-100 dark:hover:bg-red-950/60 hover:text-red-600 dark:hover:text-red-400 active:scale-90"
                title="Eliminar etiqueta"
              >
                <X className="h-3 w-3 stroke-[2.5]" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}