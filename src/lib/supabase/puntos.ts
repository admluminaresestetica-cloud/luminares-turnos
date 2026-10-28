import { supabase } from '@/lib/supabase';
import { getConfiguracionSistema } from './configuracion';

export async function acreditarPuntosTransaccion(
  userId: string,
  montoTotal: number,
  tipoTransaccion: 'pedido' | 'reserva',
  transaccionId: string
): Promise<boolean> {
  console.log('--- [PUNTOS] INICIO ACREDITACIÓN ---');
  console.log('Datos recibidos:', { userId, montoTotal, tipoTransaccion, transaccionId });

  if (!userId) {
    console.warn('⚠️ [PUNTOS] Cancelado: userId está vacío/null.');
    return false;
  }

  if (montoTotal <= 0) {
    console.warn('⚠️ [PUNTOS] Cancelado: montoTotal es menor o igual a 0.');
    return false;
  }

  // 1. Configuración
  const config = await getConfiguracionSistema();
  console.log('Configuración del sistema:', config);

  if (!config || !config.puntos_activo) {
    console.warn('⚠️ [PUNTOS] Cancelado: El sistema de puntos está desactivado en la configuración.');
    return false;
  }

  const pesosPorPunto = config.puntos_pesos_por_punto || 1000;
  console.log('Pesos por punto:', pesosPorPunto);

  // 2. Cálculo
  const puntosAGenerar = Math.floor(montoTotal / pesosPorPunto);
  console.log('Puntos a generar calculados:', puntosAGenerar);

  if (puntosAGenerar <= 0) {
    console.warn(`⚠️ [PUNTOS] Cancelado: El monto ($${montoTotal}) no alcanza el mínimo de $${pesosPorPunto} para otorgar al menos 1 punto.`);
    return true;
  }

  // 3. Verificación de duplicado
  const tabla = tipoTransaccion === 'pedido' ? 'pedidos' : 'reservas';
  const { data: trxActual, error: errorCheck } = await supabase
    .from(tabla)
    .select('puntos_otorgados')
    .eq('id', transaccionId)
    .single();

  if (errorCheck) {
    console.error('❌ [PUNTOS] Error al verificar puntos_otorgados en DB:', errorCheck);
    return false;
  }

  if (trxActual?.puntos_otorgados) {
    console.warn('⚠️ [PUNTOS] Cancelado: Esta transacción ya tenía puntos_otorgados = true.');
    return false;
  }

  // 4. Obtener puntos actuales
  const { data: registroActual, error: errorPuntos } = await supabase
    .from('puntos_usuarios')
    .select('puntos_totales')
    .eq('user_id', userId)
    .maybeSingle();

  if (errorPuntos) {
    console.error('❌ [PUNTOS] Error al consultar puntos_usuarios:', errorPuntos);
  }

  const puntosAnteriores = registroActual?.puntos_totales || 0;
  const nuevosPuntos = puntosAnteriores + puntosAGenerar;
  console.log(`Puntos anteriores: ${puntosAnteriores} | Nuevos puntos: ${nuevosPuntos}`);

  // 5. Guardar en puntos_usuarios
  const { error: errorUpsert } = await supabase
    .from('puntos_usuarios')
    .upsert(
      { 
        user_id: userId, 
        puntos_totales: nuevosPuntos,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id' }
    );

  if (errorUpsert) {
    console.error('❌ [PUNTOS] Error al hacer upsert en puntos_usuarios (posible falta de RLS/permiso):', errorUpsert);
    return false;
  }

  // 6. Marcar transacción
  const { error: errorUpdateTrx } = await supabase
    .from(tabla)
    .update({ puntos_otorgados: true })
    .eq('id', transaccionId);

  if (errorUpdateTrx) {
    console.error(`❌ [PUNTOS] Error al marcar puntos_otorgados en ${tabla}:`, errorUpdateTrx);
    return false;
  }

  console.log('✅ [PUNTOS] ¡Acreditación realizada con éxito!');
  return true;
}