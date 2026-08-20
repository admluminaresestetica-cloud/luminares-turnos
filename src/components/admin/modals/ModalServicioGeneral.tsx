// src/components/admin/modals/ModalServicioGeneral.tsx
'use client'

import { ServicioGeneral } from '../types'

interface ModalServicioGeneralProps {
  servicioGeneralEdit: Partial<ServicioGeneral>
  setServicioGeneralEdit: (s: Partial<ServicioGeneral>) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function ModalServicioGeneral({
  servicioGeneralEdit,
  setServicioGeneralEdit,
  onSubmit,
  onClose
}: ModalServicioGeneralProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
        <h2 className="text-lg font-bold mb-4">
          {servicioGeneralEdit.id ? 'Editar Servicio' : 'Nuevo Servicio'}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
            <input
              type="text"
              required
              value={servicioGeneralEdit.categoria || ''}
              onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, categoria: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
              placeholder="Ej: Masajes"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Subtipo
            </label>
            <input
              type="text"
              value={servicioGeneralEdit.subtipo || ''}
              onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, subtipo: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
              placeholder="Ej: Descontracturantes"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Si necesitás varios subtipos en un mismo servicio, separalos por coma (ej: "Relax, Descontracturante").
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Precio ($)</label>
              <input
                type="number"
                required
                min={0}
                step="0.01"
                value={servicioGeneralEdit.precio ?? 0}
                onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, precio: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Duración (min)</label>
              <input
                type="number"
                required
                min={0}
                value={servicioGeneralEdit.duracion_minutos ?? 0}
                onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, duracion_minutos: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="servicioGeneralActivo"
              checked={servicioGeneralEdit.activo ?? true}
              onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, activo: e.target.checked })}
            />
            <label htmlFor="servicioGeneralActivo" className="text-sm font-medium">
              Servicio Activo (visible en reservas)
            </label>
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
              className="px-4 py-2 text-sm bg-black text-white font-medium rounded-lg hover:bg-gray-800"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}