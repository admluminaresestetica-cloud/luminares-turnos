'use client';

import { useState } from 'react';
import { CheckCircle2, Gift, Copy, Check, Sparkles } from 'lucide-react';

export interface DatosReservaExitosa {
  codigo: string;
  codigoReferidoPropio: string;
  detalle: string;
  fecha: string;
  hora: string;
}

interface Props {
  reservaExitosa: DatosReservaExitosa;
  onCerrar: () => void;
}

export default function ModalReservaExitosa({ reservaExitosa, onCerrar }: Props) {
  const [copiado, setCopiado] = useState(false);

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] p-5 sm:p-6 max-w-sm w-full text-center shadow-2xl border border-slate-200/80 relative overflow-hidden font-sans animate-in zoom-in-95 duration-200">
        
        {/* Glow sutil de fondo */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none" />

        {/* Badge de Confirmación */}
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200/80 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
          <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
        </div>
        
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          ¡Turno Reservado!
        </h3>
        
        <p className="text-xs text-slate-500 mt-1 mb-4 font-medium flex items-center justify-center gap-1.5">
          <span>Código de reserva:</span>
          <span className="font-mono font-extrabold text-slate-900 bg-slate-100/80 border border-slate-200 px-2 py-0.5 rounded-lg text-xs">
            {reservaExitosa.codigo}
          </span>
        </p>
        
        {/* Detalle del servicio y fecha */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 text-left space-y-2.5 mb-4 shadow-2xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-0.5">
              Servicio / Selección
            </span>
            <p className="text-xs text-slate-800 font-bold leading-snug">
              {reservaExitosa.detalle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-200/60">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-0.5">
                Fecha
              </span>
              <p className="text-xs text-slate-800 font-semibold">
                {reservaExitosa.fecha}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-0.5">
                Horario
              </span>
              <p className="text-xs text-slate-800 font-semibold">
                {reservaExitosa.hora} hs
              </p>
            </div>
          </div>
        </div>

        {/* Sección de Programa de Referidos */}
        {reservaExitosa.codigoReferidoPropio && (
          <div className="bg-gradient-to-br from-violet-50/80 to-purple-50/40 border border-violet-200/80 p-4 rounded-2xl mb-4 text-left shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-violet-900">
                <Gift className="w-4 h-4 shrink-0 stroke-[2.2] text-violet-600" />
                <span className="text-xs font-extrabold">¡Sumá beneficios!</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <p className="text-[11px] text-violet-800/90 mb-3 leading-relaxed font-medium">
              Compartí tu código con amigas. Si lo usan al reservar, ¡ganás un descuento para tu próxima sesión!
            </p>
            <div className="flex items-center justify-between bg-white border border-violet-200/90 rounded-xl p-2 shadow-2xs">
              <span className="font-mono text-xs font-black text-violet-950 tracking-wider px-1">
                {reservaExitosa.codigoReferidoPropio}
              </span>
              <button
                type="button"
                onClick={() => copiarCodigo(reservaExitosa.codigoReferidoPropio)}
                className="text-[11px] font-bold text-violet-700 hover:text-violet-900 flex items-center gap-1 bg-violet-50 hover:bg-violet-100/80 border border-violet-200 px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                {copiado ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                    <span className="text-emerald-700">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <p className="text-[11px] text-slate-400 mb-4 font-medium leading-normal">
          Si fuiste redirigido a WhatsApp, asegurate de enviar el mensaje para finalizar la coordinación.
        </p>

        <button
          type="button"
          onClick={onCerrar}
          className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-extrabold py-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-md cursor-pointer tracking-wide"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}