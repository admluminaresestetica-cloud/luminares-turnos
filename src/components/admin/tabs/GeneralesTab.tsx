// src/components/admin/tabs/GeneralesTab.tsx
'use client'

import { ServicioGeneral } from '../types'

interface GeneralesTabProps {
  loadingGenerales: boolean
  serviciosGenerales: ServicioGeneral[]
  onNuevoServicio: () => void
  onEditarServicio: (serv: ServicioGeneral) => void
  onToggleActivo: (serv: ServicioGeneral) => void
  onEliminarServicio: (id: string) => void
}

export default function GeneralesTab({
  loadingGenerales,
  serviciosGenerales,
  onNuevoServicio,
  onEditarServicio,
  onToggleActivo,
  onEliminarServicio
}: GeneralesTabProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold">Servicios Generales</h2>
          <p className="text-xs text-gray-500">Gestión de categorías, subtipos, precios y duración</p>
        </div>
        <button
          onClick={onNuevoServicio}
          className="px-4 py-2 text-sm bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
        >
          + Nuevo Servicio
        </button>
      </div>

      {loadingGenerales ? (
        <div className="py-8 text-center text-gray-500">Cargando servicios...</div>
      ) : serviciosGenerales.length === 0 ? (
        <div className="py-8 text-center text-gray-500">No hay servicios cargados todavía.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Subtipo</th>
                <th className="px-4 py-3">Duración (min)</th>
                <th className="px-4 py-3">Precio ($)</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {serviciosGenerales.map((serv) => (
                <tr key={serv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{serv.categoria || '-'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{serv.subtipo || '-'}</td>
                  <td className="px-4 py-3 text-xs">{serv.duracion_minutos ?? 0} min</td>
                  <td className="px-4 py-3 font-semibold">
                    ${(serv.precio || 0).toLocaleString('es-AR')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggleActivo(serv)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        serv.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {serv.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => onEditarServicio(serv)}
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onEliminarServicio(serv.id)}
                      className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}