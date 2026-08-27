'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useReservas } from '@/hooks/admin/useReservas'
import { useAdminLogout } from '@/hooks/admin/useAdminLogout'

import AdminHeader from '@/components/admin/AdminHeader'
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
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <AdminHeader onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {/* Volver al Hub */}
        <button
          onClick={() => router.push('/admin')}
          className="mb-4 text-sm text-gray-500 hover:text-gray-800 transition"
        >
          ← Volver al inicio
        </button>

        {/* Barra de pestañas local (Reservas) */}
        <div className="flex gap-2 border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveTab('agenda')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === 'agenda'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Agenda ({r.turnos.length})
          </button>
        </div>

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
