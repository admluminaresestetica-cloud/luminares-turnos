import { supabase } from '../supabase';
import type { ServicioGeneral } from '../types';

// 1. Obtener TODOS los servicios generales (para el panel admin)
export async function getServiciosGeneralesAdmin(): Promise<ServicioGeneral[]> {
  const { data, error } = await supabase
    .from('servicios_generales')
    .select('*')
    .order('categoria', { ascending: true })
    .order('subtipo', { ascending: true });

  if (error) {
    console.error('Error al obtener servicios generales (admin):', error);
    return [];
  }

  return data ?? [];
}

// 2. Obtener solo los ACTIVOS (para la web pública del cliente)
export async function getServiciosGenerales(): Promise<ServicioGeneral[]> {
  const { data, error } = await supabase
    .from('servicios_generales')
    .select('*')
    .eq('activo', true)
    .order('categoria')
    .order('subtipo');

  if (error) {
    console.error('Error al obtener servicios generales:', error);
    return [];
  }

  return data ?? [];
}

// 3. Crear o Actualizar un servicio general
export async function guardarServicioGeneral(servicio: Partial<ServicioGeneral>) {
  const { data, error } = await supabase
    .from('servicios_generales')
    .upsert(servicio)
    .select();

  if (error) {
    console.error('Error al guardar servicio general:', error);
    throw error;
  }
  return data;
}

// 4. Cambiar estado activo / inactivo
export async function toggleActivoServicioGeneral(id: string, activoActual: boolean) {
  const { data, error } = await supabase
    .from('servicios_generales')
    .update({ activo: !activoActual })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error al cambiar estado del servicio:', error);
    throw error;
  }
  return data;
}

// 5. Eliminar servicio general
export async function deleteServicioGeneral(id: string) {
  const { error } = await supabase
    .from('servicios_generales')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar servicio general:', error);
    throw error;
  }
  return true;
}

export const LABELS_CATEGORIA: Record<string, string> = {
  faciales: 'Faciales',
  manicura: 'Uñas',
  masajes: 'Masajes',
};