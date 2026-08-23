export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
<<<<<<< HEAD
  stock: number;
  imagen_url?: string;
  categoria_id?: string;
  activo?: boolean;
=======
  precio_original?: number; // Para ofertas / precios anteriores
  imagen_url?: string;
  stock?: number;
  categoria?: string;
  destacado?: boolean;
  activo?: boolean; // Para pausar/activar productos
>>>>>>> c2357e45214b1dd6c17f7c8f886f53ebdb3c8cb1
}

// Agregar esta interfaz
export interface CarritoItem extends Producto {
  cantidad: number;
}

export interface DatosEnvio {
  nombreCliente: string;
<<<<<<< HEAD
  telefonoCliente?: string;
=======
  telefonoCliente?: string; // Para el teléfono / WhatsApp del comprador
>>>>>>> c2357e45214b1dd6c17f7c8f886f53ebdb3c8cb1
  direccion: string;
  metodoEnvio: 'retiro' | 'envio';
  notaAdicional?: string;
}
