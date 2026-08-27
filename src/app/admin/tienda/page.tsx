'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useCatalogo } from '@/hooks/admin/useCatalogo'
import { useAdminLogout } from '@/hooks/admin/useAdminLogout'

import AdminHeader from '@/components/admin/AdminHeader'
import SegmentedTabs from '@/components/admin/SegmentedTabs'
import { ArrowLeftIcon } from '@/components/admin/icons'
import PreciosTab from '@/components/admin/tabs/PreciosTab'
import GeneralesTab from '@/components/admin/tabs/GeneralesTab'
import HorariosTab from '@/components/admin/tabs/HorariosTab'
import BannerTab from '@/components/admin/tabs/BannerTab'
import FaqTab from '@/components/admin/tabs/FaqTab'
import ReferidosTab from '@/components/admin/tabs/ReferidosTab'

import ModalServicioLaser from '@/components/admin/modals/ModalServicioLaser'
import ModalPromo from '@/components/admin/modals/ModalPromo'
import ModalServicioGeneral from '@/components/admin/modals/ModalServicioGeneral'

type TiendaTab = 'precios' | 'generales' | 'horarios' | 'banner' | 'referidos' | 'faq'

const TABS: { key: TiendaTab; label: string }[] = [
  { key: 'precios', label: 'Precios' },
  { key: 'generales', label: 'Generales' },
  { key: 'horarios', label: 'Horarios' },
  { key: 'banner', label: 'Banner' },
  { key: 'referidos', label: 'Referidos' },
  { key: 'faq', label: 'FAQ' }
]

export default function TiendaPage() {
  const router = useRouter()
  const handleLogout = useAdminLogout()
  const [activeTab, setActiveTab] = useState<TiendaTab>('precios')

  const c = useCatalogo()

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

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Tienda y Productos</h1>
            <p className="mt-0.5 text-sm text-slate-500">Precios, promociones, horarios y contenido</p>
          </div>

          <div className="overflow-x-auto pb-1">
            <SegmentedTabs<TiendaTab> accent="rose" active={activeTab} onChange={setActiveTab} tabs={TABS} />
          </div>
        </div>

        {/* Contenido */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
          {activeTab === 'precios' && (
            <PreciosTab
              loadingPrecios={c.loadingPrecios}
              servicios={c.servicios}
              promos={c.promos}
              seccionPrecios={c.seccionPrecios}
              setSeccionPrecios={c.setSeccionPrecios}
              onNuevaZona={() => c.abrirModalServicio()}
              onEditarZona={(s) => c.abrirModalServicio(s)}
              onToggleActivoZona={c.toggleActivoServicio}
              onEliminarZona={c.eliminarServicio}
              onNuevaPromo={() => c.abrirModalPromo()}
              onEditarPromo={(p) => c.abrirModalPromo(p)}
              onToggleActivoPromo={c.toggleActivoPromo}
              onEliminarPromo={c.eliminarPromo}
            />
          )}

          {activeTab === 'generales' && (
            <GeneralesTab
              loadingGenerales={c.loadingGenerales}
              serviciosGenerales={c.serviciosGenerales}
              onNuevoServicio={() => c.abrirModalGeneral()}
              onEditarServicio={(s) => c.abrirModalGeneral(s)}
              onToggleActivo={c.toggleActivoGeneral}
              onEliminarServicio={c.eliminarServicioGeneral}
              referidosActivo={c.referidosActivo}
              setReferidosActivo={c.setReferidosActivo}
              referidosTipoDescuento={c.referidosTipoDescuento}
              setReferidosTipoDescuento={c.setReferidosTipoDescuento}
              referidosValorDescuento={c.referidosValorDescuento}
              setReferidosValorDescuento={c.setReferidosValorDescuento}
            />
          )}

          {activeTab === 'horarios' && (
            <HorariosTab
              loadingHorarios={c.loadingHorarios}
              configLaser={c.configLaser}
              guardandoLaser={c.guardandoLaser}
              nuevaFechaLaser={c.nuevaFechaLaser}
              setNuevaFechaLaser={c.setNuevaFechaLaser}
              onActualizarRangoLaser={c.actualizarRangoLaser}
              onAgregarFechaLaser={c.agregarFechaLaser}
              onQuitarFechaLaser={c.quitarFechaLaser}
              onGuardarConfigLaser={c.guardarConfigLaser}
              configGeneral={c.configGeneral}
              guardandoGeneral={c.guardandoGeneral}
              nuevaExcepcionGeneral={c.nuevaExcepcionGeneral}
              setNuevaExcepcionGeneral={c.setNuevaExcepcionGeneral}
              onToggleDiaGeneral={c.toggleDiaGeneral}
              onActualizarHorarioGeneral={c.actualizarHorarioGeneral}
              onAgregarExcepcionGeneral={c.agregarExcepcionGeneral}
              onQuitarExcepcionGeneral={c.quitarExcepcionGeneral}
              onGuardarConfigGeneral={c.guardarConfigGeneral}
            />
          )}

          {activeTab === 'banner' && <BannerTab />}
          {activeTab === 'referidos' && <ReferidosTab />}
          {activeTab === 'faq' && <FaqTab />}
        </div>
      </div>

      {/* MODALES */}
      {c.modalServicio && c.servicioEdit && (
        <ModalServicioLaser
          servicioEdit={c.servicioEdit}
          setServicioEdit={c.setServicioEdit}
          onSubmit={c.guardarServicio}
          onClose={() => c.setModalServicio(false)}
        />
      )}

      {c.modalPromo && c.promoEdit && (
        <ModalPromo
          promoEdit={c.promoEdit}
          setPromoEdit={c.setPromoEdit}
          servicios={c.servicios}
          onToggleZona={c.toggleZonaEnPromo}
          onSubmit={c.guardarPromo}
          onClose={() => c.setModalPromo(false)}
        />
      )}

      {c.modalGeneral && c.servicioGeneralEdit && (
        <ModalServicioGeneral
          servicioGeneralEdit={c.servicioGeneralEdit}
          setServicioGeneralEdit={c.setServicioGeneralEdit}
          onSubmit={c.guardarServicioGeneral}
          onClose={() => {
            c.setModalGeneral(false)
            c.setServicioGeneralEdit(null)
          }}
        />
      )}
    </div>
  )
}
