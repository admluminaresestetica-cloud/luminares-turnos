import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase' // O tu cliente de supabase del server si usas service_role

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // 1. Generar un código aleatorio de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString()

    // 2. Definir expiración (10 minutos a partir de ahora)
    const expiraAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // 3. Guardar el código en la tabla codigos_admin
    // (Borramos códigos previos de este email para que quede solo el activo)
    await supabase.from('codigos_admin').delete().eq('email', email)

    const { error: dbError } = await supabase.from('codigos_admin').insert([
      { email, codigo, expira_at: expiraAt }
    ])

    if (dbError) {
      return NextResponse.json({ error: 'Error al generar el código en la base de datos' }, { status: 500 })
    }

    // 4. Enviar el correo usando Resend
    // Nota: Si usas el dominio gratuito de prueba de Resend, recuerda que suele enviar a tu propio correo registrado.
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