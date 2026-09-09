import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: reservasData, error: errorReservas } = await supabase
      .from('reservas')
      .select('*')
      .order('fecha_hora_inicio', { ascending: true })

    if (errorReservas) {
      return NextResponse.json({ error: errorReservas.message }, { status: 400 })
    }

    const { data: clientesData } = await supabase
      .from('clientes')
      .select('celular, codigo_referido')

    return NextResponse.json({
      reservas: reservasData || [],
      clientes: clientesData || []
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}