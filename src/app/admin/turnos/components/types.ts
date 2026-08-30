// src/components/admin/types.ts
// Tipos, constantes y helpers compartidos entre todos los subcomponentes del panel admin.

export interface Reserva {
  id: string
  codigo_unico?: string
  cliente_nombre?: string
  cliente_celular?: string
  codigo_referido_usado?: string | null
  servicio_tipo?: string
  detalle_reserva?: any
  precio_total?: number
  duracion_total?: number
  fecha_hora_inicio?: string
  estado?: string
  medio_pago?: string
  // Campos de Mercado Pago y Pagos
  monto_abonado?: number
  mp_payment_id?: string
  tipo_pago_elegido?: string
  estado_pago?: string
}

export interface ServicioLaser {
  id: string
  genero?: string
  nombre_zona?: string
  categoria_zona?: string
  precio_lista?: number
  duracion_minutos?: number
  activo?: boolean
}

export interface PromoLaser {
  id: string
  genero?: string
  nombre_promo?: string
  zonas_incluidas?: string[]
  precio_promo?: number
  duracion_total_min?: number
  permite_swap?: boolean
  activo?: boolean
}

export interface ServicioGeneral {
  id: string
  categoria?: string
  subtipo?: string
  precio?: number
  duracion_minutos?: number
  activo?: boolean
  created_at?: string
  descripcion?: string
  imagen_url?: string
}

// --- TIPOS PARA CONFIGURACIÓN DE CALENDARIO / HORARIOS ---
export interface HorarioDia {
  abierto: boolean
  inicio: string
  fin: string
}

export interface HorariosSemana {
  lunes: HorarioDia
  martes: HorarioDia
  miercoles: HorarioDia
  jueves: HorarioDia
  viernes: HorarioDia
  sabado: HorarioDia
  domingo: HorarioDia
}

export interface ConfigCalendario {
  id?: string
  tipo_servicio: 'laser' | 'general'
  horarios_atencion?: any
  fechas_habilitadas_laser?: string[]
  updated_at?: string
}

export interface TurnoForm {
  id?: string
  cliente_nombre: string
  cliente_celular: string
  fecha_hora_local: string // formato datetime-local: YYYY-MM-DDTHH:mm
  detalle_texto: string
  precio_total: number
  estado: string
  metodo_pago: string
}

export type TabKey = 'overview' | 'agenda' | 'precios' | 'generales' | 'horarios' | 'banner' | 'referidos' | 'faq'

export const DIAS_SEMANA: { key: keyof HorariosSemana; label: string }[] = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
]

export const horarioDiaDefault = (abierto: boolean = true): HorarioDia => ({
  abierto,
  inicio: '09:00',
  fin: '18:00'
})

export const horariosSemanaDefault = (): HorariosSemana => ({
  lunes: horarioDiaDefault(true),
  martes: horarioDiaDefault(true),
  miercoles: horarioDiaDefault(true),
  jueves: horarioDiaDefault(true),
  viernes: horarioDiaDefault(true),
  sabado: horarioDiaDefault(false),
  domingo: horarioDiaDefault(false),
})

export const turnoFormVacio = (): TurnoForm => ({
  cliente_nombre: '',
  cliente_celular: '',
  fecha_hora_local: '',
  detalle_texto: '',
  precio_total: 0,
  estado: 'pendiente_sena',
  metodo_pago: ''
})

// --- HELPERS DE FECHA (ISO <-> datetime-local) ---
export const isoToDatetimeLocal = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const datetimeLocalToIso = (local: string) => {
  if (!local) return null
  return new Date(local).toISOString()
}

// --- HELPERS DE RENDER ---
export const renderDetalle = (item: Reserva) => {
  if (!item.detalle_reserva) return item.servicio_tipo || '-'

  let detalle = item.detalle_reserva
  if (typeof detalle === 'string') {
    try { detalle = JSON.parse(detalle) } catch (e) { return detalle }
  }

  if (detalle?.detalle_texto) return detalle.detalle_texto
  if (Array.isArray(detalle)) return detalle.join(', ')
  if (typeof detalle === 'object') {
    if (detalle.zonas) return Array.isArray(detalle.zonas) ? detalle.zonas.join(', ') : String(detalle.zonas)
    if (detalle.promo) return String(detalle.promo)
    if (detalle.nombre) return String(detalle.nombre)
  }

  return item.servicio_tipo || 'Reserva'
}

export const renderFechaHora = (fechaIso?: string) => {
  if (!fechaIso) return 'Sin fecha'
  const fechaObj = new Date(fechaIso)

  const fecha = fechaObj.toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })

  const hora = fechaObj.toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit'
  })

  return `${fecha} - ${hora} hs`
}

export const formatFecha = (fecha: string) => {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

export const getNombresZonas = (servicios: ServicioLaser[], idsZonas?: string[]) => {
  if (!idsZonas || idsZonas.length === 0) return 'Ninguna zona asignada'
  const nombres = idsZonas
    .map((id) => servicios.find((s) => s.id === id)?.nombre_zona)
    .filter(Boolean)
  return nombres.length > 0 ? nombres.join(' + ') : 'Zonas no encontradas'
}

export interface Reserva {
  id: string
  codigo_unico?: string
  cliente_nombre?: string
  cliente_celular?: string
  codigo_referido_usado?: string | null // <--- AGREGÁ ESTA LÍNEA AQUÍ
  servicio_tipo?: string
  detalle_reserva?: any
  precio_total?: number
  duracion_total?: number
  fecha_hora_inicio?: string
  estado?: string
  medio_pago?: string
}

export interface ConfiguracionSistema {
  // ... tus campos existentes ...
  referidos_activo?: boolean;
  referidos_tipo_descuento?: 'porcentaje' | 'monto_fijo';
  referidos_valor_descuento?: number;
}