'use client'

import { useState } from 'react'
import Link from 'next/link'

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
      
      {/* Header Unificado con el Panel de Control, Refrescar y Nuevo Turno */}
      <AdminHeader 
        onLogout={handleLogout} 
        onRefrescar={() => agenda.fetchTurnos && agenda.fetchTurnos()}
        onNuevoTurno={nuevoTurno.abrirModalNuevoTurno}
        cargandoRefresco={agenda.loading}
      />

      {/* pb-24 + safe-area en mobile: evita que la Bottom Navigation Bar tape el contenido */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-12">
        
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