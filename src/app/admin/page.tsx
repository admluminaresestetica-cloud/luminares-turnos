// src/app/admin/page.tsx
'use client'

import { useState } from 'react'

import AdminHeader from '@/components/admin/AdminHeader'
import AdminTabs from '@/components/admin/AdminTabs'
import OverviewTab from '@/components/admin/tabs/OverviewTab'
import AgendaTab from '@/components/admin/tabs/AgendaTab'
import PreciosTab from '@/components/admin/tabs/PreciosTab'
import GeneralesTab from '@/components/admin/tabs/GeneralesTab'
import HorariosTab from '@/components/admin/tabs/HorariosTab'
import BannerTab from '@/components/admin/tabs/BannerTab'
import FaqTab from '@/components/admin/tabs/FaqTab'
import ReferidosTab from '@/components/admin/tabs/ReferidosTab'

import ModalServicioLaser from '@/components/admin/modals/ModalServicioLaser'
import ModalPromo from '@/components/admin/modals/ModalPromo'
import ModalServicioGeneral from '@/components/admin/modals/ModalServicioGeneral'
import ModalCobro from '@/components/admin/modals/ModalCobro'
import ModalNuevoTurno from '@/components/admin/modals/ModalNuevoTurno'
import ModalEditarTurno from '@/components/admin/modals/ModalEditarTurno'

import { TabKey } from '@/components/admin/types'

import { useAgenda } from '@/hooks/admin/useAgenda'
import { useNuevoTurno } from '@/hooks/admin/useNuevoTurno'
import { usePreciosLaser } from '@/hooks/admin/usePreciosLaser'
import { useServiciosGenerales } from '@/hooks/admin/useServiciosGenerales'
import { useConfigCalendario } from '@/hooks/admin/useConfigCalendario'
import { useReferidosConfig } from '@/hooks/admin/useReferidosConfig'
import { useAdminLogout } from '@/hooks/admin/useAdminLogout'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  const { handleLogout } = useAdminLogout()

  const agenda = useAgenda()
  const precios = usePreciosLaser()
  const generales = useServiciosGenerales()
  const horarios = useConfigCalendario()
  const referidos = useReferidosConfig()

  const nuevoTurno = useNuevoTurno({
    servicios: precios.servicios,
    serviciosGenerales: generales.serviciosGenerales,
    serviciosLaserActivos: precios.serviciosLaserActivos,
    serviciosGeneralesActivos: generales.serviciosGeneralesActivos,
    setTurnos: agenda.setTurnos
  })

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <AdminHeader onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
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
          />
        )}

        {activeTab === 'precios' && (
          <PreciosTab
            loadingPrecios={precios.loadingPrecios}
            servicios={precios.servicios}
            promos={precios.promos}
            seccionPrecios={precios.seccionPrecios}
            setSeccionPrecios={precios.setSeccionPrecios}
            onNuevaZona={() => precios.abrirModalServicio()}
            onEditarZona={(s) => precios.abrirModalServicio(s)}
            onToggleActivoZona={precios.toggleActivoServicio}
            onEliminarZona={precios.eliminarServicio}
            onNuevaPromo={() => precios.abrirModalPromo()}
            onEditarPromo={(p) => precios.abrirModalPromo(p)}
            onToggleActivoPromo={precios.toggleActivoPromo}
            onEliminarPromo={precios.eliminarPromo}
          />
        )}

        {activeTab === 'generales' && (
          <GeneralesTab
            loadingGenerales={generales.loadingGenerales}
            serviciosGenerales={generales.serviciosGenerales}
            onNuevoServicio={() => generales.abrirModalGeneral()}
            onEditarServicio={(s) => generales.abrirModalGeneral(s)}
            onToggleActivo={generales.toggleActivoGeneral}
            onEliminarServicio={generales.eliminarServicioGeneral}
            referidosActivo={referidos.referidosActivo}
            setReferidosActivo={referidos.setReferidosActivo}
            referidosTipoDescuento={referidos.referidosTipoDescuento}
            setReferidosTipoDescuento={referidos.setReferidosTipoDescuento}
            referidosValorDescuento={referidos.referidosValorDescuento}
            setReferidosValorDescuento={referidos.setReferidosValorDescuento}
          />
        )}

        {activeTab === 'horarios' && (
          <HorariosTab
            loadingHorarios={horarios.loadingHorarios}
            configLaser={horarios.configLaser}
            guardandoLaser={horarios.guardandoLaser}
            nuevaFechaLaser={horarios.nuevaFechaLaser}
            setNuevaFechaLaser={horarios.setNuevaFechaLaser}
            onActualizarRangoLaser={horarios.actualizarRangoLaser}
            onAgregarFechaLaser={horarios.agregarFechaLaser}
            onQuitarFechaLaser={horarios.quitarFechaLaser}
            onGuardarConfigLaser={horarios.guardarConfigLaser}
            configGeneral={horarios.configGeneral}
            guardandoGeneral={horarios.guardandoGeneral}
            nuevaExcepcionGeneral={horarios.nuevaExcepcionGeneral}
            setNuevaExcepcionGeneral={horarios.setNuevaExcepcionGeneral}
            onToggleDiaGeneral={horarios.toggleDiaGeneral}
            onActualizarHorarioGeneral={horarios.actualizarHorarioGeneral}
            onAgregarExcepcionGeneral={horarios.agregarExcepcionGeneral}
            onQuitarExcepcionGeneral={horarios.quitarExcepcionGeneral}
            onGuardarConfigGeneral={horarios.guardarConfigGeneral}
          />
        )}

        {activeTab === 'banner' && <BannerTab />}
        {activeTab === 'referidos' && <ReferidosTab />}
        {activeTab === 'faq' && <FaqTab />}
      </div>

      {/* MODALES */}
      {precios.modalServicio && precios.servicioEdit && (
        <ModalServicioLaser
          servicioEdit={precios.servicioEdit}
          setServicioEdit={precios.setServicioEdit}
          onSubmit={precios.guardarServicio}
          onClose={precios.cerrarModalServicio}
        />
      )}

      {precios.modalPromo && precios.promoEdit && (
        <ModalPromo
          promoEdit={precios.promoEdit}
          setPromoEdit={precios.setPromoEdit}
          servicios={precios.servicios}
          onToggleZona={precios.toggleZonaEnPromo}
          onSubmit={precios.guardarPromo}
          onClose={precios.cerrarModalPromo}
        />
      )}

      {generales.modalGeneral && generales.servicioGeneralEdit && (
        <ModalServicioGeneral
          servicioGeneralEdit={generales.servicioGeneralEdit}
          setServicioGeneralEdit={generales.setServicioGeneralEdit}
          onSubmit={generales.guardarServicioGeneral}
          onClose={generales.cerrarModalGeneral}
        />
      )}

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
