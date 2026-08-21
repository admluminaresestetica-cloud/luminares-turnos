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

export function generarCodigoReferido(nombreCompleto: string): string {
  // 1. Toma el primer nombre, remueve tildes y caracteres especiales, pasa a mayúsculas
  const primerNombre = nombreCompleto
    .trim()
    .split(' ')[0]
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  // 2. Genera 4 caracteres alfanuméricos aleatorios
  const sufijoAleatorio = Math.random().toString(36).substring(2, 6).toUpperCase();

  // 3. Retorna la combinación (ej: MARIA-A8F2)
  return `${primerNombre}-${sufijoAleatorio}`;
}