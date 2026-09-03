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
  .select('*')
  .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const espera = data.filter((p: any) => p.estado_atencion === 'en_espera');
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* BANDEJA 1: EN ESPERA */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center border-b pb-2">
          <div className="flex items-center space-x-2 text-indigo-600">
            <Clock className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">En Espera de Gabinete</h3>
          </div>
          <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {enEspera.length}
          </span>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 italic">Actualizando lista...</p>
        ) : enEspera.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No hay pacientes esperando en este momento.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
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
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex justify-between items-center ${
                    esSeleccionado
                      ? 'bg-indigo-50/70 border-indigo-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      {pac.nombre_completo || 'Paciente sin nombre'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Celular: {pac.celular || 'N/A'} • Zonas: {zonasMostrar}
                    </p>
                  </div>
                  <button className={`text-xs p-1.5 rounded-lg ${esSeleccionado ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-600'}`}>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BANDEJA 2: ATENDIDOS HOY */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center border-b pb-2">
          <div className="flex items-center space-x-2 text-emerald-600">
            <UserCheck className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Atendidos Hoy</h3>
          </div>
          <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {atendidosHoy.length}
          </span>
        </div>

        {atendidosHoy.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Ninguna sesión completada todavía hoy.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {atendidosHoy.map((pac) => (
              <div key={pac.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">
                    {pac.nombre_completo || 'Paciente'}
                  </h4>
                  <p className="text-[10px] text-emerald-600 font-medium">✓ Sesión completada</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}