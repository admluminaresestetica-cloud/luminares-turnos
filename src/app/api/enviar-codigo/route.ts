import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'


// Cliente de Supabase para servidor (usando las variables públicas o de servicio)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const supabaseServer = createClient(supabaseUrl, supabaseKey)

    // 1. Validar las credenciales contra Supabase antes de enviar nada
    const { data: authData, error: authError } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.session) {
      return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 })
    }

    // Inmediatamente cerramos la sesión temporal del servidor para que no quede activa
    await supabaseServer.auth.signOut()

    // 2. Generar un código aleatorio de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString()
    
    // 3. Definir expiración (10 minutos)
    const expiraAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // 4. Guardar el código en la tabla codigos_admin
    await supabaseServer.from('codigos_admin').delete().eq('email', email)
    
    const { error: dbError } = await supabaseServer.from('codigos_admin').insert([
      { email, codigo, expira_at: expiraAt }
    ])

    if (dbError) {
      return NextResponse.json({ error: 'Error al generar el código en la base de datos' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error desconocido' }, { status: 500 })
  }
}
