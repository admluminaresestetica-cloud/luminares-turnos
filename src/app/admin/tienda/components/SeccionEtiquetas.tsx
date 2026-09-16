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
    <div className="sm:col-span-2 space-y-2">
      <label className="block text-xs font-medium text-[#6B675F]">
        Etiquetas / Tags del Producto (Aparecen arriba de la foto pública)
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputEtiqueta}
          onChange={(e) => setInputEtiqueta(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ej: Hipoalergénico, Piel Sensible, Recién Nacido..."
          className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm font-medium text-[#12151B] outline-none focus:border-[#0E6E55]"
        />
        <button
          type="button"
          onClick={agregarEtiqueta}
          className="rounded-xl bg-[#0E6E55] px-4 text-xs font-bold text-white hover:bg-[#0A5340] transition-colors whitespace-nowrap"
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
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0E6E55]/10 border border-[#0E6E55]/20 px-3 py-1 text-xs font-semibold text-[#0E6E55]"
            >
              🏷️ {tag}
              <button
                type="button"
                onClick={() => eliminarEtiqueta(idx)}
                className="ml-1 text-slate-400 hover:text-red-600 font-bold"
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
