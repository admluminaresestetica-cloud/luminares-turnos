'use client';

import { useState } from 'react';
import { User, Phone, Gift, ShieldCheck, MessageCircle, AlertCircle, Loader2, CreditCard } from 'lucide-react';

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
  onNombreChange: (val: string) => void;
  onCelularChange: (val: string) => void;
  onCodigoReferidoChange: (val: string) => void;
  onConfirmar: () => void;
  confirmando: boolean;
  error: string | null;
  colorAccent?: 'violet' | 'indigo' | 'rose';
  onPagarMercadoPago?: (montoAPagar: number) => void;
  cargandoMP?: boolean;
  onCancelarMP?: () => void;
}

const ACCENT_STYLES = {
  violet: {
    badge: 'bg-violet-50 text-violet-700 border-violet-200/80',
    button: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    focusRing: 'focus:border-violet-500 focus:ring-violet-500/20',
  },
  indigo: {
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    badgeSecondary: 'bg-slate-100 text-slate-700 border-slate-200/80',
    button: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    focusRing: 'focus:border-indigo-500 focus:ring-indigo-500/20',
  },
  rose: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
    badgeSecondary: 'bg-slate-100 text-slate-700 border-slate-200/80',
    button: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    focusRing: 'focus:border-rose-500 focus:ring-rose-500/20',
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
  onNombreChange,
  onCelularChange,
  onCodigoReferidoChange,
  onConfirmar,
  confirmando,
  error,
  colorAccent = 'violet',
  onPagarMercadoPago,
  cargandoMP = false,
  onCancelarMP,
}: Props) {
  const [opcionMP, setOpcionMP] = useState<'sena' | 'total'>('sena');

  const styles = ACCENT_STYLES[colorAccent] || ACCENT_STYLES.violet;

  // Formatear fecha para mostrar limpia
  const [year, month, day] = fecha.split('-');
  const fechaObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const fechaFormateada = fechaObj.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Cálculos base
  const precioFinalCalculado = Math.max(0, precioTotal - descuentoMonto);
  const montoSenaBase = Math.round((precioFinalCalculado * porcentajeSena) / 100);

  // Cálculos de Mercado Pago con el 10% de recargo por servicio
  const montoSenaMP = Math.round(montoSenaBase * 1.10);
  const montoTotalMP = Math.round(precioFinalCalculado * 1.10);

  const montoSeleccionadoMP = opcionMP === 'sena' ? montoSenaMP : montoTotalMP;
  const montoSinRecargoMP = opcionMP === 'sena' ? montoSenaBase : precioFinalCalculado;
  const recargoCalculadoMP = montoSeleccionadoMP - montoSinRecargoMP;

  const formValido = nombre.trim().length >= 3 && celular.replace(/\D/g, '').length >= 8;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* TARJETA DE RESUMEN DEL TURNO */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Servicio Seleccionado
            </span>
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight mt-0.5">
              {servicioDetalle}
            </p>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${styles.badge}`}>
            {duracionTotal} min
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/60">
          <span className="capitalize">{fechaFormateada}</span>
          <span className="text-slate-300">•</span>
          <span>{hora} hs</span>
        </div>

        {/* DESGLOSE DE PRECIOS */}
        <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-xs">
          {descuentoMonto > 0 && (
            <div className="flex justify-between items-center text-slate-500">
              <span>Precio original:</span>
              <span className="line-through">${precioTotal.toLocaleString('es-AR')}</span>
            </div>
          )}

          {descuentoMonto > 0 && (
            <div className="flex justify-between items-center text-emerald-600 font-medium">
              <span>Descuento por referido:</span>
              <span>-${descuentoMonto.toLocaleString('es-AR')}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-900 font-bold pt-1">
            <span>Total del servicio:</span>
            <span className="text-sm">${precioFinalCalculado.toLocaleString('es-AR')}</span>
          </div>

          <div className="flex justify-between items-center text-slate-500 text-[11px]">
            <span>Seña sugerida para congelar turno ({porcentajeSena}%):</span>
            <span className="font-semibold text-slate-700">${montoSenaBase.toLocaleString('es-AR')}</span>
          </div>
        </div>
      </div>

      {/* FORMULARIO DE DATOS DEL CLIENTE */}
      <div className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nombre y Apellido *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ej: María González"
              value={nombre}
              onChange={(e) => onNombreChange(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${styles.focusRing}`}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Celular (WhatsApp) *
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              placeholder="Ej: 3411234567"
              value={celular}
              onChange={(e) => onCelularChange(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${styles.focusRing}`}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            ¿Tenés un código de recomendada? <span className="text-slate-400 font-normal lowercase">(opcional)</span>
          </label>
          <div className="relative">
            <Gift className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ej: MARIA-A8F2"
              value={codigoReferidoUsado}
              onChange={(e) => onCodigoReferidoChange(e.target.value.toUpperCase())}
              className={`w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 uppercase tracking-wider placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${styles.focusRing}`}
            />
          </div>
          {mensajeReferido && (
            <p className={`text-xs mt-1.5 font-medium ${referidoValido ? 'text-emerald-600' : 'text-rose-500'}`}>
              {mensajeReferido}
            </p>
          )}
        </div>
      </div>

      {/* MENSAJE DE ERROR */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start gap-2 text-rose-700 text-xs font-medium animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* OPCIONES DE PAGO Y CONFIRMACIÓN */}
      <div className="space-y-3 pt-2">
        {/* BLOQUE OPCIONAL DE MERCADO PAGO */}
        {onPagarMercadoPago && (
          <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center gap-2 text-sky-900 font-bold text-xs sm:text-sm">
              <CreditCard className="w-4 h-4 text-sky-600" />
              <span>Pagar online con Mercado Pago</span>
            </div>

            {/* Selector de Monto (Seña o Total) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOpcionMP('sena')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                  opcionMP === 'sena'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Seña (${montoSenaMP.toLocaleString('es-AR')})
              </button>
              <button
                type="button"
                onClick={() => setOpcionMP('total')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                  opcionMP === 'total'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Total (${montoTotalMP.toLocaleString('es-AR')})
              </button>
            </div>

            {/* Leyenda aclaratoria del recargo */}
            <p className="text-[11px] text-slate-500 font-medium leading-tight">
              * Los pagos con Mercado Pago incluyen un <strong>10% de recargo por servicio</strong> (${recargoCalculadoMP.toLocaleString('es-AR')}).
            </p>

            <button
              type="button"
              disabled={!formValido || confirmando || cargandoMP}
              onClick={() => onPagarMercadoPago(montoSeleccionadoMP)}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3.5 rounded-xl shadow-xs text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {cargandoMP ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando pago Mercado Pago...
                </span>
              ) : (
                <span>Pagar con Mercado Pago (${montoSeleccionadoMP.toLocaleString('es-AR')})</span>
              )}
            </button>

            {/* Opción de cancelar la carga manual */}
            {cargandoMP && onCancelarMP && (
              <button
                type="button"
                onClick={onCancelarMP}
                className="w-full text-center text-[11px] text-slate-500 hover:text-slate-800 underline transition-colors pt-0.5 block"
              >
                Cancelar y elegir otro medio
              </button>
            )}
          </div>
        )}

        {/* BOTÓN PRINCIPAL DE WHATSAPP / SEÑAR LUEGO */}
        <button
          type="button"
          disabled={!formValido || confirmando || cargandoMP}
          onClick={onConfirmar}
          className={`w-full font-bold py-3.5 rounded-xl shadow-xs text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 ${styles.button}`}
        >
          {confirmando ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando reserva...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 fill-white" />
              Confirmar reserva por WhatsApp
            </span>
          )}
        </button>

        <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Tus datos se encuentran protegidos</span>
        </p>
      </div>
    </div>
  );
}
