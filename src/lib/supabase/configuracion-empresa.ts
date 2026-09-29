import { supabase } from '../supabase';

export interface TemaColores {
  primary: string;
  primary_foreground: string;
  secondary: string;
  secondary_foreground: string;
  accent: string;
  accent_foreground: string;
  background: string;
  foreground: string;
  border: string;
}

export const TEMA_COLORES_DEFAULT: TemaColores = {
  primary: '#0f172a',
  primary_foreground: '#ffffff',
  secondary: '#f1f5f9',
  secondary_foreground: '#0f172a',
  accent: '#f1f5f9',
  accent_foreground: '#0f172a',
  background: '#ffffff',
  foreground: '#020817',
  border: '#e2e8f0',
};

export interface ConfiguracionEmpresa {
  id?: string;
  nombre_empresa?: string;
  subtitulo_tienda?: string;
  logo_url?: string;
  whatsapp_numero?: string;
  google_maps_url?: string;
  direccion_texto?: string;
  instagram_usuario?: string;
  mp_access_token?: string;
  mp_alias?: string;

  // Acceso y PINs
  pin_acceso?: string;
  pin_admin?: string;

  // Campos de Datos Bancarios / Transferencia
  cbu?: string;
  banco?: string;
  titular_cuenta?: string;

  // Campos de personalización de Ticket / Comprobante
  cuit?: string;
  mensaje_ticket?: string;

  // Campos de configuración de Envíos
  envio_domicilio_activo?: boolean;
  costo_envio_base?: number;
  envio_gratis_activo?: boolean;
  monto_envio_gratis?: number;
  cuotas_habilitadas?: boolean;
  monto_minimo_cuotas?: number;

  // Personalización visual
  tema_colores?: TemaColores | null;

  updated_at?: string;
}

// Obtener la configuración actual asegurando el tema de colores por defecto
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

    return {
      ...data,
      tema_colores: data.tema_colores
        ? { ...TEMA_COLORES_DEFAULT, ...data.tema_colores }
        : TEMA_COLORES_DEFAULT,
    };
  } catch (err) {
    console.error('Error inesperado al cargar la configuración:', err);
    return null;
  }
}

// Guardar/Actualizar cambios generales
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

// Actualizar únicamente la paleta de colores de la empresa
export async function guardarTemaColores(nuevosColores: TemaColores): Promise<boolean> {
  return guardarConfiguracion({ tema_colores: nuevosColores });
}