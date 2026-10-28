'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Heart, User, PackageSearch } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UserAccountModal from '@/components/UserAccountModal';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [perfilOpen, setPerfilOpen] = useState(false);

  const NAV_ITEMS = [
    { label: 'Inicio', href: '/', icon: Home },
    { label: 'Tienda', href: '/tienda', icon: ShoppingBag },
    { label: 'Seguimiento', href: '/seguimiento', icon: PackageSearch },
    { label: 'Favoritos', href: '/favoritos', icon: Heart },
  ];

  const esPerfilActivo = perfilOpen;

  return (
    <>
      <div className="fixed bottom-3 left-4 right-4 z-50 max-w-md mx-auto sm:hidden">
        <nav className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-stone-200/60 dark:border-zinc-800 rounded-3xl shadow-2xl shadow-stone-900/10 px-3 py-2">
          <div className="flex justify-around items-center">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const esActivo = pathname === item.href && !perfilOpen;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setPerfilOpen(false)}
                  className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-300 active:scale-90 cursor-pointer ${
                    esActivo
                      ? 'text-[hsl(var(--primary))] font-black'
                      : 'text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 font-semibold'
                  }`}
                >
                  <div
                    className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                      esActivo
                        ? 'bg-[hsl(var(--primary))]/12 dark:bg-[hsl(var(--primary))]/20 scale-110'
                        : 'bg-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  <span className="text-[10px] tracking-tight leading-none mt-1">
                    {item.label}
                  </span>

                  {esActivo && (
                    <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[hsl(var(--primary))] animate-in fade-in zoom-in duration-200" />
                  )}
                </Link>
              );
            })}

            {/* Botón de Cuenta / Perfil */}
            <button
              type="button"
              onClick={() => setPerfilOpen(!perfilOpen)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-300 active:scale-90 cursor-pointer ${
                esPerfilActivo
                  ? 'text-[hsl(var(--primary))] font-black'
                  : 'text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 font-semibold'
              }`}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                  esPerfilActivo
                    ? 'bg-[hsl(var(--primary))]/12 dark:bg-[hsl(var(--primary))]/20 scale-110'
                    : 'bg-transparent'
                }`}
              >
                {user?.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Perfil" 
                    className="w-5 h-5 rounded-full object-cover border border-primary/30"
                  />
                ) : (
                  <User className="w-5 h-5 stroke-[2.2]" />
                )}
              </div>

              <span className="text-[10px] tracking-tight leading-none mt-1">
                {user ? 'Cuenta' : 'Ingresar'}
              </span>

              {esPerfilActivo && (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[hsl(var(--primary))] animate-in fade-in zoom-in duration-200" />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Renderizamos el modal modularizado */}
      <UserAccountModal isOpen={perfilOpen} onClose={() => setPerfilOpen(false)} />
    </>
  );
}
