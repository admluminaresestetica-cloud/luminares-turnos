'use client';

import { Zap, EyeClosed, Store, Tag, LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface Categoria {
  id: string;
  titulo: string;
  href: string;
  icon: LucideIcon;
}

const CATEGORIAS: Categoria[] = [
  { id: 'laser', titulo: 'Depilación Láser', href: '/laser', icon: Zap },
  { id: 'estetica', titulo: 'Estética', href: '/servicios', icon: EyeClosed },
  { id: 'tienda', titulo: 'Tienda', href: '/tienda', icon: Store },
  { id: 'promos', titulo: 'Ofertas & Combos', href: '/servicios?categoria=promos', icon: Tag },
];

export default function CategoriasRapidas() {
  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1">
        Categorías
      </h3>
      
      {/* Grilla circular limpia */}
      <div className="grid grid-cols-4 gap-3">
        {CATEGORIAS.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={cat.href}
              className="flex flex-col items-center text-center group cursor-pointer space-y-2"
            >
              {/* Círculo contenedor más grande y estético */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm group-hover:shadow-md group-hover:border-primary/50 group-hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-primary bg-gradient-to-b from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-800">
                <Icon className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform duration-300" />
              </div>

              {/* Título de la categoría */}
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-zinc-200 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {cat.titulo}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}