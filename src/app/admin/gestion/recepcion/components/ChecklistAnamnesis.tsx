'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Antecedentes {
  [key: string]: boolean;
}

interface ChecklistProps {
  fototipo: string;
  setFototipo: (f: string) => void;
  antecedentes: Antecedentes;
  setAntecedentes: (a: Antecedentes) => void;
  observacionesFijas: string;
  setObservacionesFijas: (obs: string) => void;
}

export default function ChecklistAnamnesis({
  fototipo,
  setFototipo,
  antecedentes,
  setAntecedentes,
  observacionesFijas,
  setObservacionesFijas,
}: ChecklistProps) {
  const [preguntasDinamicas, setPreguntasDinamicas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Cargar preguntas activas desde Supabase
  useEffect(() => {
    async function cargarPreguntas() {
      try {
        const { data, error } = await supabase
          .from('checklist_anamnesis')
          .select('*')
          .eq('activo', true)
          .order('orden', { ascending: true });

        if (error) throw error;
        setPreguntasDinamicas(data || []);
      } catch (err) {
        console.error('Error cargando checklist:', err);
      } finally {
        setCargando(false);
      }
    }

    cargarPreguntas();
  }, []);

  const toggleAntecedente = (campo: string) => {
    setAntecedentes({
      ...antecedentes,
      [campo]: !antecedentes[campo],
    });
  };

  return (
    <div className="space-y-4 border border-slate-200 p-4 rounded-xl bg-slate-50/50">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Fototipo de Piel (Fitzpatrick)
        </label>
        <select
          value={fototipo}
          onChange={(e) => setFototipo(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
        >
          <option value="Fototipo I">Fototipo I (Muy Clara / Pelirroja)</option>
          <option value="Fototipo II">Fototipo II (Clara / Sensible)</option>
          <option value="Fototipo III">Fototipo III (Intermedia)</option>
          <option value="Fototipo IV">Fototipo IV (Oscura / Bronceado fácil)</option>
          <option value="Fototipo V">Fototipo V (Muy Oscura)</option>
        </select>
      </div>

      <div>
        <span className="block text-xs font-bold uppercase text-slate-700 mb-2">
          📋 Check Clínico / Anamnesis
        </span>

        {cargando ? (
          <p className="text-xs text-slate-400 italic">Cargando preguntas de anamnesis...</p>
        ) : preguntasDinamicas.length === 0 ? (
          <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
            ⚠️ No hay preguntas configuradas. Usa el botón "Configurar Anamnesis" arriba para agregarlas.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {preguntasDinamicas.map((item) => {
              // Asumimos que tu tabla en Supabase guarda una columna identificadora como 'id', 'clave' o 'titulo'
              const claveUnica = item.clave || item.id; 
              return (
                <label
                  key={item.id}
                  className="flex items-center gap-2 bg-white p-2 border rounded cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={!!antecedentes[claveUnica]}
                    onChange={() => toggleAntecedente(claveUnica)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-medium text-slate-700">{item.titulo || item.pregunta}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Observaciones Médicas Fijas / Permanentes:
        </label>
        <input
          type="text"
          value={observacionesFijas}
          onChange={(e) => setObservacionesFijas(e.target.value)}
          placeholder="Ej: Alergia a gel conductor, lunares en espalda..."
          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
        />
      </div>
    </div>
  );
}