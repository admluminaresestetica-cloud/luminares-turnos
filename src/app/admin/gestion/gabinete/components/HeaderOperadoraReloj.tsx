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
    <header className="relative flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center">
      {/* SECCIÓN OPERADORA DINÁMICA */}
      <div className="flex w-full items-center gap-3 sm:w-auto">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 dark:border-teal-900 dark:bg-teal-950/40">
          <UserCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div className="min-w-0">
          <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-400">
            Operadora en turno
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={operadoraActual}
              onChange={(e) => setOperadoraActual(e.target.value)}
              className="cursor-pointer bg-transparent py-0.5 text-xs font-semibold text-slate-700 focus:outline-none dark:text-zinc-200 sm:text-sm"
            >
              <option value="" disabled className="dark:bg-zinc-900 dark:text-zinc-400">
                {cargando
                  ? 'Cargando operadoras...'
                  : operadoras.length === 0
                  ? 'Sin operadoras registradas'
                  : 'Seleccioná operadora...'}
              </option>
              {operadoras.map((op) => (
                <option key={op.id} value={op.nombre} className="dark:bg-zinc-900 dark:text-zinc-200">
                  {op.nombre}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setMostrarModalCrear(true)}
              className="flex items-center gap-1 rounded-lg bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-700 transition-colors hover:bg-teal-100 active:scale-95 dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-900/60"
              title="Agregar nueva operadora"
            >
              <Plus className="h-3 w-3" />
              <span>Nueva</span>
            </button>
          </div>
        </div>
      </div>

      {/* RELOJ DE PARED DESTACADO */}
      <div className="flex self-start items-center gap-2.5 rounded-xl border border-slate-200/60 bg-slate-50 px-3.5 py-1.5 shadow-inner dark:border-zinc-800 dark:bg-zinc-800/40 sm:self-auto">
        <Clock className="h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" />
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-400 leading-none">
            Hora actual
          </span>
          <span className="text-base font-mono font-bold tabular-nums leading-tight text-slate-800 dark:text-zinc-100 sm:text-lg">
            {horaActual || '--:--:--'}
          </span>
        </div>
      </div>

      {/* MODAL CREAR OPERADORA */}
      {mostrarModalCrear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-zinc-100">Agregar nueva operadora</h4>
            <form onSubmit={handleCrearOperadora} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej: Lucía Gómez"
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2.5 text-xs focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder-zinc-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalCrear(false)}
                  className="rounded-xl px-3.5 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 active:scale-95 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoOperadora}
                  className="rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-700 active:scale-95 disabled:opacity-50 dark:bg-teal-600 dark:hover:bg-teal-500"
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