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
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            ¡Hola! Te damos la bienvenida a
          </p>
          <h2 className="text-lg font-black text-slate-900 dark:text-zinc-100 leading-tight">
            {nombreEmpresa}
          </h2>
        </div>

        {/* Acciones directas (Mis Turnos / Carrito) */}
        <div className="flex items-center gap-2">
          {/* Acceso rápido a Consultar Turnos por Celular */}
          <Link
            href="/mis-turnos"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors text-xs font-bold"
          >
            <CalendarDays className="w-4 h-4 text-emerald-500" />
            <span>Mis Turnos</span>
          </Link>

          {/* Carrito de Compras */}
          <Link
            href="/carrito"
            className="relative p-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
            aria-label="Carrito"
          >
            <ShoppingBag className="w-4 h-4" />
            {cantidadCarrito > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                {cantidadCarrito}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Input de Búsqueda Estilo App Móvil */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
        <input
          type="text"
          placeholder="¿Qué servicio o producto buscas hoy?"
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-zinc-800/80 border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none transition-all shadow-inner"
        />
      </div>
    </header>
  );
}
