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
    <div className="mb-8 rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-sm">
      <h2 className="m-0 text-lg font-bold text-[#12151B]">
        🏷️ Gestión de Categorías
      </h2>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
        <input
          type="text"
          placeholder="Nombre de la nueva categoría"
          value={nuevaCategoria}
          onChange={(e) => setNuevaCategoria(e.target.value)}
          className="flex-1 rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-4 py-2.5 text-sm outline-none focus:border-[#0E6E55] focus:bg-white"
        />
        <button
          type="submit"
          disabled={cargandoCat || !nuevaCategoria.trim()}
          className="rounded-xl bg-[#0E6E55] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#0A5340] disabled:opacity-50"
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
              className="inline-flex items-center gap-2 rounded-lg border border-[#E7E5E0] bg-[#F7F7F5] px-3 py-1.5 text-xs font-medium text-[#12151B]"
            >
              {cat.nombre}
              <button
                onClick={() => onEliminarCategoria(cat)}
                className="ml-1 font-bold text-[#C84343] hover:text-red-700"
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