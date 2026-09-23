'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { X, CheckCircle2, AlertCircle, FileText, Send } from 'lucide-react';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ModalAnamnesisRecepcionProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteFicha: any;
  turnoSeleccionado: any;
  onGuardadoExitoso: () => void;
}

export default function ModalAnamnesisRecepcion({
  isOpen,
  onClose,
  pacienteFicha,
  turnoSeleccionado,
  onGuardadoExitoso,
}: ModalAnamnesisRecepcionProps) {
  const [preguntas, setPreguntas] = useState<any[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, boolean>>({});
  const [observacionesRecepcion, setObservacionesRecepcion] = useState('');
  const [loadingPreguntas, setLoadingPreguntas] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Cargar preguntas del checklist desde Supabase
  useEffect(() => {
    if (!isOpen) return;

    const cargarChecklist = async () => {
      setLoadingPreguntas(true);
      try {
        // Determinamos la categoría según el tipo de servicio del turno (ej. laser o general)
        const tipoServicio = (turnoSeleccionado?.servicio_tipo || '').toLowerCase();
        const categoriaFiltro = tipoServicio.includes('laser') ? 'laser' : 'general';

        const { data, error } = await supabase
          .from('checklist_anamnesis')
          .select('*')
          .eq('activo', true)
          // Opcional: si usas la columna categoría para separar, puedes descomentar la siguiente línea:
          // .or(`categoria.eq.${categoriaFiltro},categoria.is.null`)
          .order('orden', { ascending: true });

        if (error) {
          console.error('Error al cargar checklist_anamnesis:', error);
        } else if (data) {
          setPreguntas(data);
          // Inicializar todas las respuestas en false (NO) por defecto
          const inicial: Record<string, boolean> = {};
          data.forEach((p: any) => {
            inicial[p.id] = false;
          });
          setRespuestas(inicial);
        }
      } catch (err) {
        console.error('Excepción al cargar checklist:', err);
      } finally {
        setLoadingPreguntas(false);
      }
    };

    cargarChecklist();
  }, [isOpen, turnoSeleccionado]);

  if (!isOpen) return null;

  const handleToggleRespuesta = (idPregunta: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [idPregunta]: !prev[idPregunta],
    }));
  };

  const handleGuardarYEnviar = async () => {
    if (!pacienteFicha || !pacienteFicha.id) return;
    setGuardando(true);

    try {
      // Mapeamos las respuestas usando el texto de la pregunta como clave para que sea legible en el JSONB
      const anamnesisMap: Record<string, boolean> = {};
      preguntas.forEach((p) => {
        anamnesisMap[p.pregunta] = respuestas[p.id] || false;
      });

      // Actualizamos la tabla pacientes_ficha con la anamnesis del día, observaciones y estado a 'en_espera' (listo para gabinete)
      const { error: errorFicha } = await supabase
        .from('pacientes_ficha')
        .update({
          anamnesis_sesion: anamnesisMap,
          observaciones_recepcion: observacionesRecepcion,
          estado_atencion: 'en_espera',
          updated_at: new Date().toISOString(),
        })
        .eq('id', pacienteFicha.id);

      if (errorFicha) throw errorFicha;

      // Opcional: También podemos registrar o actualizar en sesiones_laser si corresponde al flujo clínico
      const { error: errorSesion } = await supabase
        .from('sesiones_laser')
        .insert([
          {
            paciente_id: pacienteFicha.id,
            estado_atencion: 'en_espera',
            anamnesis_sesion: anamnesisMap,
            observaciones_recepcion: observacionesRecepcion,
          },
        ]);

      if (errorSesion) {
        console.error('Aviso al registrar sesión:', errorSesion);
      }

      onGuardadoExitoso();
      onClose();
    } catch (err) {
      console.error('Error al guardar la anamnesis:', err);
      alert('Hubo un error al guardar la anamnesis. Inténtalo nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-950 dark:border dark:border-zinc-800 space-y-5">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-900">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-500" />
              Checklist de Anamnesis - {pacienteFicha?.nombre_completo}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Complete el cuestionario médico/estético previo a enviar al paciente a gabinete.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cuerpo del Cuestionario */}
        {loadingPreguntas ? (
          <div className="py-12 text-center text-xs text-slate-400">Cargando preguntas de anamnesis...</div>
        ) : preguntas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/50 p-6 text-center text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400">
            ⚠️ No hay preguntas activas configuradas en el checklist de anamnesis. Configúralas desde el panel de ajustes.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {preguntas.map((p, idx) => {
                const activo = respuestas[p.id] || false;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleToggleRespuesta(p.id)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
                      activo
                        ? 'border-rose-300 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20'
                        : 'border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <span className="text-xs font-medium text-slate-700 dark:text-zinc-200 pr-4">
                      {idx + 1}. {p.pregunta}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase transition-colors ${
                        activo 
                          ? 'bg-rose-500 text-white shadow-xs' 
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                      }`}>
                        {activo ? 'SÍ (Alerta)' : 'NO'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Observaciones de Recepción */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                Observaciones de Recepción (Opcional):
              </label>
              <textarea
                rows={2}
                placeholder="Anotar cualquier detalle relevante comentado por el paciente..."
                value={observacionesRecepcion}
                onChange={(e) => setObservacionesRecepcion(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3 dark:border-zinc-900">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardarYEnviar}
            disabled={guardando || preguntas.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {guardando ? 'Guardando y enviando...' : 'Guardar y Enviar a Gabinete'}
          </button>
        </div>
      </div>
    </div>
  );
}