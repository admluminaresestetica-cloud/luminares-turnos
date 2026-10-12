'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Reserva } from '@/app/admin/turnos/components/types'
import { Search, RefreshCw, UserPlus } from 'lucide-react'
import ModalNuevoTurnoRecepcion from './components/ModalNuevoTurnoRecepcion'

export default function RecepcionPage() {
  const [turnos, setTurnos] = useState<Reserva[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [busqueda, setBusqueda] = useState<string>('')
  const [modalNuevoOpen, setModalNuevoOpen] = useState<boolean>(false)

  // Cargar turnos desde Supabase para la fecha seleccionada
  const fetchTurnos = async () => {
    setLoading(true)
    try {
      const inicioDia = `${fechaSeleccionada}T00:00:00.000Z`
      const finDia = `${fechaSeleccionada}T23:59:59.999Z`

      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .gte('fecha_hora_inicio', inicioDia)
        .lte('fecha_hora_inicio', finDia)
        .order('fecha_hora_inicio', { ascending: true })

      if (error) throw error
      setTurnos((data as Reserva[]) || [])
    } catch (err: any) {
      console.error('Error al cargar turnos en Recepción:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTurnos()
  }, [fechaSeleccionada])

  // Actualizar estado del turno (Confirmado -> En Espera -> En Gabinete)
  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from('reservas')
        .update({ estado: nuevoEstado, modificado_por_admin: true })
        .eq('id', id)

      if (error) throw error

      setTurnos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, estado: nuevoEstado } : t))
      )
    } catch (err: any) {
      alert('Error al actualizar el estado: ' + err.message)
    }
  }

  // Filtrado local por búsqueda de texto
  const turnosFiltrados = useMemo(() => {
    return turnos.filter((t) => {
      if (!busqueda.trim()) return true
      const q = busqueda.toLowerCase()
      const nombre = (t.cliente_nombre || '').toLowerCase()
      const celular = (t.cliente_celular || '').toLowerCase()
      const codigo = (t.codigo_unico || '').toLowerCase()
      return nombre.includes(q) || celular.includes(q) || codigo.includes(q)
    })
  }, [turnos, busqueda])

  // KPIs de resumen
  const kpis = useMemo(() => {
    return {
      total: turnos.length,
      enEspera: turnos.filter((t) => t.estado === 'en_espera').length,
      enGabinete: turnos.filter((t) => t.estado === 'en_gabinete').length,
      completados: turnos.filter((t) => t.estado === 'completado').length,
    }
  }, [turnos])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-4 sm:p-6 text-slate-900 dark:text-zinc-100 font-sans">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Recepción - Control Diario</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Gestión de ingresos, sala de espera y pases a gabinete
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <input
            type="date"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <button
            onClick={fetchTurnos}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-all active:scale-95"
            title="Refrescar datos"
          >
            <RefreshCw className={`h-4 w-4 text-slate-600 dark:text-zinc-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {/* BOTÓN NUEVO TURNO MOSTRADOR */}
          <button
            onClick={() => setModalNuevoOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold rounded-xl transition-all active:scale-95 shadow-xs"
          >
            <UserPlus className="h-4 w-4" />
            <span>Nuevo Turno</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* CARDS KPIS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Total Turnos</p>
            <p className="text-2xl font-bold mt-1">{kpis.total}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-xs">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">En Sala de Espera</p>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-300 mt-1">{kpis.enEspera}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-xs">
            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">En Gabinete</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">{kpis.enGabinete}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-xs">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Atendidos</p>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mt-1">{kpis.completados}</p>
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex items-center gap-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, teléfono o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm focus:outline-none"
          />
        </div>

        {/* LISTA DE TURNOS DE RECEPCIÓN */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden p-4 sm:p-6">
          <h2 className="text-base font-bold mb-4">Agenda del Día</h2>

          {loading ? (
            <div className="text-center py-10 text-xs text-slate-500">Cargando turnos...</div>
          ) : turnosFiltrados.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">No hay turnos registrados para esta fecha.</div>
          ) : (
            <div className="space-y-3">
              {turnosFiltrados.map((t) => {
                const horaStr = t.fecha_hora_inicio
                  ? new Date(t.fecha_hora_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'

                return (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-zinc-100">{horaStr} hs</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 uppercase">
                          {t.estado || 'pendiente'}
                        </span>
                      </div>
                      <p className="font-semibold text-sm">{t.cliente_nombre || 'Cliente sin nombre'}</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">📱 {t.cliente_celular || 'Sin celular'}</p>
                    </div>

                    {/* BOTONES DE ACCIÓN RÁPIDA DE RECEPCIÓN */}
                    <div className="flex items-center gap-2">
                      {t.estado !== 'en_espera' && t.estado !== 'en_gabinete' && t.estado !== 'completado' && (
                        <button
                          onClick={() => cambiarEstado(t.id, 'en_espera')}
                          className="text-xs font-semibold px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all active:scale-95 shadow-xs"
                        >
                          Marcar Llegada (Espera)
                        </button>
                      )}

                      {t.estado === 'en_espera' && (
                        <button
                          onClick={() => cambiarEstado(t.id, 'en_gabinete')}
                          className="text-xs font-semibold px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all active:scale-95 shadow-xs"
                        >
                          Pasar a Gabinete
                        </button>
                      )}

                      {t.estado === 'en_gabinete' && (
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
                          En Atención Técnica
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL NUEVO TURNO */}
      <ModalNuevoTurnoRecepcion
        isOpen={modalNuevoOpen}
        onClose={() => setModalNuevoOpen(false)}
        onSuccess={fetchTurnos}
      />
    </div>
  )
}