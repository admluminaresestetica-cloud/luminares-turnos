import { supabase } from '../../supabase';
import type { EstadoAsistencia, EstadoReserva, MedioPago, Reserva } from '../../types';

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
  return true;
}

// Agregar al final de src/lib/supabase/admin/reservas.ts

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
      estado: 'bloqueado',
      estado_asistencia: 'pendiente',
      modificado_por_admin: true,
      fue_modificado: true,
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