import { formatDetalleReservaDisplay } from '../booking/detalle';
import type { Reserva } from '../types';

export function renderDetalleReserva(reserva: Reserva): string {
  return formatDetalleReservaDisplay(reserva);
}

export function renderFechaHora(fechaIso: string): string {
  const d = new Date(fechaIso);
  const fecha = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `${fecha} · ${hora} hs`;
}

export function matchBusqueda(reserva: Reserva, q: string): boolean {
  if (!q.trim()) return true;
  const term = q.toLowerCase().trim();
  const nombre = (reserva.cliente_nombre || '').toLowerCase();
  const celular = (reserva.cliente_celular || '').toLowerCase();
  const codigo = (reserva.codigo_unico || '').toLowerCase();
  const d = new Date(reserva.fecha_hora_inicio);
  const fechaStr = d.toLocaleDateString('es-AR').toLowerCase();
  const fechaIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  return (
    nombre.includes(term) ||
    celular.includes(term) ||
    codigo.includes(term) ||
    fechaStr.includes(term) ||
    fechaIso.includes(term)
  );
}
