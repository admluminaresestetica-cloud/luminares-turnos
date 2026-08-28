// Tipos del esquema definitivo (Supabase)

export type GeneroLaser = 'femenino' | 'masculino';
export type CategoriaZona = 'chica' | 'media' | 'grande';
export type CategoriaGeneral = string;
export type TipoServicio = 'laser' | 'general';
export type TipoJornada = 'laser' | 'general';
export type EstadoReserva = 'pendiente_sena' | 'confirmado' | 'cancelado';
export type EstadoAsistencia = 'pendiente' | 'asistio' | 'no_asistio' | 'cancelado';
export type MedioPago = 'efectivo' | 'transferencia' | 'qr' | 'tarjeta' | 'otro';
export type OpcionPago = 'sena' | 'total';

export interface ServicioLaser {
  id: string;
  genero: GeneroLaser;
  nombre_zona: string;
  categoria_zona: CategoriaZona;
  precio_lista: number;
  duracion_minutos: number;
  activo: boolean;
}

export interface PromoLaser {
  id: string;
  genero: GeneroLaser;
  nombre_promo: string;
  zonas_incluidas: string[];
  precio_promo: number;
  duracion_total_min: number;
  permite_swap: boolean;
  activo: boolean;
}

export interface ServicioGeneral {
  id: string;
  categoria: CategoriaGeneral;
  subtipo: string;
  precio: number;
  duracion_minutos: number;
  activo: boolean;
  descripcion?: string;
  imagen_url?: string;
}

export interface ConfiguracionCalendario {
  id: string;
  tipo_servicio: TipoServicio;
  fechas_habilitadas_laser: string[];
  horarios_atencion: {
    dias_semana: number[];
    bloques: { inicio: string; fin: string }[];
    intervalo_minutos: number;
  };
}

export interface ConfiguracionSistema {
  id: string;
  porcentaje_sena: number;
  ventana_horas_cancelacion: number;
  whatsapp_numero: string;
  referidos_activo?: boolean;
  referidos_tipo_descuento?: 'porcentaje' | 'monto_fijo';
  referidos_valor_descuento?: number;
}

export interface DetalleReservaLaser {
  genero: GeneroLaser;
  modo: 'promo' | 'zonas_individuales' | 'promo_mas_extra';
  promo_id?: string;
  zonas_ids: string[];
  zonas_extra_ids?: string[];
  descuento_extra_pct?: number;
  detalle_texto?: string;
  opcion_pago?: OpcionPago | string; // <-- Campo agregado
}

export interface DetalleReservaGeneral {
  servicios?: { id: string; subtipo: string; precio: number; duracion_minutos: number }[];
  detalle_texto?: string;
  opcion_pago?: OpcionPago | string; // <-- Campo agregado
}

export interface Reserva {
  id: string;
  codigo_unico: string;
  cliente_nombre: string;
  cliente_celular: string;
  servicio_tipo: TipoServicio;
  detalle_reserva: DetalleReservaLaser | DetalleReservaGeneral | Record<string, unknown>;
  precio_total: number;
  duracion_total: number;
  fecha_hora_inicio: string;
  estado: EstadoReserva;
  modificado_por_admin: boolean;
  medio_pago?: MedioPago | string | null;
  estado_asistencia: EstadoAsistencia;
  fue_modificado: boolean;
}

export interface CierreJornada {
  id: string;
  fecha: string;
  tipo_jornada: TipoJornada;
  total_recaudado: number;
  desglose_medios_pago: Record<string, number>;
  cerrado_por: string | null;
  fecha_cierre: string;
}

export interface CrearReservaInput {
  cliente_nombre: string;
  cliente_celular: string;
  codigo_referido_usado?: string | null;
  servicio_tipo: TipoServicio;
  detalle_reserva: any;
  precio_total: number;
  duracion_total: number;
  fecha_hora_inicio: string;
}