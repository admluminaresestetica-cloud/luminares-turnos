'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, CheckCircle2, XCircle, Settings } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ConfiguracionAnamnesisProps {
  onClose?: () => void;
}

export default function ConfiguracionAnamnesis({ onClose }: ConfiguracionAnamnesisProps) {
  const [preguntas, setPreguntas] = useState<any[]>([]);
  const [nuevaPregunta, setNuevaPregunta] = useState('');
  const [categoria, setCategoria] = useState('Salud');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarPreguntas();
  }, []);

  const cargarPreguntas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('checklist_anamnesis')
        .select('*')
        .order('orden', { ascending: true });

      if (error) throw error;
      setPreguntas(data || []);
    } catch (err) {
      console.error('Error al cargar preguntas:', err);
    } finally {
      setLoading(false);
    }
  };

  const agregarPregunta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaPregunta.trim()) return;

    try {
      const { error } = await supabase.from('checklist_anamnesis').insert([
        {
          pregunta: nuevaPregunta.trim(),
          categoria,
          activo: true,
          orden: preguntas.length + 1,
        },
      ]);

      if (error) throw error;
      setNuevaPregunta('');
      cargarPreguntas();
    } catch (err) {
      console.error('Error al agregar pregunta:', err);
      alert('Error al guardar la pregunta.');
    }
  };

  const toggleActivo = async (id: string, estadoActual: boolean) => {
    try {
      const { error } = await supabase
        .from('checklist_anamnesis')
        .update({ activo: !estadoActual })
        .eq('id', id);

      if (error) throw error;
      cargarPreguntas();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  const eliminarPregunta = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta pregunta permanentemente?')) return;

    try {
      const { error } = await supabase
        .from('checklist_anamnesis')
        .delete()
        .eq('id', id);

      if (error) throw error;
      cargarPreguntas();
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  };

  return (
    <div className="mx-auto my-6 max-w-3xl rounded-2xl border border-slate-200/85 bg-white p-6 shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 text-teal-600 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-400">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Configuración de Anamnesis / Check Clínico
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Agregá o deshabilita las preguntas que se le realizan al paciente en recepción.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Volver
          </button>
        )}
      </div>

      {/* Formulario para agregar nueva pregunta */}
      <form onSubmit={agregarPregunta} className="mb-8 space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Agregar Nueva Pregunta</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Ej: ¿Toma alguna medicación habitual?"
            value={nuevaPregunta}
            onChange={(e) => setNuevaPregunta(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/20"
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-teal-400 dark:focus:ring-teal-400/20"
          >
            <option value="Salud">Salud</option>
            <option value="Piel">Piel</option>
            <option value="Medicación">Medicación</option>
            <option value="General">General</option>
          </select>
          <button
            type="submit"
            className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:from-emerald-500 hover:to-teal-500"
          >
            <Plus className="h-4 w-4" />
            <span>Añadir</span>
          </button>
        </div>
      </form>

      {/* Listado de Preguntas */}
      <div className="space-y-3">
        <h3 className="mb-2 text-sm font-semibold text-slate-800 dark:text-white">Preguntas Registradas</h3>
        {loading ? (
          <p className="py-6 text-center text-xs text-slate-400">Cargando preguntas...</p>
        ) : preguntas.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">No hay preguntas cargadas todavía.</p>
        ) : (
          preguntas.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                item.activo
                  ? 'border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                  : 'border-slate-200 bg-slate-100 opacity-60 dark:border-zinc-800 dark:bg-zinc-800/30'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-600 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-400">
                    {item.categoria}
                  </span>
                  <span className="text-sm font-medium text-slate-800 dark:text-white">
                    {item.pregunta}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleActivo(item.id, item.activo)}
                  className={`flex items-center space-x-1 rounded-lg p-2 text-xs font-medium transition-colors ${
                    item.activo
                      ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                      : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                  }`}
                  title={item.activo ? 'Desactivar pregunta' : 'Activar pregunta'}
                >
                  {item.activo ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => eliminarPregunta(item.id)}
                  className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  title="Eliminar pregunta"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}