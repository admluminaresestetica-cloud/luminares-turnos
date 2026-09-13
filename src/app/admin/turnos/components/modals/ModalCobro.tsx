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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
        
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          disabled={guardandoCobro}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera del Modal */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shrink-0 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight dark:text-zinc-100">
              Completar y Cobrar Turno
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 dark:text-zinc-400">
              <User className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              <span>Cliente:</span>
              <strong className="text-gray-800 font-semibold dark:text-zinc-200">{turnoACobrar.cliente_nombre}</strong>
            </p>
          </div>
        </div>

        {/* Tarjeta Resumen del Cobro */}
        <div className="bg-gray-50/80 rounded-2xl p-4 mb-5 border border-gray-100 space-y-2.5 dark:bg-zinc-800/50 dark:border-zinc-800">
          <div className="flex justify-between items-start text-xs text-gray-600 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium text-gray-500 dark:text-zinc-400">
              <Receipt className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              Servicio / Detalle
            </span>
            <span className="font-semibold text-gray-800 text-right max-w-[60%] truncate dark:text-zinc-200">
              {renderDetalle(turnoACobrar)}
            </span>
          </div>

          <div className="pt-2 border-t border-gray-200/60 flex justify-between items-center dark:border-zinc-700/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
              Monto a cobrar
            </span>
            <span className="font-black text-emerald-600 text-xl tracking-tight dark:text-emerald-400">
              ${Number(turnoACobrar.precio_total || 0).toLocaleString('es-AR')}
            </span>
          </div>
        </div>

        {/* Selección del Medio de Pago */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5 dark:text-zinc-400">
            <CreditCard className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
            Medio de Pago Utilizado
          </label>
          <select
            value={medioPagoSeleccionado}
            onChange={(e) => setMedioPagoSeleccionado(e.target.value)}
            disabled={guardandoCobro}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
          >
            <option value="efectivo">💵 Efectivo</option>
            <option value="transferencia">🏦 Transferencia Bancaria</option>
            <option value="qr">📱 Mercado Pago / QR</option>
            <option value="tarjeta">💳 Tarjeta Débito / Crédito</option>
            <option value="otro">✨ Otro</option>
          </select>
        </div>

        {/* Acciones del Modal */}
        <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={guardandoCobro}
            className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={guardandoCobro}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none dark:bg-emerald-600 dark:hover:bg-emerald-500"
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
  )
}