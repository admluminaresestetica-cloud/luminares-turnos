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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-100 relative max-h-[92vh] overflow-y-auto dark:bg-zinc-900 dark:border-zinc-800">

        {/* Handle visual, solo mobile */}
        <div className="sm:hidden w-10 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          disabled={guardandoEdicionTurno}
          className="absolute top-4 sm:top-5 right-4 sm:right-5 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-90 transition-all disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera del Modal */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gray-100 rounded-2xl text-gray-800 shrink-0 dark:bg-zinc-800 dark:text-zinc-200">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight dark:text-zinc-100">Editar Turno</h2>
            <p className="text-xs text-gray-500 mt-0.5 dark:text-zinc-400">Modifica los detalles de la reserva</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          
          {/* Nombre del Cliente */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
              <User className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              Nombre del Cliente
            </label>
            <input
              type="text"
              required
              value={turnoEdit.cliente_nombre}
              onChange={(e) => setTurnoEdit({ ...turnoEdit, cliente_nombre: e.target.value })}
              className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
              placeholder="Ej: María González"
            />
          </div>

          {/* Celular */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
              <Phone className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              Celular
            </label>
            <input
              type="text"
              value={turnoEdit.cliente_celular}
              onChange={(e) => setTurnoEdit({ ...turnoEdit, cliente_celular: e.target.value })}
              className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
              placeholder="Ej: +54 9 11 1234-5678"
            />
          </div>

          {/* Fecha y Hora */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              Fecha y Hora
            </label>
            <input
              type="datetime-local"
              required
              value={turnoEdit.fecha_hora_local}
              onChange={(e) => setTurnoEdit({ ...turnoEdit, fecha_hora_local: e.target.value })}
              className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
            />
          </div>

          {/* Detalle / Zonas */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
              <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              Detalle / Zonas
            </label>
            <textarea
              value={turnoEdit.detalle_texto}
              onChange={(e) => setTurnoEdit({ ...turnoEdit, detalle_texto: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
              rows={2}
              placeholder="Ej: Pierna entera + Axilas"
            />
          </div>

          {/* Precio y Método de Pago */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                <DollarSign className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                Precio ($)
              </label>
              <input
                type="number"
                required
                min={0}
                value={turnoEdit.precio_total}
                onChange={(e) => setTurnoEdit({ ...turnoEdit, precio_total: Number(e.target.value) })}
                className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                <CreditCard className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                Método Pago
              </label>
              <input
                type="text"
                value={turnoEdit.metodo_pago}
                onChange={(e) => setTurnoEdit({ ...turnoEdit, metodo_pago: e.target.value })}
                className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
                placeholder="Efectivo, MP, etc."
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              Estado del Turno
            </label>
            <select
              value={turnoEdit.estado}
              onChange={(e) => setTurnoEdit({ ...turnoEdit, estado: e.target.value })}
              className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
            >
              <option value="pendiente_sena">⏳ Pendiente Seña</option>
              <option value="confirmado">✅ Confirmado</option>
              <option value="completado">🎉 Completado</option>
              <option value="cancelado">❌ Cancelado</option>
            </select>
          </div>

          {/* Acciones */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-2.5 pt-4 border-t border-gray-100 dark:border-zinc-800 sticky bottom-0 bg-white dark:bg-zinc-900 sm:static sm:bg-transparent -mx-5 sm:mx-0 px-5 sm:px-0 pb-1 sm:pb-0">
            <button
              type="button"
              onClick={onClose}
              disabled={guardandoEdicionTurno}
              className="w-full sm:w-auto px-4 py-3 sm:py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 active:scale-95 rounded-xl transition-all disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardandoEdicionTurno}
              className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-5 py-3 sm:py-2.5 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
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