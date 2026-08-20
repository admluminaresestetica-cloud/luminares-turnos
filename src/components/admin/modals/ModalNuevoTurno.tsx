// src/components/admin/modals/ModalNuevoTurno.tsx
'use client'

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Nuevo Turno Manual</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del Cliente</label>
            <input
              type="text"
              required
              value={nuevoTurno.cliente_nombre}
              onChange={(e) => setNuevoTurno({ ...nuevoTurno, cliente_nombre: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Celular</label>
            <input
              type="text"
              value={nuevoTurno.cliente_celular}
              onChange={(e) => setNuevoTurno({ ...nuevoTurno, cliente_celular: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
              placeholder="5493413954355"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha y Hora</label>
            <input
              type="datetime-local"
              required
              value={nuevoTurno.fecha_hora_local}
              onChange={(e) => setNuevoTurno({ ...nuevoTurno, fecha_hora_local: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Tipo de Turno</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipoTurnoNuevo('laser')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                  tipoTurnoNuevo === 'laser'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Depilación Láser
              </button>
              <button
                type="button"
                onClick={() => setTipoTurnoNuevo('general')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                  tipoTurnoNuevo === 'general'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Servicio General
              </button>
            </div>
          </div>

          {tipoTurnoNuevo === 'laser' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-700">Zonas (Láser)</label>
                <select
                  value={filtroGeneroLaserNuevo}
                  onChange={(e) => setFiltroGeneroLaserNuevo(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-xs outline-none"
                >
                  <option value="todos">Todos los géneros</option>
                  <option value="femenino">Femenino</option>
                  <option value="masculino">Masculino</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>

              <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
                {zonasLaserFiltradas.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-2">
                    No hay zonas activas para este filtro.
                  </div>
                ) : (
                  zonasLaserFiltradas.map((s) => {
                    const seleccionada = zonasSeleccionadasNuevo.includes(s.id)
                    return (
                      <label
                        key={s.id}
                        className="flex items-center justify-between text-xs cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={seleccionada}
                            onChange={() => toggleZonaSeleccionadaNuevo(s.id)}
                          />
                          <span className="font-medium text-gray-800">{s.nombre_zona}</span>
                          <span className="text-gray-400">({s.genero})</span>
                        </span>
                        <span className="text-gray-600 font-medium">
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Servicio General</label>
              <select
                value={servicioGeneralSeleccionadoNuevo}
                onChange={(e) => setServicioGeneralSeleccionadoNuevo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
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
                <p className="text-[11px] text-gray-400 mt-1">No hay servicios generales activos cargados.</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Detalle / Zonas</label>
            <textarea
              value={nuevoTurno.detalle_texto}
              onChange={(e) => setNuevoTurno({ ...nuevoTurno, detalle_texto: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Precio Total ($)</label>
              <input
                type="number"
                required
                min={0}
                value={nuevoTurno.precio_total}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, precio_total: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Método de Pago</label>
              <input
                type="text"
                value={nuevoTurno.metodo_pago}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, metodo_pago: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
                placeholder="Ej: Efectivo, Transferencia"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Estado Inicial</label>
            <select
              value={nuevoTurno.estado}
              onChange={(e) => setNuevoTurno({ ...nuevoTurno, estado: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none"
            >
              <option value="pendiente_sena">Pendiente Seña</option>
              <option value="confirmado">Confirmado</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardandoNuevoTurno}
              className="px-4 py-2 text-sm bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {guardandoNuevoTurno ? 'Guardando...' : 'Crear Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}