export interface ClienteResumen {
  user_id: string;
  nombre: string;
  email?: string;
  celular?: string;
  avatar_url?: string;
  created_at?: string;
  codigo_referido?: string;
  direccion?: string;
  // Métricas calculadas
  totalGastado: number;
  totalReservas: number;
  totalPedidos: number;
  puntosActuales: number;
  puntosTotales: number;
  servicioFavorito: string;
  productoFavorito: string;
  horarioHabitual: string;
  ultimaVisita?: string;
}

export interface DetalleHistorialCliente {
  reservas: {
    id: string;
    fecha_hora_inicio: string;
    servicio_tipo: string;
    precio_total: number;
    estado: string;
    estado_asistencia?: string;
  }[];
  pedidos: {
    id: string;
    created_at: string;
    total: number;
    estado: string;
    metodo_pago?: string;
  }[];
  productosComprados: {
    nombre_producto: string;
    cantidad: number;
  }[];
}