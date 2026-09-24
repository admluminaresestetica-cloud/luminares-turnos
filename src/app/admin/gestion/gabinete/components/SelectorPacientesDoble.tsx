'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { UserCheck, Clock, Search, Calendar, ChevronRight } from 'lucide-react';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SelectorPacientesDobleProps {
  onSeleccionarPaciente: (paciente: any) => void;
  pacienteSeleccionadoId?: string;
  refrescarTrigger?: number;
}

export default function SelectorPacientesDoble({
  onSeleccionarPaciente,
  pacienteSeleccionadoId,
  refrescarTrigger,
}: SelectorPacientesDobleProps) {
  const [enEspera, setEnEspera] = useState<any[]>([]);
  const [atendidosHoy, setAtendidosHoy] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const cargarPacientes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pacientes_ficha')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error al cargar pacientes_ficha:', error);
      } else if (data) {
        // Obtenemos la fecha de hoy en formato YYYY-MM-DD
        const hoyStr = new Date().toISOString().split('T')[0];

        const espera = data.filter(
          (p: any) => p.estado_atencion !== 'atendido' && p.estado_atencion !== 'cancelado'
        );

        // Filtramos estrictamente los atendidos cuya fecha de actualización pertenezca al día de hoy
        const completados = data.filter((p: any) => {
          if (p.estado_atencion !== 'atendido') return false;
          const fechaAtencion = p.updated_at || p.created_at;
          if (!fechaAtencion) return false;
          return fechaAtencion.startsWith(hoyStr);
        });

        setEnEspera(espera);
        setAtendidosHoy(completados);
      }
    } catch (err) {
      console.error('Excepción al cargar pacientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, [refrescarTrigger]);

  // Filtrar listas según la barra de búsqueda local
  const esperaFiltrados = enEspera.filter((p) =>
    `${p.nombre} ${p.apellido} ${p.celular}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const atendidosFiltrados = atendidosHoy.filter((p) =>
    `${p.nombre} ${p.apellido} ${p.celular}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* Buscador rápido */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar paciente en gabinete..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-2.5 pl-9 pr-3 text-xs focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-slate-400">Actualizando bandejas...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* BANDEJA 1: EN ESPERA / PENDIENTES */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-200">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                En Espera ({esperaFiltrados.length})
              </span>
            </div>

            <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
              {esperaFiltrados.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-[11px] text-slate-400 dark:border-zinc-800 dark:text-zinc-600">
                  No hay pacientes en espera.
                </p>
              ) : (
                esperaFiltrados.map((paciente) => {
                  const seleccionado = pacienteSeleccionadoId === paciente.id;
                  return (
                    <div
                      key={paciente.id}
                      onClick={() => onSeleccionarPaciente(paciente)}
                      className={`group flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                        seleccionado
                          ? 'border-emerald-500 bg-emerald-50/60 shadow-xs dark:bg-emerald-950/30'
                          : 'border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                          {paciente.nombre} {paciente.apellido}
                        </p>
                        <p className="text-[10px] text-slate-400">Cel: {paciente.celular || 'S/D'}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* BANDEJA 2: ATENDIDOS HOY */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-200">
                <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                Atendidos Hoy ({atendidosFiltrados.length})
              </span>
            </div>

            <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
              {atendidosFiltrados.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-[11px] text-slate-400 dark:border-zinc-800 dark:text-zinc-600">
                  Ningún paciente atendido todavía en el día.
                </p>
              ) : (
                atendidosFiltrados.map((paciente) => {
                  const seleccionado = pacienteSeleccionadoId === paciente.id;
                  return (
                    <div
                      key={paciente.id}
                      onClick={() => onSeleccionarPaciente(paciente)}
                      className={`group flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                        seleccionado
                          ? 'border-emerald-500 bg-emerald-50/60 shadow-xs dark:bg-emerald-950/30'
                          : 'border-slate-200/80 bg-emerald-50/20 hover:bg-emerald-50/40 dark:border-zinc-800 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                          {paciente.nombre} {paciente.apellido}
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Atendido hoy a las{' '}
                          {new Date(paciente.updated_at || paciente.created_at).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
