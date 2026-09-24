'use client'

import { useState, useMemo } from 'react'
import { X, Sparkles, Scissors, DollarSign, Clock, Loader2, Tag, User } from 'lucide-react'

export interface ServicioLaser {
  id: string
  genero?: string
  nombre_zona?: string
  categoria_zona?: string
  precio_lista?: number
  duracion_minutos?: number
  activo?: boolean
}

export interface PromoLaser {
  id: string
  genero?: string
  nombre_promo?: string
  zonas_incluidas?: string[] // Array de UUIDs que apuntan a ServicioLaser
  precio_promo?: number
  duracion_total_min?: number
  permite_swap?: boolean
  activo?: boolean
}

export interface ServicioGeneral {
  id: string
  categoria?: string
  subtipo?: string
  precio?: number
  duracion_minutos?: number
  activo?: boolean
}

export interface TurnoFormLocal {
  id?: string
  cliente_nombre: string
  cliente_celular?: string
  fecha_hora_local?: string
  detalle_texto?: string
  precio_total: number
  estado?: string
  metodo_pago?: string
  genero_paciente?: string
  detalle_reserva?: any
}

interface ModalEditarServiciosTurnoProps {
  turnoActual: TurnoFormLocal
  generoPaciente: string
  serviciosLaserDisponibles: ServicioLaser[]
  serviciosGeneralesDisponibles: ServicioGeneral[]
  promosLaserDisponibles: PromoLaser[]
  onSave: (serviciosSeleccionados: { 
    idsLaser: string[]
    idsGenerales: string[]
    idsPromos: string[]
    nuevoPrecio: number
    nuevaDuracion: number
    detalleTexto: string 
    genero: string
  }) => Promise<void>
  onClose: () => void
}

