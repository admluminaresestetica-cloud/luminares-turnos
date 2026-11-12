'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowLeft, Loader2, LayoutDashboard, BarChart3, CalendarDays, UserCheck } from 'lucide-react';

import DateRangePicker, { RangoFecha } from './components/DateRangePicker';
import RevenueChart from './components/RevenueChart';
import AppointmentsChart from './components/AppointmentsChart';
import GraficoTopServicios from './components/GraficoTopServicios';
import KpiCards from './components/KpiCards';
import MediosPagoCard from './components/MediosPagoCard';
import CategoriasCard from './components/CategoriasCard';
import GraficoDiasSemana from './components/GraficoDiasSemana';
import FranjasHorariasCard from './components/FranjasHorariasCard';
import CrossSellingCard from './components/CrossSellingCard';
import OrigenFinanzasCard from './components/OrigenFinanzasCard';
import ClienteAnalisisTab from './components/clientes/ClienteAnalisisTab';

import {
  getKpisReservas,
  getTopServicios,
  getSerieEvolucionIngresos,
  getDesgloseMediosPago,
  getComparativaCategorias,
  getDistribucionDiasSemana,
  getTopProductos,
  getTasaNoShow, 
  getDistribucionFranjasHorarias, 
  KpisResumen,
  ServicioTop,
  SerieIngresosPorFecha,
  DesgloseMedioPago,
  ComparativaCategorias,
  DistribucionDiaSemana,
  ProductoTop,
  MetricaNoShow,
  DistribucionFranjaHoraria, 
  getMetricasCrossSelling,
  getOrigenReservas,
  getImpactoFinancieroMediosPago,
  MetricaCrossSelling,
  DistribucionOrigen,
  ImpactoMedioPago,
} from '@/lib/admin/metricas';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type TabTipo = 'general' | 'ventas' | 'agenda' | 'clientes';

// ✨ Variantes de animación (solo UI).
// Se anima opacidad + desplazamiento (sin escala) para no interferir con el medido de los gráficos.
const contenedorVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.04 },
  },
};

const seccionVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 280, damping: 26 },
  },
};

