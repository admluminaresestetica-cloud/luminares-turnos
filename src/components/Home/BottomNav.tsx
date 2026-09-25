'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Heart, HelpCircle } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: 'Inicio', href: '/', icon: Home },
    { label: 'Tienda', href: '/tienda', icon: ShoppingBag },
    { label: 'Favoritos', href: '/favoritos', icon: Heart },
    { label: 'FAQ', href: '/faq', icon: HelpCircle },
  ];

  return (
    <div className="fixed bottom-3 left-4 right-4 z-50 max-w-md mx-auto sm:hidden">
      <nav className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-emerald-950/10 dark:border-zinc-800 rounded-3xl shadow-2xl shadow-emerald-950/15 px-3 py-2">
        <div className="flex justify-around items-center">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const esActivo = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-300 active:scale-90 cursor-pointer ${
                  esActivo
                    ? 'text-[#0E6E55] dark:text-emerald-400 font-black'
                    : 'text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 font-semibold'
                }`}
              >
                {/* Contenedor del ícono con píldora suave cuando está activo */}
                <div
                  className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                    esActivo
                      ? 'bg-[#0E6E55]/12 dark:bg-emerald-500/20 scale-110'
                      : 'bg-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>

                {/* Texto */}
                <span className="text-[10px] tracking-tight leading-none mt-1">
                  {item.label}
                </span>

                {/* Puntito indicador inferior activo */}
                {esActivo && (
                  <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#0E6E55] dark:bg-emerald-400 animate-in fade-in zoom-in duration-200" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
