export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precio_anterior?: number;
  stock: number;
  imagen_url?: string;
  categoria_id?: string;
  categoria?: string;
  activo?: boolean;
}

export interface CarritoItem extends Producto {
  cantidad: number;
}

export interface Categoria {
  id: string;
  nombre: string;
  activo?: boolean;
}

export interface DatosEnvio {
  nombreCliente: string;
  telefonoCliente?: string;
  direccion: string;
  metodoEnvio: 'retiro' | 'envio';
  notaAdicional?: string;
}
