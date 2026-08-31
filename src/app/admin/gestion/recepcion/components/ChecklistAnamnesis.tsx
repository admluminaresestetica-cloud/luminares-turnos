'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ListChecks, Check } from 'lucide-react';

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
    <div className="space-y-5 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Fototipo de piel (Fitzpatrick)
        </label>
        <select
          value={fototipo}
          onChange={(e) => setFototipo(e.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="Fototipo I">Fototipo I (Muy clara / pelirroja)</option>
          <option value="Fototipo II">Fototipo II (Clara / sensible)</option>
          <option value="Fototipo III">Fototipo III (Intermedia)</option>
          <option value="Fototipo IV">Fototipo IV (Oscura / bronceado fácil)</option>
          <option value="Fototipo V">Fototipo V (Muy oscura)</option>
        </select>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <ListChecks className="h-4 w-4" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Check clínico / anamnesis
          </span>
        </div>

        {cargando ? (
          <p className="text-xs italic text-slate-400">Cargando preguntas de anamnesis...</p>
        ) : preguntasDinamicas.length === 0 ? (
          <p className="rounded-xl border border-amber-200/80 bg-amber-50 p-3 text-xs text-amber-700">
            No hay preguntas configuradas. Usá el botón "Configurar Anamnesis" arriba para agregarlas.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {preguntasDinamicas.map((item) => {
              // USAMOS EL TÍTULO O PREGUNTA REAL COMO CLAVE PARA GUARDAR EN LA BD
              const claveLegible = item.titulo || item.pregunta || item.id;
              const marcado = !!antecedentes[claveLegible];

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleAntecedente(claveLegible)}
                  aria-pressed={marcado}
                  className={`flex min-h-11 items-center gap-2.5 rounded-xl border p-3 text-left text-xs transition-all active:scale-[0.98] ${
                    marcado
                      ? 'border-teal-300 bg-teal-50 ring-1 ring-teal-200'
                      : 'border-slate-200/80 bg-slate-50/60 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      marcado
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className={`font-medium leading-tight ${marcado ? 'text-teal-900' : 'text-slate-700'}`}>
                    {item.titulo || item.pregunta}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-4">
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Observaciones médicas fijas / permanentes
        </label>
        <input
          type="text"
          value={observacionesFijas}
          onChange={(e) => setObservacionesFijas(e.target.value)}
          placeholder="Ej: Alergia a gel conductor, lunares en espalda..."
          className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>
    </div>
  );
}