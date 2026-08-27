import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // 5. Enviar el correo usando Resend
    const { error: mailError } = await resend.emails.send({
      from: 'Luminares Admin <onboarding@resend.dev>',
      to: [email],
      subject: '🔑 Tu código de acceso al Admin',
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Código de verificación</h2>
        <p>Has intentado iniciar sesión en el panel de administración.</p>
        <p>Tu código de acceso es:</p>
        <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${codigo}</h1>
        <p>Este código expira en 10 minutos.</p>
      </div>`,
    })

    if (mailError) {
      return NextResponse.json({ error: 'Error al enviar el correo' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error desconocido' }, { status: 500 })
  }
}
