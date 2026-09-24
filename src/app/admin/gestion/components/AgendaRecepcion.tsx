'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Calendar, Clock, Search, ChevronRight, CheckCircle2, UserCheck } from 'lucide-react';
import BadgeModificado from './BadgeModificado';
import { verificarSiFueModificado } from '@/utils/turnoHelpers';

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
          clase: 'bg-rose-500 text-white shadow-xs',
          texto: 'En Gabinete',
          icono: <UserCheck className="w-3.5 h-3.5 shrink-0" />
        };
      case 'atendido':
      case 'finalizado':
        return {
          clase: 'bg-emerald-600 text-white shadow-xs',
          texto: 'Atendido',
          icono: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        };
      case 'confirmado':
        return {
          clase: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold',
          texto: 'Confirmado',
          icono: null
        };
      default:
        return {
          clase: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold',
          texto: estado || 'Pendiente',
          icono: null
        };
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      
      {/* Cabecera y Filtros */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Calendar className="h-4 w-4 shrink-0" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
              Agenda del Día ({turnos.length})
            </h2>
          </div>
        </div>

        {/* Filtros rápidos estilo Pills con scroll horizontal táctil */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {['todos', 'confirmado', 'en_gabinete', 'atendido'].map((est) => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold capitalize whitespace-nowrap transition-all active:scale-95 ${
                filtroEstado === est
                  ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              {est.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Buscador cómodo para celular */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por cliente o celular..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3 pl-10 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:bg-zinc-900 transition-all"
        />
      </div>

      {/* Lista de turnos */}
      {loading ? (
        <div className="py-12 text-center text-sm font-semibold text-slate-400 dark:text-zinc-500">
          Cargando agenda de hoy...
        </div>
      ) : (
        <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
          {turnosFiltrados.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm font-medium text-slate-400 dark:border-zinc-800 dark:text-zinc-500">
              No se encontraron turnos programados para hoy con esos filtros.
            </div>
          ) : (
            turnosFiltrados.map((turno) => {
              const seleccionado = turnoSeleccionadoId === turno.id;
              
              // Formato 24 hs sin a.m./p.m. para evitar desbordes visuales
              const horaTurno = new Date(turno.fecha_hora_inicio).toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              });

              const badge = obtenerBadgeEstado(turno.estado);
              const estaEnGabinete = turno.estado === 'en_gabinete';
              const modificado = verificarSiFueModificado(turno);

              return (
                <div
                  key={turno.id}
                  onClick={() => onSeleccionarTurno(turno)}
                  className={`group flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 sm:p-4 transition-all active:scale-[0.98] ${
                    seleccionado
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-sm ring-2 ring-emerald-500/20'
                      : estaEnGabinete
                      ? 'border-rose-300 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20'
                      : 'border-slate-200/90 bg-white hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Badge visual de hora limpio y amplio */}
                    <div className="flex h-11 min-w-[64px] px-2 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs">
                      <Clock className="h-3 w-3 opacity-70 mb-0.5" />
                      <span className="text-xs font-black tracking-tight whitespace-nowrap">
                        {horaTurno} hs
                      </span>
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 truncate capitalize">
                          {turno.cliente_nombre}
                        </p>
                        <BadgeModificado fueModificado={modificado} />
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 truncate">
                        {turno.servicio_tipo || 'Servicio General'} • <span className="text-slate-600 dark:text-zinc-300 font-bold">{turno.cliente_celular || 'Sin cel'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${badge.clase}`}>
                      {badge.icono}
                      <span>{badge.texto}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
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
