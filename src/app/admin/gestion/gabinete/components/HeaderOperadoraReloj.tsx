'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Clock, UserCheck, Plus } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface HeaderOperadoraProps {
  operadoraActual: string;
  setOperadoraActual: (nombre: string) => void;
}

export default function HeaderOperadoraReloj({
  operadoraActual,
  setOperadoraActual,
}: HeaderOperadoraProps) {
  const [horaActual, setHoraActual] = useState<string>('');
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState<number>(0);
  const [cronometroActivo, setCronometroActivo] = useState<boolean>(false);
  
  const [operadoras, setOperadoras] = useState<{ id: string; nombre: string }[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  
  // Estado para el mini modal de agregar operadora
  const [mostrarModalCrear, setMostrarModalCrear] = useState<boolean>(false);
  const [nuevoNombre, setNuevoNombre] = useState<string>('');
  const [guardandoOperadora, setGuardandoOperadora] = useState<boolean>(false);

  // 1. Reloj en tiempo real
  useEffect(() => {
    const actualizarReloj = () => {
      const ahora = new Date();
      setHoraActual(ahora.toLocaleTimeString());
    };
    actualizarReloj();
    const intervalReloj = setInterval(actualizarReloj, 1000);
    return () => clearInterval(intervalReloj);
  }, []);

  // 2. Cargar operadoras desde Supabase
  const cargarOperadoras = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('operadoras')
        .select('id, nombre')
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error al cargar operadoras:', error);
      } else if (data) {
        setOperadoras(data);
      }
    } catch (err) {
      console.error('Error en la petición de operadoras:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarOperadoras();
  }, []);

  // 3. Crear nueva operadora en Supabase
  const handleCrearOperadora = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    setGuardandoOperadora(true);
    try {
      const { data, error } = await supabase
        .from('operadoras')
        .insert([{ nombre: nuevoNombre.trim(), activa: true }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setOperadoras((prev) => [...prev, { id: data.id, nombre: data.nombre }].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        setOperadoraActual(data.nombre);
        setNuevoNombre('');
        setMostrarModalCrear(false);
      }
    } catch (err: any) {
      alert(`Error al guardar operadora: ${err.message || err}`);
    } finally {
      setGuardandoOperadora(false);
    }
  };

  // 4. Temporizador de sesión
  useEffect(() => {
    let intervalCronometro: NodeJS.Timeout;
    if (cronometroActivo) {
      intervalCronometro = setInterval(() => {
        setTiempoTranscurrido((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(intervalCronometro);
  }, [cronometroActivo]);

  const formatearTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 relative">
      {/* SECCIÓN OPERADORA DINÁMICA */}
      <div className="flex items-center space-x-3 w-full md:w-auto">
        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Operadora en Turno
          </span>
          <div className="flex items-center space-x-2">
            <select
              value={operadoraActual}
              onChange={(e) => setOperadoraActual(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="" disabled>
                {cargando
                  ? 'Cargando operadoras...'
                  : operadoras.length === 0
                  ? 'Sin operadoras registradas'
                  : 'Selecciona operadora...'}
              </option>
              {operadoras.map((op) => (
                <option key={op.id} value={op.nombre}>
                  {op.nombre}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setMostrarModalCrear(true)}
              className="flex items-center space-x-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded cursor-pointer"
              title="Agregar nueva operadora"
            >
              <Plus className="w-3 h-3" />
              <span>Nueva</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN RELOJ Y TEMPORIZADOR */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <span className="text-xs font-bold text-slate-600">Sesión:</span>
          <span className="text-xs font-mono font-bold text-indigo-600">
            {formatearTiempo(tiempoTranscurrido)}
          </span>
          <button
            type="button"
            onClick={() => setCronometroActivo(!cronometroActivo)}
            className={`text-[10px] px-2 py-0.5 rounded font-bold text-white transition-colors cursor-pointer ${
              cronometroActivo ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {cronometroActivo ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            type="button"
            onClick={() => {
              setCronometroActivo(false);
              setTiempoTranscurrido(0);
            }}
            className="text-[10px] text-slate-400 hover:text-slate-600 px-1 cursor-pointer"
            title="Reiniciar cronómetro"
          >
            🔄
          </button>
        </div>

        <div className="flex items-center space-x-2 text-slate-600 border-l pl-4 border-slate-200">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono font-medium">{horaActual || '--:--:--'}</span>
        </div>
      </div>

      {/* MODAL CREAR OPERADORA */}
      {mostrarModalCrear && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xl max-w-sm w-full space-y-4">
            <h4 className="text-sm font-bold text-slate-800">👤 Agregar Nueva Operadora</h4>
            <form onSubmit={handleCrearOperadora} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre completo:</label>
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej: Lucía Gómez"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalCrear(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoOperadora}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {guardandoOperadora ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}