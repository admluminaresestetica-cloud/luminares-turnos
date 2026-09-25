'use client';

import { Zap, Flower2, ShoppingBag, Tag } from 'lucide-react';
import Link from 'next/link';

interface Categoria {
  id: string;
  titulo: string;
  href: string;
  icon: any;
  accentBg: string;
  iconColor: string;
}

const CATEGORIAS: Categoria[] = [
  { 
    id: 'laser', 
    titulo: 'Depilación Láser', 
    href: '/laser', 
    icon: Zap,
    accentBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    iconColor: 'text-[#0E6E55] dark:text-emerald-400'
  },
  { 
    id: 'estetica', 
    titulo: 'Estética', 
    href: '/servicios', 
    icon: Flower2,
    accentBg: 'bg-teal-500/10 dark:bg-teal-500/20',
    iconColor: 'text-teal-700 dark:text-teal-400'
  },
  { 
    id: 'tienda', 
    titulo: 'Tienda', 
    href: '/tienda', 
    icon: ShoppingBag,
    accentBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconColor: 'text-amber-700 dark:text-amber-400'
  },
  { 
    id: 'promos', 
    titulo: 'Ofertas & Combos', 
    href: '/servicios?categoria=promos', 
    icon: Tag,
    accentBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    iconColor: 'text-rose-600 dark:text-rose-400'
  },
];

export default function CategoriasRapidas() {
  return (
    <div className="space-y-2.5">
      <h3 className="text-[11px] font-black uppercase tracking-wider text-stone-400 dark:text-zinc-500 px-1">
        Categorías
      </h3>
      <div className="grid grid-cols-4 gap-2.5">
        {CATEGORIAS.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={cat.href}
              className="flex flex-col items-center justify-between gap-2 p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md border border-emerald-900/5 dark:border-zinc-800/80 hover:bg-white dark:hover:bg-zinc-900 shadow-lg shadow-emerald-900/5 active:scale-95 hover:-translate-y-0.5 transition-all duration-200 text-center group cursor-pointer"
            >
              {/* Contenedor del ícono con color distintivo por categoría */}
              <div className={`p-2.5 rounded-xl ${cat.accentBg} ${cat.iconColor} group-hover:scale-110 transition-transform duration-200 shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <span className="text-[11px] font-bold text-stone-800 dark:text-zinc-200 leading-tight">
                {cat.titulo}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
