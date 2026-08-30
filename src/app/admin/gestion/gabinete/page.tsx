'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function GabinetePage() {
  const [sesionesEspera, setSesionesEspera] = useState<any[]>([]);
  const [sesionActiva, setSesionActiva] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  // Parámetros técnicos del tratamiento
  const [joules, setJoules] = useState<number>(12);
  const [frecuencia, setFrecuencia] = useState<number>(10);
  const [observaciones, setObservaciones] = useState<string>('');
  const [guardando, setGuardando] = useState(false);

  // Cargar sesiones con estado 'en_espera'
  const cargarSesiones = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('sesiones_gabinete')
      .select('*, clientes(nombre, celular)')
      .eq('estado', 'en_espera')
      .order('created_at', { ascending: true });

    if (!error) {
      setSesionesEspera(data || []);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarSesiones();
  }, []);

  const handleIniciarSesion = (sesion: any) => {
    setSesionActiva(sesion);
  };

  const handleFinalizarSesion = async () => {
    if (!sesionActiva) return;
    setGuardando(true);

    const parametros = {
      parametros_generales: {
        joules,
        frecuencia_hz: frecuencia,
      }
    };

    const { error } = await supabase
      .from('sesiones_gabinete')
      .update({
        estado: 'finalizado',
        parametros_tecnicos: parametros,
        observaciones_gabinete: observaciones
      })
      .eq('id', sesionActiva.id);

    if (error) {
      alert('Error al finalizar la sesión.');
    } else {
      alert('✅ Sesión finalizada y guardada con éxito.');
      setSesionActiva(null);
      setObservaciones('');
      cargarSesiones();
    }
    setGuardando(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gabinete / Operadora</h1>
        <p className="text-slate-500 text-sm">Control de aplicaciones técnicas y registro de parámetros en vivo.</p>
      </div>

      {!sesionActiva ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Pacientes en Sala de Espera</h2>
            <button
              onClick={cargarSesiones}
              className="text-xs text-slate-600 hover:text-slate-900 underline"
            >
              Actualizar lista
            </button>
          </div>

          {cargando ? (
            <p className="text-sm text-slate-500 py-4">Cargando cola de espera...</p>
          ) : sesionesEspera.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No hay pacientes esperando en este momento.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {sesionesEspera.map((sesion) => (
                <div
                  key={sesion.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-slate-400 transition-all bg-slate-50 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-slate-900">{sesion.clientes?.nombre || 'Cliente'}</p>
                    <p className="text-xs text-slate-500">Cel: {sesion.clientes?.celular || '-'}</p>
                    {sesion.observaciones_recepcion && (
                      <p className="text-xs text-amber-700 mt-1 bg-amber-50 p-1 rounded border border-amber-200">
                        Nota Recepción: {sesion.observaciones_recepcion}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleIniciarSesion(sesion)}
                    className="px-4 py-2 bg-emerald-600 text-white font-medium text-xs rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Atender
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                Sesión en Curso
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">{sesionActiva.clientes?.nombre}</h2>
            </div>
            <button
              onClick={() => setSesionActiva(null)}
              className="text-xs text-slate-500 hover:underline"
            >
              Volver a la lista
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">Parámetros del Equipo</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fluencia / Energía (Joules)</label>
                <input
                  type="number"
                  value={joules}
                  onChange={(e) => setJoules(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Frecuencia (Hz)</label>
                <input
                  type="number"
                  value={frecuencia}
                  onChange={(e) => setFrecuencia(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones Técnicas / Reacción de la piel</label>
              <textarea
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej: Buena tolerancia al disparo, leve eritema perifolicular esperable..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-800"
              />
            </div>

            <button
              onClick={handleFinalizarSesion}
              disabled={guardando}
              className="w-full py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Finalizar Sesión y Registrar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}