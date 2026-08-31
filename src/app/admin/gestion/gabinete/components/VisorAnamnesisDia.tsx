'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShieldAlert, AlertTriangle, AlertCircle, FileText } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface VisorAnamnesisDiaProps {
  sesionActual: any;
}

export default function VisorAnamnesisDia({ sesionActual }: VisorAnamnesisDiaProps) {
  const [preguntasMap, setPreguntasMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar el mapa de preguntas desde la tabla checklist_anamnesis
  useEffect(() => {
    const cargarPreguntas = async () => {
      try {
        const { data, error } = await supabase
          .from('checklist_anamnesis')
          .select('id, pregunta');

        if (!error && data) {
          const mapa: Record<string, string> = {};
          data.forEach((p) => {
            mapa[p.id] = p.pregunta;
          });
          setPreguntasMap(mapa);
        }
      } catch (err) {
        console.error('Error cargando preguntas de anamnesis:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarPreguntas();
  }, []);

  if (!sesionActual) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
        <p className="text-xs text-slate-400 italic">
          Selecciona un paciente en espera para ver su ficha clínica y anamnesis.
        </p>
      </div>
    );
  }

  const anamnesis = sesionActual.anamnesis_sesion || {};
  const obsFijas = sesionActual.observaciones_fijas;
  const obsRecepcion = sesionActual.observaciones_recepcion;

  // Convertimos las entradas para mostrar la pregunta traducida o la clave legible
  const entradas = Object.entries(anamnesis).map(([key, value]) => {
    const textoPregunta = preguntasMap[key] || key.replace(/_/g, ' ');
    return {
      id: key,
      pregunta: textoPregunta,
      respuesta: Boolean(value),
    };
  });

  return (
    <div className="space-y-3">
      {/* 1. ALERTAS CLÍNICAS PERMANENTES (Alergia al gel, etc.) */}
      {obsFijas && (
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-3 shadow-sm flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              ⚠️ Alertas Clínicas Permanentes
            </h4>
            <p className="text-xs font-medium text-amber-800 mt-0.5">
              {obsFijas}
            </p>
          </div>
        </div>
      )}

      {/* 2. NOTAS PARA GABINETE DESDE RECEPCIÓN (Sensibilidad, etc.) */}
      {obsRecepcion && (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-3 shadow-sm flex items-start space-x-3">
          <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              📌 Nota de Recepción para esta Sesión
            </h4>
            <p className="text-xs font-medium text-blue-800 mt-0.5">
              {obsRecepcion}
            </p>
          </div>
        </div>
      )}

      {/* 3. CHECKLIST DE ANAMNESIS DEL DÍA */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center space-x-2 text-slate-800">
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Checklist de Anamnesis / Salud
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            {loading ? 'Cargando preguntas...' : 'Verificado en recepción'}
          </span>
        </div>

        {entradas.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center space-x-2 text-slate-500 text-xs italic">
            <AlertCircle className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Sin ítems tildados o marcados en el checklist de hoy.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {entradas.map((item) => (
              <div
                key={item.id}
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                  item.respuesta
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900 font-bold'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}
              >
                <span className="text-xs font-medium capitalize truncate pr-2">
                  {item.pregunta}
                </span>
                <div className="flex items-center space-x-1 shrink-0">
                  {item.respuesta ? (
                    <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded shadow-xs">
                      SÍ (ALERTA)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded shadow-xs">
                      NO
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}