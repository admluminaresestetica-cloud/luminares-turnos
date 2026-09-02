import { createBrowserClient } from '@supabase/ssr';

export function ejecutarAccionAdmin({
  tabla,
  accion,
  id,
  datos,
}: any): Promise<any> {
  // Creamos el cliente usando SSR para que viaje la sesión y el rol 'authenticated'
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return (async () => {
    if (accion === 'INSERT') {
      const { data, error } = await supabase
        .from(tabla)
        .insert(datos)
        .select();

      if (error) throw new Error(error.message);
      return data || [];
    }

    if (accion === 'UPDATE') {
      if (id === undefined || id === null) {
        throw new Error('Se requiere un ID para actualizar');
      }
      
      const { data, error } = await supabase
        .from(tabla)
        .update(datos)
        .eq('id', String(id))
        .select();

      if (error) throw new Error(error.message);
      return data || [];
    }

    if (accion === 'DELETE') {
      if (id === undefined || id === null) {
        throw new Error('Se requiere un ID para eliminar');
      }

      const { error } = await supabase
        .from(tabla)
        .delete()
        .eq('id', String(id));

      if (error) throw new Error(error.message);
      return true;
    }
  })();
}