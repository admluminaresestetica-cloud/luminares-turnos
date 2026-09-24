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
  { id: 'promos', titulo: 'Ofertas & Combos', href: '/promos', icon: Tag },
];

export default function CategoriasRapidas() {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
        Categorías
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {CATEGORIAS.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={cat.href}
              className="flex flex-col items-center gap-2 p-2.5 rounded-2xl bg-[#f7f5f0]/80 dark:bg-zinc-900/60 border border-[#e8e4d9] dark:border-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all text-center group"
            >
              {/* Contenedor del ícono en Verde Salvia elegante */}
              <div className="p-2.5 rounded-xl bg-[#1e2e28]/10 dark:bg-[#a3c9b8]/10 text-[#1e2e28] dark:text-[#a3c9b8] group-hover:bg-[#1e2e28] group-hover:text-white transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-stone-700 dark:text-zinc-300 leading-tight">
                {cat.titulo}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
