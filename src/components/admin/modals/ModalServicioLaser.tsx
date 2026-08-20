// src/components/admin/modals/ModalServicioLaser.tsx
'use client'

import { ServicioLaser } from '../types'

interface ModalServicioLaserProps {
  servicioEdit: Partial<ServicioLaser>
  setServicioEdit: (s: Partial<ServicioLaser>) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function ModalServicioLaser({ servicioEdit, setServicioEdit, onSubmit, onClose }: ModalServicioLaserProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
        <h2 className="text-lg font-bold mb-4">
          {servicioEdit.id ? 'Editar Zona' : 'Nueva Zona'}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Zona</label>
            <input
              type="text"
              required
              value={servicioEdit.nombre_zona || ''}
              onChange={(e) => setServicioEdit({ ...servicioEdit, nombre_zona: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Género</label>
              <select
                value={servicioEdit.genero || 'femenino'}
                onChange={(e) => setServicioEdit({ ...servicioEdit, genero: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none"
              >
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
              <input
                type="text"
                value={servicioEdit.categoria_zona || ''}
                onChange={(e) => setServicioEdit({ ...servicioEdit, categoria_zona: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Precio Lista ($)</label>
              <input
                type="number"
                required
                value={servicioEdit.precio_lista || 0}
                onChange={(e) => setServicioEdit({ ...servicioEdit, precio_lista: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Duración (min)</label>
              <input
                type="number"
                required
                value={servicioEdit.duracion_minutos || 0}
                onChange={(e) => setServicioEdit({ ...servicioEdit, duracion_minutos: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="servicioActivo"
              checked={servicioEdit.activo ?? true}
              onChange={(e) => setServicioEdit({ ...servicioEdit, activo: e.target.checked })}
            />
            <label htmlFor="servicioActivo" className="text-sm font-medium">Zona Activa (visible en reservas)</label>
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