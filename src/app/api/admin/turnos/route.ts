import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()

    // 1. Verificamos la sesión del usuario que está haciendo la petición
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

    // 2. Si no hay sesión o no está logueado, rechazamos el acceso inmediatamente
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado. Debe iniciar sesión.' }, { status: 401 })
    }

    // 3. Si está autenticado, usamos el cliente con Service Role para traer los datos protegidos
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    const { data: reservasData, error: errorReservas } = await supabaseAdmin
      .from('reservas')
      .select('*')
      .order('fecha_hora_inicio', { ascending: true })

    if (errorReservas) {
      return NextResponse.json({ error: errorReservas.message }, { status: 400 })
    }

    const { data: clientesData, error: errorClientes } = await supabaseAdmin
      .from('clientes')
      .select('celular, codigo_referido')

    if (errorClientes) {
      return NextResponse.json({ error: errorClientes.message }, { status: 400 })
    }

    return NextResponse.json({
      reservas: reservasData || [],
      clientes: clientesData || []
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 })
  }
}