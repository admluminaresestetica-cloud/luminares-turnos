import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Creamos un cliente específico para el servidor usando la Service Role Key (evita bloqueos de RLS)
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