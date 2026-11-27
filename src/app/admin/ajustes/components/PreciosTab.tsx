// src/components/admin/tabs/PreciosTab.tsx
'use client'

import { useMemo, useState } from 'react'
import {
  Plus,
  CheckCircle2,
  XCircle,
  PencilLine,
  Tag,
  Clock,
  Loader2,
  RefreshCw,
  Search,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { ServicioLaser, PromoLaser, getNombresZonas } from '@/app/admin/turnos/components/types'
import GeneradorPlacaLaser from './GeneradorPlacaLaser';
type FiltroGenero = 'todos' | 'masculino' | 'femenino'

interface PreciosTabProps {
  loadingPrecios: boolean
  servicios: ServicioLaser[]
  promos: PromoLaser[]
  seccionPrecios: 'servicios' | 'promos'
  setSeccionPrecios: (v: 'servicios' | 'promos') => void

  onRefrescar?: () => Promise<void> | void

  onNuevaZona: () => void
  onEditarZona: (serv: ServicioLaser) => void
  onToggleActivoZona: (serv: ServicioLaser) => void
  onEliminarZona: (id: string) => void

  onNuevaPromo: () => void
  onEditarPromo: (promo: PromoLaser) => void
  onToggleActivoPromo: (promo: PromoLaser) => void
  onEliminarPromo: (id: string) => void
  onMoverPromo: (promoId: string, direccion: 'arriba' | 'abajo') => void
}

export default function PreciosTab({
  loadingPrecios,
  servicios,
  promos,
  seccionPrecios,
  setSeccionPrecios,
  onRefrescar,
  onNuevaZona,
  onEditarZona,
  onToggleActivoZona,
  onEliminarZona,
  onNuevaPromo,
  onEditarPromo,
  onToggleActivoPromo,
  onEliminarPromo,
  onMoverPromo
}: PreciosTabProps) {
  const [filtroGenero, setFiltroGenero] = useState<FiltroGenero>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [refrescando, setRefrescando] = useState(false)

  const handleRefrescar = async () => {
    if (!onRefrescar || refrescando) return
    try {
      setRefrescando(true)
      await onRefrescar()
    } finally {
      setRefrescando(false)
    }
  }

  const normalizarTexto = (valor?: string | number | null) =>
    String(valor ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()

  const coincidePrecio = (precio: number | undefined | null, terminoLimpio: string) => {
    if (!terminoLimpio) return true
    const valorNum = Number(precio || 0)
    const soloDigitosTermino = terminoLimpio.replace(/\D/g, '')
    if (!soloDigitosTermino) return false

    const plano = String(valorNum)
    const formateado = valorNum.toLocaleString('es-AR').replace(/\D/g, '')
    return plano.includes(soloDigitosTermino) || formateado.includes(soloDigitosTermino)
  }

  const serviciosFiltrados = useMemo(() => {
    const q = normalizarTexto(busqueda)
    const qDigits = busqueda.replace(/\D/g, '')

    return servicios.filter((serv) => {
      const generoServ = normalizarTexto(serv.genero)
      if (filtroGenero !== 'todos' && generoServ !== filtroGenero) {
        return false
      }

      if (!q) return true

      const matchNombre = normalizarTexto(serv.nombre_zona).includes(q)
      const matchCategoria = normalizarTexto(serv.categoria_zona).includes(q)
      const matchGenero = generoServ.includes(q)
      const matchPrecio = qDigits ? coincidePrecio(serv.precio_lista, qDigits) : false

      return matchNombre || matchCategoria || matchGenero || matchPrecio
    })
  }, [servicios, filtroGenero, busqueda])

  const promosFiltradas = useMemo(() => {
    const q = normalizarTexto(busqueda)
    const qDigits = busqueda.replace(/\D/g, '')

    return promos.filter((promo) => {
      const generoPromo = normalizarTexto(promo.genero)
      if (filtroGenero !== 'todos' && generoPromo !== filtroGenero) {
        return false
      }

      if (!q) return true

      const zonasTexto = normalizarTexto(getNombresZonas(servicios, promo.zonas_incluidas))
      const matchNombre = normalizarTexto(promo.nombre_promo).includes(q)
      const matchZonas = zonasTexto.includes(q)
      const matchPrecio = qDigits ? coincidePrecio(promo.precio_promo, qDigits) : false

      return matchNombre || matchZonas || matchPrecio
    })
  }, [promos, servicios, filtroGenero, busqueda])

  const hayFiltrosActivos = filtroGenero !== 'todos' || busqueda.trim().length > 0

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-6 transition-all space-y-6">
      {/* Pestañas Superiores y Botones de Acción */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Switcher de Subsección */}
        <div className="flex space-x-1.5 sm:space-x-2 bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSeccionPrecios('servicios')}
            className={`whitespace-nowrap px-4 py-2.5 sm:py-2 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
              seccionPrecios === 'servicios'
                ? 'bg-blue-600 text-white shadow-md dark:bg-blue-600 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-700/50'
            }`}
          >
            <PencilLine className="w-4 h-4" />
            Zonas / Servicios Láser ({serviciosFiltrados.length}
            {hayFiltrosActivos && seccionPrecios === 'servicios' ? `/${servicios.length}` : ''})
          </button>

          <button
            type="button"
            onClick={() => setSeccionPrecios('promos')}
            className={`whitespace-nowrap px-4 py-2.5 sm:py-2 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
              seccionPrecios === 'promos'
                ? 'bg-blue-600 text-white shadow-md dark:bg-blue-600 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-700/50'
            }`}
          >
            <Tag className="w-4 h-4" />
            Promociones ({promosFiltradas.length}
            {hayFiltrosActivos && seccionPrecios === 'promos' ? `/${promos.length}` : ''})
          </button>
        </div>

        {/* Botones Refrescar + Nueva Zona/Promo */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {onRefrescar && (
            <button
              type="button"
              onClick={handleRefrescar}
              disabled={refrescando || loadingPrecios}
              className="justify-center px-4 py-2.5 text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/80 rounded-2xl hover:bg-slate-200/80 disabled:opacity-60 transition-all flex items-center gap-2 active:scale-95 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refrescando || loadingPrecios ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
              {refrescando ? 'Actualizando...' : 'Refrescar'}
            </button>
          )}

          {seccionPrecios === 'servicios' ? (
            <button
              type="button"
              onClick={onNuevaZona}
              className="w-full sm:w-auto justify-center px-5 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nueva Zona
            </button>
          ) : (
            <button
              type="button"
              onClick={onNuevaPromo}
              className="w-full sm:w-auto justify-center px-5 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nueva Promo
            </button>
          )}
        </div>
      </div>

      {/* Barra de Búsqueda + Filtro Género */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50/90 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800 p-3 rounded-2xl">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={
              seccionPrecios === 'servicios'
                ? 'Buscar por zona, categoría o precio...'
                : 'Buscar por promo, zona o precio...'
            }
            className="w-full pl-9 pr-9 py-2 text-xs font-medium bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtro Género */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFiltroGenero('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filtroGenero === 'todos'
                ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-700 dark:hover:bg-zinc-800'
            }`}
          >
            Todos
          </button>

          <button
            type="button"
            onClick={() => setFiltroGenero('masculino')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filtroGenero === 'masculino'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-blue-50/70 text-blue-700 border border-blue-200/80 hover:bg-blue-100/70 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50'
            }`}
          >
            ♂ Masculino
          </button>

          <button
            type="button"
            onClick={() => setFiltroGenero('femenino')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filtroGenero === 'femenino'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50/70 text-rose-700 border border-rose-200/80 hover:bg-rose-100/70 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50'
            }`}
          >
            ♀ Femenino
          </button>

          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={() => {
                setFiltroGenero('todos')
                setBusqueda('')
              }}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 underline underline-offset-2 cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {loadingPrecios ? (
        <div className="py-16 text-center text-slate-400 text-xs font-bold animate-pulse dark:text-zinc-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
          <span>Cargando precios y zonas de Supabase...</span>
        </div>
      ) : seccionPrecios === 'servicios' ? (
        /* TABLA DE ZONAS / SERVICIOS LÁSER */
        <div className="space-y-2">
          <p className="sm:hidden text-[11px] text-slate-400 dark:text-zinc-500 font-bold">
            ↔ Deslizá la tabla hacia los costados para ver más columnas
          </p>
          <div className="overflow-x-auto scroll-smooth -mx-4 sm:mx-0 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-2xs">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200/80 dark:border-zinc-800 text-slate-500 uppercase tracking-wider text-[11px] font-bold dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3.5">Zona</th>
                    <th className="px-4 py-3.5">Género</th>
                    <th className="px-4 py-3.5">Categoría</th>
                    <th className="px-4 py-3.5">Duración</th>
                    <th className="px-4 py-3.5">Precio Lista</th>
                    <th className="px-4 py-3.5">Estado</th>
                    <th className="px-4 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {serviciosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-400 dark:text-zinc-500 font-semibold">
                        No hay zonas que coincidan con el filtro o búsqueda.
                      </td>
                    </tr>
                  ) : (
                    serviciosFiltrados.map((serv) => {
                      const esMasculino = serv.genero?.toLowerCase() === 'masculino'
                      return (
                        <tr
                          key={serv.id}
                          className={`transition-colors border-l-4 ${
                            esMasculino
                              ? 'border-l-blue-500 hover:bg-blue-50/40 dark:border-l-blue-400 dark:hover:bg-blue-950/20'
                              : 'border-l-rose-400 hover:bg-rose-50/40 dark:border-l-rose-400 dark:hover:bg-rose-950/20'
                          }`}
                        >
                          <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap dark:text-zinc-100">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  esMasculino ? 'bg-blue-500 dark:bg-blue-400' : 'bg-rose-500 dark:bg-rose-400'
                                }`}
                              />
                              {serv.nombre_zona || '-'}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wide inline-flex items-center gap-1 border shadow-2xs ${
                                esMasculino
                                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60'
                              }`}
                            >
                              {esMasculino ? '♂ Masculino' : '♀ Femenino'}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-slate-500 font-semibold capitalize whitespace-nowrap dark:text-zinc-400">
                            {serv.categoria_zona || '-'}
                          </td>

                          <td className="px-4 py-3.5 text-slate-600 font-medium whitespace-nowrap dark:text-zinc-300">
                            <span className="inline-flex items-center gap-1.5 font-bold">
                              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                              {serv.duracion_minutos || 0} min
                            </span>
                          </td>

                          <td className="px-4 py-3.5 font-black font-mono text-slate-900 text-sm whitespace-nowrap dark:text-zinc-100">
                            ${(serv.precio_lista || 0).toLocaleString('es-AR')}
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onToggleActivoZona(serv)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                                serv.activo
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-900/60'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                              }`}
                            >
                              {serv.activo ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  Activo
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                                  Inactivo
                                </>
                              )}
                            </button>
                          </td>

                          <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                            <button
                              type="button"
                              onClick={() => onEditarZona(serv)}
                              className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold transition-all active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => onEliminarZona(serv.id)}
                              className="px-3 py-1.5 text-xs bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 font-bold transition-all active:scale-95 dark:bg-rose-950/60 dark:text-rose-400 dark:hover:bg-rose-900/60 cursor-pointer"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
