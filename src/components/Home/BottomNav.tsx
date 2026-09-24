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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50 px-6 py-2">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const esActivo = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
                esActivo ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
