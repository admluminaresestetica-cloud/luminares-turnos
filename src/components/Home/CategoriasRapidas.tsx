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
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
        Categorías
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {CATEGORIAS.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={cat.href}
              className="flex flex-col items-center gap-2 p-2.5 rounded-2xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 hover:scale-[1.02] active:scale-[0.98] transition-all text-center group"
            >
              {/* Contenedor del ícono unificado en tono Azul Elegante */}
              <div className="p-2.5 rounded-xl bg-slate-900/5 dark:bg-blue-500/10 text-slate-800 dark:text-blue-400 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-blue-600 dark:group-hover:text-white transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 leading-tight">
                {cat.titulo}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
