'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Heart } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: 'Inicio', href: '/', icon: Home },
    { label: 'Tienda', href: '/tienda', icon: ShoppingBag },
    { label: 'Favoritos', href: '/favoritos', icon: Heart },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#f7f5f0]/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-[#e8e4d9] dark:border-zinc-800 z-50 px-6 py-2.5">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const esActivo = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
                esActivo
                  ? 'text-[#1e2e28] dark:text-[#a3c9b8] scale-105'
                  : 'text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  esActivo ? 'bg-[#a3c9b8]/25 dark:bg-[#a3c9b8]/15' : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
