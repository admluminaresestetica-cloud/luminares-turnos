'use client';

import React from 'react';
import { Tag } from 'lucide-react';

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
    <div className="w-full overflow-x-auto no-scrollbar py-3 mb-3">
      <div className="flex items-center gap-3 px-1">
        
        {/* Botón inicial "Todo" */}
        <button
          onClick={() => onSelectTag(null)}
          className={`flex flex-col items-center justify-center min-w-[76px] h-[76px] p-2 rounded-2xl transition-all duration-200 shrink-0 cursor-pointer border ${
            tagSeleccionado === null
              ? 'bg-[#12151B] text-white border-[#12151B] shadow-md scale-105'
              : 'bg-white text-gray-700 border-[#E7E5E0] hover:border-gray-300 hover:bg-gray-50 shadow-2xs'
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
            tagSeleccionado === null ? 'bg-white/10 text-amber-400' : 'bg-[#F7F7F5] text-[#0E6E55]'
          }`}>
            <Tag className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold tracking-tight text-center truncate w-full">
            Todo
          </span>
        </button>

        {/* Tags Dinámicos */}
        {tags.map((tag) => {
          const estaActivo = tagSeleccionado === tag.slug;

          return (
            <button
              key={tag.id}
              onClick={() => onSelectTag(estaActivo ? null : tag.slug)}
              className={`flex flex-col items-center justify-center min-w-[76px] h-[76px] p-2 rounded-2xl transition-all duration-200 shrink-0 cursor-pointer border ${
                estaActivo
                  ? 'bg-[#12151B] text-white border-[#12151B] shadow-md scale-105'
                  : 'bg-white text-gray-700 border-[#E7E5E0] hover:border-gray-300 hover:bg-gray-50 shadow-2xs'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                estaActivo ? 'bg-white/10 text-amber-400' : 'bg-[#F7F7F5] text-[#0E6E55]'
              }`}>
                <Tag className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold tracking-tight text-center truncate w-full">
                {tag.nombre}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}