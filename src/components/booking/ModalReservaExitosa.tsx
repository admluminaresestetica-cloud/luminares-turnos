'use client';

import { useState } from 'react';
import { CheckCircle2, Gift, Copy, Check } from 'lucide-react';

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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-[28px] p-5 sm:p-6 max-w-sm w-full text-center shadow-xl border border-slate-200/80 relative overflow-hidden font-sans">
        
        {/* Badge de Confirmación */}
        <div className="w-13 h-13 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200/60 flex items-center justify-center mx-auto mb-3.5 shadow-xs">
          <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
        </div>
        
        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">¡Turno Reservado!</h3>
        
        <p className="text-xs text-slate-500 mt-1 mb-4 font-medium">
          Código de reserva: <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200/80 px-2 py-0.5 rounded-lg shadow-xs">{reservaExitosa.codigo}</span>
        </p>
        
        {/* Detalle del servicio y fecha */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 text-left space-y-2 mb-3.5 shadow-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Servicio / Selección</span>
            <p className="text-xs text-slate-800 font-bold leading-snug">{reservaExitosa.detalle}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Fecha</span>
              <p className="text-xs text-slate-800 font-semibold">{reservaExitosa.fecha}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Horario</span>
              <p className="text-xs text-slate-800 font-semibold">{reservaExitosa.hora} hs</p>
            </div>
          </div>
        </div>

        {/* Sección de Programa de Referidos */}
        {reservaExitosa.codigoReferidoPropio && (
          <div className="bg-violet-50/50 border border-violet-200/70 p-3.5 rounded-2xl mb-4 text-left shadow-xs">
            <div className="flex items-center gap-1.5 text-violet-800 mb-1">
              <Gift className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
              <span className="text-[11px] font-extrabold">¡Sumá descuentos!</span>
            </div>
            <p className="text-[10px] text-violet-700/90 mb-2.5 leading-relaxed font-medium">
              Compartí tu código con tus amigas. Si lo usan al reservar, ¡sumás un beneficio para tu próxima sesión!
            </p>
            <div className="flex items-center justify-between bg-white border border-violet-200/80 rounded-xl p-2 shadow-xs">
              <span className="font-mono text-xs font-black text-violet-950 tracking-wide px-1">
                {reservaExitosa.codigoReferidoPropio}
              </span>
              <button
                type="button"
                onClick={() => copiarCodigo(reservaExitosa.codigoReferidoPropio)}
                className="text-[10px] font-bold text-violet-700 hover:text-violet-900 flex items-center gap-1 bg-white hover:bg-violet-50 border border-violet-200/80 px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                {copiado ? <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" /> : <Copy className="w-3 h-3 stroke-[2]" />}
                <span>{copiado ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        )}

        <p className="text-[10px] sm:text-[11px] text-slate-400 mb-4 font-medium leading-normal">
          Si fuiste redirigido a WhatsApp, asegurate de enviar el mensaje para finalizar la coordinación.
        </p>

        <button
          type="button"
          onClick={onCerrar}
          className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-xs cursor-pointer tracking-wide"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}