// src/components/admin/tabs/PreciosTab.tsx
'use client'

import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Sparkles, Tag, Clock } from 'lucide-react'
import { ServicioLaser, PromoLaser, getNombresZonas } from '../types'

interface PreciosTabProps {
  loadingPrecios: boolean
  servicios: ServicioLaser[]
  promos: PromoLaser[]
  seccionPrecios: 'servicios' | 'promos'
  setSeccionPrecios: (v: 'servicios' | 'promos') => void

  onNuevaZona: () => void
  onEditarZona: (serv: ServicioLaser) => void
  onToggleActivoZona: (serv: ServicioLaser) => void
  onEliminarZona: (id: string) => void

  onNuevaPromo: () => void
  onEditarPromo: (promo: PromoLaser) => void
  onToggleActivoPromo: (promo: PromoLaser) => void
  onEliminarPromo: (id: string) => void
}

export default function PreciosTab({
  loadingPrecios,
  servicios,
  promos,
  seccionPrecios,
  setSeccionPrecios,
  onNuevaZona,
  onEditarZona,
  onToggleActivoZona,
  onEliminarZona,
  onNuevaPromo,
  onEditarPromo,
  onToggleActivoPromo,
  onEliminarPromo
}: PreciosTabProps) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-all dark:bg-zinc-900 dark:border-zinc-800">
      
      {/* Pestañas Superiores y Botón Principal Adaptables */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex space-x-1.5 sm:space-x-2 bg-gray-100/80 p-1.5 rounded-2xl overflow-x-auto scroll-smooth dark:bg-zinc-800">
          <button
            onClick={() => setSeccionPrecios('servicios')}
            className={`whitespace-nowrap px-3 sm:px-4 py-2.5 sm:py-2 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center gap-1.5 ${
              seccionPrecios === 'servicios'
                ? 'bg-black text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-700/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Zonas / Servicios Laser ({servicios.length})
          </button>
          
          <button
            onClick={() => setSeccionPrecios('promos')}
            className={`whitespace-nowrap px-3 sm:px-4 py-2.5 sm:py-2 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center gap-1.5 ${
              seccionPrecios === 'promos'
                ? 'bg-black text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-700/50'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Promociones ({promos.length})
          </button>
        </div>

        {seccionPrecios === 'servicios' ? (
          <button
            onClick={onNuevaZona}
            className="w-full sm:w-auto justify-center px-4 py-2.5 text-xs font-bold bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-sm flex items-center gap-1.5 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="w-4 h-4" />
            Nueva Zona
          </button>
        ) : (
          <button
            onClick={onNuevaPromo}
            className="w-full sm:w-auto justify-center px-4 py-2.5 text-xs font-bold bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-sm flex items-center gap-1.5 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="w-4 h-4" />
            Nueva Promo
          </button>
        )}
      </div>

      {loadingPrecios ? (
        <div className="py-12 text-center text-gray-400 text-xs font-medium animate-pulse dark:text-zinc-500">
          Cargando precios y zonas...
        </div>
      ) : seccionPrecios === 'servicios' ? (

        /* TABLA DE ZONAS / SERVICIOS LÁSER */
        <>
          <p className="sm:hidden text-[11px] text-gray-400 dark:text-zinc-500 font-medium mb-2">
            ↔ Deslizá la tabla hacia los costados para ver más columnas
          </p>
          <div className="overflow-x-auto scroll-smooth -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[11px] font-semibold dark:bg-zinc-800/60 dark:border-zinc-800 dark:text-zinc-400">
                  <tr>
                    <th className="px-3 sm:px-4 py-3.5 rounded-l-xl">Zona</th>
                    <th className="px-3 sm:px-4 py-3.5">Género</th>
                    <th className="px-3 sm:px-4 py-3.5">Categoría</th>
                    <th className="px-3 sm:px-4 py-3.5">Duración</th>
                    <th className="px-3 sm:px-4 py-3.5">Precio Lista</th>
                    <th className="px-3 sm:px-4 py-3.5">Estado</th>
                    <th className="px-3 sm:px-4 py-3.5 text-right rounded-r-xl">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                  {servicios.map((serv) => {
                    const esMasculino = serv.genero?.toLowerCase() === 'masculino'
                    return (
                      <tr 
                        key={serv.id} 
                        className={`transition-colors border-l-4 ${
                          esMasculino 
                            ? 'border-l-blue-500 hover:bg-blue-50/30 dark:border-l-blue-400 dark:hover:bg-blue-950/20' 
                            : 'border-l-rose-400 hover:bg-rose-50/30 dark:border-l-rose-400 dark:hover:bg-rose-950/20'
                        }`}
                      >
                        <td className="px-3 sm:px-4 py-3.5 font-bold text-gray-900 whitespace-nowrap dark:text-zinc-100">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${esMasculino ? 'bg-blue-500 dark:bg-blue-400' : 'bg-rose-500 dark:bg-rose-400'}`} />
                            {serv.nombre_zona || '-'}
                          </div>
                        </td>

                        <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1 border shadow-sm ${
                            esMasculino
                              ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60'
                              : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60'
                          }`}>
                            {esMasculino ? '♂ Masculino' : '♀ Femenino'}
                          </span>
                        </td>

                        <td className="px-3 sm:px-4 py-3.5 text-gray-500 font-medium capitalize whitespace-nowrap dark:text-zinc-400">
                          {serv.categoria_zona || '-'}
                        </td>

                        <td className="px-3 sm:px-4 py-3.5 text-gray-600 font-medium whitespace-nowrap dark:text-zinc-300">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                            {serv.duracion_minutos || 0} min
                          </span>
                        </td>

                        <td className="px-3 sm:px-4 py-3.5 font-extrabold text-gray-900 text-sm whitespace-nowrap dark:text-zinc-100">
                          ${(serv.precio_lista || 0).toLocaleString('es-AR')}
                        </td>

                        <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
                          <button
                            onClick={() => onToggleActivoZona(serv)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1 ${
                              serv.activo
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-900/60'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {serv.activo ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                Activo
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                                Inactivo
                              </>
                            )}
                          </button>
                        </td>

                        <td className="px-3 sm:px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                          <button
                            onClick={() => onEditarZona(serv)}
                            className="px-2.5 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition-all active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => onEliminarZona(serv.id)}
                            className="px-2.5 py-1.5 text-xs bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 font-bold transition-all active:scale-95 dark:bg-rose-950/60 dark:text-rose-400 dark:hover:bg-rose-900/60"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (

        /* TABLA DE PROMOCIONES */
        <>
          <p className="sm:hidden text-[11px] text-gray-400 dark:text-zinc-500 font-medium mb-2">
            ↔ Deslizá la tabla hacia los costados para ver más columnas
          </p>
          <div className="overflow-x-auto scroll-smooth -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[11px] font-semibold dark:bg-zinc-800/60 dark:border-zinc-800 dark:text-zinc-400">
                  <tr>
                    <th className="px-3 sm:px-4 py-3.5 rounded-l-xl">Promoción</th>
                    <th className="px-3 sm:px-4 py-3.5">Género</th>
                    <th className="px-3 sm:px-4 py-3.5">Zonas Incluidas</th>
                    <th className="px-3 sm:px-4 py-3.5">Duración</th>
                    <th className="px-3 sm:px-4 py-3.5">Precio Promo</th>
                    <th className="px-3 sm:px-4 py-3.5">Swap</th>
                    <th className="px-3 sm:px-4 py-3.5">Estado</th>
                    <th className="px-3 sm:px-4 py-3.5 text-right rounded-r-xl">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                  {promos.map((p) => {
                    const esMasculino = p.genero?.toLowerCase() === 'masculino'
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/60 transition-colors dark:hover:bg-zinc-800/40">
                        <td className="px-3 sm:px-4 py-3.5 font-bold text-gray-900 whitespace-nowrap dark:text-zinc-100">
                          {p.nombre_promo || '-'}
                        </td>

                        <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1 border shadow-sm ${
                            esMasculino
                              ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60'
                              : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60'
                          }`}>
                            {esMasculino ? '♂ Masculino' : '♀ Femenino'}
                          </span>
                        </td>

                        <td className="px-3 sm:px-4 py-3.5 max-w-xs">
                          <span className="bg-purple-50 text-purple-700 font-semibold px-2.5 py-1 rounded-lg border border-purple-100 inline-block text-[11px] dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900/60">
                            {getNombresZonas(servicios, p.zonas_incluidas)}
                          </span>
                        </td>

                        <td className="px-3 sm:px-4 py-3.5 text-gray-600 font-medium whitespace-nowrap dark:text-zinc-300">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                            {p.duracion_total_min || 0} min
                          </span>
                        </td>

                        <td className="px-3 sm:px-4 py-3.5 font-extrabold text-emerald-600 text-sm whitespace-nowrap dark:text-emerald-400">
                          ${(p.precio_promo || 0).toLocaleString('es-AR')}
                        </td>

                        <td className="px-3 sm:px-4 py-3.5 font-medium text-gray-600 whitespace-nowrap dark:text-zinc-300">
                          {p.permite_swap ? (
                            <span className="text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md dark:bg-purple-950/60 dark:text-purple-400">Sí</span>
                          ) : (
                            <span className="text-gray-400 dark:text-zinc-500">No</span>
                          )}
                        </td>

                        <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
                          <button
                            onClick={() => onToggleActivoPromo(p)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1 ${
                              p.activo
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-900/60'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {p.activo ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                Activa
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                                Inactiva
                              </>
                            )}
                          </button>
                        </td>

                        <td className="px-3 sm:px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                          <button
                            onClick={() => onEditarPromo(p)}
                            className="px-2.5 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition-all active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => onEliminarPromo(p.id)}
                            className="px-2.5 py-1.5 text-xs bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 font-bold transition-all active:scale-95 dark:bg-rose-950/60 dark:text-rose-400 dark:hover:bg-rose-900/60"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}