// src/components/admin/modals/ModalCobro.tsx
'use client'

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Completar y Cobrar Turno
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Cliente: <span className="font-semibold text-gray-800">{turnoACobrar.cliente_nombre}</span>
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Servicio / Detalle:</span>
            <span className="font-medium text-gray-800">{renderDetalle(turnoACobrar)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Monto a cobrar:</span>
            <span className="font-bold text-emerald-600 text-base">
              ${Number(turnoACobrar.precio_total || 0).toLocaleString('es-AR')}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
            Medio de Pago Utilizado
          </label>
          <select
            value={medioPagoSeleccionado}
            onChange={(e) => setMedioPagoSeleccionado(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="qr">Mercado Pago / QR</option>
            <option value="tarjeta">Tarjeta Débito / Crédito</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition"
            disabled={guardandoCobro}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={guardandoCobro}
            className="px-5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm disabled:opacity-50"
          >
            {guardandoCobro ? 'Guardando...' : 'Confirmar Cobro'}
          </button>
        </div>
      </div>
    </div>
  )
}