interface CanjesPendientesListProps {
  canjesPendientes: any[];
}

export default function CanjesPendientesList({ canjesPendientes }: CanjesPendientesListProps) {
  if (canjesPendientes.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
          Premios listos para retirar
        </h4>
        <span className="text-[10px] font-extrabold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {canjesPendientes.length} pendiente{canjesPendientes.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2">
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
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-xs ${
                estaExpirado
                  ? 'bg-stone-100 border-stone-200 opacity-60 dark:bg-zinc-800/40 dark:border-zinc-800/60'
                  : 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/[0.05] to-transparent border-emerald-500/20 dark:border-emerald-500/30'
              }`}
            >
              <div className="min-w-0 space-y-0.5">
                <span className={`text-[10px] font-black uppercase tracking-wider block ${
                  estaExpirado ? 'text-stone-400 dark:text-zinc-500' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {estaExpirado ? '⚠️ Cupón Expirado' : 'Código de canje'}
                </span>
                <h5 className="text-xs font-extrabold text-stone-900 dark:text-zinc-100 truncate">
                  {tituloPremio}
                </h5>
                <p className="text-[10px] text-stone-400 dark:text-zinc-500 font-medium">
                  Vence el: {fechaVencimiento.toLocaleDateString('es-AR')}
                </p>
              </div>

              <div className="shrink-0 text-right">
                {estaExpirado ? (
                  <span className="text-[10px] font-bold bg-stone-200 text-stone-600 px-3 py-1.5 rounded-xl dark:bg-zinc-800 dark:text-zinc-400">
                    Expirado
                  </span>
                ) : (
                  <div className="bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-emerald-500/20 shadow-2xs">
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