import type { ConfiguracionCalendario, Reserva } from '../types';
import { calcularSlotsDisponibles } from '../calendario/slots';
import { fechaDeReserva } from './validacion';
import { supabase } from '../supabase';

// ==========================================
// FUNCIONES EXISTENTES DE MÉTRICAS RÁPIDAS
// ==========================================

export function citasHoy(reservas: Reserva[]): Reserva[] {
  const hoy = new Date();
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  return reservas.filter(
    (r) =>
      fechaDeReserva(r.fecha_hora_inicio) === hoyStr &&
      r.estado !== 'cancelado'
  );
}

export function pendientesSena(reservas: Reserva[]): number {
  return reservas.filter((r) => r.estado === 'pendiente_sena').length;
}

export function proximosTurnos(reservas: Reserva[], limite = 8): Reserva[] {
  const ahora = Date.now();
  return reservas
    .filter(
      (r) =>
        new Date(r.fecha_hora_inicio).getTime() >= ahora &&
        r.estado !== 'cancelado'
    )
    .sort((a, b) => new Date(a.fecha_hora_inicio).getTime() - new Date(b.fecha_hora_inicio).getTime())
    .slice(0, limite);
}

export function proximaJornadaLaser(
  reservas: Reserva[],
  configLaser: ConfiguracionCalendario | null
): { fecha: string | null; ocupacionPct: number; reservasDia: number } {
  if (!configLaser) return { fecha: null, ocupacionPct: 0, reservasDia: 0 };

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

  const fechas = (configLaser.fechas_habilitadas_laser ?? [])
    .map((f) => String(f).slice(0, 10))
    .filter((f) => f >= hoyStr)
    .sort();

  const proxima = fechas[0] ?? null;
  if (!proxima) return { fecha: null, ocupacionPct: 0, reservasDia: 0 };

  const delDia = reservas.filter(
    (r) =>
      r.servicio_tipo === 'laser' &&
      fechaDeReserva(r.fecha_hora_inicio) === proxima &&
      r.estado !== 'cancelado'
  );

  const minutosReservados = delDia.reduce((acc, r) => acc + r.duracion_total, 0);

  const slots = calcularSlotsDisponibles(proxima, 15, configLaser.horarios_atencion, []);
  const minutosDisponibles = slots.length * 15;

  const pctReal =
    minutosReservados + minutosDisponibles > 0
      ? Math.round((minutosReservados / (minutosReservados + minutosDisponibles)) * 100)
      : 0;

  return { fecha: proxima, ocupacionPct: pctReal, reservasDia: delDia.length };
}

export function minutosDisponiblesDia(fecha: string, config: ConfiguracionCalendario): number {
  const slots15 = calcularSlotsDisponibles(fecha, 15, config.horarios_atencion, []);
  return slots15.length * 15;
}

// ==========================================
// CONSULTAS Y TIPOS EXPORTADOS PARA DASHBOARD
// ==========================================

export interface RangoFechas {
  desde: string;
  hasta: string;
}

export interface KpisResumen {
  ingresosTotales: number;
  ingresosVariacion: number;
  totalTurnos: number;
  turnosVariacion: number;
  ticketPromedio: number;
  ticketVariacion: number;
  senasTotales: number;
  senasVariacion: number;
  turnosCompletados: number;
  turnosPendienteSena: number;
  turnosCancelados: number;
  tasaAsistencia: number;
}

export interface ServicioTop {
  nombre: string;
  cantidad: number;
  montoTotal: number;
}

export interface MetricaMetodoPago {
  metodo: string;
  monto: number;
  cantidad: number;
}

export interface SerieIngresosPorFecha {
  fecha: string;
  ingresos: number;
  turnos: number;
}

/**
 * Obtiene los KPIs de resumen financiero, señas y la variación vs el período anterior
 */
