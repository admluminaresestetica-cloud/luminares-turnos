import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { messages, modo } = await req.json()
    const recentMessages = messages.slice(-6)
    const lastUserMessage = messages[messages.length - 1]?.content || ''

    // Definimos el modo de búsqueda (por defecto 'todos' si no se envía nada)
    const modoFiltro = modo || 'todos'

    let reservas = null
    let movimientos = null
    let pedidos = null
    let productosParaIA: any[] = []

    // 1. CONSULTAS CONDICIONALES EXCLUSIVAS (Ahorro de procesamiento en Supabase)
    if (modoFiltro === 'reservas' || modoFiltro === 'todos') {
      const { data } = await supabase
        .from('reservas')
        .select('cliente_nombre, cliente_celular, servicio_tipo, fecha_hora_inicio, estado, precio_total, estado_pago')
        .or('eliminado.is.null,eliminado.eq.false')
        .order('fecha_hora_inicio', { ascending: false })
        .limit(10)
      reservas = data
    }

    if (modoFiltro === 'caja' || modoFiltro === 'todos') {
      const { data } = await supabase
        .from('movimientos_caja')
        .select('monto, tipo, concepto, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      movimientos = data
    }

    if (modoFiltro === 'pedidos' || modoFiltro === 'todos') {
      const { data } = await supabase
        .from('pedidos')
        .select('id, nombre_cliente, total, estado, metodo_envio, metodo_pago, created_at, items')
        .order('created_at', { ascending: false })
        .limit(5)
      pedidos = data
    }

    if (modoFiltro === 'productos' || modoFiltro === 'todos') {
      let queryProductos = supabase
        .from('productos')
        .select('nombre, categoria, precio, stock, stock_minimo, codigo_barras')
        .or('activo.is.null,activo.eq.true')

      // Limpiamos la frase del usuario sacando muletillas comunes
      const cleanInput = lastUserMessage
        .toLowerCase()
        .replace(/(me|decis|dime|de|el|la|los|las|un|una|del|en|para|precio|cuanto|cuesta|sale|valen|stock|hay|\?|\!)/gi, ' ')
        .trim()

      const keywords = cleanInput.split(/\s+/).filter((word: string) => word.length > 2)

      if (keywords.length > 0) {
        const conditions = keywords
          .map((kw: string) => `nombre.ilike.%${kw}%,categoria.ilike.%${kw}%`)
          .join(',')
        queryProductos = queryProductos.or(conditions)
      }

      const { data: productosEncontrados } = await queryProductos.limit(20)

      productosParaIA = productosEncontrados || []
      if (productosParaIA.length === 0 && modoFiltro === 'todos') {
        const { data: fallbackProductos } = await supabase
          .from('productos')
          .select('nombre, categoria, precio, stock, stock_minimo, codigo_barras')
          .or('activo.is.null,activo.eq.true')
          .order('nombre', { ascending: true })
          .limit(25)
        productosParaIA = fallbackProductos || []
      }
    }

    // 2. MINIFICACIÓN DE JSON (Ahorro masivo de tokens para Groq)
    const datosCompactos: any = {}

    if (reservas) {
      datosCompactos.res = reservas.map((r: any) => ({
        n: r.cliente_nombre,
        s: r.servicio_tipo,
        f: r.fecha_hora_inicio,
        e: r.estado,
        p: r.precio_total
      }))
    }

    if (movimientos) {
      datosCompactos.caj = movimientos.map((m: any) => ({
        m: m.monto,
        t: m.tipo,
        c: m.concepto
      }))
    }

    if (pedidos) {
      datosCompactos.ped = pedidos.map((p: any) => ({
        cli: p.nombre_cliente,
        tot: p.total,
        est: p.estado
      }))
    }

    if (productosParaIA.length > 0) {
      datosCompactos.pro = productosParaIA.map((p: any) => ({
        n: p.nombre,
        p: p.precio,
        s: p.stock,
        cat: p.categoria
      }))
    }

    // Obtenemos la fecha actual en zona horaria local
    const hoy = new Date().toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const systemPrompt = `Sos el asistente administrativo inteligente de "Luminares".
FECHA Y HORA ACTUAL DEL SISTEMA: ${hoy}
MODO DE BÚSQUEDA ACTIVO: ${modoFiltro.toUpperCase()}

LEYENDA DE DATOS:
- res = Reservas (n: cliente, s: servicio, f: fecha/hora, e: estado, p: precio)
- caj = Caja (m: monto, t: tipo, c: concepto)
- ped = Pedidos (cli: cliente, tot: total, est: estado)
- pro = Productos (n: nombre, p: precio, s: stock, cat: categoría)

REGLAS DE RESPUESTA:
- Usa la FECHA ACTUAL para interpretar términos relativos como "hoy", "mañana" o "ayer".
- Responde SOLAMENTE con el dato puntual de forma concisa y directa según el modo activo (${modoFiltro}). No des detalles innecesarios.
- Si se listan varios elementos, usa viñetas (*) cortas. Nunca uses tablas Markdown verticales.

DATOS EN TIEMPO REAL:
${JSON.stringify(datosCompactos)}`

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...recentMessages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      model: 'openai/gpt-oss-120b',
    })

    const reply = completion.choices[0]?.message?.content || 'No pude procesar la consulta.'

    return new Response(JSON.stringify({ content: reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('ERROR EN GROQ ROUTE:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Error al conectar con la IA' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}