export default function ModalEditarServiciosTurno({
  turnoActual,
  generoPaciente,
  serviciosLaserDisponibles,
  serviciosGeneralesDisponibles,
  promosLaserDisponibles,
  onSave,
  onClose
}: ModalEditarServiciosTurnoProps) {
  // Estado local para permitir alternar género dinámicamente en recepción
  const [generoSeleccionado, setGeneroSeleccionado] = useState<string>(
    generoPaciente?.toLowerCase() === 'masculino' ? 'masculino' : 'femenino'
  )

  const [tipoSeleccion, setTipoSeleccion] = useState<'laser' | 'promos' | 'general'>(
    turnoActual.detalle_texto?.toLowerCase().includes('promo') ? 'promos' : 'laser'
  )

  const [idsLaserSeleccionados, setIdsLaserSeleccionados] = useState<string[]>([])
  const [idsPromosSeleccionadas, setIdsPromosSeleccionadas] = useState<string[]>([])
  const [idsGeneralesSeleccionados, setIdsGeneralesSeleccionados] = useState<string[]>([])
  const [guardando, setGuardando] = useState(false)

  // Función helper para traducir UUIDs de zonas_incluidas a nombres de zonas
  const obtenerNombresZonasPromo = (uuidsZonas?: string[]): string => {
    if (!uuidsZonas || uuidsZonas.length === 0) return ''
    const nombres = uuidsZonas
      .map(id => serviciosLaserDisponibles.find(z => z.id === id)?.nombre_zona)
      .filter(Boolean)
    return nombres.join(', ')
  }

  // Filtrado de zonas láser por el género seleccionado en el modal
  const zonasLaserFiltradas = useMemo(() => {
    return serviciosLaserDisponibles.filter(z => {
      if (!z.activo) return false
      const gen = generoSeleccionado.toLowerCase()
      const zGen = (z.genero || '').toLowerCase()
      if (gen === 'femenino') return zGen === 'femenino' || zGen === 'unisex'
      if (gen === 'masculino') return zGen === 'masculino' || zGen === 'unisex'
      return true
    })
  }, [serviciosLaserDisponibles, generoSeleccionado])

  // Agrupamiento por categoría de zona
  const zonasPorCategoria = useMemo(() => {
    const grupos: Record<string, ServicioLaser[]> = {}
    zonasLaserFiltradas.forEach(zona => {
      const cat = zona.categoria_zona || 'Otras Zonas'
      if (!grupos[cat]) grupos[cat] = []
      grupos[cat].push(zona)
    })
    return grupos
  }, [zonasLaserFiltradas])

  // Filtrado de promociones láser por el género seleccionado
  const promosFiltradas = useMemo(() => {
    return promosLaserDisponibles.filter(p => {
      if (!p.activo) return false
      const gen = generoSeleccionado.toLowerCase()
      const pGen = (p.genero || '').toLowerCase()
      if (gen === 'femenino') return pGen === 'femenino' || pGen === 'unisex'
      if (gen === 'masculino') return pGen === 'masculino' || pGen === 'unisex'
      return true
    })
  }, [promosLaserDisponibles, generoSeleccionado])

  const toggleZonaLaser = (id: string) => {
    setIdsLaserSeleccionados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const togglePromo = (id: string) => {
    setIdsPromosSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleServicioGeneral = (id: string) => {
    setIdsGeneralesSeleccionados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // Recálculo dinámico de totales y textos
  const { precioCalculado, duracionCalculada, detalleGenerado } = useMemo(() => {
    let precio = 0
    let duracion = 0
    const nombresSeleccionados: string[] = []

    idsLaserSeleccionados.forEach(id => {
      const zona = serviciosLaserDisponibles.find(z => z.id === id)
      if (zona) {
        precio += zona.precio_lista || 0
        duracion += zona.duracion_minutos || 15
        if (zona.nombre_zona) nombresSeleccionados.push(zona.nombre_zona)
      }
    })

    idsPromosSeleccionadas.forEach(id => {
      const promo = promosLaserDisponibles.find(p => p.id === id)
      if (promo) {
        precio += promo.precio_promo || 0
        duracion += promo.duracion_total_min || 30
        if (promo.nombre_promo) {
          const detalleZonas = obtenerNombresZonasPromo(promo.zonas_incluidas)
          const zonasTexto = detalleZonas ? ` (${detalleZonas})` : ''
          nombresSeleccionados.push(`Promo: ${promo.nombre_promo}${zonasTexto}`)
        }
      }
    })

    idsGeneralesSeleccionados.forEach(id => {
      const serv = serviciosGeneralesDisponibles.find(s => s.id === id)
      if (serv) {
        precio += serv.precio || 0
        duracion += serv.duracion_minutos || 30
        nombresSeleccionados.push(`${serv.categoria || ''}${serv.subtipo ? ` - ${serv.subtipo}` : ''}`)
      }
    })

    return {
      precioCalculado: precio,
      duracionCalculada: duracion > 0 ? duracion : 30,
      detalleGenerado: nombresSeleccionados.join(', ')
    }
  }, [idsLaserSeleccionados, idsPromosSeleccionadas, idsGeneralesSeleccionados, serviciosLaserDisponibles, promosLaserDisponibles, serviciosGeneralesDisponibles])

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setGuardando(true)
      await onSave({
        idsLaser: idsLaserSeleccionados,
        idsGenerales: idsGeneralesSeleccionados,
        idsPromos: idsPromosSeleccionadas,
        nuevoPrecio: precioCalculado > 0 ? precioCalculado : turnoActual.precio_total,
        nuevaDuracion: duracionCalculada,
        detalleTexto: detalleGenerado || turnoActual.detalle_texto || '',
        genero: generoSeleccionado
      })
      onClose()
    } catch (error) {
      console.error('Error al actualizar servicios del turno:', error)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full bg-white dark:bg-zinc-900 rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 max-h-[92vh] overflow-y-auto transition-colors p-4 sm:p-6 sm:max-w-xl pb-[env(safe-area-inset-bottom)]">
        
        {/* Indicador táctil móvil */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto my-1 sm:hidden" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 dark:bg-zinc-800 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight dark:text-zinc-100">Modificar Carrito / Servicios</h2>
              <p className="text-xs text-gray-500 mt-0.5 dark:text-zinc-400">Paciente: <span className="font-semibold text-gray-700 dark:text-zinc-200">{turnoActual.cliente_nombre}</span></p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="text-gray-400 hover:text-gray-600 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-zinc-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SELECTOR RÁPIDO DE GÉNERO */}
        <div className="mb-4 flex items-center justify-between bg-slate-50 dark:bg-zinc-800/60 p-2 rounded-2xl border border-slate-200/60 dark:border-zinc-700">
          <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300 ml-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-rose-500" />
            Catálogo de Género:
          </span>
          <div className="flex items-center gap-1">
            {['femenino', 'masculino'].map((gen) => (
              <button
                key={gen}
                type="button"
                onClick={() => setGeneroSeleccionado(gen)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  generoSeleccionado === gen
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-transparent text-slate-600 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:bg-zinc-700'
                }`}
              >
                {gen}
              </button>
            ))}
          </div>
        </div>

        {/* Pestañas de tipo de servicio */}
        <div className="grid grid-cols-3 gap-1.5 mb-4 p-1 bg-gray-100 dark:bg-zinc-800 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setTipoSeleccion('laser')}
            className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 truncate ${
              tipoSeleccion === 'laser'
                ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Zonas</span>
          </button>
          <button
            type="button"
            onClick={() => setTipoSeleccion('promos')}
            className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 truncate ${
              tipoSeleccion === 'promos'
                ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Promos</span>
          </button>
          <button
            type="button"
            onClick={() => setTipoSeleccion('general')}
            className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 truncate ${
              tipoSeleccion === 'general'
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 shadow-sm'
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Generales</span>
          </button>
        </div>

        <form onSubmit={handleGuardar} className="space-y-4">
          
          {/* SECCIÓN ZONAS LÁSER */}
          {tipoSeleccion === 'laser' && (
            <div className="space-y-3 max-h-52 sm:max-h-60 overflow-y-auto pr-1">
              {Object.keys(zonasPorCategoria).length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No hay zonas láser activas para el género {generoSeleccionado}.</p>
              ) : (
                Object.entries(zonasPorCategoria).map(([categoria, zonas]) => (
                  <div key={categoria} className="space-y-1.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 px-1">{categoria}</h3>
                    <div className="space-y-1">
                      {zonas.map(zona => {
                        const seleccionada = idsLaserSeleccionados.includes(zona.id)
                        return (
                          <div
                            key={zona.id}
                            onClick={() => toggleZonaLaser(zona.id)}
                            className={`flex items-center justify-between p-3 rounded-xl text-xs cursor-pointer border transition-all ${
                              seleccionada
                                ? 'bg-rose-50/60 border-rose-300 dark:bg-zinc-800 dark:border-rose-500/50 font-semibold text-gray-900 dark:text-zinc-100'
                                : 'bg-gray-50/50 border-gray-200 dark:bg-zinc-800/40 dark:border-zinc-700/50 text-gray-600 dark:text-zinc-400'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={seleccionada}
                                onChange={() => {}}
                                className="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 dark:bg-zinc-700 dark:border-zinc-600"
                              />
                              <span>{zona.nombre_zona}</span>
                            </div>
                            <span className="font-bold text-gray-800 dark:text-zinc-200">${(zona.precio_lista || 0).toLocaleString('es-AR')}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SECCIÓN PROMOCIONES LÁSER */}
          {tipoSeleccion === 'promos' && (
            <div className="space-y-2 max-h-52 sm:max-h-60 overflow-y-auto pr-1">
              {promosFiltradas.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No hay promociones láser disponibles para este género.</p>
              ) : (
                promosFiltradas.map(promo => {
                  const seleccionada = idsPromosSeleccionadas.includes(promo.id)
                  const nombresZonas = obtenerNombresZonasPromo(promo.zonas_incluidas)
                  return (
                    <div
                      key={promo.id}
                      onClick={() => togglePromo(promo.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl text-xs cursor-pointer border transition-all ${
                        seleccionada
                          ? 'bg-rose-50/60 border-rose-300 dark:bg-zinc-800 dark:border-rose-500/50 font-semibold text-gray-900 dark:text-zinc-100'
                          : 'bg-gray-50/50 border-gray-200 dark:bg-zinc-800/40 dark:border-zinc-700/50 text-gray-600 dark:text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={seleccionada}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 dark:bg-zinc-700 dark:border-zinc-600"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-zinc-100">{promo.nombre_promo}</p>
                          {nombresZonas && (
                            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">
                              Zonas: {nombresZonas}
                            </p>
                          )}
                          <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">Duración: {promo.duracion_total_min || 30} min</p>
                        </div>
                      </div>
                      <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">${(promo.precio_promo || 0).toLocaleString('es-AR')}</span>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* SECCIÓN SERVICIOS GENERALES */}
          {tipoSeleccion === 'general' && (
            <div className="space-y-1.5 max-h-52 sm:max-h-60 overflow-y-auto pr-1">
              {serviciosGeneralesDisponibles.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No hay servicios generales activos.</p>
              ) : (
                serviciosGeneralesDisponibles.map(serv => {
                  const seleccionado = idsGeneralesSeleccionados.includes(serv.id)
                  return (
                    <div
                      key={serv.id}
                      onClick={() => toggleServicioGeneral(serv.id)}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs cursor-pointer border transition-all ${
                        seleccionado
                          ? 'bg-gray-100 border-gray-400 dark:bg-zinc-800 dark:border-zinc-500 font-semibold text-gray-900 dark:text-zinc-100'
                          : 'bg-gray-50/50 border-gray-200 dark:bg-zinc-800/40 dark:border-zinc-700/50 text-gray-600 dark:text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 dark:bg-zinc-700 dark:border-zinc-600"
                        />
                        <span>{serv.categoria} {serv.subtipo ? `- ${serv.subtipo}` : ''}</span>
                      </div>
                      <span className="font-bold text-gray-800 dark:text-zinc-200">${(serv.precio || 0).toLocaleString('es-AR')}</span>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* BARRA DE TOTALES EN TIEMPO REAL */}
          <div className="bg-gray-50 dark:bg-zinc-800/80 p-3.5 rounded-2xl border border-gray-200/80 dark:border-zinc-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-zinc-300">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Total: <strong className="text-gray-900 dark:text-zinc-100">${precioCalculado.toLocaleString('es-AR')}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-zinc-300">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Duración: <strong className="text-gray-900 dark:text-zinc-100">{duracionCalculada} min</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-4 py-3 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || (idsLaserSeleccionados.length === 0 && idsPromosSeleccionadas.length === 0 && idsGeneralesSeleccionados.length === 0)}
              className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Actualizando...</span>
                </>
              ) : (
                <span>Guardar Cambios</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}