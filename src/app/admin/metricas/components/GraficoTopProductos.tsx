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
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-500" />
              Productos Más Vendidos
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Unidades vendidas y facturación estimada
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-xs font-medium">
            No hay registro de ventas de productos en este período
          </div>
        ) : (
          <div className="space-y-4 my-2">
            {data.map((prod, index) => {
              const porcentaje = Math.round((prod.cantidad / maxCantidad) * 100);
              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-zinc-200 font-semibold truncate max-w-[180px]">
                      {prod.nombre}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        ${prod.total.toLocaleString('es-AR')}
                      </span>
                      <span className="text-slate-400 dark:text-zinc-500 text-[11px]">
                        ({prod.cantidad} u.)
                      </span>
                    </div>
                  </div>
                  {/* Barra de progreso visual */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
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