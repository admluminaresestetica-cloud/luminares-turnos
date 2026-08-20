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
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 transition-all">
      
      {/* Pestañas Superiores y Botón Principal */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex space-x-2 bg-gray-100/80 p-1.5 rounded-2xl">
          <button
            onClick={() => setSeccionPrecios('servicios')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              seccionPrecios === 'servicios'
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Zonas / Servicios Laser ({servicios.length})
          </button>
          
          <button
            onClick={() => setSeccionPrecios('promos')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              seccionPrecios === 'promos'
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Promociones ({promos.length})
          </button>
        </div>

        {seccionPrecios === 'servicios' ? (
          <button
            onClick={onNuevaZona}
            className="px-4 py-2.5 text-xs font-bold bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nueva Zona
          </button>
        ) : (
          <button
            onClick={onNuevaPromo}
            className="px-4 py-2.5 text-xs font-bold bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nueva Promo
          </button>
        )}
      </div>

      {loadingPrecios ? (
        <div className="py-12 text-center text-gray-400 text-xs font-medium animate-pulse">
          Cargando precios y zonas...
        </div>
      ) : seccionPrecios === 'servicios' ? (
        
        /* TABLA DE ZONAS / SERVICIOS LÁSER */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-3.5 rounded-l-xl">Zona</th>
                <th className="px-4 py-3.5">Género</th>
                <th className="px-4 py-3.5">Categoría</th>
                <th className="px-4 py-3.5">Duración</th>
                <th className="px-4 py-3.5">Precio Lista</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-4 py-3.5 text-right rounded-r-xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
  {servicios.map((serv) => {
    const esMasculino = serv.genero?.toLowerCase() === 'masculino'

    return (
      <tr 
        key={serv.id} 
        className={`transition-colors border-l-4 ${
          esMasculino 
            ? 'border-l-blue-500 hover:bg-blue-50/30' 
            : 'border-l-rose-400 hover:bg-rose-50/30'
        }`}
      >
        {/* Nombre Zona con leve resalte */}
        <td className="px-4 py-3.5 font-bold text-gray-900">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${esMasculino ? 'bg-blue-500' : 'bg-rose-500'}`} />
            {serv.nombre_zona || '-'}
          </div>
        </td>

        {/* Género Badge Remarcado */}
        <td className="px-4 py-3.5">
          <span className={`px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1.5 border shadow-sm ${
            esMasculino
              ? 'bg-blue-100 text-blue-800 border-blue-300'
              : 'bg-rose-100 text-rose-800 border-rose-300'
          }`}>
            {esMasculino ? '♂ Masculino' : '♀ Femenino'}
          </span>
        </td>

        {/* Categoría */}
        <td className="px-4 py-3.5 text-gray-500 font-medium capitalize">
          {serv.categoria_zona || '-'}
        </td>

        {/* Duración */}
        <td className="px-4 py-3.5 text-gray-600 font-medium">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {serv.duracion_minutos || 0} min
          </span>
        </td>

        {/* Precio */}
        <td className="px-4 py-3.5 font-extrabold text-gray-900 text-sm">
          ${(serv.precio_lista || 0).toLocaleString('es-AR')}
        </td>

        {/* Estado */}
        <td className="px-4 py-3.5">
          <button
            onClick={() => onToggleActivoZona(serv)}
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
            onClick={() => onEditarZona(serv)}
            className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition-all"
          >
            Editar
          </button>
          <button
            onClick={() => onEliminarZona(serv.id)}
            className="px-3 py-1.5 text-xs bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 font-bold transition-all"
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
      ) : (
        
        /* TABLA DE PROMOCIONES */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-3.5 rounded-l-xl">Promoción</th>
                <th className="px-4 py-3.5">Género</th>
                <th className="px-4 py-3.5">Zonas Incluidas</th>
                <th className="px-4 py-3.5">Duración</th>
                <th className="px-4 py-3.5">Precio Promo</th>
                <th className="px-4 py-3.5">Swap</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-4 py-3.5 text-right rounded-r-xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {promos.map((p) => {
                const esMasculino = p.genero?.toLowerCase() === 'masculino'
                return (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Nombre Promo */}
                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      {p.nombre_promo || '-'}
                    </td>

                    {/* Género Badge */}
                    <td className="px-4 py-3.5">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                        esMasculino
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {esMasculino ? '♂ Masculino' : '♀ Femenino'}
                      </span>
                    </td>

                    {/* Zonas Incluidas */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <span className="bg-purple-50 text-purple-700 font-semibold px-2.5 py-1 rounded-lg border border-purple-100 inline-block text-[11px]">
                        {getNombresZonas(servicios, p.zonas_incluidas)}
                      </span>
                    </td>

                    {/* Duración */}
                    <td className="px-4 py-3.5 text-gray-600 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {p.duracion_total_min || 0} min
                      </span>
                    </td>

                    {/* Precio Promo */}
                    <td className="px-4 py-3.5 font-extrabold text-emerald-600 text-sm">
                      ${(p.precio_promo || 0).toLocaleString('es-AR')}
                    </td>

                    {/* Swap */}
                    <td className="px-4 py-3.5 font-medium text-gray-600">
                      {p.permite_swap ? (
                        <span className="text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md">Sí</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => onToggleActivoPromo(p)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                          p.activo
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {p.activo ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Activa
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-gray-400" />
                            Inactiva
                          </>
                        )}
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => onEditarPromo(p)}
                        className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onEliminarPromo(p.id)}
                        className="px-3 py-1.5 text-xs bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 font-bold transition-all"
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
      )}
    </div>
  )
}