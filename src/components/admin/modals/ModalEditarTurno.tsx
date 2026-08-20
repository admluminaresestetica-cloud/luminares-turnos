// src/components/admin/modals/ModalEditarTurno.tsx
'use client'

import { TurnoForm } from '../types'

interface ModalEditarTurnoProps {
  turnoEdit: TurnoForm
  setTurnoEdit: (t: TurnoForm) => void
  guardandoEdicionTurno: boolean
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function ModalEditarTurno({ turnoEdit, setTurnoEdit, guardandoEdicionTurno, onSubmit, onClose }: ModalEditarTurnoProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Editar Turno</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del Cliente</label>
            <input
              type="text"
              required
              value={turnoEdit.cliente_nombre}
              onChange={(e) => setTurnoEdit({ ...turnoEdit, cliente_nombre: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Celular</label>
            <input
              type="text"
              value={turnoEdit.cliente_celular}
              onChange={(e) => setTurnoEdit({ ...turnoEdit, cliente_celular: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha y Hora</label>
            <input
              type="datetime-local"
              required
              value={turnoEdit.fecha_hora_local}
              onChange={(e) => setTurnoEdit({ ...turnoEdit, fecha_hora_local: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Detalle / Zonas</label>
            <textarea
              value={turnoEdit.detalle_texto}
              onChange={(e) => setTurnoEdit({ ...turnoEdit, detalle_texto: e.target.value })}
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
                value={turnoEdit.precio_total}
                onChange={(e) => setTurnoEdit({ ...turnoEdit, precio_total: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Método de Pago</label>
              <input
                type="text"
                value={turnoEdit.metodo_pago}
                onChange={(e) => setTurnoEdit({ ...turnoEdit, metodo_pago: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={turnoEdit.estado}
              onChange={(e) => setTurnoEdit({ ...turnoEdit, estado: e.target.value })}
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
              disabled={guardandoEdicionTurno}
              className="px-4 py-2 text-sm bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {guardandoEdicionTurno ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}