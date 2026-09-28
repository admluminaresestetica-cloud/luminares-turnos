'use client';

import { Zap, Flower2, ShoppingBag, Tag } from 'lucide-react';
import Link from 'next/link';

interface Categoria {
  id: string;
  titulo: string;
  href: string;
  icon: any;
}

const CATEGORIAS: Categoria[] = [
  { id: 'laser', titulo: 'Depilación Láser', href: '/laser', icon: Zap },
  { id: 'estetica', titulo: 'Estética', href: '/servicios', icon: Flower2 },
  { id: 'tienda', titulo: 'Tienda', href: '/tienda', icon: ShoppingBag },
  { id: 'promos', titulo: 'Ofertas & Combos', href: '/servicios?categoria=promos', icon: Tag },
];

export default function CategoriasRapidas() {
  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-black uppercase tracking-wider text-stone-400 dark:text-zinc-500 px-1">
        Categorías
      </h3>
      
      {/* Grilla limpia de categorías */}
      <div className="grid grid-cols-4 gap-3">
        {CATEGORIAS.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={cat.href}
              className="flex flex-col items-center text-center group cursor-pointer space-y-2"
            >
              {/* Círculo contenedor del ícono */}
              <div className="w-14 h-14 rounded-full bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm group-hover:shadow-md group-hover:border-rose-300 dark:group-hover:border-rose-900/60 group-hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-rose-600 dark:text-rose-400 bg-gradient-to-b from-white to-rose-50/30 dark:from-zinc-900 dark:to-rose-950/20">
                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </div>

              {/* Título de la categoría */}
              <span className="text-[11px] font-bold text-stone-700 dark:text-zinc-300 leading-tight group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors line-clamp-2">
                {cat.titulo}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}