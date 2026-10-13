'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Reserva, datetimeLocalToIso, isoToDatetimeLocal } from '@/app/admin/turnos/components/types'
import { ServicioLaser, PromoLaser } from '@/lib/types'
import { X, Clock, DollarSign, User, Phone, Calendar, Sparkles, Layers, ArrowRightLeft } from 'lucide-react'
import { 
  getZonaById, 
  getZonasPromoResueltas, 
  getZonasSwapDisponibles, 
  SwapsMap 
} from '@/lib/laser/calculos'
import ModalSwapZona from '@/components/laser/ModalSwapZona'

interface ModalNuevoTurnoRecepcionProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  turnoAEditar?: Reserva | null
}

export default function ModalNuevoTurnoRecepcion({
  isOpen,
  onClose,
  onSuccess,
  turnoAEditar
}: ModalNuevoTurnoRecepcionProps) {
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
      
      const [resServicios, resPromos] = await Promise.all([
        supabase.from('servicios_laser').select('*').eq('activo', true),
        supabase.from('promos_laser').select('*').eq('activo', true)
      ])

      const listServicios = (resServicios.data as ServicioLaser[]) || []
      const listPromos = (resPromos.data as PromoLaser[]) || []
      
      setServiciosLaser(listServicios)
      setPromosLaser(listPromos)

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
      modificado_por_admin: true
    }

    if (detalleTexto) {
      payload.detalle_reserva = { 
        detalle_texto: detalleTexto,
        nombre_promo: promoElegidaObj?.nombre_promo || null,
        swaps: swaps,
        hubo_cambios: Object.keys(swaps).length > 0 // 👈 Bandera que indica si hubo algún swap en la promo
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
      payload.servicio_tipo = 'laser'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden my-8">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
            {turnoAEditar ? 'Editar Turno' : 'Nuevo Turno - Mostrador'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
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
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                Celular / WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ej. 3416123456"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
              Fecha y Hora del Turno *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="datetime-local"
                required
                value={fechaHoraLocal}
                onChange={(e) => setFechaHoraLocal(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setTipoSeleccion('zonas'); setPromoSeleccionadaId(''); setSwaps({}); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tipoSeleccion === 'zonas'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Zonas Individuales</span>
            </button>
            <button
              type="button"
              onClick={() => { setTipoSeleccion('promo'); setZonasSeleccionadas([]); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tipoSeleccion === 'promo'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Promos y Combos</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
              {tipoSeleccion === 'zonas' ? 'Zonas Láser Disponibles' : 'Promociones Activas'}
            </label>
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[11px]">
              {['todos', 'femenino', 'masculino'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFiltroGenero(g)}
                  className={`px-2 py-0.5 rounded-md capitalize transition-all cursor-pointer ${
                    filtroGenero === g
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 font-bold shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-zinc-800 rounded-xl p-2 space-y-1">
            {loadingCatalogos ? (
              <p className="text-xs text-slate-400 p-2 text-center">Cargando opciones...</p>
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
                        ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold border-transparent shadow-xs'
                        : 'bg-white dark:bg-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-100 dark:border-zinc-800'
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
                        ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold border-transparent shadow-xs'
                        : 'bg-white dark:bg-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-100 dark:border-zinc-800'
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
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl space-y-2">
              <p className="text-xs font-bold text-blue-900 dark:text-blue-300">
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
                      className="flex items-center justify-between p-2 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{zona.nombre_zona}</span>
                        <span className="ml-2 text-[10px] text-slate-400 capitalize">({zona.categoria_zona})</span>
                        {fueCambiado && (
                          <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1 py-0.5 rounded font-semibold">
                            Intercambiado
                          </span>
                        )}
                      </div>

                      {originalZona && promoElegidaObj.permite_swap !== false && (
                        <button
                          type="button"
                          onClick={() => setSwapTargetZona(originalZona)}
                          className="p-1 bg-slate-100 hover:bg-blue-100 dark:bg-zinc-700 dark:hover:bg-blue-950 text-slate-600 dark:text-blue-300 rounded-md transition-all cursor-pointer flex items-center gap-1 text-[11px]"
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

          <div className="bg-slate-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Duración estimada:</span>
              <span className="font-semibold text-slate-700 dark:text-zinc-300">{duracionTotal} minutos</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-zinc-100">
              <span>Total a cobrar:</span>
              <span className="text-emerald-600 dark:text-emerald-400">${precioTotal.toLocaleString('es-AR')}</span>
            </div>
            {detalleTexto && (
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate pt-0.5">
                Detalle: {detalleTexto}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
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
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {guardando ? 'Guardando...' : turnoAEditar ? 'Guardar Cambios' : 'Crear Turno'}
            </button>
          </div>
        </form>
      </div>

      {/* MODAL SWAP INTERNO (Reutiliza ModalSwapZona con filtro de género activo de calculos.ts) */}
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