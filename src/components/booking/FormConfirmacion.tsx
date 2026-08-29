'use client';

import { 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Loader2, 
  MessageCircle,
  Gift,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { calcularMontoSena } from '@/lib/whatsapp';
import { formatFechaDisplay } from '@/lib/calendario/slots';

interface Props {
  servicioDetalle: string;
  precioTotal: number;
  duracionTotal: number;
  fecha: string;
  hora: string;
  porcentajeSena: number;
  nombre: string;
  celular: string;
  codigoReferidoUsado?: string;
  descuentoMonto?: number;
  referidoValido?: boolean | null;
  mensajeReferido?: string | null;
  onNombreChange: (v: string) => void;
  onCelularChange: (v: string) => void;
  onCodigoReferidoChange?: (v: string) => void;
  onConfirmar: () => void;
  confirmando?: boolean;
  error?: string | null;
  colorAccent?: 'violet' | 'indigo' | 'rose';
}

const COLOR_ACCENTS = {
  violet: {
    badgeSena: 'bg-violet-50 text-violet-700 border-violet-200/80',
    focusRing: 'focus:ring-violet-500/15 focus:border-violet-500',
    button: 'bg-violet-600 hover:bg-violet-500 active:bg-violet-700 shadow-violet-600/25',
    iconChip: 'bg-violet-50 text-violet-600',
    dot: 'bg-violet-600',
  },
  indigo: {
    badgeSena: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    focusRing: 'focus:ring-indigo-500/15 focus:border-indigo-500',
    button: 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-indigo-600/25',
    iconChip: 'bg-indigo-50 text-indigo-600',
    dot: 'bg-indigo-600',
  },
  rose: {
    badgeSena: 'bg-rose-50 text-rose-700 border-rose-200/80',
    focusRing: 'focus:ring-rose-500/15 focus:border-rose-500',
    button: 'bg-rose-500 hover:bg-rose-400 active:bg-rose-600 shadow-rose-500/25',
    iconChip: 'bg-rose-50 text-rose-600',
    dot: 'bg-rose-500',
  },
};

export default function FormConfirmacion({
  servicioDetalle,
  precioTotal,
  duracionTotal,
  fecha,
  hora,
  porcentajeSena,
  nombre,
  celular,
  codigoReferidoUsado = '',
  descuentoMonto = 0,
  referidoValido = null,
  mensajeReferido = null,
  onNombreChange,
  onCelularChange,
  onCodigoReferidoChange,
  onConfirmar,
  confirmando,
  error,
  colorAccent = 'violet',
}: Props) {
  const precioFinal = Math.max(0, precioTotal - descuentoMonto);
  const montoSena = calcularMontoSena(precioFinal, porcentajeSena);
  const styles = COLOR_ACCENTS[colorAccent] || COLOR_ACCENTS.violet;

  const puedeConfirmar = nombre.trim().length >= 2 && celular.replace(/\D/g, '').length >= 8;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">

      {/* Resumen de la Reserva — estilo "boarding pass" */}
      <div className="relative">
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm shadow-slate-200/60">
          {/* Encabezado */}
          <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Tu reserva
              </span>
              <p className="text-sm font-bold text-slate-900 leading-snug truncate">
                {servicioDetalle}
              </p>
            </div>
            <div className={`p-2.5 rounded-2xl shrink-0 ${styles.iconChip}`}>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* Línea perforada (efecto ticket) */}
          <div className="relative flex items-center px-4 sm:px-5">
            <div className="absolute left-[-14px] w-6 h-6 rounded-full bg-slate-50" />
            <div className="w-full border-t border-dashed border-slate-200" />
            <div className="absolute right-[-14px] w-6 h-6 rounded-full bg-slate-50" />
          </div>

          {/* Fecha / hora */}
          <div className="grid grid-cols-2 gap-2 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-2xl">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-bold truncate">
                {formatFechaDisplay(fecha)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-2xl">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-bold">
                {hora} hs <span className="text-slate-400 font-medium">· {duracionTotal}m</span>
              </span>
            </div>
          </div>

          {/* Precio y seña */}
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pb-4 sm:pb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                Total a pagar
              </p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-xl font-black text-slate-900 tracking-tight">
                  ${precioFinal.toLocaleString('es-AR')}
                </p>
                {descuentoMonto > 0 && (
                  <span className="text-xs text-slate-400 line-through font-medium">
                    ${precioTotal.toLocaleString('es-AR')}
                  </span>
                )}
              </div>
            </div>

            <div className={`px-3 py-2 rounded-2xl border ${styles.badgeSena} text-right`}>
              <p className="text-[9px] uppercase font-bold tracking-[0.1em] opacity-80">
                Seña · {porcentajeSena}%
              </p>
              <p className="text-sm font-black">
                ${montoSena.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de Datos */}
      <div className="space-y-3">
        <div>
          <label htmlFor="nombre" className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">
            Nombre completo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => onNombreChange(e.target.value)}
              placeholder="Ej: María García"
              className={`w-full pl-11 pr-4 py-3.5 text-[15px] sm:text-sm bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 transition-all duration-150 outline-none focus:ring-4 ${styles.focusRing}`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="celular" className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">
            Celular (WhatsApp)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              id="celular"
              type="tel"
              value={celular}
              onChange={(e) => onCelularChange(e.target.value)}
              placeholder="Ej: 11 2345-6789"
              className={`w-full pl-11 pr-4 py-3.5 text-[15px] sm:text-sm bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 transition-all duration-150 outline-none focus:ring-4 ${styles.focusRing}`}
            />
          </div>
        </div>

        {/* Input Opcional: Código de Recomendada / Referida */}
        {onCodigoReferidoChange && (
          <div>
            <label htmlFor="codigoReferido" className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">
              ¿Tenés un código de recomendada? <span className="text-slate-400 font-medium">(Opcional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Gift className="w-4 h-4 text-violet-500" />
              </div>
              <input
                id="codigoReferido"
                type="text"
                value={codigoReferidoUsado}
                onChange={(e) => onCodigoReferidoChange(e.target.value.toUpperCase())}
                placeholder="Ej: MARIA-A8F2"
                className={`w-full pl-11 pr-4 py-3.5 text-[15px] sm:text-sm bg-white border border-slate-200 rounded-2xl text-slate-900 uppercase placeholder:normal-case placeholder:text-slate-400 transition-all duration-150 outline-none focus:ring-4 ${styles.focusRing}`}
              />
            </div>

            {/* Feedback del código */}
            {mensajeReferido && (
              <div className={`mt-2 ml-1 flex items-center gap-1.5 text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-200 ${referidoValido ? 'text-emerald-600' : 'text-amber-600'}`}>
                {referidoValido ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{mensajeReferido}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mensaje de Error General */}
      {error && (
        <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200/80 rounded-2xl p-3.5 font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      {/* Botón de Confirmación */}
      <button
        type="button"
        onClick={onConfirmar}
        disabled={!puedeConfirmar || confirmando}
        className={`w-full font-bold py-4 rounded-2xl transition-all duration-150 text-sm text-white flex items-center justify-center gap-2 active:scale-[0.97] disabled:opacity-40 disabled:shadow-none disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg ${styles.button}`}
      >
        {confirmando ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Confirmando reserva...</span>
          </>
        ) : (
          <>
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Confirmar y enviar por WhatsApp</span>
          </>
        )}
      </button>

      {/* Disclaimer */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium text-center px-4">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Se redirigirá a WhatsApp para coordinar el pago de la seña.</span>
      </div>

    </div>
  );
}
