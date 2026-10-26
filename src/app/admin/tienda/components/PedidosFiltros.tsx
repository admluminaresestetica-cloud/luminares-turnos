'use client';

import React from 'react';
import { Search, Download, RotateCw, ClipboardList } from 'lucide-react';

interface PedidosFiltrosProps {
  busqueda: string;
  setBusqueda: (val: string) => void;
  filtroEstado: string;
  setFiltroEstado: (val: string) => void;
  filtroFecha: string;
  setFiltroFecha: (val: string) => void;
  exportarACSV: () => void;
  onFetchPedidos: () => void;
}

export default function PedidosFiltros({
  busqueda,
  setBusqueda,
  filtroEstado,
  setFiltroEstado,
  filtroFecha,
  setFiltroFecha,
  exportarACSV,
  onFetchPedidos,
}: PedidosFiltrosProps) {
  return (
    <>
      {/* Encabezado y Acciones */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400">
            <ClipboardList className="w-5 h-5" />
          </div>
          <h2 className="m-0 text-base font-extrabold text-slate-900 dark:text-zinc-100 sm:text-lg">
            Pedidos Recibidos (Logística Web)
          </h2>
        </div>

        <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={exportarACSV}
            className="h-9 sm:h-10 shrink-0 inline-flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={onFetchPedidos}
            className="h-9 sm:h-10 shrink-0 inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 px-3.5 text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all hover:bg-slate-100 dark:hover:bg-zinc-700 active:scale-95 cursor-pointer"
          >
            <RotateCw className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/50 p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar cliente o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 pl-9 pr-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="h-10 flex-1 sm:flex-none rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 px-3 text-xs font-bold text-slate-800 dark:text-zinc-200 outline-none cursor-pointer"
          >
            <option value="todos" className="dark:bg-zinc-900">Todos los Estados</option>
            <option value="pendiente" className="dark:bg-zinc-900">⏳ Pendiente</option>
            <option value="en_preparacion" className="dark:bg-zinc-900">📦 En Preparación</option>
            <option value="listo" className="dark:bg-zinc-900">🚀 Listo / Empaquetado</option>
            <option value="en_camino" className="dark:bg-zinc-900">🛵 En Camino</option>
            <option value="cerca" className="dark:bg-zinc-900">📍 Cerca del Domicilio</option>
            <option value="completado" className="dark:bg-zinc-900">✅ Entregado con Éxito</option>
            <option value="no_entregado" className="dark:bg-zinc-900">⚠️ No se pudo entregar</option>
            <option value="cancelado" className="dark:bg-zinc-900">❌ Cancelado</option>
          </select>

          <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 px-3 text-xs font-medium text-slate-800 dark:text-zinc-200 outline-none [color-scheme:light] dark:[color-scheme:dark]"
            />
            {filtroFecha && (
              <button
                type="button"
                onClick={() => setFiltroFecha('')}
                className="h-10 px-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
