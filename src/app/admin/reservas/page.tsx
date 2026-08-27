'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useReservas } from '@/hooks/admin/useReservas'
import { useAdminLogout } from '@/hooks/admin/useAdminLogout'

import AdminHeader from '@/components/admin/AdminHeader'
import SegmentedTabs from '@/components/admin/SegmentedTabs'
import { ArrowLeftIcon } from '@/components/admin/icons'
import OverviewTab from '@/components/admin/tabs/OverviewTab'
import AgendaTab from '@/components/admin/tabs/AgendaTab'
import ModalCobro from '@/components/admin/modals/ModalCobro'
import ModalNuevoTurno from '@/components/admin/modals/ModalNuevoTurno'
import ModalEditarTurno from '@/components/admin/modals/ModalEditarTurno'

type ReservasTab = 'overview' | 'agenda'

export default function ReservasPage() {
  const router = useRouter()
  const handleLogout = useAdminLogout()
  const [activeTab, setActiveTab] = useState<ReservasTab>('overview')

  const r = useReservas()

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <AdminHeader onLogout={handleLogout} />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* Volver + título de sección */}
        <div className="mb-6 flex flex-col gap-4">
          <button
            onClick={() => router.push('/admin')}
            className="flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Inicio
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Agenda y Turnos</h1>
              <p className="mt-0.5 text-sm text-slate-500">Gestioná reservas, estados y cobros</p>
            </div>

            <SegmentedTabs<ReservasTab>
              accent="teal"
              active={activeTab}
              onChange={setActiveTab}
              tabs={[
                { key: 'overview', label: 'Resumen' },
                { key: 'agenda', label: 'Agenda', count: r.turnos.length }
              ]}
            />
          </div>
        </div>

        {/* Contenido */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
          {activeTab === 'overview' && (
            <OverviewTab
              totalReservas={r.totalReservas}
              ingresosCobrados={r.ingresosCobrados}
              ingresosPendientes={r.ingresosPendientes}
            />
          )}

          {activeTab === 'agenda' && (
            <AgendaTab
              loading={r.loading}
              turnosFiltrados={r.turnosFiltrados}
              turnosAgendaResumen={r.turnosAgendaResumen}
              esFechaAgendaPasada={r.esFechaAgendaPasada}
              busqueda={r.busqueda}
              setBusqueda={r.setBusqueda}
              filtroFechaTipo={r.filtroFechaTipo}
              setFiltroFechaTipo={r.setFiltroFechaTipo}
              fechaEspecifica={r.fechaEspecifica}
              setFechaEspecifica={r.setFechaEspecifica}
              filtroEstado={r.filtroEstado}
              setFiltroEstado={r.setFiltroEstado}
              onNuevoTurno={r.abrirModalNuevoTurno}
              onEditarTurno={r.abrirModalEditarTurno}
              onActualizarEstado={r.actualizarEstado}
            />
          )}
        </div>
      </div>

      {/* MODALES */}
      {r.turnoACobrar && (
        <ModalCobro
          turnoACobrar={r.turnoACobrar}
          medioPagoSeleccionado={r.medioPagoSeleccionado}
          setMedioPagoSeleccionado={r.setMedioPagoSeleccionado}
          guardandoCobro={r.guardandoCobro}
          onConfirm={r.confirmarCobro}
          onClose={() => r.setTurnoACobrar(null)}
        />
      )}

      {r.modalNuevoTurno && (
        <ModalNuevoTurno
          nuevoTurno={r.nuevoTurno}
          setNuevoTurno={r.setNuevoTurno}
          tipoTurnoNuevo={r.tipoTurnoNuevo}
          setTipoTurnoNuevo={r.setTipoTurnoNuevo}
          filtroGeneroLaserNuevo={r.filtroGeneroLaserNuevo}
          setFiltroGeneroLaserNuevo={r.setFiltroGeneroLaserNuevo}
          zonasSeleccionadasNuevo={r.zonasSeleccionadasNuevo}
          toggleZonaSeleccionadaNuevo={r.toggleZonaSeleccionadaNuevo}
          zonasLaserFiltradas={r.zonasLaserFiltradas}
          servicioGeneralSeleccionadoNuevo={r.servicioGeneralSeleccionadoNuevo}
          setServicioGeneralSeleccionadoNuevo={r.setServicioGeneralSeleccionadoNuevo}
          serviciosGeneralesActivos={r.serviciosGeneralesActivos}
          guardandoNuevoTurno={r.guardandoNuevoTurno}
          onSubmit={r.crearTurnoManual}
          onClose={() => r.setModalNuevoTurno(false)}
        />
      )}

      {r.modalEditarTurno && r.turnoEdit && (
        <ModalEditarTurno
          turnoEdit={r.turnoEdit}
          setTurnoEdit={r.setTurnoEdit}
          guardandoEdicionTurno={r.guardandoEdicionTurno}
          onSubmit={r.guardarEdicionTurno}
          onClose={() => {
            r.setModalEditarTurno(false)
            r.setTurnoEdit(null)
          }}
        />
      )}
    </div>
  )
}
