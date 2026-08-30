// src/components/admin/modals/ModalEditarTurno.tsx
'use client'

import { Edit3, X, Loader2, User, Phone, Calendar, FileText, DollarSign, CreditCard, CheckCircle2 } from 'lucide-react'
import { TurnoForm } from '../types'

interface ModalEditarTurnoProps {
  turnoEdit: TurnoForm
  setTurnoEdit: (t: TurnoForm) => void
  guardandoEdicionTurno: boolean
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function ModalEditarTurno({
  turnoEdit,
  setTurnoEdit,
  guardandoEdicionTurno,
  onSubmit,
  onClose
}: ModalEditarTurnoProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
        
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          disabled={guardandoEdicionTurno}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera del Modal */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gray-100 rounded-2xl text-gray-800 shrink-0">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">Editar Turno</h2>
            <p className="text-xs text-gray-500 mt-0.5">Modifica los detalles de la reserva</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          
          {/* Nombre del Cliente */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" />
              Nombre del Cliente
            </label>
            <input
              type="text"
              required
              value={turnoEdit.cliente_nombre}
              onChange={(e) => setTurnoEdit({ ...turnoEdit, cliente_nombre: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
              placeholder="Ej: María González"
            />
          </div>

          {/* Celular */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              Celular
            </label>
            <input
              type="text"
              value={turnoEdit.cliente_celular}
              onChange={(e) => setTurnoEdit({ ...turnoEdit, cliente_celular: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
              placeholder="Ej: +54 9 11 1234-5678"
            />
          </div>

          {/* Fecha y Hora */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Fecha y Hora
            </label>
            <input
              type="datetime-local"
              required
              value={turnoEdit.fecha_hora_local}
              onChange={(e) => setTurnoEdit({ ...turnoEdit, fecha_hora_local: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
            />
          </div>

          {/* Detalle / Zonas */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              Detalle / Zonas
            </label>
            <textarea
              value={turnoEdit.detalle_texto}
              onChange={(e) => setTurnoEdit({ ...turnoEdit, detalle_texto: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
              rows={2}
              placeholder="Ej: Pierna entera + Axilas"
            />
          </div>

          {/* Precio y Método de Pago */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                Precio ($)
              </label>
              <input
                type="number"
                required
                min={0}
                value={turnoEdit.precio_total}
                onChange={(e) => setTurnoEdit({ ...turnoEdit, precio_total: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                Método Pago
              </label>
              <input
                type="text"
                value={turnoEdit.metodo_pago}
                onChange={(e) => setTurnoEdit({ ...turnoEdit, metodo_pago: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
                placeholder="Efectivo, MP, etc."
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
              Estado del Turno
            </label>
            <select
              value={turnoEdit.estado}
              onChange={(e) => setTurnoEdit({ ...turnoEdit, estado: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
            >
              <option value="pendiente_sena">⏳ Pendiente Seña</option>
              <option value="confirmado">✅ Confirmado</option>
              <option value="completado">🎉 Completado</option>
              <option value="cancelado">❌ Cancelado</option>
            </select>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={guardandoEdicionTurno}
              className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardandoEdicionTurno}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {guardandoEdicionTurno ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar Cambios</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}