export type FototipoPiel = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';

export interface FichaMedica {
  embarazo: boolean;
  lactancia: boolean;
  medicacionFotosensible: boolean;
  patologiasPiel: boolean;
  marcapasosOPlacas: boolean;
  bronceadoReciente: boolean;
  observacionesMedicas?: string;
}

export interface Cliente {
  id: string;
  codigo_cliente: string; // Ej: CLI-00001
  nombre_completo: string;
  telefono: string;
  email?: string;
  fototipo?: FototipoPiel;
  ficha_medica: FichaMedica;
  created_at?: string;
}

export type EstadoSesion = 'recepcion' | 'en_espera' | 'en_gabinete' | 'finalizado' | 'cancelado';

export interface ParametrosZona {
  zona_nombre: string;
  joules?: number;
  pulso_ms?: number;
  frecuencia_hz?: number;
  pasadas?: number;
  observaciones?: string;
}

export interface SesionGabinete {
  id: string;
  cliente_id: string;
  cliente?: Cliente;
  operadora_id?: string;
  servicio_nombre: string;
  estado: EstadoSesion;
  zonas_preasignadas: string[]; // Zonas elegidas en recepción
  parametros_tecnicos: Record<string, ParametrosZona>; // JSONB key: zona_nombre
  observaciones_gabinete?: string;
  fecha_sesion: string;
  created_at?: string;
}