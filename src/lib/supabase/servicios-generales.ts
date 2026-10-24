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
  unas: 'Uñas',
  uñas: 'Uñas',
  masajes: 'Masajes',
  miradas: 'Miradas',
  ojos: 'Miradas',
};

import type { HistorialSesionGeneral } from '../types';

// 6. Registrar una nueva sesión en el historial de Servicios Generales
export async function crearHistorialSesionGeneral(
  sesion: Partial<HistorialSesionGeneral>
): Promise<HistorialSesionGeneral | null> {
  const { data, error } = await supabase
    .from('historial_sesiones_generales')
    .insert([sesion])
    .select()
    .single();

  if (error) {
    console.error('Error al registrar historial de sesión general:', error);
    throw error;
  }

  return data;
}

// 7. Obtener todas las sesiones pasadas de servicios generales de un cliente por celular
export async function getHistorialClienteGeneral(
  celular: string
): Promise<HistorialSesionGeneral[]> {
  if (!celular) return [];

  const celularLimpio = celular.replace(/\D/g, '');

  const { data, error } = await supabase
    .from('historial_sesiones_generales')
    .select('*')
    .ilike('cliente_celular', `%${celularLimpio}%`)
    .order('fecha_sesion', { ascending: false });

  if (error) {
    console.error('Error al obtener historial de servicios generales:', error);
    return [];
  }

  return data ?? [];
}