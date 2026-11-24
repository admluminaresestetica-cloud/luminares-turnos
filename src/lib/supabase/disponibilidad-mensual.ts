import { supabase } from '@/lib/supabase';
import {
  BloqueHorario,
  DisponibilidadMensualGeneral,
  FiltroDisponibilidadGeneral,
} from '@/lib/types';

export interface EmpleadoDisponible {
  id: string;
  nombre: string;
  rol: 'admin' | 'empleado';
}

function normalizarBloques(bloques: unknown): BloqueHorario[] {
  if (!Array.isArray(bloques)) return [];
  return bloques
    .filter(
      (b): b is { inicio: string; fin: string } =>
        Boolean(b) &&
        typeof (b as { inicio?: unknown }).inicio === 'string' &&
        typeof (b as { fin?: unknown }).fin === 'string'
    )
    .map((b) => ({
      inicio: b.inicio.slice(0, 5),
      fin: b.fin.slice(0, 5),
    }));
}

function normalizarRegistro(row: Record<string, unknown>): DisponibilidadMensualGeneral {
  return {
    id: typeof row.id === 'string' ? row.id : undefined,
    fecha: String(row.fecha).slice(0, 10),
    empleado_id: (row.empleado_id as string | null) ?? null,
    activo: Boolean(row.activo),
    bloques: normalizarBloques(row.bloques),
    created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
    updated_at: typeof row.updated_at === 'string' ? row.updated_at : undefined,
  };
}

/**
 * Lista perfiles activos para asignar disponibilidad mensual por persona si se desea.
 */
export async function obtenerEmpleadosActivos(): Promise<EmpleadoDisponible[]> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('id, nombre, rol')
    .eq('activo', true)
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al obtener empleados activos:', error.message);
    return [];
  }

  return (data || []) as EmpleadoDisponible[];
}

/**
 * Obtiene toda la disponibilidad mensual de Servicios Generales para un mes (anioMes = "YYYY-MM")
 * y un filtro ('general' para empleado_id IS NULL, o un empleado_id puntual).
 */
export async function obtenerDisponibilidadMesGeneral(
  anioMes: string,
  filtro: FiltroDisponibilidadGeneral = 'general'
): Promise<DisponibilidadMensualGeneral[]> {
  const [yearStr, monthStr] = anioMes.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);

  if (!year || !month) return [];

  const fechaDesde = `${yearStr}-${monthStr}-01`;
  const ultimoDia = new Date(year, month, 0).getDate();
  const fechaHasta = `${yearStr}-${monthStr}-${String(ultimoDia).padStart(2, '0')}`;

  let query = supabase
    .from('disponibilidad_mensual_general')
    .select('*')
    .gte('fecha', fechaDesde)
    .lte('fecha', fechaHasta)
    .order('fecha', { ascending: true });

  if (filtro === 'general') {
    query = query.is('empleado_id', null);
  } else {
    query = query.eq('empleado_id', filtro);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error al obtener disponibilidad mensual general:', error.message);
    return [];
  }

  return (data || []).map((row) => normalizarRegistro(row as Record<string, unknown>));
}

/**
 * Obtiene registros de disponibilidad mensual general para una fecha exacta.
 * Si se pasa empleadoId, busca ese empleado; si es null, busca el calendario general.
 */
export async function obtenerDisponibilidadPorFechaGeneral(
  fecha: string,
  empleadoId: string | null = null
): Promise<DisponibilidadMensualGeneral | null> {
  let query = supabase
    .from('disponibilidad_mensual_general')
    .select('*')
    .eq('fecha', fecha);

  query = empleadoId ? query.eq('empleado_id', empleadoId) : query.is('empleado_id', null);

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Error al obtener disponibilidad por fecha:', error.message);
    return null;
  }

  return data ? normalizarRegistro(data as Record<string, unknown>) : null;
}

/**
 * Guarda o actualiza (upsert) la disponibilidad de uno o varios días en un solo lote.
 */
export async function guardarDisponibilidadDiasGeneral(
  items: {
    fecha: string;
    empleado_id?: string | null;
    activo: boolean;
    bloques: BloqueHorario[];
  }[]
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!items.length) return { ok: true };

    for (const item of items) {
      const empId = item.empleado_id ?? null;

      let consultaExistente = supabase
        .from('disponibilidad_mensual_general')
        .select('id')
        .eq('fecha', item.fecha);

      if (empId) {
        consultaExistente = consultaExistente.eq('empleado_id', empId);
      } else {
        consultaExistente = consultaExistente.is('empleado_id', null);
      }

      const { data: existente, error: errorBuscar } = await consultaExistente.maybeSingle();

      if (errorBuscar) {
        return { ok: false, error: errorBuscar.message };
      }

      const payload = {
        fecha: item.fecha,
        empleado_id: empId,
        activo: item.activo,
        bloques: item.activo ? item.bloques : [],
      };

      if (existente?.id) {
        const { error: errorUpdate } = await supabase
          .from('disponibilidad_mensual_general')
          .update(payload)
          .eq('id', existente.id);

        if (errorUpdate) {
          return { ok: false, error: errorUpdate.message };
        }
      } else {
        const { error: errorInsert } = await supabase
          .from('disponibilidad_mensual_general')
          .insert(payload);

        if (errorInsert) {
          return { ok: false, error: errorInsert.message };
        }
      }
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Error inesperado al guardar.' };
  }
}

/**
 * Elimina el override mensual de una fecha (vuelve a regirse por la regla semanal normal).
 */
export async function eliminarDisponibilidadDiaGeneral(
  fecha: string,
  empleadoId: string | null = null
): Promise<{ ok: boolean; error?: string }> {
  let query = supabase
    .from('disponibilidad_mensual_general')
    .delete()
    .eq('fecha', fecha.slice(0, 10));

  query = empleadoId ? query.eq('empleado_id', empleadoId) : query.is('empleado_id', null);

  const { error } = await query;

  if (error) {
    console.error('Error al eliminar disponibilidad del día:', error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}