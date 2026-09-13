export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  precio_original?: number;
  stock: number;
  stock_minimo?: number;
  codigo_barras?: string | null;
  imagen_url?: string;
  categoria?: string;
  activo?: boolean;
  mostrar_ultimas_unidades?: boolean;
  created_at?: string;
}

export interface CarritoItem extends Producto {
  cantidad: number;
}

export interface TagBusqueda {
  id: string;
  nombre: string;
  slug: string;
  orden?: number;
  activo?: boolean;
}

export interface Categoria {
  id: number;
  nombre: string;
  created_at?: string;
}

export interface DatosEnvio {
  nombreCliente: string;
  telefonoCliente?: string;
  direccion: string;
  metodoEnvio: 'retiro' | 'envio';
  notaAdicional?: string;
}