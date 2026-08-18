import { supabase } from '../../supabase';
import type { CierreJornada, Reserva, TipoJornada } from '../../types';
import { fechaDeReserva } from '../../admin/validacion';
import { MEDIOS_PAGO } from '../../admin/constants';

export async function getCierresJornada(): Promise<CierreJornada[]> {
  const { data, error } = await supabase
    .from('cierres_jornada')
    .select('*')
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error al obtener cierres:', error);
    return [];
  }
  return (data ?? []) as CierreJornada[];
}

export function isJornadaCerrada(
  fecha: string,
  tipo: TipoJornada,
  cierres: CierreJornada[]
): boolean {
  return cierres.some((c) => c.fecha === fecha && c.tipo_jornada === tipo);
}

export function calcularArqueo(
  reservas: Reserva[],
  fecha: string,
  tipo: TipoJornada
): { total: number; desglose: Record<string, number> } {
  const delDia = reservas.filter(
    (r) =>
      r.servicio_tipo === tipo &&
      fechaDeReserva(r.fecha_hora_inicio) === fecha &&
      r.estado !== 'cancelado'
  );

  const desglose: Record<string, number> = {};
  for (const m of MEDIOS_PAGO) desglose[m.value] = 0;
  desglose.sin_medio = 0;

  let total = 0;
  for (const r of delDia) {
    if (r.estado_asistencia === 'asistio' || r.estado === 'confirmado') {
      const monto = Number(r.precio_total) || 0;
      total += monto;
      const key = r.medio_pago || 'sin_medio';
      desglose[key] = (desglose[key] || 0) + monto;
    }
  }

  return { total, desglose };
}

export async function cerrarJornada(
  fecha: string,
  tipo: TipoJornada,
  total: number,
  desglose: Record<string, number>,
  cerradoPor: string
): Promise<CierreJornada | null> {
  const { data, error } = await supabase
    .from('cierres_jornada')
    .insert({
      fecha,
      tipo_jornada: tipo,
      total_recaudado: total,
      desglose_medios_pago: desglose,
      cerrado_por: cerradoPor,
    })
    .select()
    .single();

  if (error) {
    console.error('Error al cerrar jornada:', error);
    return null;
  }
  return data as CierreJornada;
}

export async function desbloquearJornada(fecha: string, tipo: TipoJornada): Promise<boolean> {
  const { error } = await supabase
    .from('cierres_jornada')
    .delete()
    .eq('fecha', fecha)
    .eq('tipo_jornada', tipo);

  if (error) {
    console.error('Error al desbloquear jornada:', error);
    return false;
  }
  return true;
}
