// src/components/admin/tabs/GeneralesTab.tsx
'use client'

import { Plus, Clock, CheckCircle2, XCircle, Scissors } from 'lucide-react'
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
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 transition-all">
      
      {/* Cabecera de Sección */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 text-gray-800 rounded-xl">
              <Scissors className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Servicios Generales</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">Gestión de categorías, subtipos, precios y duración</p>
        </div>

        <button
          onClick={onNuevoServicio}
          className="px-4 py-2.5 text-xs font-bold bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nuevo Servicio
        </button>
      </div>

      {loadingGenerales ? (
        <div className="py-12 text-center text-gray-400 text-xs font-medium animate-pulse">
          Cargando servicios generales...
        </div>
      ) : serviciosGenerales.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-xs font-medium">
          No hay servicios cargados todavía.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-3.5 rounded-l-xl">Categoría</th>
                <th className="px-4 py-3.5">Subtipo</th>
                <th className="px-4 py-3.5">Duración</th>
                <th className="px-4 py-3.5">Precio</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-4 py-3.5 text-right rounded-r-xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {serviciosGenerales.map((serv) => (
                <tr key={serv.id} className="hover:bg-gray-50/60 transition-colors">
                  
                  {/* Categoría */}
                  <td className="px-4 py-3.5 font-bold text-gray-900">
                    {serv.categoria || '-'}
                  </td>

                  {/* Subtipo */}
                  <td className="px-4 py-3.5 text-gray-500 font-medium">
                    {serv.subtipo || '-'}
                  </td>

                  {/* Duración */}
                  <td className="px-4 py-3.5 text-gray-600 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {serv.duracion_minutos ?? 0} min
                    </span>
                  </td>

                  {/* Precio */}
                  <td className="px-4 py-3.5 font-extrabold text-gray-900 text-sm">
                    ${(serv.precio || 0).toLocaleString('es-AR')}
                  </td>

                  {/* Estado Switch Button */}
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => onToggleActivo(serv)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                        serv.activo
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {serv.activo ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Activo
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-gray-400" />
                          Inactivo
                        </>
                      )}
                    </button>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => onEditarServicio(serv)}
                      className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition-all"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onEliminarServicio(serv.id)}
                      className="px-3 py-1.5 text-xs bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 font-bold transition-all"
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