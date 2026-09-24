'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { ArrowLeft } from 'lucide-react'

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
import BannersHomeTab from './components/BannersHomeTab' // ✨ 1. IMPORTAMOS LA NUEVA PESTAÑA
import ReferidosTab from './components/ReferidosTab'
import ConfiguracionAnamnesisTab from './components/ConfiguracionAnamnesis'
import ConfiguracionPinTab from './components/ConfiguracionPinTab'

import ModalServicioLaser from '@/app/admin/turnos/components/modals/ModalServicioLaser'
import ModalPromo from '@/app/admin/turnos/components/modals/ModalPromo'
import ModalServicioGeneral from '@/app/admin/turnos/components/modals/ModalServicioGeneral'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AjustesAdminPage() {
  const router = useRouter()
  const [cargandoSesion, setCargandoSesion] = useState(true)
  const [autenticado, setAutenticado] = useState(false)

  // ✨ 2. SUMAMOS 'banners_home' AL TIPO Y ESTADO INICIAL (o podés dejarlo como predeterminado para testear)
  const [activeTab, setActiveTab] = useState<
    'empresa' | 'agenda' | 'precios' | 'generales' | 'banners' | 'banners_home' | 'referidos' | 'anamnesis' | 'faqs' | 'seguridad'
  >('banners_home')

  const configAgendaProps = useConfigCalendario()
  const precios = usePreciosLaser()
  const generales = useServiciosGenerales()
  const referidos = useReferidosConfig()

  // Validación de Sesión de Admin
  useEffect(() => {
    const verificarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/admin/login?redirect=/admin/ajustes')
      } else {
        setAutenticado(true)
      }
      setCargandoSesion(false)
    }

    verificarSesion()
  }, [router])

  if (cargandoSesion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Verificando permisos...</p>
      </div>
    )
  }

  if (!autenticado) return null

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Encabezado con Botón de Volver */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Ajustes del Negocio</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Administrá la información dinámica de tu marca, datos de contacto, horarios, servicios, tarifas, banners, referidos, ficha médica y claves de acceso.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all shadow-xs shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
          <span>Volver al Menú Admin</span>
        </Link>
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

        {/* ✨ 3. BOTÓN DE PESTAÑA NUEVA: BANNERS INICIO APP */}
        <button
          onClick={() => setActiveTab('banners_home')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'banners_home'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          Banners Inicio App
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
          Banners Secundarios
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

        <button
          onClick={() => setActiveTab('seguridad')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'seguridad'
              ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          PIN de Seguridad
        </button>
      </div>

      {/* Contenido según la pestaña activa */}
      {activeTab === 'empresa' && <FormularioEmpresaTab />}

      {/* ✨ 4. RENDERIZAMOS EL COMPONENTE DE BANNERS HOME */}
      {activeTab === 'banners_home' && <BannersHomeTab />}

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

      {activeTab === 'seguridad' && <ConfiguracionPinTab />}

      {/* MODALES DE EDICIÓN Y ALTA DE SERVICIOS */}
      {precios.modalServicio && precios.servicioEdit && (
        <ModalServicioLaser
          servicioEdit={precios.servicioEdit}
          setServicioEdit={precios.setServicioEdit}
          onClose={precios.cerrarModalServicio}
          onSaveSuccess={() => {
            precios.cerrarModalServicio()
          }}
        />
      )}
      {precios.modalPromo && precios.promoEdit && (
        <ModalPromo
          promoEdit={precios.promoEdit}
          setPromoEdit={precios.setPromoEdit}
          servicios={precios.servicios}
          onToggleZona={precios.toggleZonaEnPromo}
          onClose={precios.cerrarModalPromo}
          onSaveSuccess={() => {
            precios.cerrarModalPromo()
          }}
        />
      )}

      {generales.modalGeneral && generales.servicioGeneralEdit && (
        <ModalServicioGeneral
          servicioGeneralEdit={generales.servicioGeneralEdit}
          setServicioGeneralEdit={generales.setServicioGeneralEdit}
          onClose={generales.cerrarModalGeneral}
          onSaveSuccess={() => {
            generales.cerrarModalGeneral()
          }}
        />
      )}
    </div>
  )
}
