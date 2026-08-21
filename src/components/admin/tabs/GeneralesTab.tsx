'use client'

import { Plus, Clock, CheckCircle2, XCircle, Scissors, Image as ImageIcon } from 'lucide-react'
import { ServicioGeneral } from '../types'

interface GeneralesTabProps {
  loadingGenerales: boolean
  serviciosGenerales: ServicioGeneral[]
  onNuevoServicio: () => void
  onEditarServicio: (serv: ServicioGeneral) => void
  onToggleActivo: (serv: ServicioGeneral) => void
  onEliminarServicio: (id: string) => void
  referidosActivo: boolean
  setReferidosActivo: (value: boolean) => void
  referidosTipoDescuento: 'porcentaje' | 'monto_fijo'
  setReferidosTipoDescuento: (value: 'porcentaje' | 'monto_fijo') => void
  referidosValorDescuento: number
  setReferidosValorDescuento: (value: number) => void
  onGuardarReferidos?: () => void
}

export default function GeneralesTab({
  loadingGenerales,
  serviciosGenerales,
  onNuevoServicio,
  onEditarServicio,
  onToggleActivo,
  onEliminarServicio,
  referidosActivo,
  setReferidosActivo,
  referidosTipoDescuento,
  setReferidosTipoDescuento,
  referidosValorDescuento,
  setReferidosValorDescuento,
  onGuardarReferidos
}: GeneralesTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-all">
        {/* Cabecera Adaptable */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 text-gray-800 rounded-xl">
                <Scissors className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Servicios Generales</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">Gestión de categorías, subtipos, precios, imágenes y duración</p>
          </div>

          <button
            onClick={onNuevoServicio}
            className="w-full sm:w-auto justify-center px-4 py-2.5 text-xs font-bold bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
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
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="px-3 sm:px-4 py-3.5 rounded-l-xl">Imagen</th>
                    <th className="px-3 sm:px-4 py-3.5">Categoría / Subtipo</th>
                    <th className="px-3 sm:px-4 py-3.5">Duración</th>
                    <th className="px-3 sm:px-4 py-3.5">Precio</th>
                    <th className="px-3 sm:px-4 py-3.5">Estado</th>
                    <th className="px-3 sm:px-4 py-3.5 text-right rounded-r-xl">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {serviciosGenerales.map((serv) => (
                    <tr key={serv.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Vista Previa de Imagen */}
                      <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
                        {serv.imagen_url ? (
                          <img
                            src={serv.imagen_url}
                            alt={serv.categoria || 'Servicio'}
                            className="w-10 h-10 object-cover rounded-xl border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center border border-gray-200">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </td>

                      {/* Categoría, Subtipo y Descripción */}
                      <td className="px-3 sm:px-4 py-3.5">
                        <div className="font-bold text-gray-900 whitespace-nowrap">
                          {serv.categoria || '-'}
                        </div>
                        {serv.subtipo && (
                          <div className="text-gray-500 font-medium whitespace-nowrap text-[11px]">
                            {serv.subtipo}
                          </div>
                        )}
                        {serv.descripcion && (
                          <div className="text-gray-400 text-[11px] max-w-xs truncate mt-0.5">
                            {serv.descripcion}
                          </div>
                        )}
                      </td>

                      <td className="px-3 sm:px-4 py-3.5 text-gray-600 font-medium whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {serv.duracion_minutos ?? 0} min
                        </span>
                      </td>

                      <td className="px-3 sm:px-4 py-3.5 font-extrabold text-gray-900 text-sm whitespace-nowrap">
                        ${(serv.precio || 0).toLocaleString('es-AR')}
                      </td>

                      <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
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

                      <td className="px-3 sm:px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => onEditarServicio(serv)}
                          className="px-2.5 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition-all"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onEliminarServicio(serv.id)}
                          className="px-2.5 py-1.5 text-xs bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 font-bold transition-all"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN PROGRAMA DE REFERIDOS */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Programa de Referidos</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Controlá si querés permitir códigos de recomendación y qué beneficio otorgan.
            </p>
          </div>

          {/* Toggle Activar/Desactivar */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={referidosActivo}
              onChange={(e) => setReferidosActivo(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
          </label>
        </div>

        {/* Opciones de Descuento (Visibles solo si está activo) */}
        {referidosActivo && (
          <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tipo de Beneficio
              </label>
              <select
                value={referidosTipoDescuento}
                onChange={(e) =>
                  setReferidosTipoDescuento(e.target.value as 'porcentaje' | 'monto_fijo')
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-all bg-gray-50/50"
              >
                <option value="porcentaje">Porcentaje (%)</option>
                <option value="monto_fijo">Monto Fijo ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Valor del Descuento
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={referidosValorDescuento}
                  onChange={(e) => setReferidosValorDescuento(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black pl-7 transition-all bg-gray-50/50"
                />
                <span className="absolute left-2.5 top-2 text-xs text-gray-400 font-bold">
                  {referidosTipoDescuento === 'monto_fijo' ? '$' : '%'}
                </span>
              </div>
            </div>
          </div>
        )}

        {onGuardarReferidos && (
          <div className="pt-3 text-right">
            <button
              onClick={onGuardarReferidos}
              className="px-4 py-2 text-xs font-bold bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-sm active:scale-95"
            >
              Guardar Cambios de Referidos
            </button>
          </div>
        )}
      </div>
    </div>
  )
}