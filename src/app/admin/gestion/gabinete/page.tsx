'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Reserva } from '@/app/admin/turnos/components/types'
import NotificacionesGabinete from './components/NotificacionesGabinete'
import { 
  RefreshCw, 
  Zap, 
  CheckCircle2, 
  Clock, 
  FolderClock, 
  Clipboard,
  ArrowLeft
} from 'lucide-react'
import ModalHistorialCliente from '../recepcion/components/ModalHistorialCliente'
import ModalCierreGabinete from './components/ModalCierreGabinete'
import RelojCronometroGabinete from './components/RelojCronometroGabinete'

export default function GabinetePage() {
  const [turnos, setTurnos] = useState<Reserva[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  // Modales
  const [modalCierreOpen, setModalCierreOpen] = useState<boolean>(false)
  const [turnoAAtender, setTurnoAAtender] = useState<Reserva | null>(null)

  // Modal Historial
  const [modalHistorialOpen, setModalHistorialOpen] = useState<boolean>(false)
  const [clienteHistorial, setClienteHistorial] = useState<{ celular: string; nombre: string }>({ celular: '', nombre: '' })
  const [duracionSegundos, setDuracionSegundos] = useState<number>(0)

  const fetchTurnosGabinete = async () => {
    setLoading(true)
    try {
      const inicioDia = `${fechaSeleccionada}T00:00:00.000Z`
      const finDia = `${fechaSeleccionada}T23:59:59.999Z`

      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .gte('fecha_hora_inicio', inicioDia)
        .lte('fecha_hora_inicio', finDia)
        .in('estado', ['en_gabinete', 'en_espera', 'completado'])
        .order('fecha_hora_inicio', { ascending: true })

      if (error) throw error
      setTurnos((data as Reserva[]) || [])
    } catch (err: any) {
      console.error('Error al cargar turnos de gabinete:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTurnosGabinete()
  }, [fechaSeleccionada])

  const abrirModalCierre = (turno: Reserva) => {
    setTurnoAAtender(turno)
    setModalCierreOpen(true)
  }

  const abrirHistorial = (celular: string, nombre: string) => {
    if (!celular) {
      alert('Este paciente no tiene registrado un número de celular.')
      return
    }
    setClienteHistorial({ celular, nombre })
    setModalHistorialOpen(true)
  }

  const obtenerDetalleTexto = (t: Reserva) => {
    if (!t.detalle_reserva) return t.servicio_tipo || 'Servicio Láser'
    let det = t.detalle_reserva
    if (typeof det === 'string') {
      try { det = JSON.parse(det) } catch (e) { return det }
    }
    return det.detalle_texto || det.nombre || t.servicio_tipo || 'Turno Láser'
  }

  const obtenerNotaRecepcion = (t: Reserva) => {
    if (!t.detalle_reserva) return ''
    let det = t.detalle_reserva
    if (typeof det === 'string') {
      try { det = JSON.parse(det) } catch (e) { return '' }
    }
    return det.nota_recepcion || ''
  }

  const enGabinete = useMemo(() => turnos.filter((t) => t.estado === 'en_gabinete'), [turnos])
  const enEspera = useMemo(() => turnos.filter((t) => t.estado === 'en_espera' || t.estado === 'pendiente_sena' || t.estado === 'pendiente'), [turnos])
  const completados = useMemo(() => turnos.filter((t) => t.estado === 'completado'), [turnos])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-zinc-100 font-sans">

      <NotificacionesGabinete gabineteId="1" />


      <NotificacionesGabinete gabineteId="1" />

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER PRINCIPAL */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 rounded-2xl border border-purple-200/60 dark:border-purple-800/40">
              <Clipboard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Gabinete - Control de Tratamientos
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                Registro técnico de disparos, potencias e historial clínico
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm rounded-xl px-3.5 py-2 font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 transition-all"
            />
            <button
              type="button"
              onClick={fetchTurnosGabinete}
              disabled={loading}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl border border-slate-200 dark:border-zinc-700 transition-all active:scale-95 cursor-pointer"
              title="Refrescar datos"
            >
              <RefreshCw className={`h-4 w-4 text-slate-600 dark:text-zinc-300 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="w-full lg:w-auto">
            <RelojCronometroGabinete 
              onTiempoActualizado={(seg) => setDuracionSegundos(seg)} 
            />
          </div>
        </div>

        {/* SECCIÓN 1: PACIENTES EN GABINETE */}
        <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span>En Atención Ahora ({enGabinete.length})</span>
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
              Listo para registrar
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Cargando gabinete...</div>
          ) : enGabinete.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No hay pacientes ingresados en gabinete en este momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {enGabinete.map((t) => {
                const horaStr = t.fecha_hora_inicio
                  ? new Date(t.fecha_hora_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'
                const detalleTexto = obtenerDetalleTexto(t)
                const notaRecep = obtenerNotaRecepcion(t)

                return (
                  <div
                    key={t.id}
                    className="p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs sm:text-sm bg-purple-600 text-white dark:bg-purple-500 px-3 py-1 rounded-xl shadow-2xs">
                          {horaStr} hs
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => abrirHistorial(t.cliente_celular || '', t.cliente_nombre || 'Cliente')}
                          className="p-2 bg-slate-100 hover:bg-purple-50 dark:bg-zinc-800 dark:hover:bg-purple-950/50 text-slate-600 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200/60 dark:border-zinc-700/60"
                          title="Ver Historial Clínico Completo"
                        >
                          <FolderClock className="h-4 w-4" />
                          <span className="hidden sm:inline">Historial</span>
                        </button>
                      </div>

                      <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200/60 dark:border-zinc-800 space-y-1">
                        <p className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                          {t.cliente_nombre || 'Cliente sin nombre'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          📱 {t.cliente_celular || 'Sin celular'}
                        </p>
                        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center text-xs">
                          <span className="text-slate-500 dark:text-zinc-400 font-medium">Zonas a tratar:</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">{detalleTexto}</span>
                        </div>
                      </div>

                      {notaRecep && (
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-300">
                          <strong className="block font-semibold">Nota de Recepción:</strong> 
                          <span>{notaRecep}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => abrirModalCierre(t)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Cargar Grilla de Potencias y Finalizar</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* SECCIÓN 2: SALA DE ESPERA */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span>En Sala de Espera ({enEspera.length})</span>
          </h2>

          {enEspera.length === 0 ? (
            <p className="text-xs text-slate-400">No hay pacientes esperando en sala.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {enEspera.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-bold text-xs text-slate-800 dark:text-zinc-200">{t.cliente_nombre}</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">{obtenerDetalleTexto(t)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => abrirModalCierre(t)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[11px] rounded-lg transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95"
                  >
                    Atender
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECCIÓN 3: ATENDIDOS HOY */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Sesiones Finalizadas Hoy ({completados.length})</span>
          </h2>

          {completados.length === 0 ? (
            <p className="text-xs text-slate-400">Aún no se han finalizado sesiones hoy.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {completados.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-800 dark:text-zinc-200">{t.cliente_nombre}</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">{obtenerDetalleTexto(t)}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 px-2.5 py-1 rounded-md shrink-0 border border-emerald-200/60 dark:border-emerald-800/40">
                    Atendido ✔
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* MODAL DE CIERRE AVANZADO */}
      <ModalCierreGabinete
        isOpen={modalCierreOpen}
        onClose={() => setModalCierreOpen(false)}
        onSuccess={fetchTurnosGabinete}
        turno={turnoAAtender}
        duracionSegundos={duracionSegundos}
      />

      {/* MODAL HISTORIAL COMPLETO */}
      <ModalHistorialCliente
        isOpen={modalHistorialOpen}
        onClose={() => setModalHistorialOpen(false)}
        celular={clienteHistorial.celular}
        nombreCliente={clienteHistorial.nombre}
      />

    </div>
  )
}