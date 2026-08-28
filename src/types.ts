export type EstadoPago = 'pendiente' | 'seña_pagada' | 'total_pagado';
export type TipoPagoElegido = 'sena' | 'total' | 'whatsapp';

export interface Reserva {
  id?: string;
  codigo_unico?: string;
  cliente_nombre: string;
  cliente_celular: string;
  servicio_tipo: 'laser' | 'general';
  detalle_reserva: any;
  precio_total: number;
  duracion_total?: number;
  fecha_hora_inicio: string;
  estado?: string;
  modificado_por_admin?: boolean;
  metodo_pago?: string;
  medio_pago?: string;
  codigo_referido_usado?: string;

  // Campos para Señas y Mercado Pago
  estado_pago?: EstadoPago;
  tipo_pago_elegido?: TipoPagoElegido;
  monto_sena?: number;
  monto_abonado?: number;
  mp_preference_id?: string;
  mp_payment_id?: string;
  
  created_at?: string;
  updated_at?: string;
}