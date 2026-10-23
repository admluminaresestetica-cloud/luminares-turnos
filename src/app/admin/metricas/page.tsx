'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { ArrowLeft, Loader2, LayoutDashboard, BarChart3, CalendarDays } from 'lucide-react';

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

type TabTipo = 'general' | 'ventas' | 'agenda';

export default function MetricasPage() {
  const router = useRouter();
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

 return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 transition-colors pb-12">
      
      {/* 🟦 HERO CONTINUO SUPERIOR CON DEGRADADO AZUL FINTECH */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 dark:from-blue-950 dark:via-blue-900 dark:to-zinc-900 pb-20 shadow-lg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
          
          {/* Encabezado con Botón de Volver al lado del Título */}
          <div className="flex items-center gap-3.5">
            <Link
              href="/admin"
              className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl border border-white/25 transition-all active:scale-95 shadow-xs shrink-0 cursor-pointer"
              title="Volver al Menú Admin"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </Link>

            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Métricas del Negocio
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse shadow-xs" />
              </h1>
              <p className="text-xs text-blue-100/80 mt-0.5">
                Rendimiento en tiempo real sincronizado con tus reservas y turnos
              </p>
            </div>
          </div>

          {/* Selector de Rango de Fechas */}
          <div className="pt-2">
            <DateRangePicker
              rangoSeleccionado={rango}
              setRangoSeleccionado={setRango}
              fechaInicio={fechaInicio}
              setFechaInicio={setFechaInicio}
              fechaFin={fechaFin}
              setFechaFin={setFechaFin}
            />
          </div>

          {/* Navegación por Pestañas Translúcida (Estilo Fintech) */}
          <div className="pt-2">
            <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 inline-flex items-center gap-1.5 shadow-inner overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setTabActiva('general')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  tabActiva === 'general'
                    ? 'bg-white text-blue-700 shadow-md dark:bg-zinc-900 dark:text-blue-400'
                    : 'text-white/80 hover:text-white hover:bg-white/15'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                General
              </button>

              <button
                type="button"
                onClick={() => setTabActiva('ventas')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  tabActiva === 'ventas'
                    ? 'bg-white text-blue-700 shadow-md dark:bg-zinc-900 dark:text-blue-400'
                    : 'text-white/80 hover:text-white hover:bg-white/15'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Servicios y Cobros
              </button>

              <button
                type="button"
                onClick={() => setTabActiva('agenda')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  tabActiva === 'agenda'
                    ? 'bg-white text-blue-700 shadow-md dark:bg-zinc-900 dark:text-blue-400'
                    : 'text-white/80 hover:text-white hover:bg-white/15'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                Rubros y Días
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ⬜ CONTENEDOR FLOTANTE PRINCIPAL (-mt-12) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 space-y-6">
        {cargando ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-16 flex flex-col items-center justify-center gap-3 text-slate-400 shadow-xl">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold">Cargando métricas de Supabase...</span>
          </div>
        ) : (
          <>
            {/* Pestaña 1: Visión General */}
            {tabActiva === 'general' && (
              <div className="space-y-6">
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <RevenueChart data={serieIngresos} />
                  </div>
                  <div>
                    <AppointmentsChart data={estadoTurnosChart} />
                  </div>
                </div>

                <OrigenFinanzasCard 
                  origen={origenReservas} 
                  mediosPago={impactoFinanciero} 
                  loading={cargando} 
                />
              </div>
            )}

            {/* Pestaña 2: Servicios y Cobros */}
            {tabActiva === 'ventas' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <MediosPagoCard data={mediosPago} loading={cargando} />
                  </div>
                  <div className="lg:col-span-2">
                    <GraficoTopServicios data={topServicios} />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xl">
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
                        <div key={idx} className="py-3.5 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-200/60 dark:border-blue-800/40">
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <CrossSellingCard data={crossSelling} loading={cargando} />
              </div>
            )}

            {/* Pestaña 3: Rubros y Días */}
            {tabActiva === 'agenda' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <CategoriasCard data={comparativaCat} loading={cargando} />
                  </div>
                  <div className="lg:col-span-2">
                    <GraficoDiasSemana data={diasSemana} loading={cargando} />
                  </div>
                </div>

                <FranjasHorariasCard franjas={franjasHorarias} noShow={noShow} loading={cargando} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}