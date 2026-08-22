// types/tienda.ts

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen_url: string;
  categoria: string;
  stock: number;
  disponible: boolean;
}

export interface CarritoItem extends Producto {
  cantidad: number;
}

export interface DatosEnvio {
  nombreCliente: string;
  direccion: string;
  metodoEnvio: 'retiro' | 'envio';
  notaAdicional?: string;
}