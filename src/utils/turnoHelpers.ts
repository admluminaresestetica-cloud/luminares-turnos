export interface TurnoConDetalles {
  detalle_texto?: string;
  detalle_original?: string;
  fue_modificado?: boolean;
}

/**
 * Compara si el detalle actual difiere del original de la reserva web
 */
export function verificarSiFueModificado(turno: TurnoConDetalles): boolean {
  if (turno.fue_modificado) return true;
  if (!turno.detalle_original || !turno.detalle_texto) return false;
  return turno.detalle_original.trim().toLowerCase() !== turno.detalle_texto.trim().toLowerCase();
}

/**
 * Limpia y formatea el texto del detalle para mostrarlo ordenadamente
 */
export function formatearDetalle(detalle?: string): string {
  if (!detalle) return 'Sin servicio especificado';
  return detalle;
}