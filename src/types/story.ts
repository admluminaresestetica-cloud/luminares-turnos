export type EstiloPlantilla = "minimal" | "destacado" | "collage" | "ecommerce_modern";

export type FormatoStory = "story" | "feed" | "banner"; // "story" (9:16), "feed" (1:1), "banner" (16:9)

export type FitImagen = "contain" | "cover";

export type TipoFuente = "modern" | "bold" | "display" | "serif";

export type AlineacionTexto = "left" | "center" | "right";

export type BadgeTipo = 
  | "ninguno"
  | "ultimas_unidades"
  | "mas_vendido"
  | "oferta"
  | "envio_gratis"
  | "nuevo"
  | "cyberweek"
  | "descuento_20"
  | "descuento_50";

// --- NUEVOS TIPOS PARA ETAPA 3 ---
export type SombraProducto = "ninguna" | "suave" | "profunda" | "neon";

export type BordeProducto = "ninguno" | "blanco" | "dorado" | "fino_sutil";

export type StickerDecorativo = "ninguno" | "oferta_estrella" | "copo_nieve" | "lazo_regalo" | "corona_oro";

export interface FiltrosImagen {
  brillo: number; // 50 a 150 (por defecto 100)
  contraste: number; // 50 a 150 (por defecto 100)
  saturacion: number; // 0 a 200 (por defecto 100)
  rotacion: number; // 0, 90, 180, 270
}

export interface OpcionesStory {
  estiloPlantilla: EstiloPlantilla;
  formato: FormatoStory;
  fitImagen: FitImagen;
  colorFondo: string;
  usarColorPersonalizado: boolean;
  colorTexto?: string;
  imagenFondo?: string; // URL o Base64 para fondo personalizado/festivo
  fuenteTipografica: TipoFuente;
  alineacionTexto: AlineacionTexto;
  badge: BadgeTipo;
  mostrarCuotas: boolean;
  mostrarDireccion: boolean;
  mostrarCategoria: boolean;
  filtrosImagen: FiltrosImagen;

  // --- PROPIEDADES AÑADIDAS ETAPA 3 ---
  sombraProducto?: SombraProducto;
  bordeProducto?: BordeProducto;
  stickerDecorativo?: StickerDecorativo;
}