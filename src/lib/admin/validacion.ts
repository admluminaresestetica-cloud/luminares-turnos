import { calcularSlotsDisponibles } from '../calendario/slots';
import type { ConfiguracionCalendario, Reserva } from '../types';

export function reservasMismoDia(reservas: Reserva[], fecha: string, excluirId?: string): Reserva[] {
  return reservas.filter((r) => {
    if (excluirId && r.id === excluirId) return false;
    if (r.estado === 'cancelado' || r.estado_asistencia === 'cancelado') return false;
    const d = new Date(r.fecha_hora_inicio);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return iso === fecha;
  });
}

export function validarSlotDisponible(
  fecha: string,
  hora: string,
  duracionMin: number,
  reservaId: string,
  todasReservas: Reserva[],
  config: ConfiguracionCalendario
): { ok: boolean; mensaje?: string } {
  const delDia = reservasMismoDia(todasReservas, fecha, reservaId);
  const slots = calcularSlotsDisponibles(fecha, duracionMin, config.horarios_atencion, delDia);

  if (!slots.includes(hora)) {
    return {
      ok: false,
      mensaje: `El horario ${hora} no está disponible. El turno de ${duracionMin} min se solapa con otra reserva o no entra en el bloque horario.`,
    };
  }

  return { ok: true };
}

export function fechaDeReserva(fechaIso: string): string {
  const d = new Date(fechaIso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function horaDeReserva(fechaIso: string): string {
  const d = new Date(fechaIso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
