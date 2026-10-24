// src/components/admin/modals/ModalCobro.tsx
'use client'

import { Banknote, X, Loader2, CheckCircle2, User, Receipt, CreditCard } from 'lucide-react'
import { Reserva, renderDetalle } from '../types'

interface ModalCobroProps {
  turnoACobrar: Reserva
  medioPagoSeleccionado: string
  setMedioPagoSeleccionado: (v: string) => void
  guardandoCobro: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function ModalCobro({
  turnoACobrar,
  medioPagoSeleccionado,
  setMedioPagoSeleccionado,
  guardandoCobro,
  onConfirm,
  onClose
}: ModalCobroProps) {
return (
  <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-all flex items-end sm:items-center justify-center">
    {/* MOBILE: bottom sheet · DESKTOP (sm:): modal flotante centrado */}
    <div
      className="fixed inset-x-0 bottom-0 z-50 w-full bg-white dark:bg-zinc-900 rounded-t-[32px] shadow-2xl border border-slate-200/80 dark:border-zinc-800 max-h-[92vh] overflow-y-auto transition-all animate-in slide-in-from-bottom duration-300 pb-[env(safe-area-inset-bottom)]
        sm:inset-x-0 sm:mx-auto sm:max-w-md sm:rounded-3xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:fade-in sm:zoom-in-95 sm:duration-200 sm:pb-0"
    >
      {/* Handle visual solo en mobile */}
      <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700/80 rounded-full mx-auto my-3 sm:hidden" />

      <div className="relative px-5 pb-6 pt-1 sm:p-7 overflow-hidden">
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          disabled={guardandoCobro}
          className="absolute top-3 right-3 sm:top-6 sm:right-6 text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-95 select-none transition-all disabled:opacity-50 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera del Modal */}
        <div className="flex items-center gap-3.5 mb-5 pr-10">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-zinc-100 leading-tight tracking-tight">
              Completar y Cobrar Turno
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Cliente:</span>
              <strong className="text-slate-800 dark:text-zinc-200 font-bold truncate">
                {turnoACobrar.cliente_nombre}
              </strong>
            </p>
          </div>
        </div>

        {/* Tarjeta Resumen del Cobro */}
        <div className="bg-slate-50/80 dark:bg-zinc-800/50 rounded-2xl p-4 mb-5 border border-slate-200/80 dark:border-zinc-700/60 space-y-3">
          <div className="flex justify-between items-start text-xs text-slate-600 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-zinc-400">
              <Receipt className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Servicio / Detalle
            </span>
            <span className="font-bold text-slate-800 dark:text-zinc-200 text-right max-w-[60%] truncate">
              {renderDetalle(turnoACobrar)}
            </span>
          </div>

          <div className="pt-2.5 border-t border-slate-200/60 dark:border-zinc-700/60 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Monto a cobrar
            </span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-2xl tracking-tight">
              ${Number(turnoACobrar.precio_total || 0).toLocaleString('es-AR')}
            </span>
          </div>
        </div>

        {/* Selección del Medio de Pago */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Medio de Pago Utilizado
          </label>
          <select
            value={medioPagoSeleccionado}
            onChange={(e) => setMedioPagoSeleccionado(e.target.value)}
            disabled={guardandoCobro}
            className="w-full px-3.5 py-3 sm:py-2.5 border border-slate-200 dark:border-zinc-700/80 rounded-2xl bg-slate-50/50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-800 text-slate-800 dark:text-zinc-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs cursor-pointer"
          >
            <option value="efectivo" className="bg-white dark:bg-zinc-900">💵 Efectivo</option>
            <option value="transferencia" className="bg-white dark:bg-zinc-900">🏦 Transferencia Bancaria</option>
            <option value="qr" className="bg-white dark:bg-zinc-900">📱 Mercado Pago / QR</option>
            <option value="tarjeta" className="bg-white dark:bg-zinc-900">💳 Tarjeta Débito / Crédito</option>
            <option value="otro" className="bg-white dark:bg-zinc-900"> Otro</option>
          </select>
        </div>

        {/* Acciones del Modal */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={guardandoCobro}
            className="w-full sm:w-auto min-h-[42px] px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 active:scale-95 select-none rounded-2xl transition-all disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={guardandoCobro}
            className="w-full sm:w-auto min-h-[42px] justify-center inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all shadow-md shadow-emerald-500/10 active:scale-95 select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {guardandoCobro ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Cobro</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);
}