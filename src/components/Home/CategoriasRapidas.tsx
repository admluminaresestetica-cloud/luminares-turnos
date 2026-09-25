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
              className="flex flex-col items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-[#1e2e28] dark:bg-zinc-900 backdrop-blur-md border border-[#2d4239] dark:border-zinc-800 shadow-md shadow-stone-900/10 hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-300 text-center group cursor-pointer"
            >
              {/* Contenedor del ícono en blanco translúcido con efecto de movimiento */}
              <div className="p-2.5 rounded-xl bg-white/10 text-white group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300 shrink-0">
                <Icon className="w-5 h-5" />
              </div>

              <span className="text-[11px] font-bold text-white leading-tight group-hover:text-emerald-200 transition-colors">
                {cat.titulo}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
