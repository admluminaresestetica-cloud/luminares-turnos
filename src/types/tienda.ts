export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagen_url?: string;
  categoria_id?: string;
  activo?: boolean;
}

// Agregar esta interfaz
export interface CarritoItem extends Producto {
  cantidad: number;
}

export interface DatosEnvio {
  nombreCliente: string;
  telefonoCliente?: string;
  direccion: string;
  metodoEnvio: 'retiro' | 'envio';
  notaAdicional?: string;
}