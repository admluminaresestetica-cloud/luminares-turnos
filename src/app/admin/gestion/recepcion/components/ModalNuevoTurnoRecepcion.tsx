'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ServicioLaser, datetimeLocalToIso } from '@/app/admin/turnos/components/types'
import { X, Clock, DollarSign, User, Phone, Calendar, Plus } from 'lucide-react'

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
  
  const [serviciosLaser, setServiciosLaser] = useState<ServicioLaser[]>([])
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>([])
  const [filtroGenero, setFiltroGenero] = useState<string>('todos')
  const [loadingServicios, setLoadingServicios] = useState(true)
  const [guardando, setGuardando] = useState(false)

  // Cargar servicios láser activos
  useEffect(() => {
    if (!isOpen) return

    // Setea fecha/hora por defecto (ahora mismo)
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    setFechaHoraLocal(now.toISOString().slice(0, 16))

    const fetchServicios = async () => {
      setLoadingServicios(true)
      const { data, error } = await supabase
        .from('servicios_laser')
        .select('*')
        .eq('activo', true)

      if (!error && data) {
        setServiciosLaser(data as ServicioLaser[])
      }
      setLoadingServicios(false)
    }

    fetchServicios()
  }, [isOpen])

  if (!isOpen) return null

  // Filtrado por género
  const serviciosFiltrados = serviciosLaser.filter(
    (s) => filtroGenero === 'todos' || s.genero === filtroGenero
  )

  const toggleZona = (id: string) => {
    setZonasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id]
    )
  }

  // Cálculos dinámicos
  const zonasElegidasObj = serviciosLaser.filter((s) => zonasSeleccionadas.includes(s.id))
  const precioTotal = zonasElegidasObj.reduce((acc, z) => acc + (Number(z.precio_lista) || 0), 0)
  const duracionTotal = zonasElegidasObj.reduce((acc, z) => acc + (Number(z.duracion_minutos) || 0), 0) || 30
  const detalleTexto = zonasElegidasObj.map((z) => z.nombre_zona).filter(Boolean).join(' + ')

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim() || !fechaHoraLocal) {
      alert('Por favor completá al menos el nombre del cliente y la fecha/hora.')
      return
    }

    if (zonasSeleccionadas.length === 0) {
      alert('Seleccioná al menos una zona para el turno.')
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
      estado: 'pendiente_sena', // <--- Clave: coincide con la constraint de Supabase
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

          {/* SELECTOR DE ZONAS LÁSER */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
                Selección de Zonas Láser
              </label>
              {/* FILTRO GÉNERO */}
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

            <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-zinc-800 rounded-xl p-2 space-y-1">
              {loadingServicios ? (
                <p className="text-xs text-slate-400 p-2">Cargando zonas...</p>
              ) : serviciosFiltrados.map((s) => {
                const checked = zonasSeleccionadas.includes(s.id)
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleZona(s.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all ${
                      checked
                        ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <span>{s.nombre_zona}</span>
                    <span>${Number(s.precio_lista).toLocaleString('es-AR')}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* RESUMEN DIVERSIFICADO */}
          <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Duración estimada:</span>
              <span className="font-semibold text-slate-700 dark:text-zinc-300">{duracionTotal} minutos</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-zinc-100">
              <span>Total a cobrar:</span>
              <span>${precioTotal.toLocaleString('es-AR')}</span>
            </div>
            {detalleTexto && (
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
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