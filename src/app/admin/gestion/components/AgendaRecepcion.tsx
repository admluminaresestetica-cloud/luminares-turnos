'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Calendar, Clock, Search, ChevronRight, CheckCircle2, UserCheck } from 'lucide-react';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AgendaRecepcionProps {
  onSeleccionarTurno: (turno: any) => void;
  turnoSeleccionadoId?: string;
}

export default function AgendaRecepcion({
  onSeleccionarTurno,
  turnoSeleccionadoId,
}: AgendaRecepcionProps) {
  const [turnos, setTurnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const cargarTurnosHoy = async () => {
    setLoading(true);
    try {
      const hoy = new Date();
      const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString();
      const finDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1).toISOString();

      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .gte('fecha_hora_inicio', inicioDia)
        .lt('fecha_hora_inicio', finDia)
        .eq('eliminado', false)
        .order('fecha_hora_inicio', { ascending: true });

      if (error) {
        console.error('Error al cargar reservas del día:', error);
      } else if (data) {
        setTurnos(data);
      }
    } catch (err) {
      console.error('Excepción al consultar agenda:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTurnosHoy();
  }, []);

  // Filtrado de turnos
  const turnosFiltrados = turnos.filter((t) => {
    const coincideTexto = 
      `${t.cliente_nombre || ''} ${t.cliente_celular || ''}`.toLowerCase().includes(busqueda.toLowerCase());
    
    if (filtroEstado === 'todos') return coincideTexto;
    return coincideTexto && t.estado === filtroEstado;
  });

  // Retorna estilos e iconos según el estado del turno
  const obtenerBadgeEstado = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'en_gabinete':
        return {
          clase: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60',
          texto: 'En Gabinete',
          icono: <UserCheck className="w-3 h-3 shrink-0" />
        };
      case 'atendido':
      case 'finalizado':
        return {
          clase: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60',
          texto: 'Atendido',
          icono: <CheckCircle2 className="w-3 h-3 shrink-0" />
        };
      case 'confirmado':
        return {
          clase: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
          texto: 'Confirmado',
          icono: null
        };
      default:
        return {
          clase: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
          texto: estado || 'Pendiente',
          icono: null
        };
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-500 shrink-0" />
          <h2 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            Agenda del Día ({turnos.length})
          </h2>
        </div>

        {/* Filtros rápidos de estado adaptables */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {['todos', 'confirmado', 'en_gabinete', 'atendido'].map((est) => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize whitespace-nowrap transition-all ${
                filtroEstado === est
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              {est.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por cliente o celular..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-2.5 pl-9 pr-3 text-xs focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      {/* Lista de turnos */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Cargando agenda de hoy...</div>
      ) : (
        <div className="max-h-[460px] space-y-2.5 overflow-y-auto pr-1">
          {turnosFiltrados.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-zinc-800 dark:text-zinc-600">
              No se encontraron turnos programados para hoy con esos filtros.
            </p>
          ) : (
            turnosFiltrados.map((turno) => {
              const seleccionado = turnoSeleccionadoId === turno.id;
              const horaTurno = new Date(turno.fecha_hora_inicio).toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const badge = obtenerBadgeEstado(turno.estado);
              const estaEnGabinete = turno.estado === 'en_gabinete';

              return (
                <div
                  key={turno.id}
                  onClick={() => onSeleccionarTurno(turno)}
                  className={`group flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all active:scale-[0.99] ${
                    seleccionado
                      ? 'border-emerald-500 bg-emerald-50/60 shadow-xs dark:bg-emerald-950/30'
                      : estaEnGabinete
                      ? 'border-rose-200 bg-rose-50/30 dark:border-rose-900/40 dark:bg-rose-950/10'
                      : 'border-slate-200/80 bg-slate-50/30 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-100/60 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold">{horaTurno}</span>
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                        {turno.cliente_nombre}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                        {turno.servicio_tipo || 'Servicio General'} • <span className="text-slate-400">{turno.cliente_celular || 'Sin celular'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium capitalize ${badge.clase}`}>
                      {badge.icono}
                      <span>{badge.texto}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 hidden sm:block" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}