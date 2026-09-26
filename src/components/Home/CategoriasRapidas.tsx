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
      
      {/* Contenedor optimizado en grilla moderna y compacta estilo app nativa */}
      <div className="grid grid-cols-4 gap-2.5">
        {CATEGORIAS.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={cat.href}
              className="flex flex-col items-center justify-between gap-2.5 p-3 rounded-2xl bg-white/90 dark:bg-zinc-900/80 backdrop-blur-md border border-[#2d4030]/10 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 shadow-md shadow-[#2d4030]/5 active:scale-95 transition-all duration-200 text-center group cursor-pointer"
            >
              {/* Contenedor del ícono con acento en verde marca */}
              <div className="p-2.5 rounded-xl bg-[#2d4030]/10 text-[#3b533f] dark:bg-emerald-500/15 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
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
