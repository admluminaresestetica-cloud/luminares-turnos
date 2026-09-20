import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function actualizarPinAcceso(nuevoPin: string) {
  // Obtenemos el registro de la empresa
  const { data: config, error: searchError } = await supabase
    .from('configuracion_empresa')
    .select('id')
    .limit(1)
    .single();

  if (searchError) throw searchError;

  // Actualizamos la columna pin_acceso
  const { error } = await supabase
    .from('configuracion_empresa')
    .update({ pin_acceso: nuevoPin })
    .eq('id', config.id);

  if (error) throw error;
  return true;
}

export async function obtenerPinAcceso() {
  const { data, error } = await supabase
    .from('configuracion_empresa')
    .select('pin_acceso')
    .limit(1)
    .single();

  if (error) return '1234'; // Valor de respaldo
  return data?.pin_acceso || '1234';
}