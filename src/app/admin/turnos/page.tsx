'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 font-sans text-gray-900 dark:text-zinc-100 transition-colors">
      <AdminHeader onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">
              Panel de Control
            </h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Gestión integral de turnos y agenda
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin"
              className="flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-xs hover:shadow flex items-center justify-center gap-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <ArrowLeft className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
              <span>Menú Admin</span>
            </Link>
          </div>
        </div>

        <AdminTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          totalTurnos={agenda.turnos.length}
          totalGenerales={generales.serviciosGenerales.length}
        />

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