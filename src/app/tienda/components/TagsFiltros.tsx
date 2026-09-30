'use client';

import React from 'react';
import Image from 'next/image';
import { Tag } from 'lucide-react';

export interface TagBusqueda {
  id: string;
  nombre: string;
  slug: string;
  imagen_url?: string | null;
}

interface TagsFiltrosProps {
  tags: TagBusqueda[];
  tagSeleccionado: string | null;
  onSelectTag: (slug: string | null) => void;
}

export default function TagsFiltros({ tags, tagSeleccionado, onSelectTag }: TagsFiltrosProps) {
  if (!tags || tags.length === 0) return null;

  // Helper para mantener clases limpias y adaptables a dark mode
  const getButtonStyles = (activo: boolean) =>
    `flex flex-col items-center justify-center min-w-[76px] h-[76px] p-2 rounded-2xl transition-all duration-200 shrink-0 cursor-pointer border active:scale-95 snap-start select-none ${
      activo
        ? 'bg-[#0E6E55] dark:bg-emerald-600 text-white border-[#0E6E55] dark:border-emerald-500 shadow-md scale-105'
        : 'bg-card text-foreground border-border hover:border-[#0E6E55]/40 dark:hover:border-emerald-500/40 hover:bg-accent shadow-2xs'
    }`;

  const getIconWrapperStyles = (activo: boolean) =>
    `relative w-8 h-8 rounded-full flex items-center justify-center mb-1 overflow-hidden transition-colors ${
      activo 
        ? 'bg-white/20 text-white' 
        : 'bg-muted text-[#0E6E55] dark:text-emerald-400'
    }`;

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-3 mb-1 snap-x snap-mandatory">
      <div className="flex items-center gap-3 px-1" role="tablist" aria-label="Filtros por categoría">
        {/* Botón "Todo" */}
        <button
          role="tab"
          aria-selected={tagSeleccionado === null}
          onClick={() => onSelectTag(null)}
          className={getButtonStyles(tagSeleccionado === null)}
        >
          <div className={getIconWrapperStyles(tagSeleccionado === null)}>
            <Tag className="w-4 h-4 stroke-[2]" />
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
              role="tab"
              aria-selected={estaActivo}
              onClick={() => onSelectTag(estaActivo ? null : tag.slug)}
              className={getButtonStyles(estaActivo)}
            >
              <div className={getIconWrapperStyles(estaActivo)}>
                {tag.imagen_url ? (
                  <Image
                    src={tag.imagen_url}
                    alt={tag.nombre}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                ) : (
                  <Tag className="w-4 h-4 stroke-[2]" />
                )}
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