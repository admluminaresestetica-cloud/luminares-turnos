'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { 
  ArrowLeft, Building2, Image as ImageIcon, Flame, BookOpen, 
  Clock, Tag, Layers, Share2, ClipboardList, HelpCircle, Shield,
  ChevronRight, FileStack, Palette
} from 'lucide-react'

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
import BannersHomeTab from './components/BannersHomeTab'
import GuiasAjustesTab from './components/GuiasAjustesTab'
import ReferidosTab from './components/ReferidosTab'
import ConfiguracionAnamnesisTab from './components/ConfiguracionAnamnesis'
import ConfiguracionPinTab from './components/ConfiguracionPinTab'
import DestacadosAjustesTab from './components/DestacadosAjustesTab'
import AparienciaAjustesTab from './components/AparienciaAjustesTab'

import ModalServicioLaser from '@/app/admin/turnos/components/modals/ModalServicioLaser'
import ModalPromo from '@/app/admin/turnos/components/modals/ModalPromo'
import ModalServicioGeneral from '@/app/admin/turnos/components/modals/ModalServicioGeneral'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type ModuloAjustes = 
  | 'empresa'
  | 'apariencia'
  | 'banners_home'
  | 'destacados'
  | 'guias_app'
  | 'agenda'
  | 'precios'
  | 'generales'
  | 'banners'
  | 'referidos'
  | 'anamnesis'
  | 'faqs'
  | 'seguridad'

interface TarjetaConfig {
  id: ModuloAjustes
  titulo: string
  descripcion: string
  icono: any
  colorIcono: string
  badge?: string
}

