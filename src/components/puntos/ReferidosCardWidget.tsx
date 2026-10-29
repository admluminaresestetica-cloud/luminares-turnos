'use client';

import { Gift, Loader2, Copy, Check } from 'lucide-react';

interface ReferidosCardWidgetProps {
  clienteData: any;
  cargandoReferido: boolean;
  copiado: boolean;
  onCopiarCodigo: () => void;
}

export default function ReferidosCardWidget({
  clienteData,
  cargandoReferido,
  copiado,
  onCopiarCodigo,
}: ReferidosCardWidgetProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-3.5 space-y-2.5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 flex items-center gap-1">
          <Gift className="w-3.5 h-3.5" /> Programa de Referidos
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${clienteData?.codigo_activo ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
          {clienteData?.codigo_activo ? 'Activo' : 'Pendiente de activación'}
        </span>
      </div>

      {cargandoReferido ? (
        <div className="flex items-center justify-center py-2 text-xs text-muted-foreground gap-2 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando tu código...
        </div>
      ) : clienteData?.codigo_activo ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-muted/60 p-2.5 rounded-xl border border-border">
            <div>
              <p className="text-[10px] text-muted-foreground">Tu código único:</p>
              <p className="font-mono font-bold text-sm text-foreground tracking-wider">{clienteData.codigo_referido}</p>
            </div>
            <button
              type="button"
              onClick={onCopiarCodigo}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiado ? '¡Copiado!' : 'Copiar'}</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] px-1">
            <span className="text-muted-foreground">Beneficios disponibles:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{clienteData.descuentos_disponibles || 0}</span>
          </div>
        </div>
      ) : (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 space-y-1.5 text-center">
          <p className="font-mono font-bold text-xs text-foreground tracking-wider">{clienteData?.codigo_referido || '—'}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Completá tu primera reserva y asisti a tu cita para activar tu código y empezar a regalar y recibir descuentos.
          </p>
        </div>
      )}
    </div>
  );
}
