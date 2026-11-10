'use client';

import { useRef } from 'react';
import { Gift, Sparkles, Clock, AlertCircle } from 'lucide-react';

interface CanjesPendientesListProps {
  canjesPendientes: any[];
}

export default function CanjesPendientesList({ canjesPendientes }: CanjesPendientesListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!canjesPendientes || canjesPendientes.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Cabecera de la sección */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Gift className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-bold text-stone-700 dark:text-zinc-300 uppercase tracking-wider">
            Mis Cupones y Premios
          </h4>
        </div>
        <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          {canjesPendientes.length} pendiente{canjesPendientes.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* 📱 CARRUSEL HORIZONTAL DESLIZANTE DE CUPONES */}
      <div 
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x touch-pan-x"
      >
        {canjesPendientes.map((canje) => {
          const fechaCreacion = new Date(canje.created_at || Date.now());
          const fechaVencimiento = canje.fecha_expiracion 
            ? new Date(canje.fecha_expiracion) 
            : new Date(fechaCreacion.getTime() + 30 * 24 * 60 * 60 * 1000);

          const estaExpirado = new Date() > fechaVencimiento;
          const tituloPremio = canje.premios_catalogo?.titulo || 'Premio Canjeado';

          return (
            <div
              key={canje.id}
              className={`
                snap-start shrink-0 w-[260px] sm:w-[280px] p-4 rounded-[22px] border transition-all duration-200 flex flex-col justify-between gap-3 shadow-xs relative overflow-hidden
                ${
                  estaExpirado
                    ? 'bg-stone-100/80 border-stone-200 opacity-60 dark:bg-zinc-800/40 dark:border-zinc-800/60'
                    : 'bg-gradient-to-br from-emerald-500/[0.08] via-emerald-500/[0.03] to-white dark:to-zinc-900 border-emerald-500/20 dark:border-emerald-500/30'
                }
              `}
            >
              {/* Decoración de fondo sutil */}
              {!estaExpirado && (
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              )}

              {/* Parte superior de la tarjeta */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                    estaExpirado ? 'text-stone-400 dark:text-zinc-500' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {estaExpirado ? (
                      <>
                        <AlertCircle className="w-3 h-3" /> Expirado
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" /> Código de canje
                      </>
                    )}
                  </span>
                  <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Vence: {fechaVencimiento.toLocaleDateString('es-AR')}
                  </span>
                </div>

                <h5 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-zinc-100 line-clamp-1">
                  {tituloPremio}
                </h5>
              </div>

              {/* Parte inferior: Código o estado */}
              <div className="pt-2 border-t border-stone-200/60 dark:border-zinc-800/80 flex items-center justify-between">
                <span className="text-[10px] text-stone-500 dark:text-zinc-400 font-medium">
                  {estaExpirado ? 'No disponible' : 'Mostrá este código'}
                </span>

                {estaExpirado ? (
                  <span className="text-[10px] font-bold bg-stone-200/80 text-stone-600 px-3 py-1.5 rounded-xl dark:bg-zinc-800 dark:text-zinc-400">
                    Expirado
                  </span>
                ) : (
                  <div className="bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-emerald-500/30 shadow-2xs">
                    <span className="font-mono font-black text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 tracking-wider">
                      {canje.codigo_canje}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
