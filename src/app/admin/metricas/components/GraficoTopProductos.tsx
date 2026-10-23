'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';

export interface ProductoTop {
  nombre: string;
  cantidad: number;
  total: number;
}

interface GraficoTopProductosProps {
  data: ProductoTop[];
  loading?: boolean;
}

export default function GraficoTopProductos({ data, loading = false }: GraficoTopProductosProps) {
  const maxCantidad = Math.max(...data.map((d) => d.cantidad), 1);

return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        {/* Encabezado de la Tarjeta */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 shadow-2xs shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                Productos Más Vendidos
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-0.5">
                Unidades vendidas y facturación estimada
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400 dark:text-zinc-500 text-xs font-bold text-center">
            No hay registro de ventas de productos en este período
          </div>
        ) : (
          <div className="space-y-3 my-2">
            {data.map((prod, index) => {
              const porcentaje = Math.round((prod.cantidad / maxCantidad) * 100);
              return (
                <div 
                  key={index} 
                  className="space-y-2 bg-slate-50/60 dark:bg-zinc-800/40 p-3 sm:p-3.5 rounded-2xl border border-slate-100 dark:border-zinc-800/80 hover:bg-slate-100/60 dark:hover:bg-zinc-800/70 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-900 dark:text-zinc-100 font-bold truncate max-w-[160px] sm:max-w-[200px]">
                      {prod.nombre}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-black font-mono text-xs sm:text-sm">
                        ${prod.total.toLocaleString('es-AR')}
                      </span>
                      <span className="text-slate-400 dark:text-zinc-500 font-bold text-[11px]">
                        ({prod.cantidad} u.)
                      </span>
                    </div>
                  </div>
                  {/* Barra de progreso visual */}
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}