export default function AjustesAdminPage() {
  const router = useRouter()
  const [cargandoSesion, setCargandoSesion] = useState(true)
  const [autenticado, setAutenticado] = useState(false)
  const [moduloActivo, setModuloActivo] = useState<ModuloAjustes | null>(null)

  const configAgendaProps = useConfigCalendario()
  const precios = usePreciosLaser()
  const generales = useServiciosGenerales()
  const referidos = useReferidosConfig()

  useEffect(() => {
    const verificarSesion = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

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
        <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
          Verificando permisos...
        </p>
      </div>
    )
  }

  if (!autenticado) return null

  // Módulos agrupados por categoría
  const categorias = [
    {
      titulo: 'Catálogo & Precios',
      tarjetas: [
        {
          id: 'precios',
          titulo: 'Tarifas Láser & Combos',
          descripcion: 'Zonas individuales, paquetes y precios de depilación láser.',
          icono: Tag,
          colorIcono: 'text-emerald-500 bg-emerald-500/10'
        },
        {
          id: 'generales',
          titulo: 'Servicios Generales',
          descripcion: 'Tratamientos faciales, corporales y otros servicios.',
          icono: Layers,
          colorIcono: 'text-indigo-500 bg-indigo-500/10'
        },
        {
          id: 'destacados',
          titulo: 'Lo Más Buscado',
          descripcion: 'Elegí qué servicios y promos se destacan en el inicio de la app.',
          icono: Flame,
          colorIcono: 'text-amber-500 bg-amber-500/10',
          badge: 'Inicio'
        }
      ] as TarjetaConfig[]
    },
    {
      titulo: 'Experiencia & App',
      tarjetas: [
        {
          id: 'apariencia',
          titulo: 'Colores & Apariencia',
          descripcion: 'Personalizá el esquema de colores de la aplicación en tiempo real.',
          icono: Palette,
          colorIcono: 'text-pink-500 bg-pink-500/10',
          badge: 'Nuevo'
        },
        {
          id: 'banners_home',
          titulo: 'Banners Inicio App',
          descripcion: 'Novedades y promociones principales del inicio.',
          icono: FileStack,
          colorIcono: 'text-teal-500 bg-teal-500/10',
          badge: 'Inicio'
        },
        {
          id: 'guias_app',
          titulo: 'Guías e Instructivos',
          descripcion: 'Cuidados pre/post tratamiento e información útil.',
          icono: BookOpen,
          colorIcono: 'text-cyan-500 bg-cyan-500/10'
        },
        {
          id: 'faqs',
          titulo: 'Preguntas Frecuentes',
          descripcion: 'Respuestas dinámicas a dudas habituales de clientes.',
          icono: HelpCircle,
          colorIcono: 'text-sky-500 bg-sky-500/10'
        },
        {
          id: 'banners',
          titulo: 'Banners Secundarios & Tienda',
          descripcion: 'Banner modal emergente al entrar y banners para la Tienda / E-Commerce.',
          icono: ImageIcon,
          colorIcono: 'text-purple-500 bg-purple-500/10'
        }
      ] as TarjetaConfig[]
    },
    {
      titulo: 'Operación & Negocio',
      tarjetas: [
        {
          id: 'empresa',
          titulo: 'Datos de la Empresa',
          descripcion: 'Marca, redes, WhatsApp, logo y datos generales.',
          icono: Building2,
          colorIcono: 'text-blue-500 bg-blue-500/10'
        },
        {
          id: 'agenda',
          titulo: 'Horarios de Agenda',
          descripcion: 'Días laborables, turnos y margen de reservas.',
          icono: Clock,
          colorIcono: 'text-rose-500 bg-rose-500/10'
        },
        {
          id: 'referidos',
          titulo: 'Programa de Referidos',
          descripcion: 'Configuración de descuentos y beneficios por recomendación.',
          icono: Share2,
          colorIcono: 'text-fuchsia-500 bg-fuchsia-500/10'
        },
        {
          id: 'anamnesis',
          titulo: 'Ficha Médica (Anamnesis)',
          descripcion: 'Preguntas de salud obligatorias antes de agendar.',
          icono: ClipboardList,
          colorIcono: 'text-orange-500 bg-orange-500/10'
        },
        {
          id: 'seguridad',
          titulo: 'PIN de Seguridad',
          descripcion: 'Claves de acceso para el personal y área administrativa.',
          icono: Shield,
          colorIcono: 'text-red-500 bg-red-500/10'
        }
      ] as TarjetaConfig[]
    }
  ]

return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 transition-colors pb-12">
      
      {/* 🟦 HERO CONTINUO SUPERIOR CON DEGRADADO AZUL FINTECH */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 dark:from-blue-950 dark:via-blue-900 dark:to-zinc-900 pb-20 shadow-lg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          
          {/* Encabezado con Botón de Volver al lado del Título */}
          <div className="flex items-center gap-3.5">
            {moduloActivo ? (
              <button
                type="button"
                onClick={() => setModuloActivo(null)}
                className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl border border-white/25 transition-all active:scale-95 shadow-xs shrink-0 cursor-pointer"
                title="Volver al Menú de Ajustes"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
            ) : (
              <Link
                href="/admin"
                className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl border border-white/25 transition-all active:scale-95 shadow-xs shrink-0 cursor-pointer"
                title="Volver al Menú Admin"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </Link>
            )}

            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Ajustes del Negocio
              </h1>
              <p className="text-xs text-blue-100/80 mt-0.5">
                {moduloActivo 
                  ? 'Editá los valores del módulo seleccionado.' 
                  : 'Seleccioná la sección que querés configurar.'}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ⬜ CONTENEDOR FLOTANTE PRINCIPAL (-mt-10) */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 space-y-6">
        {/* VISTA 1: GRID HUB DE TARJETAS */}
        {!moduloActivo && (
          <div className="space-y-8 pt-6"> {/* <--- Agregale pt-6 aquí */}
            {categorias.map((cat, idx) => (
              <div key={idx} className="space-y-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 px-1">
                  {cat.titulo}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cat.tarjetas.map((tarjeta) => {
                    const Icono = tarjeta.icono
                    return (
                      <button
                        key={tarjeta.id}
                        type="button"
                        onClick={() => setModuloActivo(tarjeta.id)}
                        className="group text-left p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-zinc-700 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden shadow-xl"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${tarjeta.colorIcono} transition-transform group-hover:scale-110 shadow-2xs`}>
                              <Icono className="w-5 h-5" />
                            </div>
                            {tarjeta.badge && (
                              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                {tarjeta.badge}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                            {tarjeta.titulo}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                            {tarjeta.descripcion}
                          </p>
                        </div>

                        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          <span>Gestionar</span>
                          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VISTA 2: COMPONENTE SELECCIONADO A PANTALLA COMPLETA */}
        {moduloActivo && (
          <div className="animate-in fade-in duration-200">
            {moduloActivo === 'empresa' && <FormularioEmpresaTab />}
            {moduloActivo === 'apariencia' && <AparienciaAjustesTab />}
            {moduloActivo === 'banners_home' && <BannersHomeTab />}
            {moduloActivo === 'destacados' && <DestacadosAjustesTab />}
            {moduloActivo === 'guias_app' && <GuiasAjustesTab />}
            {moduloActivo === 'agenda' && <HorariosTab {...configAgendaProps} />}

            {moduloActivo === 'precios' && (
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

            {moduloActivo === 'generales' && (
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

            {moduloActivo === 'banners' && <BannersAjustesTab />}
            {moduloActivo === 'referidos' && <ReferidosTab />}
            {moduloActivo === 'anamnesis' && <ConfiguracionAnamnesisTab />}

            {moduloActivo === 'faqs' && (
              <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xl transition-colors">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 tracking-tight mb-4">
                  Gestión de Preguntas Frecuentes
                </h2>
                <FaqTab />
              </div>
            )}

            {moduloActivo === 'seguridad' && <ConfiguracionPinTab />}
          </div>
        )}

      </main>

      {/* MODALES DE EDICIÓN Y ALTA */}
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