// src/components/admin/modals/ModalNuevoTurno.tsx
'use client'

import {
  Sparkles, Scissors, X, User, Phone, Calendar, FileText,
  DollarSign, CreditCard, CheckCircle2, Loader2
} from 'lucide-react'
import { ServicioGeneral, ServicioLaser, TurnoForm } from '../types'

interface ModalNuevoTurnoProps {
  nuevoTurno: TurnoForm
  setNuevoTurno: (t: TurnoForm) => void

  tipoTurnoNuevo: 'laser' | 'general'
  setTipoTurnoNuevo: (v: 'laser' | 'general') => void

  filtroGeneroLaserNuevo: string
  setFiltroGeneroLaserNuevo: (v: string) => void

  zonasSeleccionadasNuevo: string[]
  toggleZonaSeleccionadaNuevo: (id: string) => void
  zonasLaserFiltradas: ServicioLaser[]

  servicioGeneralSeleccionadoNuevo: string
  setServicioGeneralSeleccionadoNuevo: (id: string) => void
  serviciosGeneralesActivos: ServicioGeneral[]

  guardandoNuevoTurno: boolean
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function ModalNuevoTurno({
  nuevoTurno,
  setNuevoTurno,
  tipoTurnoNuevo,
  setTipoTurnoNuevo,
  filtroGeneroLaserNuevo,
  setFiltroGeneroLaserNuevo,
  zonasSeleccionadasNuevo,
  toggleZonaSeleccionadaNuevo,
  zonasLaserFiltradas,
  servicioGeneralSeleccionadoNuevo,
  setServicioGeneralSeleccionadoNuevo,
  serviciosGeneralesActivos,
  guardandoNuevoTurno,
  onSubmit,
  onClose
}: ModalNuevoTurnoProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">

        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          disabled={guardandoNuevoTurno}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera del Modal */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gray-100 rounded-2xl text-gray-800 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">Nuevo Turno Manual</h2>
            <p className="text-xs text-gray-500 mt-0.5">Cargá una reserva directamente desde el panel</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">

          {/* Nombre del Cliente */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" />
              Nombre del Cliente
            </label>
            <input
              type="text"
              required
              value={nuevoTurno.cliente_nombre}
              onChange={(e) => setNuevoTurno({ ...nuevoTurno, cliente_nombre: e.target.value })}
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
              value={nuevoTurno.cliente_celular}
              onChange={(e) => setNuevoTurno({ ...nuevoTurno, cliente_celular: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
              placeholder="5493413954355"
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
              value={nuevoTurno.fecha_hora_local}
              onChange={(e) => setNuevoTurno({ ...nuevoTurno, fecha_hora_local: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
            />
          </div>

          {/* Tipo de Turno */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Tipo de Turno
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipoTurnoNuevo('laser')}
                className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  tipoTurnoNuevo === 'laser'
                    ? 'bg-rose-500 border-rose-600 text-white shadow-sm ring-2 ring-rose-300 ring-offset-1'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-rose-50/50 hover:border-rose-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Depilación Láser
              </button>
              <button
                type="button"
                onClick={() => setTipoTurnoNuevo('general')}
                className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  tipoTurnoNuevo === 'general'
                    ? 'bg-gray-900 border-gray-900 text-white shadow-sm ring-2 ring-gray-300 ring-offset-1'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                Servicio General
              </button>
            </div>
          </div>

          {tipoTurnoNuevo === 'laser' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Zonas (Láser)
                </label>
                <select
                  value={filtroGeneroLaserNuevo}
                  onChange={(e) => setFiltroGeneroLaserNuevo(e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-[11px] font-medium outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                >
                  <option value="todos">Todos los géneros</option>
                  <option value="femenino">Femenino</option>
                  <option value="masculino">Masculino</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>

              <div className="border border-gray-200 rounded-2xl p-2.5 max-h-48 overflow-y-auto space-y-1.5 bg-gray-50/50">
                {zonasLaserFiltradas.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-4">
                    No hay zonas activas para este filtro.
                  </div>
                ) : (
                  zonasLaserFiltradas.map((s) => {
                    const seleccionada = zonasSeleccionadasNuevo.includes(s.id)
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                          seleccionada
                            ? 'bg-white border border-gray-300 shadow-sm font-semibold'
                            : 'hover:bg-white/80 border border-transparent text-gray-600'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={seleccionada}
                            onChange={() => toggleZonaSeleccionadaNuevo(s.id)}
                            className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                          />
                          <span className="font-medium text-gray-800">{s.nombre_zona}</span>
                          <span className="text-gray-400">({s.genero})</span>
                        </span>
                        <span className="text-gray-600 font-semibold">
                          ${(s.precio_lista || 0).toLocaleString('es-AR')}
                        </span>
                      </label>
                    )
                  })
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Servicio General
              </label>
              <select
                value={servicioGeneralSeleccionadoNuevo}
                onChange={(e) => setServicioGeneralSeleccionadoNuevo(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
              >
                <option value="">Seleccioná un servicio...</option>
                {serviciosGeneralesActivos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.categoria}
                    {s.subtipo ? ` - ${s.subtipo}` : ''} (${(s.precio || 0).toLocaleString('es-AR')})
                  </option>
                ))}
              </select>
              {serviciosGeneralesActivos.length === 0 && (
                <p className="text-[11px] text-gray-400 mt-1.5">No hay servicios generales activos cargados.</p>
              )}
            </div>
          )}

          {/* Detalle / Zonas */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              Detalle / Zonas
            </label>
            <textarea
              value={nuevoTurno.detalle_texto}
              onChange={(e) => setNuevoTurno({ ...nuevoTurno, detalle_texto: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm resize-none"
              rows={2}
            />
          </div>

          {/* Precio y Método de Pago */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                Precio Total ($)
              </label>
              <input
                type="number"
                required
                min={0}
                value={nuevoTurno.precio_total}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, precio_total: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                Método de Pago
              </label>
              <input
                type="text"
                value={nuevoTurno.metodo_pago}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, metodo_pago: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
                placeholder="Ej: Efectivo, Transferencia"
              />
            </div>
          </div>

          {/* Estado Inicial */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
              Estado Inicial
            </label>
            <select
              value={nuevoTurno.estado}
              onChange={(e) => setNuevoTurno({ ...nuevoTurno, estado: e.target.value })}
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
              disabled={guardandoNuevoTurno}
              className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardandoNuevoTurno}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {guardandoNuevoTurno ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Crear Turno</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}