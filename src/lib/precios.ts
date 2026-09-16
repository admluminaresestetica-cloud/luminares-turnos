export const PORCENTAJE_RECARGO_CUOTAS = 0.25; // 25% de recargo para 3 cuotas sin interés

export interface CalculoPrecio {
  precioBase: number;         // Precio transferencia / efectivo
  precioLista: number;        // Precio total financiado
  montoCuota: number;         // Valor de cada cuota (3 cuotas)
  cantidadCuotas: number;     // Por defecto 3
}

export function calcularCuotas(precioBase: number, cuotas: number = 3): CalculoPrecio {
  const precioLista = Math.round(precioBase * (1 + PORCENTAJE_RECARGO_CUOTAS));
  const montoCuota = Math.round(precioLista / cuotas);

  return {
    precioBase,
    precioLista,
    montoCuota,
    cantidadCuotas: cuotas,
  };
}
