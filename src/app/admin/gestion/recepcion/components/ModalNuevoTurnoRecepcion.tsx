'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ServicioLaser, PromoLaser, datetimeLocalToIso } from '@/app/admin/turnos/components/types'
import { X, Clock, DollarSign, User, Phone, Calendar, Sparkles, Layers } from 'lucide-react'

interface ModalNuevoTurnoRecepcionProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ModalNuevoTurnoRecepcion({
  isOpen,
  onClose,
  onSuccess
}: ModalNuevoTurnoRecepcionProps) {
  const [nombre, setNombre] = useState('')
  const [celular, setCelular] = useState('')
  const [fechaHoraLocal, setFechaHoraLocal] = useState('')
  
  // Modos y catálogos
  const [tipoSeleccion, setTipoSeleccion] = useState<'zonas' | 'promo'>('zonas')
  const [serviciosLaser, setServiciosLaser] = useState<ServicioLaser[]>([])
  const [promosLaser, setPromosLaser] = useState<PromoLaser[]>([])
  
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>([])
  const [promoSeleccionadaId, setPromoSeleccionadaId] = useState<string>('')
  
  const [filtroGenero, setFiltroGenero] = useState<string>('todos')
  const [loadingCatalogos, setLoadingCatalogos] = useState(true)
  const [guardando, setGuardando] = useState(false)

  // Cargar servicios láser y promos activas al abrir el modal
  useEffect(() => {
    if (!isOpen) return

    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    setFechaHoraLocal(now.toISOString().slice(0, 16))

    const fetchData = async () => {
      setLoadingCatalogos(true)
      
      const [resServicios, resPromos] = await Promise.all([
        supabase.from('servicios_laser').select('*').eq('activo', true),
        supabase.from('promos_laser').select('*').eq('activo', true)
      ])

      if (!resServicios.error && resServicios.data) {
        setServiciosLaser(resServicios.data as ServicioLaser[])
      }
      if (!resPromos.error && resPromos.data) {
        setPromosLaser(resPromos.data as PromoLaser[])
      }
      
      setLoadingCatalogos(false)
    }

    fetchData()
  }, [isOpen])

  if (!isOpen) return null

  // Filtrado por género
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

  // Cálculos dinámicos según el tipo de selección
  let precioTotal = 0
  let duracionTotal = 30
  let detalleTexto = ''

  if (tipoSeleccion === 'zonas') {
    const zonasElegidasObj = serviciosLaser.filter((s) => zonasSeleccionadas.includes(s.id))
    precioTotal = zonasElegidasObj.reduce((acc, z) => acc + (Number(z.precio_lista) || 0), 0)
    duracionTotal = zonasElegidasObj.reduce((acc, z) => acc + (Number(z.duracion_minutos) || 0), 0) || 30
    detalleTexto = zonasElegidasObj.map((z) => z.nombre_zona).filter(Boolean).join(' + ')
  } else {
    const promoElegida = promosLaser.find((p) => p.id === promoSeleccionadaId)
    if (promoElegida) {
      precioTotal = Number(promoElegida.precio_promo) || 0
      duracionTotal = Number(promoElegida.duracion_total_min) || 30
      detalleTexto = `Promo: ${promoElegida.nombre_promo}`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim() || !fechaHoraLocal) {
      alert('Por favor completá al menos el nombre del cliente y la fecha/hora.')
      return
    }

    if (tipoSeleccion === 'zonas' && zonasSeleccionadas.length === 0) {
      alert('Seleccioná al menos una zona láser.')
      return
    }

    if (tipoSeleccion === 'promo' && !promoSeleccionadaId) {
      alert('Seleccioná una promoción.')
      return
    }

    setGuardando(true)

    const codigoGenerado = `RECEPCION-${Date.now().toString(36).toUpperCase()}`

    const payload = {
      codigo_unico: codigoGenerado,
      cliente_nombre: nombre,
      cliente_celular: celular,
      fecha_hora_inicio: datetimeLocalToIso(fechaHoraLocal),
      servicio_tipo: 'laser',
      duracion_total: duracionTotal,
      detalle_reserva: { detalle_texto: detalleTexto },
      precio_total: Number(precioTotal),
      estado: 'pendiente_sena',
      metodo_pago: 'efectivo',
      modificado_por_admin: true
    }

    const { data, error } = await supabase
      .from('reservas')
      .insert([payload])
      .select()
      .single()

    if (error) {
      alert('Error al crear el turno: ' + error.message)
    } else {
      alert('Turno registrado con éxito.')
      setNombre('')
      setCelular('')
      setZonasSeleccionadas([])
      setPromoSeleccionadaId('')
      onSuccess()
      onClose()
    }

    setGuardando(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden my-8">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Nuevo Turno - Mostrador</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* DATOS CLIENTE */}
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

          {/* FECHA Y HORA */}
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

          {/* SELECTOR DE TIPO (ZONAS vs PROMOS) */}
          <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setTipoSeleccion('zonas'); setPromoSeleccionadaId(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
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
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tipoSeleccion === 'promo'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Promos y Combos</span>
            </button>
          </div>

          {/* FILTRO DE GÉNERO */}
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
                  className={`px-2 py-0.5 rounded-md capitalize transition-all ${
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

          {/* LISTADO INTERACTIVO (ZONAS O PROMOS) */}
          <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-zinc-800 rounded-xl p-2 space-y-1">
            {loadingCatalogos ? (
              <p className="text-xs text-slate-400 p-2 text-center">Cargando opciones...</p>
            ) : tipoSeleccion === 'zonas' ? (
              serviciosFiltrados.length === 0 ? (
                <p className="text-xs text-slate-400 p-2 text-center">No hay zonas para este filtro.</p>
              ) : (
                serviciosFiltrados.map((s) => {
                  const checked = zonasSeleccionadas.includes(s.id)
                  // Distinción visual por género si el filtro está en 'todos'
                  const generoBadge = s.genero === 'femenino' 
                    ? 'bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300 border-pink-200' 
                    : s.genero === 'masculino'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200'
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200'

                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => toggleZona(s.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all border ${
                        checked
                          ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold border-transparent shadow-xs'
                          : 'bg-white dark:bg-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-100 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{s.nombre_zona}</span>
                        {filtroGenero === 'todos' && s.genero && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border uppercase tracking-wider font-medium ${generoBadge}`}>
                            {s.genero.slice(0, 3)}
                          </span>
                        )}
                      </div>
                      <span className="font-bold">${Number(s.precio_lista).toLocaleString('es-AR')}</span>
                    </button>
                  )
                })
              )
            ) : (
              promosFiltradas.length === 0 ? (
                <p className="text-xs text-slate-400 p-2 text-center">No hay promos para este filtro.</p>
              ) : (
                promosFiltradas.map((p) => {
                  const selected = promoSeleccionadaId === p.id
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPromoSeleccionadaId(p.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all border text-left ${
                        selected
                          ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold border-transparent shadow-xs'
                          : 'bg-white dark:bg-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-100 dark:border-zinc-800'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{p.nombre_promo}</p>
                        <p className={`text-[11px] ${selected ? 'text-zinc-300 dark:text-zinc-600' : 'text-slate-400'}`}>
                          {p.duracion_total_min || 30} mins
                        </p>
                      </div>
                      <span className="font-bold text-sm">${Number(p.precio_promo).toLocaleString('es-AR')}</span>
                    </button>
                  )
                })
              )
            )}
          </div>

          {/* RESUMEN TOTALES */}
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

          {/* BOTONES ACCIÓN */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Crear Turno en Recepción'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
