import { supabase } from '@/lib/supabase';
import { ClienteResumen, DetalleHistorialCliente } from './types';

// Obtener la lista general de clientes para el buscador
export async function obtenerListaClientes(): Promise<{ user_id: string; nombre: string; celular?: string }[]> {
  const { data: clientesData, error } = await supabase
    .from('clientes')
    .select('user_id, nombre, celular')
    .not('user_id', 'is', null);

  if (error) {
    console.error('Error cargando clientes:', error);
    return [];
  }

  return (clientesData || []).map((c) => ({
    user_id: c.user_id,
    nombre: c.nombre || 'Sin Nombre',
    celular: c.celular || '',
  }));
}

// Función auxiliar para calcular la franja horaria más frecuente
function calcularHorarioHabitual(fechas: string[]): string {
  if (fechas.length === 0) return 'Sin registros';

  const conteoFranjas = { Mañana: 0, Tarde: 0, Noche: 0 };

  fechas.forEach((fechaStr) => {
    if (!fechaStr) return;
    const hora = new Date(fechaStr).getHours();
    if (hora >= 8 && hora < 13) conteoFranjas.Mañana++;
    else if (hora >= 13 && hora < 19) conteoFranjas.Tarde++;
    else conteoFranjas.Noche++;
  });

  const franjaMasFrecuente = Object.entries(conteoFranjas).sort((a, b) => b[1] - a[1])[0];
  
  if (!franjaMasFrecuente || franjaMasFrecuente[1] === 0) return 'Sin definir';

  const mapaEtiquetas: Record<string, string> = {
    Mañana: 'Mañana (08:00 - 13:00 hs)',
    Tarde: 'Tarde (13:00 - 19:00 hs)',
    Noche: 'Noche (19:00 - 22:00 hs)',
  };

  return mapaEtiquetas[franjaMasFrecuente[0]];
}

// Obtener la radiografía completa de un cliente puntual
export async function obtenerAnalisisCliente(userId: string): Promise<{ resumen: ClienteResumen; detalle: DetalleHistorialCliente } | null> {
  try {
    // 1. Datos personales (Tabla clientes)
 // 1. Datos personales (Tabla clientes - ahora incluye email)
    const { data: clienteData } = await supabase
      .from('clientes')
      .select('user_id, nombre, celular, avatar_url, created_at, codigo_referido, email')
      .eq('user_id', userId)
      .maybeSingle();

    // 2. Historial de Reservas
    const { data: reservasData } = await supabase
      .from('reservas')
      .select('id, fecha_hora_inicio, servicio_tipo, precio_total, estado, estado_asistencia')
      .eq('user_id', userId)
      .order('fecha_hora_inicio', { ascending: false });

    // 3. Historial de Pedidos (incluimos cliente_email y direccion)
    const { data: pedidosData } = await supabase
      .from('pedidos')
      .select('id, created_at, total, estado, metodo_pago, cliente_email, direccion')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // 4. Detalle de items comprados (pedido_items)
    const pedidoIds = (pedidosData || []).map((p) => p.id);
    let itemsComprados: { nombre_producto: string; cantidad: number }[] = [];

    if (pedidoIds.length > 0) {
      const { data: itemsData } = await supabase
        .from('pedido_items')
        .select('nombre_producto, cantidad')
        .in('pedido_id', pedidoIds);

      if (itemsData) {
        itemsComprados = itemsData;
      }
    }

    // 5. Puntos de fidelización
    const { data: puntosData } = await supabase
      .from('puntos_usuarios')
      .select('puntos_actuales, puntos_totales')
      .eq('user_id', userId)
      .maybeSingle();

    // --- CÁLCULOS Y ESTADÍSTICAS ---
    const reservas = reservasData || [];
    const pedidos = pedidosData || [];

    const gastadoEnReservas = reservas.reduce((acc, r) => acc + (Number(r.precio_total) || 0), 0);
    const gastadoEnPedidos = pedidos.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
    const totalGastado = gastadoEnReservas + gastadoEnPedidos;

    // Email y Dirección extraídos del último pedido cargado
    const ultimoPedidoConDatos = pedidos.find((p) => p.cliente_email || p.direccion);
    const emailEncontrado = ultimoPedidoConDatos?.cliente_email || '';
    const direccionEncontrada = ultimoPedidoConDatos?.direccion || '';

    // Calcular servicio preferido
    const conteoServicios: Record<string, number> = {};
    reservas.forEach((r) => {
      if (r.servicio_tipo) {
        conteoServicios[r.servicio_tipo] = (conteoServicios[r.servicio_tipo] || 0) + 1;
      }
    });
    const servicioFavorito = Object.entries(conteoServicios).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sin registros';

    // Calcular producto preferido
    const conteoProductos: Record<string, number> = {};
    itemsComprados.forEach((item) => {
      conteoProductos[item.nombre_producto] = (conteoProductos[item.nombre_producto] || 0) + item.cantidad;
    });
    const productoFavorito = Object.entries(conteoProductos).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sin compras';

    // Calcular horario habitual combinando reservas y pedidos
    const todasLasFechas = [
      ...reservas.map((r) => r.fecha_hora_inicio),
      ...pedidos.map((p) => p.created_at),
    ];
    const horarioHabitual = calcularHorarioHabitual(todasLasFechas);

const resumen: ClienteResumen = {
      user_id: userId,
      nombre: clienteData?.nombre || 'Cliente sin nombre',
      email: clienteData?.email || emailEncontrado, // Busca en clientes o recurre al pedido
      celular: clienteData?.celular || '',
      avatar_url: clienteData?.avatar_url || '',
      created_at: clienteData?.created_at,
      codigo_referido: clienteData?.codigo_referido || '',
      direccion: direccionEncontrada,
      totalGastado,
      totalReservas: reservas.length,
      totalPedidos: pedidos.length,
      puntosActuales: puntosData?.puntos_actuales || 0,
      puntosTotales: puntosData?.puntos_totales || 0,
      servicioFavorito,
      productoFavorito,
      horarioHabitual,
      ultimaVisita: reservas[0]?.fecha_hora_inicio || pedidos[0]?.created_at,
    };

    const detalle: DetalleHistorialCliente = {
      reservas: reservas.map((r) => ({
        id: r.id,
        fecha_hora_inicio: r.fecha_hora_inicio,
        servicio_tipo: r.servicio_tipo,
        precio_total: Number(r.precio_total) || 0,
        estado: r.estado,
        estado_asistencia: r.estado_asistencia,
      })),
      pedidos: pedidos.map((p) => ({
        id: p.id,
        created_at: p.created_at,
        total: Number(p.total) || 0,
        estado: p.estado,
        metodo_pago: p.metodo_pago,
        direccion: p.direccion,
      })),
      productosComprados: itemsComprados,
    };

    return { resumen, detalle };
  } catch (err) {
    console.error('Error procesando análisis del cliente:', err);
    return null;
  }
}