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

export interface SlotDisponibilidad {
  hora: string;
  estado: 'disponible' | 'en_proceso' | 'ocupado';
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

export function isDateEnabled(
  date: Date,
  tipo: 'laser' | 'general',
  fechasLaser: string[],
  diasSemana: number[]
): boolean {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  if (checkDate < hoy) return false;

  if (tipo === 'laser') {
    const iso = formatDateISO(date);
    return fechasLaser.includes(iso);
  }

  const jsDay = date.getDay();
  const isoDay = jsDay === 0 ? 7 : jsDay;

  return diasSemana.includes(jsDay) || diasSemana.includes(isoDay);
}

/**
 * Retorna todos los slots del día indicando su estado detallado:
 * - 'disponible': Libre para reservar.
 * - 'en_proceso': Ocupado temporalmente por hold de pago (ej. Mercado Pago activo).
 * - 'ocupado': Ocupado por reserva confirmada, transferencia pendiente, o bloqueo admin.
 */
export function calcularSlotsConEstado(
  fecha: string,
  duracionMin: number,
  horarios: HorariosAtencion | any,
  reservas: Reserva[],
  bufferMinimoRestante: number = 15
): SlotDisponibilidad[] {
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

  const intervalo = horarios.intervalo_minutos || 15;
  const resultados: SlotDisponibilidad[] = [];
  const now = new Date();
  const todayStr = formatDateISO(now);

  const candidates = new Set<number>();

  for (const bloque of bloquesAtencion) {
    const bloqueStart = parseTime(bloque.inicio);
    const bloqueEnd = parseTime(bloque.fin);

    let current = bloqueStart;
    while (current + duracionMin <= bloqueEnd) {
      candidates.add(current);
      current += intervalo;
    }
  }

  for (const startMin of Array.from(candidates).sort((a, b) => a - b)) {
    const timeStr = formatTime(startMin);
    const slotDate = new Date(`${fecha}T${timeStr}:00`);

    if (fecha === todayStr && slotDate <= now) continue;

    const slotEnd = new Date(slotDate.getTime() + duracionMin * 60_000);
    const slotEndMin = startMin + duracionMin;

    let estadoSlot: 'disponible' | 'en_proceso' | 'ocupado' = 'disponible';

    for (const r of reservas) {
      if (r.estado === 'cancelado') continue;

      const resStart = new Date(r.fecha_hora_inicio);
      const resEnd = new Date(resStart.getTime() + r.duracion_total * 60_000);

      // Comprobar solape temporal
      if (slotDate < resEnd && slotEnd > resStart) {
        // Si está en proceso de pago por Mercado Pago y su expires_at sigue vigente
        if (r.estado === 'pendiente_pago' && r.expires_at && new Date(r.expires_at) > now) {
          estadoSlot = 'en_proceso';
        } else {
          // Confirmado, pendiente de seña, pendiente de transferencia o bloqueado admin
          estadoSlot = 'ocupado';
          break; 
        }
      }
    }

    if (estadoSlot === 'ocupado') continue;

    // Validación de "hueco basura"
    if (estadoSlot === 'disponible') {
      const bloqueCorrespondiente = bloquesAtencion.find((b) => {
        const bStart = parseTime(b.inicio);
        const bEnd = parseTime(b.fin);
        return startMin >= bStart && slotEndMin <= bEnd;
      });

      if (!bloqueCorrespondiente) continue;

      const bloqueEndMin = parseTime(bloqueCorrespondiente.fin);
      
      const reservasDelDia = reservas
        .filter((r) => {
          if (r.estado === 'cancelado') return false;
          if (r.estado === 'pendiente_pago' && r.expires_at && new Date(r.expires_at) <= now) {
            return false;
          }
          return true;
        })
        .map((r) => {
          const d = new Date(r.fecha_hora_inicio);
          return { startMin: d.getHours() * 60 + d.getMinutes() };
        });

      const siguienteReserva = reservasDelDia.find((r) => r.startMin >= slotEndMin);
      const proximoObstaculoMin = siguienteReserva
        ? Math.min(siguienteReserva.startMin, bloqueEndMin)
        : bloqueEndMin;

      const espacioLibreRestante = proximoObstaculoMin - slotEndMin;
      if (espacioLibreRestante > 0 && espacioLibreRestante < bufferMinimoRestante) {
        continue;
      }
    }

    resultados.push({
      hora: timeStr,
      estado: estadoSlot,
    });
  }

  return resultados;
}

export function calcularSlotsDisponibles(
  fecha: string,
  duracionMin: number,
  horarios: HorariosAtencion | any,
  reservas: Reserva[],
  bufferMinimoRestante: number = 15
): string[] {
  const conEstado = calcularSlotsConEstado(fecha, duracionMin, horarios, reservas, bufferMinimoRestante);
  return conEstado.filter((s) => s.estado === 'disponible').map((s) => s.hora);
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


export function generarSlotsIntervalo(desde: string, hasta: string, intervaloMinutos: number = 15): string[] {
  const slots: string[] = [];
  const [hStart, mStart] = desde.split(':').map(Number);
  const [hEnd, mEnd] = hasta.split(':').map(Number);

  let actualMinutos = hStart * 60 + mStart;
  const finMinutos = hEnd * 60 + mEnd;

  while (actualMinutos < finMinutos) {
    const hh = String(Math.floor(actualMinutos / 60)).padStart(2, '0');
    const mm = String(actualMinutos % 60).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
    actualMinutos += intervaloMinutos;
  }

  return slots;
}

/**
 * Retorna el día de la semana en formato ISO (1 para Lunes, 7 para Domingo)
 */
export function getIsoWeekday(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}