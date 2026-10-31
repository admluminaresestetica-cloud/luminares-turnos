'use client';

interface HistorialPuntosListProps {
  historial: any[];
}

export default function HistorialPuntosList({ historial }: HistorialPuntosListProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-3 space-y-2 shadow-xs">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Historial de Puntos
        </span>
        <span className="text-[10px] text-muted-foreground font-medium">Últimos movimientos</span>
      </div>

      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
        {historial && historial.length > 0 ? (
          historial.map((item) => {
            const esPositivo = item.puntos > 0;
            return (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-muted/50 text-xs">
                <div className="space-y-0.5 pr-2">
                  <p className="font-semibold text-foreground line-clamp-1">{item.descripcion || 'Movimiento de puntos'}</p>
                  <p className="text-[9px] text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className={`font-black shrink-0 ${esPositivo ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {esPositivo ? `+${item.puntos}` : item.puntos} pts
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-[11px] text-center text-muted-foreground py-2">
            Aún no tenés movimientos registrados.
          </p>
        )}
      </div>
    </div>
  );
}