/* TABLA DE PROMOCIONES */
        <div className="space-y-2">
          <p className="sm:hidden text-[11px] text-slate-400 dark:text-zinc-500 font-bold">
            ↔ Deslizá la tabla hacia los costados para ver más columnas
          </p>
<div className="overflow-x-auto scroll-smooth -mx-4 sm:mx-0 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-2xs">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200/80 dark:border-zinc-800 text-slate-500 uppercase tracking-wider text-[11px] font-bold dark:text-zinc-400">
                  <tr>
                    <th className="px-3 py-3.5">Orden</th>
                    <th className="px-4 py-3.5">Promoción</th>
                    <th className="px-4 py-3.5">Género</th>
                    <th className="px-4 py-3.5">Zonas Incluidas</th>
                    <th className="px-4 py-3.5">Duración</th>
                    <th className="px-4 py-3.5">Precio Promo</th>
                    <th className="px-4 py-3.5">Swap</th>
                    <th className="px-4 py-3.5">Estado</th>
                    <th className="px-4 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {promosFiltradas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-10 text-center text-slate-400 dark:text-zinc-500 font-semibold"
                      >
                        No hay promociones que coincidan con el filtro o búsqueda.
                      </td>
                    </tr>
                  ) : (
                    promosFiltradas.map((p, idx) => {
                      const esMasculino = p.genero?.toLowerCase() === 'masculino'
                      const esPrimera = idx === 0
                      const esUltima = idx === promosFiltradas.length - 1
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors dark:hover:bg-zinc-800/40">
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                disabled={esPrimera}
                                onClick={() => onMoverPromo(p.id, 'arriba')}
                                title="Subir promoción"
                                aria-label="Subir promoción"
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-90 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                              >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={esUltima}
                                  onClick={() => onMoverPromo(p.id, 'abajo')}
                                  title="Bajar promoción"
                                  aria-label="Bajar promoción"
                                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-90 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                          <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap dark:text-zinc-100">
                            {p.nombre_promo || '-'}
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wide inline-flex items-center gap-1 border shadow-2xs ${
                                esMasculino
                                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60'
                              }`}
                            >
                              {esMasculino ? '♂ Masculino' : '♀ Femenino'}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 max-w-xs">
                            <span className="bg-purple-50 text-purple-700 font-bold px-2.5 py-1 rounded-xl border border-purple-200/60 inline-block text-[11px] dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900/60">
                              {getNombresZonas(servicios, p.zonas_incluidas)}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-slate-600 font-medium whitespace-nowrap dark:text-zinc-300">
                            <span className="inline-flex items-center gap-1.5 font-bold">
                              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                              {p.duracion_total_min || 0} min
                            </span>
                          </td>

                          <td className="px-4 py-3.5 font-black font-mono text-emerald-600 text-sm whitespace-nowrap dark:text-emerald-400">
                            ${(p.precio_promo || 0).toLocaleString('es-AR')}
                          </td>

                          <td className="px-4 py-3.5 font-bold text-slate-600 whitespace-nowrap dark:text-zinc-300">
                            {p.permite_swap ? (
                              <span className="text-purple-600 font-black bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200/60 dark:bg-purple-950/60 dark:text-purple-400">
                                Sí
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-zinc-500 font-semibold">No</span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onToggleActivoPromo(p)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                                p.activo
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-900/60'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                              }`}
                            >
                              {p.activo ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  Activa
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                                  Inactiva
                                </>
                              )}
                            </button>
                          </td>

                          <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                            <button
                              type="button"
                              onClick={() => onEditarPromo(p)}
                              className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold transition-all active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => onEliminarPromo(p.id)}
                              className="px-3 py-1.5 text-xs bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 font-bold transition-all active:scale-95 dark:bg-rose-950/60 dark:text-rose-400 dark:hover:bg-rose-900/60 cursor-pointer"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <GeneradorPlacaLaser promos={promos} zonas={servicios} />
    </div>
  )
}