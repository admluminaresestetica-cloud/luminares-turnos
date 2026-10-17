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
  fuenteTipografica: TipoFuente;
  alineacionTexto: AlineacionTexto;
  badge: BadgeTipo;
  mostrarCuotas: boolean;
  mostrarDireccion: boolean;
  mostrarCategoria: boolean;
  filtrosImagen: FiltrosImagen;
}