export type EstiloPlantilla = "minimal" | "destacado";

export type FormatoStory = "story" | "feed"; // "story" (9:16) vs "feed" (1:1)

export type FitImagen = "contain" | "cover";

export type BadgeTipo = 
  | "ninguno"
  | "ultimas_unidades"
  | "mas_vendido"
  | "oferta"
  | "envio_gratis"
  | "nuevo";

export interface OpcionesStory {
  estiloPlantilla: EstiloPlantilla;
  formato: FormatoStory;
  fitImagen: FitImagen;
  colorFondo: string;
  usarColorPersonalizado: boolean;
  badge: BadgeTipo;
  mostrarCuotas: boolean;
  mostrarDireccion: boolean;
  mostrarCategoria: boolean;
}