export async function getKpisReservas(rango: RangoFechas): Promise<KpisResumen> {
  const desde = new Date(`${rango.desde}T00:00:00`);
  const hasta = new Date(`${rango.hasta}T23:59:59`);

  const diffTiempo = hasta.getTime() - desde.getTime();
  const desdeAnteriorTS = new Date(desde.getTime() - diffTiempo).toISOString();

  const { data: reservas, error } = await supabase
    .from('reservas')
    .select('precio_total, monto_sena, monto_abonado, estado, fecha_hora_inicio, eliminado')
    .gte('fecha_hora_inicio', desdeAnteriorTS)
    .lte('fecha_hora_inicio', hasta.toISOString())
    .or('eliminado.eq.false,eliminado.is.null');

  if (error || !reservas) {
    console.error('Error cargando KPIs de reservas:', error);
    return {
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
    };
  }

  const desdeActualIso = desde.toISOString();

  const actual = reservas.filter((r) => r.fecha_hora_inicio >= desdeActualIso);
  const anterior = reservas.filter((r) => r.fecha_hora_inicio < desdeActualIso);

  const esValido = (r: (typeof reservas)[0]) => r.estado !== 'cancelado';

  // --- Período Actual ---
  const validosActual = actual.filter(esValido);
  const ingresosTotales = validosActual.reduce(
    (sum, r) => sum + Number(r.monto_abonado || r.precio_total || 0),
    0
  );
  const senasTotales = validosActual.reduce(
    (sum, r) => sum + Number(r.monto_sena || 0),
    0
  );
  const totalTurnos = actual.length;
  const turnosValidosCount = validosActual.length;
  const ticketPromedio =
    turnosValidosCount > 0 ? Math.round(ingresosTotales / turnosValidosCount) : 0;

  const turnosCompletadosCount = actual.filter(
    (r) => r.estado === 'confirmado' || r.estado === 'atendido' || r.estado === 'completado'
  ).length;

  const turnosPendienteSena = actual.filter(
    (r) => r.estado === 'pendiente_sena' || r.estado === 'pendiente'
  ).length;

  const turnosCancelados = actual.filter((r) => r.estado === 'cancelado').length;

  const tasaAsistencia =
    totalTurnos > 0 ? Math.round((turnosCompletadosCount / totalTurnos) * 100) : 0;

  // --- Período Anterior ---
  const validosAnterior = anterior.filter(esValido);
  const ingresosAnterior = validosAnterior.reduce(
    (sum, r) => sum + Number(r.monto_abonado || r.precio_total || 0),
    0
  );
  const senasAnterior = validosAnterior.reduce(
    (sum, r) => sum + Number(r.monto_sena || 0),
    0
  );
  const turnosAnteriorCount = validosAnterior.length;
  const ticketAnterior =
    turnosAnteriorCount > 0 ? Math.round(ingresosAnterior / turnosAnteriorCount) : 0;

  const calcVar = (act: number, ant: number) => {
    if (ant === 0) return act > 0 ? 100 : 0;
    return Number((((act - ant) / ant) * 100).toFixed(1));
  };

  return {
    ingresosTotales,
    ingresosVariacion: calcVar(ingresosTotales, ingresosAnterior),
    totalTurnos: turnosValidosCount,
    turnosVariacion: calcVar(turnosValidosCount, turnosAnteriorCount),
    ticketPromedio,
    ticketVariacion: calcVar(ticketPromedio, ticketAnterior),
    senasTotales,
    senasVariacion: calcVar(senasTotales, senasAnterior),
    turnosCompletados: turnosCompletadosCount,
    turnosPendienteSena,
    turnosCancelados,
    tasaAsistencia,
  };
}

/**
 * Obtiene el ranking de los servicios/tratamientos más solicitados
 */
