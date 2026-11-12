'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion'

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

const contenedorVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
}

const seccionVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const reducirMovimiento = useReducedMotion()

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
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 font-sans text-gray-900 dark:text-zinc-100 transition-colors">
      
      {/* 🟦 HERO CONTINUO SUPERIOR CON DEGRADADO AZUL FINTECH */}
      <div className="relative bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-600 dark:from-blue-950 dark:via-indigo-950 dark:to-zinc-900 pb-20 shadow-lg">
        {/* Orbes de luz decorativos */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-400/25 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-24 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          {/* Header Unificado */}
          <AdminHeader 
            onLogout={handleLogout} 
            onRefrescar={() => agenda.fetchTurnos && agenda.fetchTurnos()}
            onNuevoTurno={nuevoTurno.abrirModalNuevoTurno}
            cargandoRefresco={agenda.loading}
          />

          {/* NAVEGACIÓN POR PESTAÑAS DENTRO DEL BLOQUE AZUL */}
          <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
            <AdminTabs
              activeTab={activeTab}
              onChange={setActiveTab}
              totalTurnos={agenda.turnos.length}
              totalGenerales={generales.serviciosGenerales.length}
            />
          </div>
        </div>
      </div>

      {/* ⬜ CONTENIDO FLOTANTE (Sobresale por encima del degradado con -mt-12) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 -mt-12 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-12 relative z-20">
        <div className="mt-4">
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                variants={contenedorVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
              >
                <motion.div variants={seccionVariants}>
                  <OverviewTab
                    totalReservas={agenda.totalReservas}
                    ingresosCobrados={agenda.ingresosCobrados}
                    ingresosPendientes={agenda.ingresosPendientes}
                  />
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'agenda' && (
              <motion.div
                key="agenda"
                variants={contenedorVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
              >
                <motion.div variants={seccionVariants}>
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
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MODALES OPERATIVOS DE AGENDA */}
      <AnimatePresence>
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
      </AnimatePresence>

      <AnimatePresence>
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
      </AnimatePresence>

      <AnimatePresence>
        {agenda.modalEditarTurno && agenda.turnoEdit && (
          <ModalEditarTurno
            turnoEdit={agenda.turnoEdit}
            setTurnoEdit={agenda.setTurnoEdit}
            guardandoEdicionTurno={agenda.guardandoEdicionTurno}
            onSubmit={agenda.guardarEdicionTurno}
            onClose={agenda.cerrarModalEditarTurno}
          />
        )}
      </AnimatePresence>
    </div>
  )
}