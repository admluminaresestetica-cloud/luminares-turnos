// src/components/admin/tabs/PreciosTab.tsx
'use client'

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex space-x-3">
          <button
            onClick={() => setSeccionPrecios('servicios')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              seccionPrecios === 'servicios'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Zonas / Servicios Laser ({servicios.length})
          </button>
          <button
            onClick={() => setSeccionPrecios('promos')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              seccionPrecios === 'promos'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Promociones ({promos.length})
          </button>
        </div>

        {seccionPrecios === 'servicios' ? (
          <button
            onClick={onNuevaZona}
            className="px-4 py-2 text-sm bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
          >
            + Nueva Zona
          </button>
        ) : (
          <button
            onClick={onNuevaPromo}
            className="px-4 py-2 text-sm bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
          >
            + Nueva Promo
          </button>
        )}
      </div>

      {loadingPrecios ? (
        <div className="py-8 text-center text-gray-500">Cargando precios...</div>
      ) : seccionPrecios === 'servicios' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Zona</th>
                <th className="px-4 py-3">Género</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Duración (min)</th>
                <th className="px-4 py-3">Precio Lista ($)</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {servicios.map((serv) => (
                <tr key={serv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{serv.nombre_zona || '-'}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2.5 py-1 rounded-full font-medium capitalize ${
                      serv.genero?.toLowerCase() === 'masculino'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-pink-100 text-pink-700'
                    }`}>
                      {serv.genero || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{serv.categoria_zona || '-'}</td>
                  <td className="px-4 py-3 text-xs">{serv.duracion_minutos || 0} min</td>
                  <td className="px-4 py-3 font-semibold">
                    ${(serv.precio_lista || 0).toLocaleString('es-AR')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggleActivoZona(serv)}
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
                      onClick={() => onEditarZona(serv)}
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onEliminarZona(serv.id)}
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
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Promoción</th>
                <th className="px-4 py-3">Género</th>
                <th className="px-4 py-3">Zonas Incluidas</th>
                <th className="px-4 py-3">Duración</th>
                <th className="px-4 py-3">Precio Promo ($)</th>
                <th className="px-4 py-3">Swap</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promos.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.nombre_promo || '-'}</td>
                  <td className="px-4 py-3 text-xs capitalize text-gray-500">{p.genero || '-'}</td>
                  <td className="px-4 py-3 text-xs max-w-xs">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block">
                      {getNombresZonas(servicios, p.zonas_incluidas)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{p.duracion_total_min || 0} min</td>
                  <td className="px-4 py-3 font-semibold">
                    ${(p.precio_promo || 0).toLocaleString('es-AR')}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium">
                    {p.permite_swap ? 'Sí' : 'No'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggleActivoPromo(p)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        p.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {p.activo ? 'Activa' : 'Inactiva'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => onEditarPromo(p)}
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onEliminarPromo(p.id)}
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