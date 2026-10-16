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
    <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm transition-all">
      {/* MOBILE: bottom sheet · DESKTOP (sm:): modal flotante centrado */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 w-full bg-white dark:bg-zinc-900 rounded-t-[32px] shadow-2xl border border-slate-100 dark:border-zinc-800 max-h-[92vh] overflow-y-auto transition-colors animate-in slide-in-from-bottom duration-300 pb-[env(safe-area-inset-bottom)]
          sm:inset-x-0 sm:mx-auto sm:max-w-lg sm:rounded-3xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:fade-in sm:zoom-in-95 sm:duration-200 sm:pb-0"
      >
        {/* Handle visual, solo mobile */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full mx-auto my-3 sm:hidden" />

        <div className="relative px-5 pb-6 pt-1 sm:p-7">
          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={onClose}
            disabled={guardandoEdicionTurno}
            className="absolute top-3 right-3 sm:top-6 sm:right-6 text-slate-400 hover:text-slate-700 w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-100 active:scale-90 select-none transition-all disabled:opacity-50 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Cabecera del Modal */}
          <div className="flex items-center gap-3.5 mb-6 pr-10">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/50 rounded-2xl text-purple-600 dark:text-purple-400 shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                Editar Turno
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
                Modifica los detalles generales de la reserva
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">

            {/* Nombre del Cliente */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                Nombre del Cliente
              </label>
              <input
                type="text"
                required
                value={turnoEdit.cliente_nombre}
                onChange={(e) => setTurnoEdit({ ...turnoEdit, cliente_nombre: e.target.value })}
                className="w-full px-3.5 py-3 sm:py-2.5 border border-slate-200 dark:border-zinc-700/80 rounded-xl bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-2xs"
                placeholder="Ej: María González"
              />
            </div>

            {/* Celular */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                Celular
              </label>
              <input
                type="text"
                value={turnoEdit.cliente_celular}
                onChange={(e) => setTurnoEdit({ ...turnoEdit, cliente_celular: e.target.value })}
                className="w-full px-3.5 py-3 sm:py-2.5 border border-slate-200 dark:border-zinc-700/80 rounded-xl bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm font-mono focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-2xs"
                placeholder="Ej: +54 9 11 1234-5678"
              />
            </div>

            {/* Fecha y Hora */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                Fecha y Hora
              </label>
              <input
                type="datetime-local"
                required
                value={turnoEdit.fecha_hora_local}
                onChange={(e) => setTurnoEdit({ ...turnoEdit, fecha_hora_local: e.target.value })}
                className="w-full px-3.5 py-3 sm:py-2.5 border border-slate-200 dark:border-zinc-700/80 rounded-xl bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-2xs [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            {/* Detalle / Zonas */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                Detalle / Zonas
              </label>
              <textarea
                value={turnoEdit.detalle_texto}
                onChange={(e) => setTurnoEdit({ ...turnoEdit, detalle_texto: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-700/80 rounded-xl bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-2xs resize-none"
                rows={2}
                placeholder="Ej: Pierna entera + Axilas"
              />
            </div>

            {/* Precio y Método de Pago */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Precio ($)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={turnoEdit.precio_total}
                  onChange={(e) => setTurnoEdit({ ...turnoEdit, precio_total: Number(e.target.value) })}
                  className="w-full px-3.5 py-3 sm:py-2.5 border border-slate-200 dark:border-zinc-700/80 rounded-xl bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm font-extrabold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Método Pago
                </label>
                <input
                  type="text"
                  value={turnoEdit.metodo_pago}
                  onChange={(e) => setTurnoEdit({ ...turnoEdit, metodo_pago: e.target.value })}
                  className="w-full px-3.5 py-3 sm:py-2.5 border border-slate-200 dark:border-zinc-700/80 rounded-xl bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-2xs"
                  placeholder="Efectivo, MP, etc."
                />
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                Estado del Turno
              </label>
              <select
                value={turnoEdit.estado}
                onChange={(e) => setTurnoEdit({ ...turnoEdit, estado: e.target.value })}
                className="w-full px-3.5 py-3 sm:py-2.5 border border-slate-200 dark:border-zinc-700/80 rounded-xl bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm font-bold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-2xs cursor-pointer"
              >
                <option value="pendiente_sena" className="bg-white dark:bg-zinc-900">⏳ Pendiente Seña</option>
                <option value="confirmado" className="bg-white dark:bg-zinc-900">✅ Confirmado</option>
                <option value="completado" className="bg-white dark:bg-zinc-900">🎉 Completado</option>
                <option value="cancelado" className="bg-white dark:bg-zinc-900">❌ Cancelado</option>
              </select>
            </div>

            {/* Acciones */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-zinc-800 sticky bottom-0 bg-white dark:bg-zinc-900 sm:static sm:bg-transparent -mx-5 sm:mx-0 px-5 sm:px-0 pb-1 sm:pb-0">
              <button
                type="button"
                onClick={onClose}
                disabled={guardandoEdicionTurno}
                className="w-full sm:w-auto min-h-[44px] px-4 py-3 sm:py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 active:scale-95 select-none rounded-xl transition-all disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardandoEdicionTurno}
                className="w-full sm:w-auto min-h-[44px] justify-center inline-flex items-center gap-2 px-5 py-3 sm:py-2.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all shadow-xs active:scale-95 select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
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
    </div>
  )
}
