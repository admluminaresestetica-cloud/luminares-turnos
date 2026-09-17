export type EstiloPlantilla = "minimal" | "destacado";

export type BadgeTipo = 
  | "ninguno"
  | "ultimas_unidades"
  | "mas_vendido"
  | "oferta"
  | "envio_gratis"
  | "nuevo";

export interface OpcionesStory {
  estiloPlantilla: EstiloPlantilla;
  colorFondo: string;
  usarColorPersonalizado: boolean;
  badge: BadgeTipo;
  mostrarCuotas: boolean;
  mostrarDireccion: boolean;
  mostrarCategoria: boolean;
}