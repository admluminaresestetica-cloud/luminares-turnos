export function calcularMontoSena(precioTotal: number, porcentajeSena: number): number {
  return Math.round((precioTotal * porcentajeSena) / 100);
}

export function buildMensajeReserva(params: {
  codigo: string;
  clienteNombre: string;
  servicioDetalle: string;
  fecha: string;
  hora: string;
  precioTotal: number;
  montoSena: number;
}): string {
  const { codigo, clienteNombre, servicioDetalle, fecha, hora, precioTotal, montoSena } = params;
  return [
    `Hola! Quiero confirmar mi reserva ${codigo}.`,
    ``,
    `Nombre: ${clienteNombre}`,
    `Servicio: ${servicioDetalle}`,
    `Fecha: ${fecha}`,
    `Hora: ${hora}`,
    `Total: $${precioTotal.toLocaleString('es-AR')}`,
    `Seña a abonar (${Math.round((montoSena / precioTotal) * 100)}%): $${montoSena.toLocaleString('es-AR')}`,
  ].join('\n');
}

export function buildWhatsAppUrl(numero: string, mensaje: string): string {
  const numeroLimpio = numero.replace(/\D/g, '');
  return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
}
