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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full text-center shadow-2xl border border-slate-100">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3.5">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        
        <h3 className="text-base sm:text-lg font-bold text-slate-900">¡Turno Reservado!</h3>
        
        <p className="text-xs text-slate-500 mt-1 mb-3">
          Código de reserva: <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{reservaExitosa.codigo}</span>
        </p>
        
        <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-100 text-left space-y-2 mb-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Servicio / Selección</span>
            <p className="text-xs text-slate-700 font-semibold">{reservaExitosa.detalle}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Fecha</span>
              <p className="text-xs text-slate-700 font-medium">{reservaExitosa.fecha}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Horario</span>
              <p className="text-xs text-slate-700 font-medium">{reservaExitosa.hora} hs</p>
            </div>
          </div>
        </div>

        {reservaExitosa.codigoReferidoPropio && (
          <div className="bg-violet-50/70 border border-violet-100 p-3 rounded-xl mb-4 text-left">
            <div className="flex items-center gap-1.5 text-violet-800 mb-1">
              <Gift className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] font-bold">¡Sumá descuentos!</span>
            </div>
            <p className="text-[10px] text-violet-600 mb-2 leading-tight">
              Compartí tu código con tus amigas. Si lo usan al reservar, ¡sumás un beneficio para tu próxima sesión!
            </p>
            <div className="flex items-center justify-between bg-white border border-violet-200/80 rounded-lg p-2">
              <span className="font-mono text-xs font-black text-violet-900 tracking-wide">
                {reservaExitosa.codigoReferidoPropio}
              </span>
              <button
                type="button"
                onClick={() => copiarCodigo(reservaExitosa.codigoReferidoPropio)}
                className="text-[10px] font-bold text-violet-700 hover:text-violet-900 flex items-center gap-1 bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded-md transition-colors"
              >
                {copiado ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiado ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        )}

        <p className="text-[10px] sm:text-[11px] text-slate-400 mb-4 sm:mb-5 leading-tight">
          Si fuiste redirigido a WhatsApp, asegurate de enviar el mensaje para finalizar la coordinación.
        </p>

        <button
          type="button"
          onClick={onCerrar}
          className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold py-3 rounded-xl text-xs transition-all shadow-xs"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}