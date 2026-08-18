import type { ConfiguracionCalendario, Reserva } from '../types';
import { calcularSlotsDisponibles } from '../calendario/slots';
import { fechaDeReserva } from './validacion';

export function citasHoy(reservas: Reserva[]): Reserva[] {
  const hoy = new Date();
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  return reservas.filter(
    (r) =>
      fechaDeReserva(r.fecha_hora_inicio) === hoyStr &&
      r.estado !== 'cancelado' &&
      r.estado_asistencia !== 'cancelado'
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
        r.estado !== 'cancelado' &&
        r.estado_asistencia !== 'cancelado'
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
  const ocupacionPct =
    minutosDisponibles > 0
      ? Math.min(100, Math.round((minutosReservados / (minutosReservados + minutosDisponibles * 15 / 15)) * 100))
      : minutosReservados > 0
        ? 100
        : 0;

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
