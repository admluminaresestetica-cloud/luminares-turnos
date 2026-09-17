'use client';

import React, { useState } from 'react';

interface Categoria {
  id: string | number;
  nombre: string;
}

interface CategoriasTabProps {
  categorias: Categoria[];
  cargandoCat: boolean;
  onCrearCategoria: (nombre: string) => Promise<void>;
  onEliminarCategoria: (cat: Categoria) => Promise<void>;
}

export default function CategoriasTab({
  categorias,
  cargandoCat,
  onCrearCategoria,
  onEliminarCategoria,
}: CategoriasTabProps) {
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return;
    await onCrearCategoria(nuevaCategoria.trim());
    setNuevaCategoria('');
  };

  return (
    <div className="mb-6 rounded-2xl border border-[#E7E5E0] bg-white p-4 shadow-sm sm:mb-8 sm:rounded-3xl sm:p-6">
      <h2 className="m-0 text-base font-bold text-[#12151B] sm:text-lg">
        🏷️ Gestión de Categorías
      </h2>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
        <input
          type="text"
          placeholder="Nombre de la categoría..."
          value={nuevaCategoria}
          onChange={(e) => setNuevaCategoria(e.target.value)}
          className="h-11 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-3.5 text-sm font-medium text-[#12151B] outline-none transition-colors focus:border-[#0E6E55] focus:bg-white"
        />
        <button
          type="submit"
          disabled={cargandoCat || !nuevaCategoria.trim()}
          className="h-11 shrink-0 rounded-xl bg-[#0E6E55] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0A5340] active:scale-[0.98] disabled:opacity-50 sm:w-auto"
        >
          {cargandoCat ? 'Guardando...' : 'Guardar Categoría'}
        </button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        {categorias.length === 0 ? (
          <p className="text-xs text-[#6B675F]">No hay categorías creadas aún.</p>
        ) : (
          categorias.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-[#E7E5E0] bg-[#F7F7F5] px-3.5 text-xs font-medium text-[#12151B] transition-colors hover:border-[#0E6E55]/30"
            >
              {cat.nombre}
              <button
                onClick={() => onEliminarCategoria(cat)}
                className="flex h-4 w-4 items-center justify-center rounded-full font-bold text-[#C84343] transition-colors hover:bg-red-100 hover:text-red-700"
              >
                ✕
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}