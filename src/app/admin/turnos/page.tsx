'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Calendar, Sparkles } from 'lucide-react'

import AdminHeader from '@/app/admin/turnos/AdminHeader'
import AdminTabs from './components/AdminTabs'
import OverviewTab from './components/tabs/OverviewTab'
import AgendaTab from './components/tabs/AgendaTab'

import ModalCobro from './components/modals/ModalCobro'
import ModalNuevoTurno from './components/modals/ModalNuevoTurno'
import ModalEditarTurno from './components/modals/ModalEditarTurno'

import { TabKey } from '@/app/admin/turnos/components/types'

import { useAgenda } from '@/hooks/admin/useAgenda'
import { useNuevoTurno } from '@/hooks/admin/useNuevoTurno'
import { usePreciosLaser } from '@/hooks/admin/usePreciosLaser'
import { useServiciosGenerales } from '@/hooks/admin/useServiciosGenerales'
import { useAdminLogout } from '@/hooks/admin/useAdminLogout'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  const { handleLogout } = useAdminLogout()

  const agenda = useAgenda()
  const precios = usePreciosLaser()
  const generales = useServiciosGenerales()

  const nuevoTurno = useNuevoTurno({
    servicios: precios.servicios,
    promos: precios.promos, 
    serviciosGenerales: generales.serviciosGenerales,
    serviciosLaserActivos: precios.serviciosLaserActivos,
    promosLaserActivas: precios.promosLaserActivas, 
    serviciosGeneralesActivos: generales.serviciosGeneralesActivos,
    setTurnos: agenda.setTurnos
  })

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-zinc-950 font-sans text-gray-900 dark:text-zinc-100 transition-colors">
      <AdminHeader onLogout={handleLogout} />

      {/* pb-24 + safe-area en mobile: evita que la Bottom Navigation Bar tape el contenido */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-12">
        
        {/* Cabecera Principal Modernizada */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs transition-all">
          <div className="flex items-center gap-3 min-w-0">
            {/* Botón Volver */}
            <Link
              href="/admin"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all active:scale-95 shrink-0"
              title="Volver al panel general"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                  Panel de Control
                </h1>
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold dark:bg-emerald-950/60 dark:border-emerald-900/80 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  En Vivo
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Gestión integral de turnos, agenda y cobros
              </p>
            </div>
          </div>

          {/* Botón de Acción Rápida en Cabecera */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={nuevoTurno.abrirModalNuevoTurno}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs rounded-xl sm:rounded-2xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Turno</span>
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS */}
        <AdminTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          totalTurnos={agenda.turnos.length}
          totalGenerales={generales.serviciosGenerales.length}
        />

        {/* CONTENIDO DE PESTAÑAS */}
        <div className="mt-4">
          {activeTab === 'overview' && (
            <OverviewTab
              totalReservas={agenda.totalReservas}
              ingresosCobrados={agenda.ingresosCobrados}
              ingresosPendientes={agenda.ingresosPendientes}
            />
          )}

          {activeTab === 'agenda' && (
            <AgendaTab
              loading={agenda.loading}
              turnosFiltrados={agenda.turnosFiltrados}
              turnosAgendaResumen={agenda.turnosAgendaResumen}
              esFechaAgendaPasada={agenda.esFechaAgendaPasada}
              busqueda={agenda.busqueda}
              setBusqueda={agenda.setBusqueda}
              filtroFechaTipo={agenda.filtroFechaTipo}
              setFiltroFechaTipo={agenda.setFiltroFechaTipo}
              fechaEspecifica={agenda.fechaEspecifica}
              setFechaEspecifica={agenda.setFechaEspecifica}
              filtroEstado={agenda.filtroEstado}
              setFiltroEstado={agenda.setFiltroEstado}
              onNuevoTurno={nuevoTurno.abrirModalNuevoTurno}
              onEditarTurno={agenda.abrirModalEditarTurno}
              onActualizarEstado={agenda.actualizarEstado}
              onEliminarTurno={(id) => agenda.eliminarTurno(id)}
            />
          )}
        </div>
      </div>

      {/* MODALES OPERATIVOS DE AGENDA */}
      {agenda.turnoACobrar && (
        <ModalCobro
          turnoACobrar={agenda.turnoACobrar}
          medioPagoSeleccionado={agenda.medioPagoSeleccionado}
          setMedioPagoSeleccionado={agenda.setMedioPagoSeleccionado}
          guardandoCobro={agenda.guardandoCobro}
          onConfirm={agenda.confirmarCobro}
          onClose={agenda.cerrarModalCobro}
        />
      )}

      {nuevoTurno.modalNuevoTurno && (
        <ModalNuevoTurno
          nuevoTurno={nuevoTurno.nuevoTurno}
          setNuevoTurno={nuevoTurno.setNuevoTurno}
          tipoTurnoNuevo={nuevoTurno.tipoTurnoNuevo}
          setTipoTurnoNuevo={nuevoTurno.setTipoTurnoNuevo}
          filtroGeneroLaserNuevo={nuevoTurno.filtroGeneroLaserNuevo}
          setFiltroGeneroLaserNuevo={nuevoTurno.setFiltroGeneroLaserNuevo}
          zonasSeleccionadasNuevo={nuevoTurno.zonasSeleccionadasNuevo}
          toggleZonaSeleccionadaNuevo={nuevoTurno.toggleZonaSeleccionadaNuevo}
          zonasLaserFiltradas={nuevoTurno.zonasLaserFiltradas}
          promoSeleccionadaNuevo={nuevoTurno.promoSeleccionadaNuevo}
          setPromoSeleccionadaNuevo={nuevoTurno.setPromoSeleccionadaNuevo}
          promosLaserFiltradas={nuevoTurno.promosLaserFiltradas}
          servicioGeneralSeleccionadoNuevo={nuevoTurno.servicioGeneralSeleccionadoNuevo}
          setServicioGeneralSeleccionadoNuevo={nuevoTurno.setServicioGeneralSeleccionadoNuevo}
          serviciosGeneralesActivos={generales.serviciosGeneralesActivos}
          guardandoNuevoTurno={nuevoTurno.guardandoNuevoTurno}
          onSubmit={nuevoTurno.crearTurnoManual}
          onClose={nuevoTurno.cerrarModalNuevoTurno}
        />
      )}

      {agenda.modalEditarTurno && agenda.turnoEdit && (
        <ModalEditarTurno
          turnoEdit={agenda.turnoEdit}
          setTurnoEdit={agenda.setTurnoEdit}
          guardandoEdicionTurno={agenda.guardandoEdicionTurno}
          onSubmit={agenda.guardarEdicionTurno}
          onClose={agenda.cerrarModalEditarTurno}
        />
      )}
    </div>
  )
}