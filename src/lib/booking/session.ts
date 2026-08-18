import type { GeneroLaser } from '../types';
import type { SwapsMap } from '../laser/calculos';

export const LASER_STORAGE_KEY = 'laser-seleccion';
export const SERVICIOS_STORAGE_KEY = 'servicios-seleccion';

export interface SeleccionLaser {
  genero: GeneroLaser;
  modo: 'promo' | 'zonas_individuales' | 'promo_mas_extra';
  promo_id?: string;
  swaps: SwapsMap;
  zonas_ids: string[];
  zonas_extra_ids: string[];
  precio_total: number;
  duracion_total: number;
  detalle_texto?: string;
}

export interface SeleccionServicios {
  servicios_ids: string[];
  precio_total: number;
  duracion_total: number;
  detalle_texto: string;
}

export function loadLaserSeleccion(): SeleccionLaser | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(LASER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SeleccionLaser;
  } catch {
    return null;
  }
}

export function loadServiciosSeleccion(): SeleccionServicios | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(SERVICIOS_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SeleccionServicios;
  } catch {
    return null;
  }
}
