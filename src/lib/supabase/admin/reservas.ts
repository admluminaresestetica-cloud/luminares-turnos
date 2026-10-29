import { supabase } from '../../supabase';
import type { EstadoAsistencia, EstadoReserva, MedioPago, Reserva } from '../../types';

import { acreditarPuntosTransaccion } from '../puntos';

// ---------------------------------------------------------------------------
// FUNCIÓN AUXILIAR: Acreditación de puntos y activación de referidos
// ---------------------------------------------------------------------------
export async function procesarAsistenciaYReferidos(reservaId: string) {
  console.log('🟢 [DEBUG] 1. Ejecutando procesarAsistenciaYReferidos para la reserva ID:', reservaId);

  const { data: reservaInfo, error: errorReserva } = await supabase
    .from('reservas')
    .select('user_id, precio_total, estado') // Traemos también el estado
    .eq('id', reservaId)
    .maybeSingle();

  console.log('🟢 [DEBUG] 2. Datos de la reserva encontrados:', reservaInfo, '| Error:', errorReserva);

  // 🛑 REQUISITO CLAVE: Solo procesar si el estado es realmente 'completado'
  if (reservaInfo?.estado !== 'completado') {
    console.log('⚠️ [DEBUG] La reserva no está completada (estado actual:', reservaInfo?.estado, '). No se otorgan puntos ni referidos.');
    return;
  }

  if (reservaInfo?.user_id) {
    console.log('🟢 [DEBUG] 3. user_id detectado con éxito:', reservaInfo.user_id);

    // 1. Acreditar puntos de fidelidad
    try {
      await acreditarPuntosTransaccion(
        reservaInfo.user_id,
        Number(reservaInfo.precio_total || 0),
        'reserva',
        reservaId
      );
      console.log('🟢 [DEBUG] 4. Puntos acreditados correctamente.');
    } catch (errPuntos) {
      console.error('🔴 [ERROR] Falló la acreditación de puntos:', errPuntos);
    }

    // 2. Activar automáticamente el código de referido del cliente
    const { data: clienteActualizado, error: errorActivacion } = await supabase
      .from('clientes')
      .update({ codigo_activo: true })
      .eq('user_id', reservaInfo.user_id)
      .select();

    console.log('🟢 [DEBUG] 5. Resultado de actualizar tabla clientes:', clienteActualizado, '| Error Supabase:', errorActivacion);

    if (errorActivacion) {
      console.error('🔴 [ERROR] Supabase rechazó activar el código de referido:', errorActivacion);
    }
  } else {
    console.log('⚠️ [ADVERTENCIA] La reserva NO tiene un user_id asociado. Por eso no se activó nada.');
  }
}

// ---------------------------------------------------------------------------
// OBTENER RESERVAS
// ---------------------------------------------------------------------------
export async function getAllReservas(): Promise<Reserva[]> {
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .order('fecha_hora_inicio', { ascending: true });

  if (error) {
    console.error('Error al obtener reservas:', error);
    return [];
  }
  return (data ?? []) as Reserva[];
}

export interface ActualizarReservaAdminInput {
  id: string;
  cliente_nombre?: string;
  cliente_celular?: string;
  fecha_hora_inicio?: string;
  estado?: EstadoReserva;
  estado_asistencia?: EstadoAsistencia;
  medio_pago?: MedioPago | string | null;
  precio_total?: number;
}

export async function actualizarReservaAdmin(input: ActualizarReservaAdminInput): Promise<Reserva | null> {
  const { id, ...campos } = input;
  const { data, error } = await supabase
    .from('reservas')
    .update({
      ...campos,
      fue_modificado: true,
      modificado_por_admin: true,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar reserva:', error);
    return null;
  }

  // Forzar la ejecución si se modificó el estado o la asistencia a algo válido
  await procesarAsistenciaYReferidos(id);

  return data as Reserva;
}

export async function actualizarCampoReserva(
  id: string,
  campos: Partial<Pick<Reserva, 'estado' | 'estado_asistencia' | 'medio_pago'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('reservas')
    .update({ ...campos, fue_modificado: true, modificado_por_admin: true })
    .eq('id', id);

  if (error) {
    console.error('Error al actualizar campo:', error);
    return false;
  }

  // Cada vez que el admin toque un estado o asistencia desde la tabla rápida, procesamos
  await procesarAsistenciaYReferidos(id);

  return true;
}

// ---------------------------------------------------------------------------
// BLOQUEOS MASIVOS Y UTILIDADES ADMIN
// ---------------------------------------------------------------------------
export interface CrearBloqueoInput {
  fecha: string;
  horas: string[];
  duracionMinutos?: number;
  nota: string;
  servicioTipo?: 'laser' | 'general';
}

export async function crearBloqueosMasivos(input: CrearBloqueoInput): Promise<boolean> {
  const { fecha, horas, duracionMinutos = 15, nota, servicioTipo = 'general' } = input;

  const registros = horas.map((hora) => {
    const [year, month, day] = fecha.split('-').map(Number);
    const [hours, minutes] = hora.split(':').map(Number);
    const fechaHoraInicio = new Date(year, month - 1, day, hours, minutes, 0).toISOString();
    const codigoRandom = Math.random().toString(36).substring(2, 7).toUpperCase();

    return {
      codigo_unico: `VIP-${codigoRandom}`,
      cliente_nombre: nota.trim() || 'Horario Bloqueado',
      cliente_celular: '0000000000',
      servicio_tipo: servicioTipo,
      detalle_reserva: { detalle_texto: `Bloqueo Manual Admin: ${nota}` },
      precio_total: 0,
      duracion_total: duracionMinutos,
      fecha_hora_inicio: fechaHoraInicio,
      estado: 'confirmado',
      estado_asistencia: 'pendiente',
      modificado_por_admin: true,
    };
  });

  const { error } = await supabase.from('reservas').insert(registros);

  if (error) {
    console.error('Error al crear bloqueos masivos:', error);
    return false;
  }

  return true;
}

export async function eliminarBloqueo(reservaId: string): Promise<boolean> {
  const { error } = await supabase.from('reservas').delete().eq('id', reservaId);

  if (error) {
    console.error('Error al eliminar bloqueo:', error);
    return false;
  }

  return true;
}