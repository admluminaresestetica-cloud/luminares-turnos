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
