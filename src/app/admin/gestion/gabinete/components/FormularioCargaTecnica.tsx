'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Settings, Save, CheckCircle2, Loader2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FormularioCargaTecnicaProps {
  sesionActual: any;
  operadoraActual: string;
  zonasSeleccionadas: string[];
  onSesionCompletada: () => void;
}

export default function FormularioCargaTecnica({
  sesionActual,
  operadoraActual,
  zonasSeleccionadas,
  onSesionCompletada,
}: FormularioCargaTecnicaProps) {
  const [equipo, setEquipo] = useState('Laser Soprano / Diodo');
  const [joules, setJoules] = useState('');
  const [frecuencia, setFrecuencia] = useState('');
  const [observacionesGabinete, setObservacionesGabinete] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (sesionActual) {
      if (sesionActual.parametros_tecnicos) {
        setEquipo(sesionActual.parametros_tecnicos.equipo || 'Laser Soprano / Diodo');
        setJoules(sesionActual.parametros_tecnicos.joules || '');
        setFrecuencia(sesionActual.parametros_tecnicos.frecuencia || '');
      }
      setObservacionesGabinete(sesionActual.observaciones_gabinete || '');
    }
  }, [sesionActual]);

  if (!sesionActual) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
        <p className="text-xs text-slate-400 italic">
          Selecciona un paciente para habilitar la carga de parámetros técnicos.
        </p>
      </div>
    );
  }

  const handleGuardarYFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operadoraActual) {
      alert('Por favor selecciona una operadora en la barra superior antes de finalizar.');
      return;
    }

    setGuardando(true);
    try {
      const parametros_tecnicos = {
        equipo,
        joules,
        frecuencia,
      };

      const { error } = await supabase
        .from('sesiones_gabinete')
        .update({
          operadora_nombre: operadoraActual,
          zonas_realizadas: zonasSeleccionadas,
          parametros_tecnicos,
          observaciones_gabinete: observacionesGabinete,
          estado: 'completada',
        })
        .eq('id', sesionActual.id);

      if (error) throw error;

      alert('¡Sesión de gabinete guardada y finalizada con éxito!');
      onSesionCompletada();
    } catch (err) {
      console.error('Error al guardar la sesión:', err);
      alert('Hubo un error al guardar los datos de la sesión.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleGuardarYFinalizar} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex items-center space-x-2 border-b pb-2 text-slate-800">
        <Settings className="w-4 h-4 text-indigo-600" />
        <h3 className="text-xs font-bold uppercase tracking-wider">
          Parámetros Técnicos y Notas de Gabinete
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Equipo / Tecnología</label>
          <input
            type="text"
            value={equipo}
            onChange={(e) => setEquipo(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
            placeholder="Ej: Diodo Soprano"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Fluencia / Joules (J/cm²)</label>
          <input
            type="text"
            value={joules}
            onChange={(e) => setJoules(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
            placeholder="Ej: 12 J/cm2"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Frecuencia / Hz</label>
          <input
            type="text"
            value={frecuencia}
            onChange={(e) => setFrecuencia(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
            placeholder="Ej: 3 Hz"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1">Observaciones de Gabinete (Notas de la Sesión)</label>
        <textarea
          rows={3}
          value={observacionesGabinete}
          onChange={(e) => setObservacionesGabinete(e.target.value)}
          className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
          placeholder="Escribe notas relevantes sobre la piel, tolerancia al tratamiento o recomendaciones dadas..."
        />
      </div>

      <div className="flex justify-end pt-2 border-t">
        <button
          type="submit"
          disabled={guardando}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {guardando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando sesión...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar y Finalizar Sesión</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}