'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { 
  ArrowLeft, Building2, Image as ImageIcon, Flame, BookOpen, 
  Clock, Tag, Layers, Share2, ClipboardList, HelpCircle, Shield,
  ChevronRight, FileStack, Palette, Gift, QrCode,
  PanelLeftClose, PanelLeftOpen, Search, X, LayoutGrid
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
import ModuloFidelizacionTab from './components/ModuloFidelizacionTab'

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
  const [busquedaSeccion, setBusquedaSeccion] = useState('')

  // 🎨 Solo UI: estado de colapso del menú lateral (solo aplica en desktop, lg+)
  const [colapsado, setColapsado] = useState(false)
  const inputBusquedaRef = useRef<HTMLInputElement>(null)

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
          titulo: 'Fidelización, Puntos & Premios',
          descripcion: 'Gestioná el programa de referidos, catálogo de premios y validación de canjes.',
          icono: Gift,
          colorIcono: 'text-fuchsia-500 bg-fuchsia-500/10',
          badge: 'Fidelización'
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

  // 🔎 Solo UI: categorías filtradas por el buscador del menú lateral
  const termino = busquedaSeccion.trim().toLowerCase()
  const categoriasFiltradas = categorias
    .map((cat) => ({
      ...cat,
      tarjetas: cat.tarjetas.filter(
        (t) =>
          !termino ||
          t.titulo.toLowerCase().includes(termino) ||
          t.descripcion.toLowerCase().includes(termino)
      )
    }))
    .filter((cat) => cat.tarjetas.length > 0)

  const abrirBuscadorDesdeColapsado = () => {
    setColapsado(false)
    setTimeout(() => inputBusquedaRef.current?.focus(), 320)
  }

  // Tooltip reutilizable (solo visible en desktop con el menú colapsado)
  const Tooltip = ({ texto }: { texto: string }) =>
    colapsado ? (
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white opacity-0 shadow-xl transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100 group-focus-visible/item:translate-x-0 group-focus-visible/item:opacity-100 lg:block dark:bg-zinc-100 dark:text-zinc-900"
      >
        {texto}
      </span>
    ) : null

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 transition-colors pb-12">
      
      {/* 🟦 HERO CONTINUO SUPERIOR CON DEGRADADO AZUL FINTECH */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 dark:from-blue-950 dark:via-blue-900 dark:to-zinc-900 pb-20 shadow-lg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          
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
                  : 'Navegá por las secciones desde el menú lateral o seleccioná una tarjeta.'}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ⬜ CONTENEDOR FLOTANTE PRINCIPAL (-mt-4) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 space-y-6">
        
        {/* Layout: Menú Lateral colapsable + Contenido fluido */}
        <div className="flex flex-col lg:flex-row gap-6 items-start pt-6">
          
          {/* 1. MENÚ LATERAL IZQUIERDO (Sticky en PC, glassmorphism, colapsable) */}
          <aside
            className={`w-full shrink-0 lg:sticky lg:top-24 transition-[width] duration-300 ease-in-out motion-reduce:transition-none ${
              colapsado ? 'lg:w-[4.5rem]' : 'lg:w-72'
            }`}
          >
            <div className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-3 shadow-xl dark:shadow-2xl space-y-4">

              {/* Cabecera del menú + botón de colapso (solo desktop) */}
              <div className={`flex items-center px-1 ${colapsado ? 'lg:justify-center' : 'justify-between'}`}>
                <span
                  className={`text-sm font-black tracking-tight text-slate-800 dark:text-zinc-100 transition-all duration-300 ${
                    colapsado ? 'lg:hidden' : ''
                  }`}
                >
                  Secciones
                </span>
                <button
                  type="button"
                  onClick={() => setColapsado((v) => !v)}
                  aria-label={colapsado ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
                  title={colapsado ? 'Expandir menú' : 'Colapsar menú'}
                  className="hidden lg:flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 dark:text-zinc-500 transition-all duration-200 hover:scale-105 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                >
                  {colapsado ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </button>
              </div>

              {/* 🔎 Buscador integrado */}
              <div>
                {/* Input (mobile siempre; desktop solo expandido) */}
                <div className={`relative ${colapsado ? 'lg:hidden' : ''}`}>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                  <input
                    ref={inputBusquedaRef}
                    type="text"
                    value={busquedaSeccion}
                    onChange={(e) => setBusquedaSeccion(e.target.value)}
                    placeholder="Buscar sección..."
                    aria-label="Buscar sección de ajustes"
                    className="w-full rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-100/70 dark:bg-zinc-800/60 py-2.5 pl-9 pr-8 text-xs font-medium text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white dark:focus:border-blue-500/60 dark:focus:bg-zinc-900 focus:ring-4 focus:ring-blue-500/10"
                  />
                  {busquedaSeccion && (
                    <button
                      type="button"
                      onClick={() => setBusquedaSeccion('')}
                      aria-label="Limpiar búsqueda"
                      className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-all duration-200 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Ícono de búsqueda (solo desktop colapsado) */}
                {colapsado && (
                  <button
                    type="button"
                    onClick={abrirBuscadorDesdeColapsado}
                    aria-label="Buscar sección"
                    className="group/item relative hidden lg:flex h-10 w-full items-center justify-center rounded-2xl bg-slate-100/70 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 transition-all duration-200 hover:scale-105 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                  >
                    <Search className="h-4 w-4 transition-transform duration-200 group-hover/item:-translate-y-0.5" />
                    <Tooltip texto="Buscar sección" />
                  </button>
                )}
              </div>

              {/* Vista general */}
              <button
                type="button"
                onClick={() => setModuloActivo(null)}
                aria-current={moduloActivo === null ? 'page' : undefined}
                className={`group/item relative flex w-full items-center rounded-2xl p-2 text-xs font-bold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 ${
                  colapsado ? 'lg:justify-center lg:hover:scale-105' : 'justify-between'
                } ${
                  moduloActivo === null
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100'
                }`}
              >
                {moduloActivo === null && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-blue-600 dark:bg-blue-400" />
                )}
                <div className="flex min-w-0 items-center">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200 group-hover/item:-translate-y-0.5 group-hover/item:scale-110 ${
                      moduloActivo === null
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-200/70 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </div>
                  <span
                    className={`truncate text-left transition-all duration-300 ease-in-out ${
                      colapsado ? 'lg:ml-0 lg:w-0 lg:opacity-0' : 'ml-2.5 opacity-100'
                    }`}
                  >
                    Vista general
                  </span>
                </div>
                <ChevronRight
                  className={`h-3.5 w-3.5 shrink-0 opacity-50 transition-all duration-300 group-hover/item:translate-x-0.5 ${
                    colapsado ? 'lg:hidden' : ''
                  }`}
                />
                <Tooltip texto="Vista general" />
              </button>

              {/* Navegación por categorías */}
              <nav className="space-y-4" aria-label="Secciones de ajustes">
                {categoriasFiltradas.length === 0 && (
                  <p className={`px-3 py-4 text-center text-xs text-slate-400 dark:text-zinc-500 ${colapsado ? 'lg:hidden' : ''}`}>
                    No hay secciones que coincidan con “{busquedaSeccion}”.
                  </p>
                )}

                {categoriasFiltradas.map((cat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    {/* Título de categoría (expandido) / divisor (colapsado) */}
                    <span
                      className={`block px-3 text-[11px] font-bold tracking-wide text-slate-400 dark:text-zinc-500 ${
                        colapsado ? 'lg:hidden' : ''
                      }`}
                    >
                      {cat.titulo}
                    </span>
                    {colapsado && (
                      <div className="mx-3 hidden h-px bg-slate-200/80 dark:bg-zinc-800 lg:block" />
                    )}

                    <div className="space-y-1">
                      {cat.tarjetas.map((tarjeta) => {
                        const Icono = tarjeta.icono
                        const activo = moduloActivo === tarjeta.id
                        return (
                          <button
                            key={tarjeta.id}
                            type="button"
                            onClick={() => setModuloActivo(tarjeta.id)}
                            aria-current={activo ? 'page' : undefined}
                            className={`group/item relative flex w-full items-center rounded-2xl p-2 text-xs font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 ${
                              colapsado ? 'lg:justify-center lg:hover:scale-105' : 'justify-between'
                            } ${
                              activo
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100'
                            }`}
                          >
                            {/* Indicador lateral del módulo activo */}
                            {activo && (
                              <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-blue-600 dark:bg-blue-400" />
                            )}

                            <div className="flex min-w-0 items-center">
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200 group-hover/item:-translate-y-0.5 group-hover/item:scale-110 ${
                                  activo
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                    : tarjeta.colorIcono
                                }`}
                              >
                                <Icono className="h-4 w-4" />
                              </div>
                              <span
                                className={`truncate text-left transition-all duration-300 ease-in-out ${
                                  colapsado ? 'lg:ml-0 lg:w-0 lg:opacity-0' : 'ml-2.5 opacity-100'
                                }`}
                              >
                                {tarjeta.titulo}
                              </span>
                            </div>

                            <ChevronRight
                              className={`h-3.5 w-3.5 shrink-0 transition-all duration-300 group-hover/item:translate-x-0.5 ${
                                activo ? 'opacity-80' : 'opacity-40'
                              } ${colapsado ? 'lg:hidden' : ''}`}
                            />

                            <Tooltip texto={tarjeta.titulo} />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </nav>

            </div>
          </aside>

          {/* 2. ÁREA DE CONTENIDO PRINCIPAL (Derecha, ocupa el ancho restante) */}
          <div className="min-w-0 w-full flex-1 space-y-6">
            
            {/* VISTA 1: GRID HUB DE TARJETAS */}
            {!moduloActivo && (
              <div className="space-y-8">
                {categorias.map((cat, idx) => (
                  <div key={idx} className="space-y-3">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 px-1">
                      {cat.titulo}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cat.tarjetas.map((tarjeta) => {
                        const Icono = tarjeta.icono
                        return (
                          <button
                            key={tarjeta.id}
                            type="button"
                            onClick={() => setModuloActivo(tarjeta.id)}
                            className="group text-left p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-zinc-700 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden shadow-xl"
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
                {moduloActivo === 'referidos' && <ModuloFidelizacionTab />}
              </div>
            )}

          </div>

        </div>

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