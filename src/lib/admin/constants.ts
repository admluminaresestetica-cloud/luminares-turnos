import type { MedioPago } from '../types';

export const MEDIOS_PAGO: { value: MedioPago; label: string }[] = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'qr', label: 'QR / Mercado Pago' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'otro', label: 'Otro' },
];

export const ESTADOS_ASISTENCIA = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'asistio', label: 'Asistió' },
  { value: 'no_asistio', label: 'No asistió' },
  { value: 'cancelado', label: 'Cancelado' },
] as const;

export const ESTADOS_RESERVA = [
  { value: 'pendiente_sena', label: 'Pendiente seña' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'cancelado', label: 'Cancelado' },
] as const;

export type AdminTab = 'overview' | 'agenda' | 'precios';
