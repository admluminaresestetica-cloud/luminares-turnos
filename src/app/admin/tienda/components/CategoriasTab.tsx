'use client';

import React, { useState } from 'react';
import { Tag, Plus, X } from 'lucide-react';

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
    <div className="mb-20 sm:mb-8 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs sm:rounded-3xl sm:p-6">
      <h2 className="m-0 text-base font-bold text-gray-900 dark:text-zinc-100 sm:text-lg flex items-center gap-2">
        <Tag className="h-5 w-5 text-[#0E6E55] dark:text-emerald-400" />
        Gestión de Categorías
      </h2>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
        <input
          type="text"
          placeholder="Nombre de la categoría..."
          value={nuevaCategoria}
          onChange={(e) => setNuevaCategoria(e.target.value)}
          className="h-11 w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3.5 text-sm font-medium text-gray-900 dark:text-zinc-100 outline-none transition-colors focus:border-[#0E6E55]"
        />
        <button
          type="submit"
          disabled={cargandoCat || !nuevaCategoria.trim()}
          className="h-11 shrink-0 rounded-xl bg-[#0E6E55] px-5 text-xs sm:text-sm font-bold text-white shadow-xs transition-all hover:bg-[#0A5340] active:scale-95 disabled:opacity-50 sm:w-auto flex items-center justify-center gap-1.5"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>{cargandoCat ? 'Guardando...' : 'Guardar Categoría'}</span>
        </button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        {categorias.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-zinc-400">No hay categorías creadas aún.</p>
        ) : (
          categorias.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/80 px-3.5 text-xs font-bold text-gray-800 dark:text-zinc-200 transition-colors hover:border-[#0E6E55]/40"
            >
              {cat.nombre}
              <button
                type="button"
                onClick={() => onEliminarCategoria(cat)}
                className="flex h-5 w-5 items-center justify-center rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-950/60 hover:text-red-700 dark:hover:text-red-400 transition-colors active:scale-90"
                title="Eliminar categoría"
              >
                <X className="h-3 w-3 stroke-[2.5]" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}