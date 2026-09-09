import { supabase } from '../supabase';
import type {
  DetalleReservaGeneral,
  DetalleReservaLaser,
  Reserva,
  TipoServicio,
} from '../types';

export interface CrearReservaInput {
  cliente_nombre: string;
  cliente_celular: string;
  codigo_referido_usado?: string | null;
  servicio_tipo: TipoServicio;
  detalle_reserva: DetalleReservaLaser | DetalleReservaGeneral;
  precio_total: number;
  duracion_total: number;
  fecha_hora_inicio: string;
}

export async function getReservasPorFecha(fecha: string): Promise<Reserva[]> {
  const inicio = `${fecha}T00:00:00`;
  const fin = `${fecha}T23:59:59.999`;

  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .gte('fecha_hora_inicio', inicio)
    .lte('fecha_hora_inicio', fin)
    .neq('estado', 'cancelado');

  if (error) {
    console.error('Error al obtener reservas del día:', error);
    return [];
  }

  return data ?? [];
}

export async function crearReserva(input: CrearReservaInput): Promise<Reserva | null> {
  const { data, error } = await supabase
    .from('reservas')
    .insert({
      ...input,
      estado: 'pendiente_sena',
    })
    .select()
    .single();

  if (error) {
    console.error('Error al crear reserva:', error);
    return null;
  }

  return data;
}

export async function buscarReserva(
  celular: string,
  codigo: string
): Promise<Reserva | null> {
  try {
    const celularNorm = celular.replace(/\D/g, '');
    const numeroCodigo = codigo.replace('#', '').trim();

    console.log('--- BUSCANDO RESERVA ---');
    console.log('Ingresado -> Celular limpia:', celularNorm, '| Código limpia:', numeroCodigo);

    if (!numeroCodigo) return null;

    // Consultamos en Supabase buscando los registros cuyo código contenga o coincida con la parte numérica
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .ilike('codigo_unico', `%${numeroCodigo}%`);

    if (error) {
      console.error('Error de Supabase al buscar reserva:', error);
      return null;
    }

    console.log('Registros encontrados en Supabase por código:', data);

    if (!data || data.length === 0) {
      console.log('No se encontró ninguna reserva en Supabase con ese código.');
      return null;
    }

    // Comparamos el celular
    const reserva = data.find((r) => {
      if (!r.cliente_celular) return false;
      const celReserva = r.cliente_celular.replace(/\D/g, '');
      console.log('Comparando cel DB:', celReserva, 'vs cel buscado:', celularNorm);
      return (
        celReserva === celularNorm ||
        celReserva.endsWith(celularNorm) ||
        celularNorm.endsWith(celReserva)
      );
    });

    console.log('Reserva final matcheada:', reserva);
    return reserva ?? null;
  } catch (err) {
    console.error('Error inesperado en buscarReserva:', err);
    return null;
  }
}

export async function cancelarReserva(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('reservas')
    .update({ estado: 'cancelado' })
    .eq('id', id);

  if (error) {
    console.error('Error al cancelar reserva:', error);
    return false;
  }

  return true;
}
