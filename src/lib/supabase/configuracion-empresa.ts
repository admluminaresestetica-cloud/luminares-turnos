import { supabase } from '../supabase';

export interface ConfiguracionEmpresa {
  id?: string;
  nombre_empresa: string;
  subtitulo_tienda: string;
  logo_url: string;
  whatsapp_numero: string;
  google_maps_url: string;
  direccion?: string;          
  mp_access_token: string;
  mp_alias: string;
  // Campos de configuración de Envíos
  envio_domicilio_activo?: boolean;
  costo_envio_base?: number;
  envio_gratis_activo?: boolean;
  monto_envio_gratis?: number;
}

// Obtener la configuración actual
export async function obtenerConfiguracion(): Promise<ConfiguracionEmpresa | null> {
  try {
    const { data, error } = await supabase
      .from('configuracion_empresa')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error al obtener la configuración:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error inesperado al cargar la configuración:', err);
    return null;
  }
}

// Guardar/Actualizar cambios
export async function guardarConfiguracion(
  config: Partial<ConfiguracionEmpresa>
): Promise<boolean> {
  try {
    // Primero buscamos el ID existente
    const actual = await obtenerConfiguracion();

    if (actual?.id) {
      const { error } = await supabase
        .from('configuracion_empresa')
        .update({
          ...config,
          updated_at: new Date().toISOString(),
        })
        .eq('id', actual.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('configuracion_empresa')
        .insert([config]);

      if (error) throw error;
    }

    return true;
  } catch (err) {
    console.error('Error al guardar la configuración:', err);
    return false;
  }
}