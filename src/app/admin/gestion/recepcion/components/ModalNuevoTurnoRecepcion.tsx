'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Reserva, datetimeLocalToIso, isoToDatetimeLocal } from '@/app/admin/turnos/components/types'
import { ServicioLaser, PromoLaser } from '@/lib/types'
import { X, User, Phone, Calendar, Layers, ClipboardList, ArrowRightLeft, Zap, Heart } from "lucide-react";
import { 
  getZonaById, 
  getZonasPromoResueltas, 
  getZonasSwapDisponibles, 
  SwapsMap 
} from '@/lib/laser/calculos'
import ModalSwapZona from '@/components/laser/ModalSwapZona'
import { ServicioGeneral } from '@/lib/types'

interface ModalNuevoTurnoRecepcionProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  turnoAEditar?: Reserva | null
  tipoServicioInicial?: 'laser' | 'general'
}

export default function ModalNuevoTurnoRecepcion({
  isOpen,
  onClose,
  onSuccess,
  turnoAEditar,
  tipoServicioInicial = 'laser'
}: ModalNuevoTurnoRecepcionProps) {
  // Estado para alternar entre láser y general en el modal
  const [tipoServicioActivo, setTipoServicioActivo] = useState<'laser' | 'general'>(tipoServicioInicial)
  const [serviciosGenerales, setServiciosGenerales] = useState<ServicioGeneral[]>([])
  const [serviciosGeneralesSeleccionados, setServiciosGeneralesSeleccionados] = useState<string[]>([])
  const [nombre, setNombre] = useState('')
  const [celular, setCelular] = useState('')
  const [fechaHoraLocal, setFechaHoraLocal] = useState('')
  
  const [tipoSeleccion, setTipoSeleccion] = useState<'zonas' | 'promo'>('zonas')
  const [serviciosLaser, setServiciosLaser] = useState<ServicioLaser[]>([])
  const [promosLaser, setPromosLaser] = useState<PromoLaser[]>([])
  
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>([])
  const [promoSeleccionadaId, setPromoSeleccionadaId] = useState<string>('')
  
  // Mapa de Swaps realizados sobre la promo { idZonaOriginal: idZonaNueva }
  const [swaps, setSwaps] = useState<SwapsMap>({})
  const [swapTargetZona, setSwapTargetZona] = useState<ServicioLaser | null>(null)

  const [filtroGenero, setFiltroGenero] = useState<string>('todos')
  const [loadingCatalogos, setLoadingCatalogos] = useState(true)
  const [guardando, setGuardando] = useState(false)

  // Cargar catálogos y precargar si es edición
  useEffect(() => {
    if (!isOpen) return

    const fetchData = async () => {
      setLoadingCatalogos(true)
      
      const [resServicios, resPromos, resGenerales] = await Promise.all([
        supabase.from('servicios_laser').select('*').eq('activo', true),
        supabase.from('promos_laser').select('*').eq('activo', true),
        supabase.from('servicios_generales').select('*').eq('activo', true)
      ])

      const listServicios = (resServicios.data as ServicioLaser[]) || []
      const listPromos = (resPromos.data as PromoLaser[]) || []
      const listGenerales = (resGenerales.data as ServicioGeneral[]) || []
      
      setServiciosLaser(listServicios)
      setPromosLaser(listPromos)
      setServiciosGenerales(listGenerales)

      if (turnoAEditar) {
        setNombre(turnoAEditar.cliente_nombre || '')
        setCelular(turnoAEditar.cliente_celular || '')
        setFechaHoraLocal(isoToDatetimeLocal(turnoAEditar.fecha_hora_inicio))
        setTipoServicioActivo((turnoAEditar.servicio_tipo as 'laser' | 'general') || 'laser')
        // Si es general, puedes precargar los servicios seleccionados desde su detalle_reserva si lo deseas
      } else {
        setTipoServicioActivo(tipoServicioInicial)
        // ... resto de reseteos
      }

      if (turnoAEditar) {
        setNombre(turnoAEditar.cliente_nombre || '')
        setCelular(turnoAEditar.cliente_celular || '')
        setFechaHoraLocal(isoToDatetimeLocal(turnoAEditar.fecha_hora_inicio))
        setSwaps({})
      } else {
        const now = new Date()
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
        setFechaHoraLocal(now.toISOString().slice(0, 16))
        setNombre('')
        setCelular('')
        setZonasSeleccionadas([])
        setPromoSeleccionadaId('')
        setSwaps({})
      }
      
      setLoadingCatalogos(false)
    }

    fetchData()
  }, [isOpen, turnoAEditar])

  if (!isOpen) return null

  const serviciosFiltrados = serviciosLaser.filter(
    (s) => filtroGenero === 'todos' || s.genero === filtroGenero
  )
  const promosFiltradas = promosLaser.filter(
    (p) => filtroGenero === 'todos' || p.genero === filtroGenero
  )

  const toggleZona = (id: string) => {
    setZonasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id]
    )
  }

  const handleSeleccionarPromo = (promoId: string) => {
    setPromoSeleccionadaId(promoId)
    setSwaps({}) // Limpiar swaps previos al cambiar de promo
  }

  const ejecutarSwap = (nuevoServicioId: string) => {
    if (!swapTargetZona) return
    setSwaps((prev) => ({
      ...prev,
      [swapTargetZona.id]: nuevoServicioId
    }))
    setSwapTargetZona(null)
  }

  // Obtener objeto de la promo seleccionada
  const promoElegidaObj = promosLaser.find((p) => p.id === promoSeleccionadaId)

  // Zonas resueltas de la promo (aplicando swaps activos)
  const zonasPromoResueltas = promoElegidaObj
    ? getZonasPromoResueltas(promoElegidaObj, serviciosLaser, swaps)
    : []

  let precioTotal = 0
  let duracionTotal = 30
  let detalleTexto = ''

  if (tipoServicioActivo === 'general') {
    const elegidosGen = serviciosGenerales.filter((s) => serviciosGeneralesSeleccionados.includes(s.id))
    precioTotal = elegidosGen.reduce((acc, s) => acc + (Number(s.precio) || 0), 0)
    duracionTotal = elegidosGen.reduce((acc, s) => acc + (Number(s.duracion_minutos) || 0), 0) || 30
    detalleTexto = elegidosGen.map((s) => s.subtipo).filter(Boolean).join(' + ')
  } else {
    if (tipoSeleccion === 'zonas') {
      const zonasElegidasObj = serviciosLaser.filter((s) => zonasSeleccionadas.includes(s.id))
      precioTotal = zonasElegidasObj.reduce((acc, z) => acc + (Number(z.precio_lista) || 0), 0)
      duracionTotal = zonasElegidasObj.reduce((acc, z) => acc + (Number(z.duracion_minutos) || 0), 0) || 30
      detalleTexto = zonasElegidasObj.map((z) => z.nombre_zona).filter(Boolean).join(' + ')
    } else {
      if (promoElegidaObj) {
        precioTotal = Number(promoElegidaObj.precio_promo) || 0
        duracionTotal = zonasPromoResueltas.reduce((acc, z) => acc + z.duracion_minutos, 0) || Number(promoElegidaObj.duracion_total_min) || 30
        detalleTexto = zonasPromoResueltas.map((z) => z.nombre_zona).join(' + ') || `Promo: ${promoElegidaObj.nombre_promo}`
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim() || !fechaHoraLocal) {
      alert('Por favor completá al menos el nombre del cliente y la fecha/hora.')
      return
    }

    if (tipoSeleccion === 'zonas' && zonasSeleccionadas.length === 0 && !turnoAEditar) {
      alert('Seleccioná al menos una zona láser.')
      return
    }

    if (tipoSeleccion === 'promo' && !promoSeleccionadaId && !turnoAEditar) {
      alert('Seleccioná una promoción.')
      return
    }

    setGuardando(true)

   const payload: any = {
      cliente_nombre: nombre,
      cliente_celular: celular,
      fecha_hora_inicio: datetimeLocalToIso(fechaHoraLocal),
      duracion_total: duracionTotal,
      precio_total: Number(precioTotal),
      servicio_tipo: tipoServicioActivo,
      modificado_por_admin: true
    }

    if (tipoServicioActivo === 'general') {
      const elegidosGen = serviciosGenerales.filter((s) => serviciosGeneralesSeleccionados.includes(s.id))
      payload.detalle_reserva = {
        servicios: elegidosGen.map(s => ({ id: s.id, subtipo: s.subtipo, precio: s.precio, duracion_minutos: s.duracion_minutos })),
        detalle_texto: detalleTexto
      }
    } else {
      if (tipoSeleccion === 'promo' && promoElegidaObj) {
        payload.detalle_reserva = {
          modo: 'promo',
          promo_id: promoElegidaObj.id,
          nombre_promo: promoElegidaObj.nombre_promo,
          detalle_texto: detalleTexto,
          swaps: swaps,
          hubo_cambios: Object.keys(swaps).length > 0
        }
      } else if (detalleTexto) {
        payload.detalle_reserva = {
          modo: 'zonas',
          detalle_texto: detalleTexto,
          zonas_ids: zonasSeleccionadas
        }
      }
    }

    let errorSupabase = null

    if (turnoAEditar) {
      const { error } = await supabase
        .from('reservas')
        .update(payload)
        .eq('id', turnoAEditar.id)
      errorSupabase = error
    } else {
      payload.codigo_unico = `RECEPCION-${Date.now().toString(36).toUpperCase()}`
      payload.servicio_tipo = tipoServicioActivo
      payload.estado = 'pendiente_sena'
      payload.metodo_pago = 'efectivo'

      const { error } = await supabase
        .from('reservas')
        .insert([payload])
      errorSupabase = error
    }

    if (errorSupabase) {
      alert('Error al guardar el turno: ' + errorSupabase.message)
    } else {
      alert(turnoAEditar ? 'Turno actualizado con éxito.' : 'Turno registrado con éxito.')
      onSuccess()
      onClose()
    }

    setGuardando(false)
  }

  // Zonas ocupadas actualmente en la promo para deshabilitarlas en el swap
  const idsOcupadosSwap = zonasPromoResueltas.map((z) => z.id)
  const opcionesSwapDisponibles = swapTargetZona
    ? getZonasSwapDisponibles(swapTargetZona, serviciosLaser, idsOcupadosSwap)
    : []

return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      {/* Contenedor principal con altura máxima y diseño flex para evitar cortes arriba */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh] text-slate-900 dark:text-zinc-100 my-auto overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 shrink-0">
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
            {turnoAEditar ? 'Editar Turno' : 'Nuevo Turno - Mostrador'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 transition-all cursor-pointer border border-slate-200/60 dark:border-zinc-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* FORMULARIO CON SCROLL INTERNO */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">

          {/* SELECTOR PRINCIPAL (Láser / General con iconos de Lucide) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/60 dark:bg-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => setTipoServicioActivo('laser')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tipoServicioActivo === 'laser'
                  ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Jornada Láser</span>
            </button>
            <button
              type="button"
              onClick={() => setTipoServicioActivo('general')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tipoServicioActivo === 'general'
                  ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
              <span>Servicio General</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Nombre del Cliente *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Ej. María Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Celular / WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ej. 3416123456"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Fecha y Hora del Turno *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="datetime-local"
                required
                value={fechaHoraLocal}
                onChange={(e) => setFechaHoraLocal(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* SÓLO SE MUESTRA SI ES LÁSER */}
          {tipoServicioActivo === 'laser' && (
            <>
              <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setTipoSeleccion('zonas'); setPromoSeleccionadaId(''); setSwaps({}); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    tipoSeleccion === 'zonas'
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Zonas Individuales</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setTipoSeleccion('promo'); setZonasSeleccionadas([]); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    tipoSeleccion === 'promo'
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
                  }`}
                >
                  <ClipboardList className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Promos y Combos</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  {tipoSeleccion === 'zonas' ? 'Zonas Láser Disponibles' : 'Promociones Activas'}
                </label>
                <div className="flex bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[11px]">
                  {['todos', 'femenino', 'masculino'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFiltroGenero(g)}
                      className={`px-2.5 py-1 rounded-md capitalize transition-all cursor-pointer ${
                        filtroGenero === g
                          ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 font-bold shadow-2xs'
                          : 'text-slate-500 dark:text-zinc-400'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {tipoServicioActivo === 'general' && (
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
              Servicios Generales Disponibles
            </label>
          )}

          <div className="max-h-48 overflow-y-auto border border-slate-200/80 dark:border-zinc-800 rounded-xl p-2 space-y-1 bg-slate-50/50 dark:bg-zinc-800/30">
            {loadingCatalogos ? (
              <p className="text-xs text-slate-400 p-2 text-center">Cargando opciones...</p>
            ) : tipoServicioActivo === 'general' ? (
              serviciosGenerales.map((sg) => {
                const checked = serviciosGeneralesSeleccionados.includes(sg.id)
                return (
                  <button
                    type="button"
                    key={sg.id}
                    onClick={() => {
                      setServiciosGeneralesSeleccionados((prev) =>
                        prev.includes(sg.id) ? prev.filter((i) => i !== sg.id) : [...prev, sg.id]
                      )
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all border cursor-pointer ${
                      checked
                        ? 'bg-purple-600 text-white font-semibold border-transparent shadow-2xs'
                        : 'bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200/60 dark:border-zinc-800'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-bold">{sg.subtipo}</p>
                      <p className="text-[10px] opacity-80 capitalize">{sg.categoria}</p>
                    </div>
                    <span className="font-bold">${Number(sg.precio).toLocaleString('es-AR')}</span>
                  </button>
                )
              })
            ) : tipoSeleccion === 'zonas' ? (
              serviciosFiltrados.map((s) => {
                const checked = zonasSeleccionadas.includes(s.id)
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleZona(s.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all border cursor-pointer ${
                      checked
                        ? 'bg-purple-600 text-white font-semibold border-transparent shadow-2xs'
                        : 'bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200/60 dark:border-zinc-800'
                    }`}
                  >
                    <span>{s.nombre_zona}</span>
                    <span className="font-bold">${Number(s.precio_lista).toLocaleString('es-AR')}</span>
                  </button>
                )
              })
            ) : (
              promosFiltradas.map((p) => {
                const selected = promoSeleccionadaId === p.id
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => handleSeleccionarPromo(p.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all border text-left cursor-pointer ${
                      selected
                        ? 'bg-purple-600 text-white font-semibold border-transparent shadow-2xs'
                        : 'bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200/60 dark:border-zinc-800'
                    }`}
                  >
                    <div>
                      <p className="font-bold">{p.nombre_promo}</p>
                    </div>
                    <span className="font-bold text-sm">${Number(p.precio_promo).toLocaleString('es-AR')}</span>
                  </button>
                )
              })
            )}
          </div>

          {/* DESGLOSE Y SWAP DE LA PROMO SELECCIONADA */}
          {tipoSeleccion === 'promo' && promoElegidaObj && (
            <div className="p-3.5 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/50 rounded-xl space-y-2">
              <p className="text-xs font-bold text-purple-900 dark:text-purple-300">
                Zonas incluidas en la promo (Podés hacer Swap 🔁):
              </p>
              <div className="space-y-1.5">
                {zonasPromoResueltas.map((zona, idx) => {
                  const originalId = promoElegidaObj.zonas_incluidas[idx]
                  const originalZona = getZonaById(serviciosLaser, originalId)
                  const fueCambiado = swaps[originalId] !== undefined

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200/80 dark:border-zinc-800 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{zona.nombre_zona}</span>
                        <span className="ml-2 text-[10px] text-slate-400 capitalize">({zona.categoria_zona})</span>
                        {fueCambiado && (
                          <span className="ml-2 text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 px-1.5 py-0.5 rounded font-semibold">
                            Intercambiado
                          </span>
                        )}
                      </div>

                      {originalZona && promoElegidaObj.permite_swap !== false && (
                        <button
                          type="button"
                          onClick={() => setSwapTargetZona(originalZona)}
                          className="p-1.5 bg-slate-100 hover:bg-purple-100 dark:bg-zinc-800 dark:hover:bg-purple-950 text-slate-600 dark:text-purple-300 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] border border-slate-200 dark:border-zinc-700"
                          title="Cambiar esta zona por otra equivalente"
                        >
                          <ArrowRightLeft className="h-3 w-3" />
                          <span>Swap</span>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="bg-slate-50 dark:bg-zinc-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-1 shrink-0">
            <div className="flex justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>Duración estimada:</span>
              <span className="font-semibold text-slate-700 dark:text-zinc-300">{duracionTotal} minutos</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-zinc-100">
              <span>Total a cobrar:</span>
              <span className="text-emerald-700 dark:text-emerald-400">${precioTotal.toLocaleString('es-AR')}</span>
            </div>
            {detalleTexto && (
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate pt-0.5">
                Detalle: {detalleTexto}
              </p>
            )}
          </div>

          <div className="flex gap-2.5 pt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {guardando ? 'Guardando...' : turnoAEditar ? 'Guardar Cambios' : 'Crear Turno'}
            </button>
          </div>
        </form>
      </div>

      {/* MODAL SWAP INTERNO */}
      {swapTargetZona && (
        <ModalSwapZona
          zonaOriginal={swapTargetZona}
          opciones={opcionesSwapDisponibles}
          onSelect={ejecutarSwap}
          onClose={() => setSwapTargetZona(null)}
        />
      )}
    </div>
  )
}