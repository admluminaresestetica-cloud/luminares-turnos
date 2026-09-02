import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface AccionAdminParams {
  tabla: string;
  accion: 'INSERT' | 'UPDATE' | 'DELETE';
  id?: string | number;
  datos?: any;
}

export async function ejecutarAccionAdmin({
  tabla,
  accion,
  id,
  datos,
}: AccionAdminParams): Promise<any> {
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
}