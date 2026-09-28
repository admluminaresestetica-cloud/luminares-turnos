import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// Creamos una instancia directa para el manifiesto (evita problemas de contexto en SSR)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // Valores por defecto por si falla la conexión inicial
  let nombreEmpresa = 'Luminares Estética';
  let logoUrl = '/icon-512.png';

  try {
    const { data } = await supabase
      .from('configuracion_empresa')
      .select('nombre_empresa, logo_url')
      .limit(1)
      .maybeSingle();

    if (data) {
      if (data.nombre_empresa) nombreEmpresa = data.nombre_empresa;
      if (data.logo_url) logoUrl = data.logo_url;
    }
  } catch (err) {
    console.error('Error al cargar config para el manifest:', err);
  }

  return {
    name: nombreEmpresa,
    short_name: nombreEmpresa.length > 12 ? nombreEmpresa.substring(0, 12) : nombreEmpresa,
    description: `Panel y turnos de ${nombreEmpresa}`,
    start_url: '/',
    display: 'standalone',
    background_color: '#024128',
    theme_color: '#024128',
    icons: [
      {
        src: logoUrl,
        sizes: '192x192 512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}