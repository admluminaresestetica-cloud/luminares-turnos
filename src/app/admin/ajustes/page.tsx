'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useConfigCalendario } from '@/hooks/admin/useConfigCalendario'
import { usePreciosLaser } from '@/hooks/admin/usePreciosLaser'
import { useServiciosGenerales } from '@/hooks/admin/useServiciosGenerales'
import { useReferidosConfig } from '@/hooks/admin/useReferidosConfig'

import FormularioEmpresaTab from './components/FormularioEmpresaTab'
import FaqTab from './components/FaqTab'
import HorariosTab from './components/HorariosTab'
import PreciosTab from './components/PreciosTab'
import GeneralesTab from './components/GeneralesTab'
import BannersAjustesTab from './components/BannersAjustesTab'
import ReferidosTab from './components/ReferidosTab'
import ConfiguracionAnamnesisTab from './components/ConfiguracionAnamnesis'

import ModalServicioLaser from '@/app/admin/turnos/components/modals/ModalServicioLaser'
import ModalPromo from '@/app/admin/turnos/components/modals/ModalPromo'
import ModalServicioGeneral from '@/app/admin/turnos/components/modals/ModalServicioGeneral'

export default function AjustesAdminPage() {
  const [activeTab, setActiveTab] = useState<'empresa' | 'agenda' | 'precios' | 'generales' | 'banners' | 'referidos' | 'anamnesis' | 'faqs'>('empresa')

  const configAgendaProps = useConfigCalendario()
  const precios = usePreciosLaser()
  const generales = useServiciosGenerales()
  const referidos = useReferidosConfig()

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Ajustes del Negocio</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Administrá la información dinámica de tu marca, datos de contacto, horarios, servicios, tarifas, banners, referidos y ficha médica.
        </p>
      </div>

      {/* Navegación entre pestañas */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-zinc-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('empresa')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'empresa'
              ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          Empresa y Configuración
        </button>

        <button
          onClick={() => setActiveTab('agenda')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'agenda'
              ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          Horarios de Agenda
        </button>

        <button
          onClick={() => setActiveTab('precios')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'precios'
              ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          Tarifas Láser y Combos
        </button>

        <button
          onClick={() => setActiveTab('generales')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'generales'
              ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          Servicios Generales
        </button>

        <button
          onClick={() => setActiveTab('banners')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'banners'
              ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          Banners y Visuales
        </button>

        <button
          onClick={() => setActiveTab('referidos')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'referidos'
              ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          Programa de Referidos
        </button>

        <button
          onClick={() => setActiveTab('anamnesis')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'anamnesis'
              ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          Preguntas Anamnesis
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'faqs'
              ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          Preguntas Frecuentes (FAQ)
        </button>
      </div>

      {/* Contenido según la pestaña activa */}
      {activeTab === 'empresa' && <FormularioEmpresaTab />}

      {activeTab === 'agenda' && <HorariosTab {...configAgendaProps} />}

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

      {activeTab === 'banners' && <BannersAjustesTab />}

      {activeTab === 'referidos' && <ReferidosTab />}

      {activeTab === 'anamnesis' && <ConfiguracionAnamnesisTab />}

      {activeTab === 'faqs' && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">
            Gestión de Preguntas Frecuentes
          </h2>
          <FaqTab />
        </div>
      )}

      {/* MODALES DE EDICIÓN Y ALTA DE SERVICIOS */}
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
    </div>
  )
}