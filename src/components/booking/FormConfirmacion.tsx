'use client';

import { 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Loader2, 
  Gift,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Check
} from 'lucide-react';
import { calcularMontoSena } from '@/lib/whatsapp';
import { formatFechaDisplay } from '@/lib/calendario/slots';
import { Dispatch, SetStateAction } from 'react';

export type OpcionPago = 'sena' | 'total';

interface Props {
  servicioDetalle: string;
  precioTotal: number;
  duracionTotal: number;
  fecha: string;
  hora: string;
  porcentajeSena: number;
  nombre: string;
  celular: string;
  codigoReferidoUsado: string;
  descuentoMonto: number;
  referidoValido: boolean | null;
  mensajeReferido: string | null;
  opcionPago: OpcionPago;
  onNombreChange: (val: string) => void;
  onCelularChange: (val: string) => void;
  onCodigoReferidoChange: (val: string) => void;
  onOpcionPagoChange: ((val: OpcionPago) => void) | Dispatch<SetStateAction<OpcionPago>>;
  onConfirmar: () => void;
  confirmando: boolean;
  error: string | null;
  colorAccent?: 'violet' | 'indigo' | 'rose';
}

const COLOR_ACCENTS = {
  violet: {
    badgeSena: 'bg-violet-50 text-violet-700 border-violet-200/80',
    focusRing: 'focus:ring-violet-500/20 focus:border-violet-600',
    button: 'bg-violet-600 hover:bg-violet-500 text-white shadow-sm',
    borderSelected: 'border-violet-600 bg-violet-50/40 text-violet-900',
  },
  indigo: {
    badgeSena: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    focusRing: 'focus:ring-indigo-500/20 focus:border-indigo-600',
    button: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm',
    borderSelected: 'border-indigo-600 bg-indigo-50/40 text-indigo-900',
  },
  rose: {
    badgeSena: 'bg-rose-50 text-rose-700 border-rose-200/80',
    focusRing: 'focus:ring-rose-500/20 focus:border-rose-600',
    button: 'bg-rose-500 hover:bg-rose-400 text-white shadow-sm',
    borderSelected: 'border-rose-500 bg-rose-50/40 text-rose-900',
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
  codigoReferidoUsado,
  descuentoMonto,
  referidoValido,
  mensajeReferido,
  opcionPago,
  onNombreChange,
  onCelularChange,
  onCodigoReferidoChange,
  onOpcionPagoChange,
  onConfirmar,
  confirmando,
  error,
  colorAccent = 'violet',
}: Props) {
  const precioFinal = Math.max(0, precioTotal - descuentoMonto);
  const montoSena = calcularMontoSena(precioFinal, porcentajeSena);
  const styles = COLOR_ACCENTS[colorAccent] || COLOR_ACCENTS.violet;

  const puedeConfirmar = nombre.trim().length >= 2 && celular.replace(/\D/g, '').length >= 8;
  const montoAPagar = opcionPago === 'sena' ? montoSena : precioFinal;

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      
      {/* Resumen de la Reserva */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 space-y-3">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200/60">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Servicio Seleccionado
            </span>
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
              {servicioDetalle}
            </p>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-200/80 shrink-0 text-slate-700">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/60">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-800 truncate">
              {formatFechaDisplay(fecha)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/60">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-800">
              {hora} hs <span className="text-slate-400 font-normal">({duracionTotal}m)</span>
            </span>
          </div>
        </div>

        {/* Desglose de Precios */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total del Servicio
            </p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-base sm:text-lg font-black text-slate-900">
                ${precioFinal.toLocaleString('es-AR')}
              </p>
              {descuentoMonto > 0 && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  ${precioTotal.toLocaleString('es-AR')}
                </span>
              )}
            </div>
          </div>

          <div className={`px-2.5 py-1.5 sm:px-3 rounded-xl border ${styles.badgeSena} text-right`}>
            <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">
              Seña ({porcentajeSena}%)
            </p>
            <p className="text-xs sm:text-sm font-bold">
              ${montoSena.toLocaleString('es-AR')}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario de Datos */}
      <div className="space-y-3 sm:space-y-3.5">
        <div>
          <label htmlFor="nombre" className="block text-xs font-bold text-slate-800 mb-1">
            Nombre completo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => onNombreChange(e.target.value)}
              placeholder="Ej: María García"
              className={`w-full pl-10 pr-3.5 py-3 text-base sm:text-sm bg-white border border-slate-200/80 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all outline-none ${styles.focusRing}`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="celular" className="block text-xs font-bold text-slate-800 mb-1">
            Celular (WhatsApp)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              id="celular"
              type="tel"
              value={celular}
              onChange={(e) => onCelularChange(e.target.value)}
              placeholder="Ej: 11 2345-6789"
              className={`w-full pl-10 pr-3.5 py-3 text-base sm:text-sm bg-white border border-slate-200/80 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all outline-none ${styles.focusRing}`}
            />
          </div>
        </div>

        {/* Input Opcional: Código de Recomendada */}
        <div>
          <label htmlFor="codigoReferido" className="block text-xs font-bold text-slate-800 mb-1">
            ¿Tenés un código de recomendada? <span className="text-slate-400 font-normal">(Opcional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Gift className="w-4 h-4 text-violet-500" />
            </div>
            <input
              id="codigoReferido"
              type="text"
              value={codigoReferidoUsado}
              onChange={(e) => onCodigoReferidoChange(e.target.value.toUpperCase())}
              placeholder="Ej: MARIA-A8F2"
              className={`w-full pl-10 pr-3.5 py-3 text-base sm:text-sm bg-white border border-slate-200/80 rounded-xl text-slate-900 uppercase placeholder:normal-case placeholder:text-slate-400 transition-all outline-none ${styles.focusRing}`}
            />
          </div>
          
          {mensajeReferido && (
            <div className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium ${referidoValido ? 'text-emerald-600' : 'text-amber-600'}`}>
              {referidoValido ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{mensajeReferido}</span>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN DE OPCIÓN DE PAGO (MERCADO PAGO) */}
      <div className="space-y-2 pt-2">
        <label className="block text-xs font-bold text-slate-800">
          ¿Cuánto querés abonar ahora por Mercado Pago?
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Opción 1: Seña */}
          <button
            type="button"
            onClick={() => onOpcionPagoChange('sena')}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
              opcionPago === 'sena'
                ? styles.borderSelected
                : 'border-slate-200/80 bg-white hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold">Pagar Seña ({porcentajeSena}%)</span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${opcionPago === 'sena' ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300'}`}>
                {opcionPago === 'sena' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
            <span className="text-sm font-black text-slate-900">${montoSena.toLocaleString('es-AR')}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Saldo restante en el local</span>
          </button>

          {/* Opción 2: Total 100% */}
          <button
            type="button"
            onClick={() => onOpcionPagoChange('total')}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
              opcionPago === 'total'
                ? styles.borderSelected
                : 'border-slate-200/80 bg-white hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold">Pago Total (100%)</span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${opcionPago === 'total' ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300'}`}>
                {opcionPago === 'total' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
            <span className="text-sm font-black text-slate-900">${precioFinal.toLocaleString('es-AR')}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Sin saldo pendiente</span>
          </button>
        </div>
      </div>

      {/* Mensaje de Error General */}
      {error && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200/80 rounded-xl p-3 font-medium">
          {error}
        </div>
      )}

      {/* Botón de Confirmación y Pago */}
      <button
        type="button"
        onClick={onConfirmar}
        disabled={!puedeConfirmar || confirmando}
        className={`w-full font-bold py-3.5 rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${styles.button}`}
      >
        {confirmando ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generando pago...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            <span>Pagar ${montoAPagar.toLocaleString('es-AR')} con Mercado Pago</span>
          </>
        )}
      </button>

      {/* Disclaimer */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 font-medium text-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Serás redirigido de forma segura a Mercado Pago.</span>
      </div>

    </div>
  );
}