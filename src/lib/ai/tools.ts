import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const aiTools = {
  // 1. Herramienta para consultar turnos y reservas
  consultarReservas: tool({
    description: 'Consulta las reservas o turnos registrados en el centro de estética. Permite buscar por nombre de cliente o filtrar por estado.',
    inputSchema: z.object({
      filtroNombre: z.string().optional().describe('Nombre o parte del nombre del cliente para buscar sus turnos'),
      estado: z.string().optional().describe('Estado del turno (ej: pendiente, confirmado, cancelado)'),
    }),
    execute: async ({ filtroNombre, estado }) => {
      let query = supabase
        .from('reservas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15)

      if (filtroNombre) {
        query = query.ilike('cliente_nombre', `%${filtroNombre}%`)
      }
      if (estado) {
        query = query.eq('estado', estado)
      }

      const { data, error } = await query

      if (error) {
        return { error: 'No se pudieron recuperar las reservas de la base de datos.' }
      }

      return { reservas: data, totalEncontrados: data?.length || 0 }
    },
  }),

  // 2. Herramienta para consultar movimientos de caja
  consultarCaja: tool({
    description: 'Consulta los movimientos recientes de caja y registros financieros para ver ingresos, egresos y estado financiero.',
    inputSchema: z.object({
      limite: z.number().optional().describe('Cantidad máxima de movimientos a retornar (por defecto 10)'),
    }),
    execute: async ({ limite }) => {
      const cantidad = limite ?? 10
      const { data, error } = await supabase
        .from('movimientos_caja')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(cantidad)

      if (error) {
        return { error: 'Error al consultar los movimientos de caja.' }
      }

      return { movimientos: data }
    },
  }),
}