export async function getTopServicios(rango: RangoFechas, limite = 5): Promise<ServicioTop[]> {
  const desdeTS = `${rango.desde}T00:00:00`;
  const hastaTS = `${rango.hasta}T23:59:59`;

  const { data: reservas, error } = await supabase
    .from('reservas')
    .select('servicio_tipo, detalle_reserva, precio_total, estado')
    .gte('fecha_hora_inicio', desdeTS)
    .lte('fecha_hora_inicio', hastaTS);

  if (error || !reservas) {
    console.error('Error obteniendo top servicios:', error);
    return [];
  }

  const acumulador: Record<string, { cantidad: number; montoTotal: number }> = {};

  reservas
    .filter((r) => r.estado !== 'cancelado')
    .forEach((res) => {
      const detalleObj = typeof res.detalle_reserva === 'object' && res.detalle_reserva !== null ? res.detalle_reserva : {};
      const nombre = (detalleObj as { detalle_texto?: string }).detalle_texto || 
                     (res.servicio_tipo === 'laser' ? 'Depilación Láser' : 'Estética General');
      
      const precio = Number(res.precio_total) || 0;

      if (!acumulador[nombre]) {
        acumulador[nombre] = { cantidad: 0, montoTotal: 0 };
      }
      acumulador[nombre].cantidad += 1;
      acumulador[nombre].montoTotal += precio;
    });

  return Object.entries(acumulador)
    .map(([nombre, stat]) => ({
      nombre,
      cantidad: stat.cantidad,
      montoTotal: stat.montoTotal,
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, limite);
}

/**
 * Evolución de ingresos día a día dentro del rango
 */
export async function getSerieEvolucionIngresos(rango: RangoFechas): Promise<SerieIngresosPorFecha[]> {
  const desdeTS = `${rango.desde}T00:00:00`;
  const hastaTS = `${rango.hasta}T23:59:59`;

  const { data: reservas, error } = await supabase
    .from('reservas')
    .select('fecha_hora_inicio, precio_total, estado')
    .gte('fecha_hora_inicio', desdeTS)
    .lte('fecha_hora_inicio', hastaTS)
    .order('fecha_hora_inicio', { ascending: true });

  if (error || !reservas) return [];

  const porDia: Record<string, { ingresos: number; turnos: number }> = {};

  reservas
    .filter((r) => r.estado !== 'cancelado')
    .forEach((res) => {
      const fecha = res.fecha_hora_inicio.slice(0, 10);
      const precio = Number(res.precio_total) || 0;

      if (!porDia[fecha]) {
        porDia[fecha] = { ingresos: 0, turnos: 0 };
      }
      porDia[fecha].ingresos += precio;
      porDia[fecha].turnos += 1;
    });

  return Object.entries(porDia).map(([fecha, datos]) => ({
    fecha,
    ingresos: datos.ingresos,
    turnos: datos.turnos,
  }));
}

// Agregá este tipo al bloque de tipos exportados en metricas.ts
export interface DesgloseMedioPago {
  medio: string;
  monto: number;
  cantidad: number;
  porcentaje: number;
}

/**
 * Obtiene la distribución de ingresos agrupada por medio de pago
 */
export async function getDesgloseMediosPago(rango: RangoFechas): Promise<DesgloseMedioPago[]> {
  const desdeTS = `${rango.desde}T00:00:00`;
  const hastaTS = `${rango.hasta}T23:59:59`;

  const { data: reservas, error } = await supabase
    .from('reservas')
    .select('medio_pago, metodo_pago, tipo_pago_elegido, monto_abonado, precio_total, estado, eliminado')
    .gte('fecha_hora_inicio', desdeTS)
    .lte('fecha_hora_inicio', hastaTS)
    .or('eliminado.eq.false,eliminado.is.null');

  if (error || !reservas) {
    console.error('Error cargando medios de pago:', error);
    return [];
  }

  const validas = reservas.filter((r) => r.estado !== 'cancelado');
  const acumulador: Record<string, { monto: number; cantidad: number }> = {};
  let montoTotalGlobal = 0;

  validas.forEach((res) => {
    // Tomamos la columna disponible que contenga el medio (ej: 'efectivo', 'transferencia', 'mercadopago')
    let medio = (res.medio_pago || res.metodo_pago || res.tipo_pago_elegido || 'no_definido')
      .toLowerCase()
      .trim();

    // Normalización de etiquetas para la UI
    if (medio.includes('efect') || medio === 'cash') medio = 'Efectivo';
    else if (medio.includes('transf') || medio.includes('cbu') || medio.includes('alias')) medio = 'Transferencia';
    else if (medio.includes('mp') || medio.includes('mercado')) medio = 'Mercado Pago';
    else medio = 'Otro / No Especificado';

    const monto = Number(res.monto_abonado || res.precio_total || 0);

    if (!acumulador[medio]) {
      acumulador[medio] = { monto: 0, cantidad: 0 };
    }
    acumulador[medio].monto += monto;
    acumulador[medio].cantidad += 1;
    montoTotalGlobal += monto;
  });

  return Object.entries(acumulador)
    .map(([medio, stat]) => ({
      medio,
      monto: stat.monto,
      cantidad: stat.cantidad,
      porcentaje: montoTotalGlobal > 0 ? Number(((stat.monto / montoTotalGlobal) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.monto - a.monto);
}

// ==========================================
// NUEVOS TIPOS ETAPA 3
// ==========================================

export interface ComparativaCategorias {
  laser: { turnos: number; ingresos: number; porcentajeIngresos: number };
  estetica: { turnos: number; ingresos: number; porcentajeIngresos: number };
}

export interface DistribucionDiaSemana {
  dia: string;
  turnos: number;
  ingresos: number;
}

/**
 * Compara el rendimiento de Depilación Láser vs. Estética General
 */
export async function getComparativaCategorias(rango: RangoFechas): Promise<ComparativaCategorias> {
  const desdeTS = `${rango.desde}T00:00:00`;
  const hastaTS = `${rango.hasta}T23:59:59`;

  const { data: reservas, error } = await supabase
    .from('reservas')
    .select('servicio_tipo, precio_total, monto_abonado, estado, eliminado')
    .gte('fecha_hora_inicio', desdeTS)
    .lte('fecha_hora_inicio', hastaTS)
    .or('eliminado.eq.false,eliminado.is.null');

  if (error || !reservas) {
    console.error('Error cargando comparativa de categorías:', error);
    return {
      laser: { turnos: 0, ingresos: 0, porcentajeIngresos: 0 },
      estetica: { turnos: 0, ingresos: 0, porcentajeIngresos: 0 },
    };
  }

  const validas = reservas.filter((r) => r.estado !== 'cancelado');

  let laserTurnos = 0;
  let laserIngresos = 0;
  let esteticaTurnos = 0;
  let esteticaIngresos = 0;

  validas.forEach((r) => {
    const monto = Number(r.monto_abonado || r.precio_total || 0);
    if (r.servicio_tipo === 'laser') {
      laserTurnos += 1;
      laserIngresos += monto;
    } else {
      esteticaTurnos += 1;
      esteticaIngresos += monto;
    }
  });

  const ingresosTotales = laserIngresos + esteticaIngresos;

  return {
    laser: {
      turnos: laserTurnos,
      ingresos: laserIngresos,
      porcentajeIngresos: ingresosTotales > 0 ? Number(((laserIngresos / ingresosTotales) * 100).toFixed(1)) : 0,
    },
    estetica: {
      turnos: esteticaTurnos,
      ingresos: esteticaIngresos,
      porcentajeIngresos: ingresosTotales > 0 ? Number(((esteticaIngresos / ingresosTotales) * 100).toFixed(1)) : 0,
    },
  };
}

/**
 * Analiza la carga de turnos e ingresos según el día de la semana
 */
export async function getDistribucionDiasSemana(rango: RangoFechas): Promise<DistribucionDiaSemana[]> {
  const desdeTS = `${rango.desde}T00:00:00`;
  const hastaTS = `${rango.hasta}T23:59:59`;

  const { data: reservas, error } = await supabase
    .from('reservas')
    .select('fecha_hora_inicio, precio_total, monto_abonado, estado, eliminado')
    .gte('fecha_hora_inicio', desdeTS)
    .lte('fecha_hora_inicio', hastaTS)
    .or('eliminado.eq.false,eliminado.is.null');

  if (error || !reservas) {
    console.error('Error cargando distribución por día:', error);
    return [];
  }

  const diasNombre = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const acumulador: Record<number, { turnos: number; ingresos: number }> = {
    1: { turnos: 0, ingresos: 0 }, // Lunes
    2: { turnos: 0, ingresos: 0 }, // Martes
    3: { turnos: 0, ingresos: 0 }, // Miércoles
    4: { turnos: 0, ingresos: 0 }, // Jueves
    5: { turnos: 0, ingresos: 0 }, // Viernes
    6: { turnos: 0, ingresos: 0 }, // Sábado
    0: { turnos: 0, ingresos: 0 }, // Domingo
  };

  reservas
    .filter((r) => r.estado !== 'cancelado')
    .forEach((r) => {
      const fecha = new Date(r.fecha_hora_inicio);
      const diaSemana = fecha.getDay();
      const monto = Number(r.monto_abonado || r.precio_total || 0);

      acumulador[diaSemana].turnos += 1;
      acumulador[diaSemana].ingresos += monto;
    });

  // Ordenamos arrancando de Lunes (1) a Domingo (0)
  const ordenDias = [1, 2, 3, 4, 5, 6, 0];

  return ordenDias.map((d) => ({
    dia: diasNombre[d],
    turnos: acumulador[d].turnos,
    ingresos: acumulador[d].ingresos,
  }));
}

export interface ProductoTop {
  nombre: string;
  cantidad: number;
  total: number;
}

/**
 * Obtiene los productos más vendidos consultando 'pedido_items' y 'pedidos'
 */
export async function getTopProductos(
  rango: { desde: string; hasta: string },
  limite = 5
): Promise<ProductoTop[]> {
  const desdeTS = `${rango.desde}T00:00:00`;
  const hastaTS = `${rango.hasta}T23:59:59`;

  // Consultamos pedido_items haciendo inner join con la tabla pedidos
  const { data, error } = await supabase
    .from('pedido_items')
    .select(`
      nombre_producto,
      cantidad,
      precio_unitario,
      pedido:pedidos!inner (
        created_at,
        estado
      )
    `)
    .gte('pedido.created_at', desdeTS)
    .lte('pedido.created_at', hastaTS)
    .neq('pedido.estado', 'cancelado') // Excluimos pedidos cancelados/anulados
    .neq('pedido.estado', 'anulado');

  if (error || !data) {
    console.error('Error al obtener top productos:', error);
    return [];
  }

  // Agrupamos y sumamos por nombre_producto
  const mapProductos: Record<string, { cantidad: number; total: number }> = {};

  data.forEach((item: any) => {
    const nombre = item.nombre_producto || 'Producto sin nombre';
    const cant = Number(item.cantidad) || 0;
    const precio = Number(item.precio_unitario) || 0;
    const subtotal = cant * precio;

    if (!mapProductos[nombre]) {
      mapProductos[nombre] = { cantidad: 0, total: 0 };
    }
    mapProductos[nombre].cantidad += cant;
    mapProductos[nombre].total += subtotal;
  });

  // Ordenamos por cantidad vendida de mayor a menor y limitamos los resultados
  return Object.entries(mapProductos)
    .map(([nombre, stat]) => ({
      nombre,
      cantidad: stat.cantidad,
      total: stat.total,
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, limite);
}

export interface MetricaNoShow {
  totalReservas: number;
  canceladas: number;
  porcentajeCanceladas: number;
}

export interface DistribucionFranjaHoraria {
  franja: 'Mañana (8-12h)' | 'Mediodía (12-16h)' | 'Tarde (16-20h)' | 'Noche (20h+)';
  turnos: number;
}

/**
 * Obtiene la tasa de cancelaciones y ausentismo dentro del rango seleccionado
 */
export async function getTasaNoShow(rango: { desde: string; hasta: string }): Promise<MetricaNoShow> {
  // Construimos las fechas límite en formato ISO UTC
  const desdeISO = new Date(`${rango.desde}T00:00:00`).toISOString();
  const hastaISO = new Date(`${rango.hasta}T23:59:59.999`).toISOString();

  // Consultamos usando la columna correcta: fecha_hora_inicio
  const { data, error } = await supabase
    .from('reservas')
    .select('id, estado, estado_pago, eliminado, fecha_hora_inicio')
    .gte('fecha_hora_inicio', desdeISO)
    .lte('fecha_hora_inicio', hastaISO);

  if (error || !data) {
    console.error('Error al obtener tasa de no-show:', error);
    return { totalReservas: 0, canceladas: 0, porcentajeCanceladas: 0 };
  }

  const totalReservas = data.length;

  // Verificamos si está cancelado por 'estado', 'estado_pago' o si fue marcado en 'eliminado'
  const canceladas = data.filter((r) => {
    const estadoStr = r.estado?.toString().toLowerCase().trim() || '';
    const estadoPagoStr = r.estado_pago?.toString().toLowerCase().trim() || '';
    
    const esCancelado = 
      estadoStr === 'cancelado' || 
      estadoStr === 'cancelada' ||
      estadoPagoStr === 'cancelado' ||
      r.eliminado === true;

    return esCancelado;
  }).length;

  const porcentajeCanceladas =
    totalReservas > 0 ? Number(((canceladas / totalReservas) * 100).toFixed(1)) : 0;

  return { totalReservas, canceladas, porcentajeCanceladas };
}

/**
 * Obtiene la distribución de turnos agrupados por franja horaria
 */
export async function getDistribucionFranjasHorarias(
  rango: { desde: string; hasta: string }
): Promise<DistribucionFranjaHoraria[]> {
  const desdeISO = new Date(`${rango.desde}T00:00:00`).toISOString();
  const hastaISO = new Date(`${rango.hasta}T23:59:59.999`).toISOString();

  const { data, error } = await supabase
    .from('reservas')
    .select('fecha_hora_inicio, estado, eliminado')
    .gte('fecha_hora_inicio', desdeISO)
    .lte('fecha_hora_inicio', hastaISO);

  if (error || !data) {
    console.error('Error al obtener franjas horarias:', error);
    return [];
  }

  // Filtrar cancelados o eliminados
  const reservasValidas = data.filter((r) => {
    const est = r.estado?.toString().toLowerCase().trim();
    return est !== 'cancelado' && est !== 'cancelada' && !r.eliminado;
  });

  const franjas: Record<string, number> = {
    'Mañana (8-12h)': 0,
    'Mediodía (12-16h)': 0,
    'Tarde (16-20h)': 0,
    'Noche (20h+)': 0,
  };

  reservasValidas.forEach((item) => {
    if (!item.fecha_hora_inicio) return;
    
    // Convertir la fecha a hora local del navegador/servidor
    const hora = new Date(item.fecha_hora_inicio).getHours();

    if (hora >= 8 && hora < 12) franjas['Mañana (8-12h)']++;
    else if (hora >= 12 && hora < 16) franjas['Mediodía (12-16h)']++;
    else if (hora >= 16 && hora < 20) franjas['Tarde (16-20h)']++;
    else if (hora >= 20 || hora < 8) franjas['Noche (20h+)']++;
  });

  return Object.entries(franjas).map(([franja, turnos]) => ({
    franja: franja as any,
    turnos,
  }));
}

// ==========================================
// ETAPA 3: CROSS-SELLING Y TICKET DESGLOSADO
// ==========================================

export interface MetricaCrossSelling {
  totalTurnos: number;
  turnosConProducto: number;
  tasaConversion: number;
  ticketMedioSoloServicio: number;
  ticketMedioConProducto: number;
}

export async function getMetricasCrossSelling(rango: { desde: string; hasta: string }): Promise<MetricaCrossSelling> {
  const desdeISO = new Date(`${rango.desde}T00:00:00`).toISOString();
  const hastaISO = new Date(`${rango.hasta}T23:59:59.999`).toISOString();

  // Consultar reservas del período
  const { data: reservas, error } = await supabase
    .from('reservas')
    .select('id, precio_total, detalle_reserva, estado, eliminado')
    .gte('fecha_hora_inicio', desdeISO)
    .lte('fecha_hora_inicio', hastaISO);

  if (error || !reservas) {
    console.error('Error al obtener métricas de cross-selling:', error);
    return {
      totalTurnos: 0,
      turnosConProducto: 0,
      tasaConversion: 0,
      ticketMedioSoloServicio: 0,
      ticketMedioConProducto: 0,
    };
  }

  const reservasValidas = reservas.filter((r) => {
    const est = r.estado?.toString().toLowerCase().trim();
    return est !== 'cancelado' && est !== 'cancelada' && !r.eliminado;
  });

  const totalTurnos = reservasValidas.length;
  if (totalTurnos === 0) {
    return {
      totalTurnos: 0,
      turnosConProducto: 0,
      tasaConversion: 0,
      ticketMedioSoloServicio: 0,
      ticketMedioConProducto: 0,
    };
  }

  let turnosConProducto = 0;
  let sumaSoloServicio = 0;
  let conteoSoloServicio = 0;
  let sumaConProducto = 0;

  reservasValidas.forEach((r) => {
    const monto = Number(r.precio_total) || 0;
    // Verificar si en detalle_reserva existen productos
    const tieneProducto = Array.isArray(r.detalle_reserva?.productos) && r.detalle_reserva.productos.length > 0;

    if (tieneProducto) {
      turnosConProducto++;
      sumaConProducto += monto;
    } else {
      conteoSoloServicio++;
      sumaSoloServicio += monto;
    }
  });

  const tasaConversion = Number(((turnosConProducto / totalTurnos) * 100).toFixed(1));
  const ticketMedioSoloServicio = conteoSoloServicio > 0 ? Math.round(sumaSoloServicio / conteoSoloServicio) : 0;
  const ticketMedioConProducto = turnosConProducto > 0 ? Math.round(sumaConProducto / turnosConProducto) : 0;

  return {
    totalTurnos,
    turnosConProducto,
    tasaConversion,
    ticketMedioSoloServicio,
    ticketMedioConProducto,
  };
}

// ==========================================
// ETAPA 4: ORIGEN DE RESERVAS E IMPACTO FINANCIERO
// ==========================================

export interface DistribucionOrigen {
  origen: 'Web' | 'Manual (Admin)';
  cantidad: number;
  porcentaje: number;
}

export interface ImpactoMedioPago {
  medio: string;
  totalMonto: number;
  cantidad: number;
  porcentajeUso: number;
}

export async function getOrigenReservas(rango: { desde: string; hasta: string }): Promise<DistribucionOrigen[]> {
  const desdeISO = new Date(`${rango.desde}T00:00:00`).toISOString();
  const hastaISO = new Date(`${rango.hasta}T23:59:59.999`).toISOString();

  const { data, error } = await supabase
    .from('reservas')
    .select('modificado_por_admin, estado, eliminado')
    .gte('fecha_hora_inicio', desdeISO)
    .lte('fecha_hora_inicio', hastaISO);

  if (error || !data) return [];

  const validas = data.filter((r) => {
    const est = r.estado?.toString().toLowerCase().trim();
    return est !== 'cancelado' && est !== 'cancelada' && !r.eliminado;
  });

  const total = validas.length;
  if (total === 0) return [];

  const creadasAdmin = validas.filter((r) => r.modificado_por_admin === true).length;
  const creadasWeb = total - creadasAdmin;

  return [
    {
      origen: 'Web',
      cantidad: creadasWeb,
      porcentaje: Number(((creadasWeb / total) * 100).toFixed(1)),
    },
    {
      origen: 'Manual (Admin)',
      cantidad: creadasAdmin,
      porcentaje: Number(((creadasAdmin / total) * 100).toFixed(1)),
    },
  ];
}

export async function getImpactoFinancieroMediosPago(rango: { desde: string; hasta: string }): Promise<ImpactoMedioPago[]> {
  const desdeISO = new Date(`${rango.desde}T00:00:00`).toISOString();
  const hastaISO = new Date(`${rango.hasta}T23:59:59.999`).toISOString();

  const { data, error } = await supabase
    .from('reservas')
    .select('medio_pago, metodo_pago, precio_total, estado, eliminado')
    .gte('fecha_hora_inicio', desdeISO)
    .lte('fecha_hora_inicio', hastaISO);

  if (error || !data) return [];

  const validas = data.filter((r) => {
    const est = r.estado?.toString().toLowerCase().trim();
    return est !== 'cancelado' && est !== 'cancelada' && !r.eliminado;
  });

  const totalReservas = validas.length;
  if (totalReservas === 0) return [];

  const resumen: Record<string, { totalMonto: number; cantidad: number }> = {};

  validas.forEach((r) => {
    const medio = (r.medio_pago || r.metodo_pago || 'Otro').toLowerCase().trim();
    const nombreFormateado = medio.includes('mercadopago') || medio.includes('mp') 
      ? 'Mercado Pago' 
      : medio.includes('efectivo') 
      ? 'Efectivo' 
      : medio.includes('transfer') 
      ? 'Transferencia' 
      : 'Otro / No especificado';

    const monto = Number(r.precio_total) || 0;

    if (!resumen[nombreFormateado]) {
      resumen[nombreFormateado] = { totalMonto: 0, cantidad: 0 };
    }
    resumen[nombreFormateado].totalMonto += monto;
    resumen[nombreFormateado].cantidad += 1;
  });

  return Object.entries(resumen).map(([medio, val]) => ({
    medio,
    totalMonto: val.totalMonto,
    cantidad: val.cantidad,
    porcentajeUso: Number(((val.cantidad / totalReservas) * 100).toFixed(1)),
  }));
}