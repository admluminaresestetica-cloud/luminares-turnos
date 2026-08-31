'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, CheckCircle2, XCircle, Settings, ArrowLeft } from 'lucide-react';

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
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm max-w-3xl mx-auto my-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Configuración de Anamnesis / Check Clínico
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Agrega o deshabilita las preguntas que se le realizan al paciente en recepción.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-xl transition-colors"
          >
            Volver
          </button>
        )}
      </div>

      {/* Formulario para agregar nueva pregunta */}
      <form onSubmit={agregarPregunta} className="mb-8 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Agregar Nueva Pregunta</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Ej: ¿Toma alguna medicación habitual?"
            value={nuevaPregunta}
            onChange={(e) => setNuevaPregunta(e.target.value)}
            className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Salud">Salud</option>
            <option value="Piel">Piel</option>
            <option value="Medicación">Medicación</option>
            <option value="General">General</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir</span>
          </button>
        </div>
      </form>

      {/* Listado de Preguntas */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Preguntas Registradas</h3>
        {loading ? (
          <p className="text-xs text-gray-500 text-center py-6">Cargando preguntas...</p>
        ) : preguntas.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-6">No hay preguntas cargadas todavía.</p>
        ) : (
          preguntas.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                item.activo
                  ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                  : 'bg-gray-100 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 opacity-60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                    {item.categoria}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.pregunta}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleActivo(item.id, item.activo)}
                  className={`p-2 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors ${
                    item.activo
                      ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                      : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                  title={item.activo ? 'Desactivar pregunta' : 'Activar pregunta'}
                >
                  {item.activo ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => eliminarPregunta(item.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                  title="Eliminar pregunta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}