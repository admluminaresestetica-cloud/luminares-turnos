'use server';

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

interface CrearEmpleadoParams {
  nombre: string;
  email: string;
  password: string;
  rol?: 'admin' | 'empleado';
}

export async function crearEmpleadoAction({
  nombre,
  email,
  password,
  rol = 'empleado',
}: CrearEmpleadoParams) {
  try {
    const cookieStore = await cookies();

    const supabaseUserClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    // 1. Validar sesión del administrador activo
    const {
      data: { user: usuarioActual },
      error: sessionError,
    } = await supabaseUserClient.auth.getUser();

    if (sessionError || !usuarioActual) {
      return { success: false, error: 'No tenés una sesión activa.' };
    }

    // 2. Verificar que quien invita sea admin usando supabaseAdmin
    const { data: perfilAdmin, error: perfilError } = await supabaseAdmin
      .from('perfiles')
      .select('rol, activo')
      .eq('user_id', usuarioActual.id)
      .maybeSingle();

    if (perfilError || !perfilAdmin || perfilAdmin.rol !== 'admin') {
      return {
        success: false,
        error: 'No tenés permisos de administrador para crear empleados.',
      };
    }

    // 3. Crear el usuario en Supabase Auth
    const { data: nuevoUsuario, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nombre,
          rol,
        },
      });

    if (createError) {
      if (createError.message.includes('already registered')) {
        return {
          success: false,
          error: 'Ya existe una cuenta registrada con este correo electrónico.',
        };
      }
      return { success: false, error: createError.message };
    }

    // 4. Insertar el perfil explícitamente usando el ID del usuario recién creado
    if (nuevoUsuario?.user) {
      const { error: dbError } = await supabaseAdmin.from('perfiles').upsert(
        {
          user_id: nuevoUsuario.user.id,
          nombre: nombre,
          email: email,
          rol: rol,
          activo: true,
        },
        { onConflict: 'user_id' }
      );

      if (dbError) {
        console.error('Error al insertar perfil en Supabase:', dbError);
        return {
          success: false,
          error: `Error al guardar en la base de datos: ${dbError.message} (Código: ${dbError.code})`,
        };
      }
    }

    return {
      success: true,
      user: nuevoUsuario.user,
      message: 'Empleado creado con éxito.',
    };
  } catch (error: any) {
    console.error('Error en crearEmpleadoAction:', error);
    return {
      success: false,
      error: error?.message || 'Ocurrió un error inesperado en el servidor.',
    };
  }
}