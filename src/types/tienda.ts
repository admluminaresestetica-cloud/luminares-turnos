export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precio_original?: number; // Para ofertas / precios anteriores
  imagen_url?: string;
  stock?: number;
  categoria?: string;
  destacado?: boolean;
  activo?: boolean; // Para pausar/activar productos
}

export interface CarritoItem extends Producto {
  cantidad: number;
}

export interface DatosEnvio {
  nombreCliente: string;
  telefonoCliente?: string; // Para el teléfono / WhatsApp del comprador
  direccion: string;
  metodoEnvio: string;
  notaAdicional?: string;
}
