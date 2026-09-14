'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users, UserCheck, Clock, ArrowRight } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SelectorPacientesDobleProps {
  pacienteSeleccionado: any;
  setPacienteSeleccionado: (paciente: any) => void;
  sesionActual: any;
  setSesionActual: (sesion: any) => void;
}

export default function SelectorPacientesDoble({
  pacienteSeleccionado,
  setPacienteSeleccionado,
  sesionActual,
  setSesionActual,
}: SelectorPacientesDobleProps) {
  const [enEspera, setEnEspera] = useState<any[]>([]);
  const [atendidosHoy, setAtendidosHoy] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const cargarPacientes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pacientes_ficha')
        .select('*');

      console.log('DATOS BRUTOS SUPABASE:', data);
      console.log('ERROR SUPABASE:', error);

      if (error) throw error;

      if (data) {
        const espera = data.filter((p: any) => p.estado_atencion !== 'atendido' && p.estado_atencion !== 'cancelado');
        const completados = data.filter((p: any) => p.estado_atencion === 'atendido');

        setEnEspera(espera);
        setAtendidosHoy(completados);
      }
    } catch (err) {
      console.error('Error al cargar la lista de pacientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPacientes();

    // Suscripción en tiempo real a cambios en pacientes_ficha
    const channel = supabase
      .channel('cambios_pacientes_gabinete')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pacientes_ficha' },
        () => {
          cargarPacientes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const seleccionarPaciente = (paciente: any) => {
    // Al unificar todo en pacientes_ficha, la "sesionActual" pasa a ser el mismo objeto del paciente
    setSesionActual(paciente);
    setPacienteSeleccionado({
      ...paciente,
      nombre: paciente.nombre_completo || 'Paciente',
      telefono: paciente.celular || 'N/A',
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* BANDEJA 1: EN ESPERA */}
      <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-zinc-800">
          <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400">
            <Clock className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">En Espera de Gabinete</h3>
          </div>
          <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
            {enEspera.length}
          </span>
        </div>

        {loading ? (
          <p className="text-xs italic text-slate-400 dark:text-zinc-500">Actualizando lista...</p>
        ) : enEspera.length === 0 ? (
          <p className="text-xs italic text-slate-400 dark:text-zinc-500">No hay pacientes esperando en este momento.</p>
        ) : (
          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
            {enEspera.map((pac) => {
              const esSeleccionado = sesionActual?.id === pac.id;
              
              // Extraer zonas de forma segura si están guardadas como JSON
              let zonasMostrar = 'General';
              if (pac.zonas_realizadas) {
                if (Array.isArray(pac.zonas_realizadas)) {
                  zonasMostrar = pac.zonas_realizadas.join(', ');
                } else if (typeof pac.zonas_realizadas === 'string') {
                  try {
                    const parsed = JSON.parse(pac.zonas_realizadas);
                    if (Array.isArray(parsed)) zonasMostrar = parsed.join(', ');
                  } catch {
                    zonasMostrar = pac.zonas_realizadas;
                  }
                }
              }

              return (
                <div
                  key={pac.id}
                  onClick={() => seleccionarPaciente(pac)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                    esSeleccionado
                      ? 'border-teal-500 bg-teal-50/70 shadow-sm dark:border-teal-600 dark:bg-teal-950/40'
                      : 'border-slate-200/80 bg-slate-50 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/70'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-bold text-slate-800 truncate dark:text-zinc-100">
                      {pac.nombre_completo || 'Paciente sin nombre'}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate dark:text-zinc-400">
                      Celular: {pac.celular || 'N/A'} • Zonas: {zonasMostrar}
                    </p>
                  </div>
                  <button
                    className={`rounded-lg p-1.5 text-xs transition-colors ${
                      esSeleccionado
                        ? 'bg-teal-600 text-white dark:bg-teal-600'
                        : 'border border-slate-200 bg-white text-slate-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BANDEJA 2: ATENDIDOS HOY */}
      <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-zinc-800">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
            <UserCheck className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Atendidos Hoy</h3>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            {atendidosHoy.length}
          </span>
        </div>

        {atendidosHoy.length === 0 ? (
          <p className="text-xs italic text-slate-400 dark:text-zinc-500">Ninguna sesión completada todavía hoy.</p>
        ) : (
          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
            {atendidosHoy.map((pac) => (
              <div
                key={pac.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                    {pac.nombre_completo || 'Paciente'}
                  </h4>
                  <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">✓ Sesión completada</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}