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
      {/* Input de Búsqueda Profesional */}
      <div className="relative flex items-center">
        {/* Ícono SVG de Lupa Estilizado */}
        <div className="pointer-events-none absolute left-4 text-[#8C8881]">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <input
          type="text"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          className="w-full rounded-2xl border border-[#E7E5E0] bg-white py-3 pl-11 pr-10 text-sm font-medium text-[#12151B] placeholder-[#9E9A92] shadow-sm transition-all outline-none focus:border-[#12151B] focus:ring-1 focus:ring-[#12151B]"
        />

        {/* Botón para limpiar búsqueda cuando hay texto */}
        {busqueda && (
          <button
            onClick={() => onBusquedaChange("")}
            type="button"
            className="absolute right-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#E7E5E0] text-[#6B675F] hover:bg-[#D8D5CE] transition-colors"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Lista de Categorías en Chips con Scroll Horizontal */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth">
        {categorias.map((cat) => {
          const esSeleccionado = categoriaSeleccionada === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoriaSelect(cat)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
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

          