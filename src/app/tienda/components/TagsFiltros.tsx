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
        {/* Acceso directo: catálogo completo */}
        <button
          onClick={() => onSelectTag(null)}
          className={`group relative whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold cursor-pointer
            transition-all duration-300 ease-out
            hover:-translate-y-0.5 active:translate-y-0
            ${
              tagSeleccionado === null
                ? 'text-white shadow-md shadow-black/10 bg-gradient-to-br from-[#22252D] to-[#12151B] scale-[1.03]'
                : 'text-[#12151B] bg-gradient-to-br from-[#FDFDFC] to-[#F1F0EC] border border-[#E7E5E0] hover:border-[#12151B]/20 hover:shadow-sm'
            }`}
        >
          <span className="relative z-10 inline-flex items-center gap-1.5">
            <span className="text-[13px] leading-none">⚡</span>
            Destacados
          </span>
        </button>

        {/* Separador sutil entre accesos directos y tags */}
        <span className="h-4 w-px bg-[#E7E5E0] mx-0.5 shrink-0" />

        {/* Tags dinámicos */}
        {tags.map((tag) => {
          const estaActivo = tagSeleccionado === tag.slug;
          return (
            <button
              key={tag.id}
              onClick={() => onSelectTag(estaActivo ? null : tag.slug)}
              className={`relative whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold cursor-pointer
                transition-all duration-300 ease-out
                hover:-translate-y-0.5 active:translate-y-0
                ${
                  estaActivo
                    ? 'text-white shadow-md shadow-black/10 bg-gradient-to-br from-[#22252D] to-[#12151B] scale-[1.03]'
                    : 'text-[#3A3D45] bg-[#F7F7F5] border border-[#E7E5E0] hover:border-[#12151B]/20 hover:bg-[#F1F0EC] hover:shadow-sm'
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