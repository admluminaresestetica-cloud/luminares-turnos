'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ListChecks } from 'lucide-react';

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
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
          Fototipo de piel (Fitzpatrick)
        </label>
        <select
          value={fototipo}
          onChange={(e) => setFototipo(e.target.value)}
          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition-colors focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20"
        >
          <option value="Fototipo I">Fototipo I (Muy clara / pelirroja)</option>
          <option value="Fototipo II">Fototipo II (Clara / sensible)</option>
          <option value="Fototipo III">Fototipo III (Intermedia)</option>
          <option value="Fototipo IV">Fototipo IV (Oscura / bronceado fácil)</option>
          <option value="Fototipo V">Fototipo V (Muy oscura)</option>
        </select>
      </div>

      <div>
        <div className="mb-2.5 flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-teal-600" />
          <span className="text-sm font-bold text-slate-800">Check clínico / anamnesis</span>
        </div>

        {cargando ? (
          <p className="text-xs italic text-slate-400">Cargando preguntas de anamnesis...</p>
        ) : preguntasDinamicas.length === 0 ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            No hay preguntas configuradas. Usá el botón "Configurar Anamnesis" arriba para agregarlas.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {preguntasDinamicas.map((item) => {
              // USAMOS EL TÍTULO O PREGUNTA REAL COMO CLAVE PARA GUARDAR EN LA BD
              const claveLegible = item.titulo || item.pregunta || item.id;
              const marcado = !!antecedentes[claveLegible];

              return (
                <label
                  key={item.id}
                  className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border p-3 text-xs transition-colors ${
                    marcado
                      ? 'border-teal-300 bg-teal-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={marcado}
                    onChange={() => toggleAntecedente(claveLegible)}
                    className="h-4.5 w-4.5 shrink-0 cursor-pointer rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="font-medium leading-tight text-slate-700">
                    {item.titulo || item.pregunta}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
          Observaciones médicas fijas / permanentes
        </label>
        <input
          type="text"
          value={observacionesFijas}
          onChange={(e) => setObservacionesFijas(e.target.value)}
          placeholder="Ej: Alergia a gel conductor, lunares en espalda..."
          className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition-colors focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20"
        />
      </div>
    </div>
  );
}