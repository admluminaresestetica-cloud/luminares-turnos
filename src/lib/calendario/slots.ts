import type { Reserva } from '../types';

export interface HorarioDia {
  abierto: boolean;
  inicio: string;
  fin: string;
}

export interface HorariosAtencion {
  lunes?: HorarioDia;
  martes?: HorarioDia;
  miercoles?: HorarioDia;
  jueves?: HorarioDia;
  viernes?: HorarioDia;
  sabado?: HorarioDia;
  domingo?: HorarioDia;
  dias_semana?: number[];
  inicio?: string;
  fin?: string;
  bloques?: { inicio: string; fin: string }[];
  intervalo_minutos?: number;
}

function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getIsoWeekday(date: Date): number {
  const d = date.getDay();
  return d === 0 ? 7 : d;
}

export function isDateEnabled(
  date: Date,
  tipo: 'laser' | 'general',
  fechasLaser: string[],
  diasSemana: number[] = [1, 2, 3, 4, 5]
): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return false;

  if (tipo === 'laser') {
    return fechasLaser.includes(formatDateISO(date));
  }

  return diasSemana.includes(getIsoWeekday(date));
}

function hasOverlap(
  slotStart: Date,
  durationMin: number,
  reservas: Pick<Reserva, 'fecha_hora_inicio' | 'duracion_total' | 'estado'>[]
): boolean {
  const slotEnd = new Date(slotStart.getTime() + durationMin * 60_000);
  for (const r of reservas) {
    if (r.estado === 'cancelado') continue;
    const resStart = new Date(r.fecha_hora_inicio);
    const resEnd = new Date(resStart.getTime() + r.duracion_total * 60_000);
    if (slotStart < resEnd && slotEnd > resStart) return true;
  }
  return false;
}

export function calcularSlotsDisponibles(
  fecha: string,
  duracionMin: number,
  horarios: HorariosAtencion | any,
  reservas: Pick<Reserva, 'fecha_hora_inicio' | 'duracion_total' | 'estado'>[]
): string[] {
  if (!horarios) return [];

  let bloquesAtencion: { inicio: string; fin: string }[] = [];

  const diasNombres = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const [year, month, day] = fecha.split('-').map(Number);
  const fechaObj = new Date(year, month - 1, day);
  const nombreDia = diasNombres[fechaObj.getDay()];

  const configDia = horarios[nombreDia];

  if (configDia) {
    if (!configDia.abierto) return [];
    bloquesAtencion = [{ inicio: configDia.inicio, fin: configDia.fin }];
  } else if (horarios.inicio && horarios.fin) {
    bloquesAtencion = [{ inicio: horarios.inicio, fin: horarios.fin }];
  } else if (horarios.bloques && Array.isArray(horarios.bloques)) {
    bloquesAtencion = horarios.bloques;
  }

  if (bloquesAtencion.length === 0) return [];

  const intervalo = horarios.intervalo_minutos || 30;
  const slots: string[] = [];
  const now = new Date();
  const todayStr = formatDateISO(now);

  const candidates = new Set<number>();

  for (const bloque of bloquesAtencion) {
    let current = parseTime(bloque.inicio);
    const bloqueEnd = parseTime(bloque.fin);

    while (current + duracionMin <= bloqueEnd) {
      candidates.add(current);
      current += intervalo;
    }
  }

  for (const startMin of Array.from(candidates).sort((a, b) => a - b)) {
    const timeStr = formatTime(startMin);
    const slotDate = new Date(`${fecha}T${timeStr}:00`);

    if (fecha === todayStr && slotDate <= now) continue;
    if (!hasOverlap(slotDate, duracionMin, reservas)) {
      slots.push(timeStr);
    }
  }

  return slots;
}

export function formatFechaDisplay(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatHoraDisplay(hora: string): string {
  return hora;
}

export function puedeCancelarReserva(
  fechaHoraInicio: string,
  ventanaHoras: number,
  estado: string
): boolean {
  if (estado === 'cancelado') return false;
  const horasRestantes =
    (new Date(fechaHoraInicio).getTime() - Date.now()) / (1000 * 60 * 60);
  return horasRestantes >= ventanaHoras;
}
