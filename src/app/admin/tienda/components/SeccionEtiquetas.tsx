"use client";

import { useState } from "react";

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
      <label className="block text-xs font-semibold text-[#6B675F]">
        Etiquetas / Tags del Producto <span className="font-normal text-[#A6A29B]">(aparecen arriba de la foto pública)</span>
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputEtiqueta}
          onChange={(e) => setInputEtiqueta(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ej: Hipoalergénico, Piel Sensible, Recién Nacido..."
          className="h-11 w-full min-w-0 rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-3.5 text-sm font-medium text-[#12151B] outline-none transition-colors focus:border-[#0E6E55] focus:bg-white"
        />
        <button
          type="button"
          onClick={agregarEtiqueta}
          className="h-11 shrink-0 rounded-xl bg-[#0E6E55] px-4 text-xs font-bold text-white transition-all hover:bg-[#0A5340] active:scale-95 whitespace-nowrap"
        >
          ➕ Agregar
        </button>
      </div>

      {/* Tira de Etiquetas (Chips) */}
      {etiquetas.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {etiquetas.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#0E6E55]/20 bg-[#0E6E55]/10 px-3.5 text-xs font-semibold text-[#0E6E55] transition-colors hover:border-[#0E6E55]/40"
            >
              🏷️ {tag}
              <button
                type="button"
                onClick={() => eliminarEtiqueta(idx)}
                className="flex h-4 w-4 items-center justify-center rounded-full font-bold text-[#0E6E55]/60 transition-colors hover:bg-red-100 hover:text-red-600"
                title="Eliminar etiqueta"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}