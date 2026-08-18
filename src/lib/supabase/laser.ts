import { supabase } from '../supabase';
import type { GeneroLaser, PromoLaser, ServicioLaser } from '../types';

export async function getServiciosLaser(genero: GeneroLaser): Promise<ServicioLaser[]> {
  const { data, error } = await supabase
    .from('servicios_laser')
    .select('*')
    .eq('genero', genero)
    .eq('activo', true)
    .order('nombre_zona');

  if (error) {
    console.error('Error al obtener servicios láser:', error);
    return [];
  }

  return data ?? [];
}

export async function getPromosLaser(genero: GeneroLaser): Promise<PromoLaser[]> {
  const { data, error } = await supabase
    .from('promos_laser')
    .select('*')
    .eq('genero', genero)
    .eq('activo', true)
    .order('nombre_promo');

  if (error) {
    console.error('Error al obtener promos láser:', error);
    return [];
  }

  return data ?? [];
}

// --- ELIMINAR ZONAS Y PROMOS ---

export async function deleteServicioLaser(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('servicios_laser')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar servicio láser:', error);
    throw error;
  }

  return true;
}

export async function deletePromoLaser(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('promos_laser')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar promo láser:', error);
    throw error;
  }

  return true;
}