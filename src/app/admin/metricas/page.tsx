'use client';

import { useState, useEffect, useCallback } from 'react';
import DateRangePicker, { RangoFecha } from './components/DateRangePicker';
import RevenueChart from './components/RevenueChart';
import AppointmentsChart from './components/AppointmentsChart';
import GraficoTopServicios from './components/GraficoTopServicios';
import KpiCards from './components/KpiCards';
import MediosPagoCard from './components/MediosPagoCard';
import CategoriasCard from './components/CategoriasCard';
import GraficoDiasSemana from './components/GraficoDiasSemana';
import { Loader2, LayoutDashboard, BarChart3, CalendarDays } from 'lucide-react';
import {
  getKpisReservas,
  getTopServicios,
  getSerieEvolucionIngresos,
  getDesgloseMediosPago,
  getComparativaCategorias,
  getDistribucionDiasSemana,
  getTopProductos, // <-- IMPORTADO
  KpisResumen,
  ServicioTop,
  SerieIngresosPorFecha,
  DesgloseMedioPago,
  ComparativaCategorias,
  DistribucionDiaSemana,
  ProductoTop, // <-- IMPORTADO
} from '@/lib/admin/metricas';

type TabTipo = 'general' | 'ventas' | 'agenda';

export default function MetricasPage() {
  const [tabActiva, setTabActiva] = useState<TabTipo>('general');
  const [rango, setRango] = useState<RangoFecha>('mes');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(true);

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

  // Estados Gráficos
  const [serieIngresos, setSerieIngresos] = useState<{ fecha: string; total: number }[]>([]);
  const [topServicios, setTopServicios] = useState<ServicioTop[]>([]);
  const [topProductos, setTopProductos] = useState<ProductoTop[]>([]); // <-- NUEVO ESTADO
  const [estadoTurnosChart, setEstadoTurnosChart] = useState<{ name: string; value: number }[]>([]);

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
    if (!fechaInicio || !fechaFin) return;
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
        resTopProductos, // <-- AGREGADO AL PROMISE.ALL
      ] = await Promise.all([
        getKpisReservas(rangoParam),
        getTopServicios(rangoParam, 5),
        getSerieEvolucionIngresos(rangoParam),
        getDesgloseMediosPago(rangoParam),
        getComparativaCategorias(rangoParam),
        getDistribucionDiasSemana(rangoParam),
        getTopProductos(rangoParam, 5), // <-- LLAMADA
      ]);

      setKpis(resKpis);
      setMediosPago(resMediosPago);
      setComparativaCat(resCategorias);
      setDiasSemana(resDiasSemana);
      setTopProductos(resTopProductos); // <-- SET DEL ESTADO

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
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    cargarMetricas();
  }, [cargarMetricas]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">
            Métricas del Negocio
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Rendimiento en tiempo real sincronizado con tus reservas y turnos
          </p>
        </div>
      </div>

      {/* Selector de Rango de Fechas */}
      <DateRangePicker
        rangoSeleccionado={rango}
        setRangoSeleccionado={setRango}
        fechaInicio={fechaInicio}
        setFechaInicio={setFechaInicio}
        fechaFin={fechaFin}
        setFechaFin={setFechaFin}
      />

      {/* Navegación por Pestañas */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-1">
        <button
          onClick={() => setTabActiva('general')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            tabActiva === 'general'
              ? 'bg-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-none'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          General
        </button>

        <button
          onClick={() => setTabActiva('ventas')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            tabActiva === 'ventas'
              ? 'bg-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-none'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Servicios y Cobros
        </button>

        <button
          onClick={() => setTabActiva('agenda')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            tabActiva === 'agenda'
              ? 'bg-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-none'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Rubros y Días
        </button>
      </div>

      {cargando ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <span className="text-sm font-medium">Cargando métricas de Supabase...</span>
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

              {/* Lista/Tarjeta de Productos Más Vendidos */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 mb-4">
                  Productos Más Vendidos
                </h3>
                {topProductos.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-zinc-400">
                    No hay ventas de productos registradas en este período.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {topProductos.map((prod, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 font-bold text-xs">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-slate-700 dark:text-zinc-200">
                            {prod.nombre}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-800 dark:text-zinc-100 block">
                            ${prod.total.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400">
                            {prod.cantidad} {prod.cantidad === 1 ? 'unidad' : 'unidades'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pestaña 3: Rubros y Días */}
          {tabActiva === 'agenda' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <CategoriasCard data={comparativaCat} loading={cargando} />
              </div>
              <div className="lg:col-span-2">
                <GraficoDiasSemana data={diasSemana} loading={cargando} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}