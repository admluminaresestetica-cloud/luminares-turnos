'use client';

interface VisorAnamnesisDiaProps {
  sesionActual: any;
}

export default function VisorAnamnesisDia({ sesionActual }: VisorAnamnesisDiaProps) {
  if (!sesionActual) return null;

  // Tomamos el JSON de la anamnesis traído directamente desde recepción
  const anamnesis = sesionActual.anamnesis_sesion || sesionActual.antecedentes_medicos || {};
  const entradas = Object.entries(anamnesis);

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-zinc-800">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-100">
          <span>🛡️ CHECKLIST DE ANAMNESIS / SALUD</span>
        </h3>
        <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">Verificado en recepción</span>
      </div>

      {/* NOTA DE RECEPCIÓN PARA GABINETE */}
      {sesionActual?.observaciones_recepcion && (
        <div className="space-y-0.5 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            📌 Nota enviada desde Recepción:
          </p>
          <p className="font-medium">{sesionActual.observaciones_recepcion}</p>
        </div>
      )}

      {entradas.length === 0 ? (
        <p className="text-xs italic text-slate-400 dark:text-zinc-500">No hay preguntas de anamnesis registradas para este paciente.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 md:grid-cols-3">
          {entradas.map(([pregunta, valor]) => {
            const estaEnRiesgo = valor === true;
            return (
              <div
                key={pregunta}
                className={`flex items-center justify-between rounded-xl border p-2.5 transition-all ${
                  estaEnRiesgo
                    ? 'border-rose-200 bg-rose-50 font-medium text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200'
                    : 'border-emerald-200/80 bg-emerald-50/60 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200'
                }`}
              >
                <span className="text-xs leading-tight">{pregunta}</span>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                    estaEnRiesgo ? 'bg-rose-600 text-white dark:bg-rose-700' : 'bg-emerald-600 text-white dark:bg-emerald-700'
                  }`}
                >
                  {estaEnRiesgo ? 'SÍ (ALERTA)' : 'NO'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}