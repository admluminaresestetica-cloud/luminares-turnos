import type { PromoLaser, ServicioLaser } from '../types';

export type ModoLaser = 'promo' | 'zonas';

export interface SwapsMap {
  [zonaOriginalId: string]: string;
}

export interface TotalesLaser {
  precio: number;
  duracion: number;
  modo: 'promo' | 'zonas_individuales' | 'promo_mas_extra';
  ahorroPromo?: number;
}

const DESCUENTO_ZONA_EXTRA = 0.1;

function idsIguales(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((id, i) => id === sb[i]);
}

export function getZonaById(zonas: ServicioLaser[], id: string): ServicioLaser | undefined {
  return zonas.find((z) => z.id === id);
}

export function getZonasPromoResueltas(
  promo: PromoLaser,
  zonas: ServicioLaser[],
  swaps: SwapsMap
): ServicioLaser[] {
  return promo.zonas_incluidas
    .map((id) => {
      const swapId = swaps[id];
      return getZonaById(zonas, swapId ?? id);
    })
    .filter((z): z is ServicioLaser => z !== undefined);
}

export function getZonasSwapDisponibles(
  zonaOriginal: ServicioLaser,
  zonas: ServicioLaser[],
  idsOcupados: string[]
): ServicioLaser[] {
  return zonas.filter(
    (z) =>
      z.categoria_zona === zonaOriginal.categoria_zona &&
      z.id !== zonaOriginal.id &&
      !idsOcupados.includes(z.id)
  );
}

export function detectarPromoEquivalente(
  zonaIds: string[],
  promos: PromoLaser[]
): { promo: PromoLaser; ahorro: number; precioIndividual: number } | null {
  for (const promo of promos) {
    if (promo.zonas_incluidas.length === 0) continue;
    if (!idsIguales(zonaIds, promo.zonas_incluidas)) continue;
    return {
      promo,
      ahorro: 0,
      precioIndividual: 0,
    };
  }
  return null;
}

export function detectarPromoConAhorro(
  zonaIds: string[],
  zonas: ServicioLaser[],
  promos: PromoLaser[]
): { promo: PromoLaser; ahorro: number; precioIndividual: number } | null {
  const seleccionadas = zonaIds
    .map((id) => getZonaById(zonas, id))
    .filter((z): z is ServicioLaser => z !== undefined);

  if (seleccionadas.length === 0) return null;

  const precioIndividual = seleccionadas.reduce((acc, z) => acc + Number(z.precio_lista), 0);

  for (const promo of promos) {
    if (promo.zonas_incluidas.length === 0) continue;
    if (!idsIguales(zonaIds, promo.zonas_incluidas)) continue;

    const ahorro = precioIndividual - Number(promo.precio_promo);
    if (ahorro >= 0) {
      return { promo, ahorro, precioIndividual };
    }
  }

  return null;
}

export function calcularTotalesPromo(
  promo: PromoLaser,
  zonas: ServicioLaser[],
  swaps: SwapsMap,
  zonasExtraIds: string[]
): TotalesLaser {
  const zonasExtra = zonasExtraIds
    .map((id) => getZonaById(zonas, id))
    .filter((z): z is ServicioLaser => z !== undefined);

  const precioExtra = zonasExtra.reduce(
    (acc, z) => acc + Number(z.precio_lista) * (1 - DESCUENTO_ZONA_EXTRA),
    0
  );

  const zonasResueltas = getZonasPromoResueltas(promo, zonas, swaps);
  const duracionPromo =
    zonasResueltas.length > 0
      ? zonasResueltas.reduce((acc, z) => acc + z.duracion_minutos, 0)
      : promo.duracion_total_min;

  const duracionExtra = zonasExtra.reduce((acc, z) => acc + z.duracion_minutos, 0);
  const tieneExtra = zonasExtra.length > 0;

  return {
    precio: Number(promo.precio_promo) + precioExtra,
    duracion: duracionPromo + duracionExtra,
    modo: tieneExtra ? 'promo_mas_extra' : 'promo',
  };
}

export function calcularTotalesZonasIndividuales(zonaIds: string[], zonas: ServicioLaser[]): TotalesLaser {
  const seleccionadas = zonaIds
    .map((id) => getZonaById(zonas, id))
    .filter((z): z is ServicioLaser => z !== undefined);

  return {
    precio: seleccionadas.reduce((acc, z) => acc + Number(z.precio_lista), 0),
    duracion: seleccionadas.reduce((acc, z) => acc + z.duracion_minutos, 0),
    modo: 'zonas_individuales',
  };
}

export function precioZonaExtraConDescuento(zona: ServicioLaser): number {
  return Number(zona.precio_lista) * (1 - DESCUENTO_ZONA_EXTRA);
}

export const ETIQUETA_CATEGORIA: Record<string, string> = {
  chica: 'Chica',
  media: 'Media',
  grande: 'Grande',
};
