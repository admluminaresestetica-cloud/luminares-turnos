'use client';

import { Sparkles, Zap, ShoppingBag, Tag, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Categoria {
  id: string;
  titulo: string;
  href: string;
  icon: any;
  color: string;
}

const CATEGORIAS: Categoria[] = [
  { id: 'laser', titulo: 'Depilación Láser', href: '/laser', icon: Zap, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { id: 'estetica', titulo: 'Estética', href: '/servicios', icon: Sparkles, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { id: 'tienda', titulo: 'Tienda', href: '/tienda', icon: ShoppingBag, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { id: 'promos', titulo: 'Ofertas & Combos', href: '/promos', icon: Tag, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
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
              className="flex flex-col items-center gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 hover:scale-[1.02] active:scale-[0.98] transition-transform text-center"
            >
              <div className={`p-2.5 rounded-xl ${cat.color}`}>
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
