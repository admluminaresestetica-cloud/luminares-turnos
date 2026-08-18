import { supabase } from '../supabase';
import type { ConfiguracionCalendario, ConfiguracionSistema, TipoServicio } from '../types';

export async function getConfiguracionCalendario(
  tipo: TipoServicio
): Promise<ConfiguracionCalendario | null> {
  const { data, error } = await supabase
    .from('configuracion_calendario')
    .select('*')
    .eq('tipo_servicio', tipo)
    .maybeSingle();

  if (error) {
    console.error('Error al obtener configuración de calendario:', error);
    return null;
  }

  return data;
}

export async function getConfiguracionSistema(): Promise<ConfiguracionSistema | null> {
  const { data, error } = await supabase
    .from('configuracion_sistema')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error al obtener configuración del sistema:', error);
    return null;
  }

  return data;
}

export async function updateFechasLaser(fechas: string[]): Promise<boolean> {
  const { error } = await supabase
    .from('configuracion_calendario')
    .update({ fechas_habilitadas_laser: fechas })
    .eq('tipo_servicio', 'laser');

  if (error) {
    console.error('Error al actualizar fechas láser:', error);
    return false;
  }
  return true;
}

export async function updateConfiguracionSistema(
  campos: Partial<Pick<ConfiguracionSistema, 'porcentaje_sena' | 'ventana_horas_cancelacion' | 'whatsapp_numero'>>
): Promise<boolean> {
  const config = await getConfiguracionSistema();
  if (!config) return false;

  const { error } = await supabase
    .from('configuracion_sistema')
    .update(campos)
    .eq('id', config.id);

  if (error) {
    console.error('Error al actualizar config sistema:', error);
    return false;
  }
  return true;
}
