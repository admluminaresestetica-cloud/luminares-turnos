'use client';

import { Search, CalendarDays, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface HeaderBusquedaProps {
  nombreEmpresa?: string;
  onSearchChange?: (term: string) => void;
  cantidadCarrito?: number;
}

export default function HeaderBusqueda({
  nombreEmpresa = 'Luminares Estética',
  onSearchChange,
  cantidadCarrito = 0,
}: HeaderBusquedaProps) {
  return (
    <header className="space-y-4 pt-2 pb-1">
      {/* Saludo + Botón Consultar Mis Turnos */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-stone-500 dark:text-zinc-400 font-medium">
            ¡Hola! Te damos la bienvenida a
          </p>
          <h2 className="text-lg font-black text-stone-900 dark:text-zinc-100 leading-tight">
            {nombreEmpresa}
          </h2>
        </div>

        {/* Acciones directas (Mis Turnos / Carrito) */}
        <div className="flex items-center gap-2">
          {/* Acceso rápido a Consultar Turnos */}
          <Link
            href="/mis-turnos"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#a3c9b8]/20 dark:bg-[#a3c9b8]/15 text-[#2d5747] dark:text-[#a3c9b8] hover:bg-[#a3c9b8]/30 transition-colors text-xs font-bold"
          >
            <CalendarDays className="w-4 h-4 text-[#2d5747] dark:text-[#a3c9b8]" />
            <span>Mis Turnos</span>
          </Link>

          {/* Carrito de Compras */}
          <Link
            href="/carrito"
            className="relative p-2.5 rounded-full bg-[#f7f5f0] dark:bg-zinc-800 border border-[#e8e4d9] dark:border-zinc-700/60 text-stone-700 dark:text-zinc-300 hover:bg-[#eae6db] dark:hover:bg-zinc-700 transition-colors"
            aria-label="Carrito"
          >
            <ShoppingBag className="w-4 h-4" />
            {cantidadCarrito > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1e2e28] dark:bg-[#a3c9b8] text-white dark:text-[#1e2e28] text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                {cantidadCarrito}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Input de Búsqueda Estilo App Móvil */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-zinc-500" />
        <input
          type="text"
          placeholder="¿Qué servicio o producto buscas hoy?"
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-[#f7f5f0]/90 dark:bg-zinc-800/80 border border-[#e8e4d9] dark:border-zinc-700/60 focus:border-[#a3c9b8] dark:focus:border-[#a3c9b8] rounded-2xl text-xs font-medium text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 outline-none transition-all shadow-inner"
        />
      </div>
    </header>
  );
}
