'use client';

import React from 'react';

interface TagBusqueda {
  id: string;
  nombre: string;
  slug: string;
}

interface TagsFiltrosProps {
  tags: TagBusqueda[];
  tagSeleccionado: string | null;
  onSelectTag: (slug: string | null) => void;
}

export default function TagsFiltros({ tags, tagSeleccionado, onSelectTag }: TagsFiltrosProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 mb-4">
      <div className="flex items-center gap-2 px-1">
        {/* Botón para ver todos */}
        <button
          onClick={() => onSelectTag(null)}
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer ${
            tagSeleccionado === null
              ? 'bg-[#12151B] text-white shadow-sm scale-105'
              : 'bg-[#F7F7F5] text-gray-600 hover:bg-gray-200 border border-[#E7E5E0]'
          }`}
        >
          ✨ Todos
        </button>

        {/* Tags dinámicos */}
        {tags.map((tag) => {
          const estaActivo = tagSeleccionado === tag.slug;
          return (
            <button
              key={tag.id}
              onClick={() => onSelectTag(estaActivo ? null : tag.slug)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                estaActivo
                  ? 'bg-[#12151B] text-white shadow-sm scale-105'
                  : 'bg-[#F7F7F5] text-gray-600 hover:bg-gray-200 border border-[#E7E5E0]'
              }`}
            >
              {tag.nombre}
            </button>
          );
        })}
      </div>
    </div>
  );
}