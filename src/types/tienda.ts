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
  imagenes_urls?: string[]; // <-- Nueva propiedad para múltiples imágenes
  permite_cuotas?: boolean; // <-- Para controlar las 3 cuotas sin interés
  categoria?: string;
  etiquetas?: string[]; // <-- AGREGAR ESTA LÍNEA
  activo?: boolean;
  mostrar_ultimas_unidades?: boolean;
  created_at?: string;
}
