export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen_url?: string;
  stock?: number;
  categoria?: string;
  destacado?: boolean;
}

export interface CarritoItem extends Producto {
  cantidad: number;
}

export interface DatosEnvio {
  nombreCliente: string;
  direccion: string;
  metodoEnvio: string;
  notaAdicional?: string;
}