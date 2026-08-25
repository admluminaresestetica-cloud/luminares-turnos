'use client';

import React from "react";

interface BuscadorYCategoriasProps {
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  categorias: string[];
  categoriaSeleccionada: string;
  onCategoriaSelect: (cat: string) => void;
}

export default function BuscadorYCategorias({
  busqueda,
  onBusquedaChange,
  categorias,
  categoriaSeleccionada,
  onCategoriaSelect,
}: BuscadorYCategoriasProps) {
  return (
    <div className="mb-6 space-y-4">
      {/* Input de Búsqueda */}
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A6A29B]">
          🔍
        </span>
        <input
          type="text"
          placeholder="Buscar productos por nombre..."
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          className="w-full rounded-2xl border border-[#E7E5E0] bg-white py-3.5 pl-11 pr-4 text-sm text-[#12151B] outline-none transition-all placeholder:text-[#A6A29B] focus:border-[#0E6E55] focus:shadow-[0_0_0_3px_rgba(14,110,85,0.15)]"
        />
      </div>

      {/* Lista de Categorías en Chips con Scroll Horizontal */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth">
        {categorias.map((cat) => {
          const esSeleccionado = categoriaSeleccionada === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoriaSelect(cat)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                esSeleccionado
                  ? "border-[#12151B] bg-[#12151B] text-white shadow-sm"
                  : "border-[#E7E5E0] bg-white text-[#6B675F] hover:border-[#12151B]/30 hover:text-[#12151B]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
b