export interface CalculoPrecio {
  precioBase: number;         // Precio transferencia / efectivo
  precioLista: number;        // Precio total financiado
  montoCuota: number;         // Valor de cada cuota
  cantidadCuotas: number;     // Cantidad de cuotas configurada
}

export function calcularCuotas(
  precioBase: number, 
  cantidadCuotas: number = 3, 
  porcentajeRecargo: number = 25
): CalculoPrecio {
  // Convertimos el porcentaje (ej: 25) a factor de multiplicador (ej: 0.25)
  const factorRecargo = porcentajeRecargo / 100;
  const precioLista = Math.round(precioBase * (1 + factorRecargo));
  const montoCuota = cantidadCuotas > 0 ? Math.round(precioLista / cantidadCuotas) : precioLista;

  return {
    precioBase,
    precioLista,
    montoCuota,
    cantidadCuotas,
  };
}