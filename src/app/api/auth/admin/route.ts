// src/app/api/admin/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { tabla, accion, datos, id, authHeader } = await request.json();

    // 1. CONTROL DE SEGURIDAD (Ejemplo: validar un pin/token de administración)
    // Podés validar una variable de entorno o la cookie/token de la sesión del admin
    const ADMIN_SECRET = process.env.ADMIN_INTERNAL_SECRET || 'mi_clave_admin_interna';
    if (authHeader !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2. INSERTAR
    if (accion === 'INSERT') {
      const { data, error } = await supabaseAdmin
        .from(tabla)
        .insert(datos)
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    // 3. ACTUALIZAR
    if (accion === 'UPDATE') {
      const { data, error } = await supabaseAdmin
        .from(tabla)
        .update(datos)
        .eq('id', id)
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    // 4. ELIMINAR
    if (accion === 'DELETE') {
      const { data, error } = await supabaseAdmin
        .from(tabla)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });

  } catch (error: any) {
    console.error('Error en /api/admin:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}