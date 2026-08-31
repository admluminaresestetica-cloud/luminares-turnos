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
        setOperadoras((prev) =>
          [...prev, { id: data.id, nombre: data.nombre }].sort((a, b) => a.nombre.localeCompare(b.nombre))
        );
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

  return (
    <header className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
      {/* SECCIÓN OPERADORA DINÁMICA */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
          <UserCheck className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wide">
            Operadora en turno
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={operadoraActual}
              onChange={(e) => setOperadoraActual(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer py-0.5"
            >
              <option value="" disabled>
                {cargando
                  ? 'Cargando operadoras...'
                  : operadoras.length === 0
                  ? 'Sin operadoras registradas'
                  : 'Seleccioná operadora...'}
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
              className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors active:scale-95"
              title="Agregar nueva operadora"
            >
              <Plus className="w-3 h-3" />
              <span>Nueva</span>
            </button>
          </div>
        </div>
      </div>

      {/* RELOJ DE PARED */}
      <div className="flex items-center gap-2 text-slate-600 sm:border-l sm:pl-4 border-slate-200 self-start sm:self-auto">
        <Clock className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-mono font-medium tabular-nums">{horaActual || '--:--:--'}</span>
      </div>

      {/* MODAL CREAR OPERADORA */}
      {mostrarModalCrear && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xl max-w-sm w-full space-y-4">
            <h4 className="text-sm font-semibold text-slate-800">Agregar nueva operadora</h4>
            <form onSubmit={handleCrearOperadora} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1.5">Nombre completo</label>
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej: Lucía Gómez"
                  className="w-full text-xs px-3 py-2.5 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-slate-50/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalCrear(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoOperadora}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50 transition-colors active:scale-95"
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