const heroVariants: Variants = {
  hidden: { opacity: 0, y: -14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

// Envoltorio animado para cada bloque (hereda el stagger del contenedor)
const Seccion = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <motion.div variants={seccionVariants} className={className}>
    {children}
  </motion.div>
);

// Definición visual de las pestañas (los ids y el onClick no cambian)
const TABS: { id: TabTipo; label: string; icono: typeof LayoutDashboard }[] = [
  { id: 'general', label: 'General', icono: LayoutDashboard },
  { id: 'ventas', label: 'Servicios y Cobros', icono: BarChart3 },
  { id: 'agenda', label: 'Rubros y Días', icono: CalendarDays },
  { id: 'clientes', label: 'Clientes', icono: UserCheck },
];

export default function MetricasPage() {
  const router = useRouter();
  const reducirMovimiento = useReducedMotion();
  const [cargandoSesion, setCargandoSesion] = useState<boolean>(true);
  const [autenticado, setAutenticado] = useState<boolean>(false);

  const [tabActiva, setTabActiva] = useState<TabTipo>('general');
  const [rango, setRango] = useState<RangoFecha>('mes');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(true);

  // Verificación de Sesión Supabase Auth
  useEffect(() => {
    const verificarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/admin/login?redirect=/admin/metricas');
      } else {
        setAutenticado(true);
      }
      setCargandoSesion(false);
    };

    verificarSesion();
  }, [router]);

  // Estados KPIs, Medios de Pago y Categorías
  const [kpis, setKpis] = useState<KpisResumen>({
    ingresosTotales: 0,
    ingresosVariacion: 0,
    totalTurnos: 0,
    turnosVariacion: 0,
    ticketPromedio: 0,
    ticketVariacion: 0,
    senasTotales: 0,
    senasVariacion: 0,
    turnosCompletados: 0,
    turnosPendienteSena: 0,
    turnosCancelados: 0,
    tasaAsistencia: 0,
  });

  const [mediosPago, setMediosPago] = useState<DesgloseMedioPago[]>([]);
  const [comparativaCat, setComparativaCat] = useState<ComparativaCategorias>({
    laser: { turnos: 0, ingresos: 0, porcentajeIngresos: 0 },
    estetica: { turnos: 0, ingresos: 0, porcentajeIngresos: 0 },
  });
  const [diasSemana, setDiasSemana] = useState<DistribucionDiaSemana[]>([]);

  // Estados Gráficos y Tablas
  const [serieIngresos, setSerieIngresos] = useState<{ fecha: string; total: number }[]>([]);
  const [topServicios, setTopServicios] = useState<ServicioTop[]>([]);
  const [topProductos, setTopProductos] = useState<ProductoTop[]>([]);
  const [estadoTurnosChart, setEstadoTurnosChart] = useState<{ name: string; value: number }[]>([]);

  // Nuevos Estados
  const [noShow, setNoShow] = useState<MetricaNoShow>({
    totalReservas: 0,
    canceladas: 0,
    porcentajeCanceladas: 0,
  });
  const [franjasHorarias, setFranjasHorarias] = useState<DistribucionFranjaHoraria[]>([]);

  const [crossSelling, setCrossSelling] = useState<MetricaCrossSelling>({
    totalTurnos: 0,
    turnosConProducto: 0,
    tasaConversion: 0,
    ticketMedioSoloServicio: 0,
    ticketMedioConProducto: 0,
  });
  const [origenReservas, setOrigenReservas] = useState<DistribucionOrigen[]>([]);
  const [impactoFinanciero, setImpactoFinanciero] = useState<ImpactoMedioPago[]>([]);

  // Ajuste de rango de fechas
  useEffect(() => {
    const ahora = new Date();
    let inicio = new Date();
    let fin = new Date();

    if (rango === 'hoy') {
      inicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
      fin = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    } else if (rango === 'semana') {
      const diaSemana = ahora.getDay();
      const diffInicio = ahora.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
      inicio = new Date(ahora.setDate(diffInicio));
      fin = new Date();
    } else if (rango === 'mes') {
      inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      fin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
    }

    if (rango !== 'personalizado') {
      const inicioStr = `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, '0')}-${String(inicio.getDate()).padStart(2, '0')}`;
      const finStr = `${fin.getFullYear()}-${String(fin.getMonth() + 1).padStart(2, '0')}-${String(fin.getDate()).padStart(2, '0')}`;
      setFechaInicio(inicioStr);
      setFechaFin(finStr);
    }
  }, [rango]);

  // Cargar métricas
  const cargarMetricas = useCallback(async () => {
    if (!fechaInicio || !fechaFin || !autenticado) return;
    setCargando(true);

    try {
      const rangoParam = { desde: fechaInicio, hasta: fechaFin };

      const [
        resKpis,
        resTopServicios,
        resEvolucion,
        resMediosPago,
        resCategorias,
        resDiasSemana,
        resTopProductos,
        resNoShow, 
        resFranjas, 
        resCrossSelling,
        resOrigen,
        resImpacto,
      ] = await Promise.all([
        getKpisReservas(rangoParam),
        getTopServicios(rangoParam, 5),
        getSerieEvolucionIngresos(rangoParam),
        getDesgloseMediosPago(rangoParam),
        getComparativaCategorias(rangoParam),
        getDistribucionDiasSemana(rangoParam),
        getTopProductos(rangoParam, 5),
        getTasaNoShow(rangoParam),
        getDistribucionFranjasHorarias(rangoParam),
        getMetricasCrossSelling(rangoParam),
        getOrigenReservas(rangoParam),
        getImpactoFinancieroMediosPago(rangoParam),
      ]);

      setKpis(resKpis);
      setMediosPago(resMediosPago);
      setComparativaCat(resCategorias);
      setDiasSemana(resDiasSemana);
      setTopProductos(resTopProductos);
      setNoShow(resNoShow);
      setFranjasHorarias(resFranjas);
      setCrossSelling(resCrossSelling);
      setOrigenReservas(resOrigen);
      setImpactoFinanciero(resImpacto);

      setSerieIngresos(
        resEvolucion.map((item: SerieIngresosPorFecha) => ({
          fecha: item.fecha.split('-').slice(1).join('/'),
          total: item.ingresos,
        }))
      );

      setTopServicios(resTopServicios);

      setEstadoTurnosChart([
        { name: 'Confirmados / Señados', value: resKpis.turnosCompletados },
        { name: 'Pendiente Seña', value: resKpis.turnosPendienteSena },
        { name: 'Cancelados', value: resKpis.turnosCancelados },
      ]);
    } catch (err) {
      console.error('Error cargando métricas:', err);
    } finally {
      setCargando(false);
    }
  }, [fechaInicio, fechaFin, autenticado]);

  useEffect(() => {
    cargarMetricas();
  }, [cargarMetricas]);

  if (cargandoSesion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-xs font-semibold">
          <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
          <span>Verificando permisos...</span>
        </div>
      </div>
    );
  }

  if (!autenticado) return null;

  // Solo UI: rango legible para el chip del hero (dd/mm/aaaa)
  const formatearFecha = (iso: string) => iso.split('-').reverse().join('/');

 return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 transition-colors pb-12">
      
      {/* 🟦🟪 HERO FINTECH: DEGRADADO AZUL → ÍNDIGO → VIOLETA CON ORBES DE LUZ */}
      <div className="relative bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-600 dark:from-blue-950 dark:via-indigo-950 dark:to-zinc-900 pb-24 shadow-lg text-white transition-colors">
        {/* Orbes decorativos (capa recortada propia, no interactiva) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-sky-400/30 blur-3xl" />
          <div className="absolute -right-20 top-2 h-72 w-72 rounded-full bg-fuchsia-400/25 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent" />
        </div>

        <motion.div
          variants={contenedorVariants}
          initial="hidden"
          animate="show"
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4"
        >
          
          {/* Encabezado con Botón de Volver al lado del Título */}
          <motion.div variants={heroVariants} className="flex items-center gap-3.5">
            <motion.div
              whileTap={{ scale: 0.92 }}
              whileHover={reducirMovimiento ? undefined : { x: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="shrink-0"
            >
              <Link
                href="/admin"
                className="flex p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl border border-white/25 transition-colors shadow-xs cursor-pointer"
                title="Volver al Menú Admin"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </Link>
            </motion.div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                Métricas del Negocio
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
              </h1>
              <p className="text-xs text-blue-100/80 mt-0.5">
                Rendimiento en tiempo real sincronizado con tus reservas y turnos
              </p>
            </div>
          </motion.div>

          {/* Chips de estado (datos reales de la carga actual) */}
          <motion.div variants={heroVariants} className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/90 backdrop-blur-md">
              {cargando ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Actualizando
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Sincronizado
                </>
              )}
            </span>

            {fechaInicio && fechaFin && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold tabular-nums text-white/90 backdrop-blur-md">
                <CalendarDays className="h-3 w-3" />
                {fechaInicio === fechaFin
                  ? formatearFecha(fechaInicio)
                  : `${formatearFecha(fechaInicio)} – ${formatearFecha(fechaFin)}`}
              </span>
            )}

            <AnimatePresence>
              {!cargando && kpis.turnosPendienteSena > 0 && (
                <motion.span
                  key="pend-sena"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-200/40 bg-amber-400/20 px-3 py-1.5 text-[11px] font-bold text-amber-50 backdrop-blur-md"
                >
                  <span className="h-2 w-2 rounded-full bg-amber-300" />
                  <span className="font-black tabular-nums">{kpis.turnosPendienteSena}</span>
                  {kpis.turnosPendienteSena === 1 ? 'turno pendiente de seña' : 'turnos pendientes de seña'}
                </motion.span>
              )}

              {!cargando && kpis.turnosCancelados > 0 && (
                <motion.span
                  key="cancelados"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-500/25 px-3 py-1.5 text-[11px] font-bold text-rose-50 backdrop-blur-md"
                >
                  <span className="h-2 w-2 rounded-full bg-rose-300" />
                  <span className="font-black tabular-nums">{kpis.turnosCancelados}</span>
                  {kpis.turnosCancelados === 1 ? 'cancelado' : 'cancelados'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Selector de Rango de Fechas */}
          <motion.div variants={heroVariants} className="pt-1">
            <DateRangePicker
              rangoSeleccionado={rango}
              setRangoSeleccionado={setRango}
              fechaInicio={fechaInicio}
              setFechaInicio={setFechaInicio}
              fechaFin={fechaFin}
              setFechaFin={setFechaFin}
            />
          </motion.div>

          {/* Navegación por Pestañas Translúcida con indicador deslizante */}
          <motion.div variants={heroVariants} className="pt-1">
            <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 inline-flex items-center gap-1.5 shadow-inner overflow-x-auto max-w-full">
              {TABS.map((tab) => {
                const Icono = tab.icono;
                const activa = tabActiva === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    type="button"
                    onClick={() => setTabActiva(tab.id)}
                    whileTap={{ scale: 0.95 }}
                    aria-current={activa ? 'page' : undefined}
                    className={`relative flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                      activa
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : 'text-white/80 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    {activa && (
                      <motion.span
                        layoutId="metricas-tab-activa"
                        transition={
                          reducirMovimiento
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 420, damping: 32 }
                        }
                        className="absolute inset-0 rounded-xl bg-white shadow-md dark:bg-zinc-900"
                      />
                    )}
                    <Icono className="relative z-10 w-4 h-4" />
                    <span className="relative z-10">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

        </motion.div>
      </div>


      {/* ⬜ CONTENEDOR FLOTANTE PRINCIPAL (-mt-14 sobre el hero) */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 space-y-6">
        <AnimatePresence mode="wait" initial={false}>
          {cargando ? (
            <motion.div
              key="cargando"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 rounded-[28px] p-8 sm:p-12 shadow-xl"
            >
              <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-bold">Cargando métricas de Supabase...</span>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-zinc-800/70"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={tabActiva}
              variants={contenedorVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
              className="space-y-6"
            >
              {/* Pestaña 1: Visión General */}
              {tabActiva === 'general' && (
                <>
                  <Seccion>
                    <KpiCards
                      data={{
                        ingresosTotales: kpis.ingresosTotales,
                        ingresosVariacion: kpis.ingresosVariacion,
                        turnosTotales: kpis.totalTurnos,
                        turnosVariacion: kpis.turnosVariacion,
                        ticketPromedio: kpis.ticketPromedio,
                        ticketVariacion: kpis.ticketVariacion,
                        senasTotales: kpis.senasTotales,
                        senasVariacion: kpis.senasVariacion,
                      }}
                      loading={cargando}
                    />
                  </Seccion>

                  <Seccion>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <RevenueChart data={serieIngresos} />
                      </div>
                      <div>
                        <AppointmentsChart data={estadoTurnosChart} />
                      </div>
                    </div>
                  </Seccion>

                  <Seccion>
                    <OrigenFinanzasCard 
                      origen={origenReservas} 
                      mediosPago={impactoFinanciero} 
                      loading={cargando} 
                    />
                  </Seccion>
                </>
              )}

              {/* Pestaña 2: Servicios y Cobros */}
              {tabActiva === 'ventas' && (
                <>
                  <Seccion>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div>
                        <MediosPagoCard data={mediosPago} loading={cargando} />
                      </div>
                      <div className="lg:col-span-2">
                        <GraficoTopServicios data={topServicios} />
                      </div>
                    </div>
                  </Seccion>

                  <Seccion>
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 rounded-[28px] p-6 shadow-xl">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 tracking-tight mb-4">
                        Productos Más Vendidos
                      </h3>
                      {topProductos.length === 0 ? (
                        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400">
                          No hay ventas de productos registradas en este período.
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                          {topProductos.map((prod, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.15 + idx * 0.06 }}
                              className="group py-3.5 flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`flex items-center justify-center w-7 h-7 rounded-xl font-bold text-xs border transition-transform duration-200 group-hover:scale-110 ${
                                    idx === 0
                                      ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-transparent shadow-md shadow-indigo-500/30'
                                      : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40'
                                  }`}
                                >
                                  {idx + 1}
                                </span>
                                <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs sm:text-sm">
                                  {prod.nombre}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-black text-slate-900 dark:text-zinc-100 block font-mono text-xs sm:text-sm">
                                  ${prod.total.toLocaleString('es-AR')}
                                </span>
                                <span className="text-[11px] font-medium text-slate-400">
                                  {prod.cantidad} {prod.cantidad === 1 ? 'unidad' : 'unidades'}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Seccion>

                  <Seccion>
                    <CrossSellingCard data={crossSelling} loading={cargando} />
                  </Seccion>
                </>
              )}

              {/* Pestaña 3: Rubros y Días */}
              {tabActiva === 'agenda' && (
                <>
                  <Seccion>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div>
                        <CategoriasCard data={comparativaCat} loading={cargando} />
                      </div>
                      <div className="lg:col-span-2">
                        <GraficoDiasSemana data={diasSemana} loading={cargando} />
                      </div>
                    </div>
                  </Seccion>

                  <Seccion>
                    <FranjasHorariasCard franjas={franjasHorarias} noShow={noShow} loading={cargando} />
                  </Seccion>
                </>
              )}

              {/* Pestaña 4: Análisis de Clientes */}
              {tabActiva === 'clientes' && (
                <Seccion>
                  <ClienteAnalisisTab />
                </Seccion>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}