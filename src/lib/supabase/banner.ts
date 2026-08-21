import { supabase } from '../supabase';

export interface BannerConfig {
  id?: number;
  tipo: 'imagen' | 'video';
  url_media: string;
  activo: boolean;
  titulo?: string;
  enlace?: string;
}

// Obtener la configuración actual del banner
export async function getBannerConfig(): Promise<BannerConfig | null> {
  const { data, error } = await supabase
    .from('configuracion_banner')
    .select('*')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return data;
}

// Subir archivo al bucket "imagenes-banner"
export async function subirArchivoBanner(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `banner_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('imagenes-banner')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('imagenes-banner')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// Guardar o actualizar el banner
export async function guardarBannerConfig(banner: BannerConfig) {
  const { data, error } = await supabase
    .from('configuracion_banner')
    .upsert(banner)
    .select();

  if (error) {
    console.error('Error al guardar el banner:', error);
    throw error;
  }
  return data;
}