export interface ProductoPOS {
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
}

export interface PosCartItem {
  producto_id: number;
  titulo: string;
  precio_unitario: number;
  cantidad: number;
  imagen_url?: string;
  stock_disponible: number;
}

export type TipoDescuento = "monto" | "porcentaje";

export interface SesionCaja {
  id?: string;
  estado: "abierta" | "cerrada";
  monto_inicial: number;
  fecha_apertura?: string;
}