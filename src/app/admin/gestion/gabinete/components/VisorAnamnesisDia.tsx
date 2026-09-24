'use client';

import { ShieldAlert, CheckCircle2, FileHeart } from 'lucide-react';

interface VisorAnamnesisDiaProps {
  sesionActual: any;
}

export default function VisorAnamnesisDia({ sesionActual }: VisorAnamnesisDiaProps) {
  if (!sesionActual) return null;

  // Tomamos el JSON de la anamnesis traído directamente desde recepción
  const anamnesis = sesionActual.anamnesis_sesion || sesionActual.antecedentes_medicos || {};
  const entradas = Object.entries(anamnesis);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
            <FileHeart className="h-4 w-4" />
          </span>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Checklist de Anamnesis / Salud
          </h3>
        </div>
        <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
          Verificado en recepción
        </span>
      </div>

      {/* NOTA DE RECEPCIÓN PARA GABINETE */}
      {sesionActual?.observaciones_recepcion && (
        <div className="space-y-1 rounded-xl border border-blue-200/80 bg-blue-50/70 p-3 text-xs text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            📌 Nota enviada desde Recepción:
          </p>
          <p className="font-medium">{sesionActual.observaciones_recepcion}</p>
        </div>
      )}

      {entradas.length === 0 ? (
        <p className="text-xs italic text-slate-400 dark:text-zinc-500">
          No hay preguntas de anamnesis registradas para este paciente.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-2 md:grid-cols-3">
          {entradas.map(([pregunta, valor]) => {
            const estaEnRiesgo = valor === true;
            return (
              <div
                key={pregunta}
                className={`flex items-center justify-between gap-2 rounded-xl border p-3 transition-all ${
                  estaEnRiesgo
                    ? 'border-rose-200 bg-rose-50/80 font-medium text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200'
                    : 'border-slate-200/70 bg-slate-50/60 text-slate-700 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-300'
                }`}
              >
                <span className="leading-tight">{pregunta}</span>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    estaEnRiesgo
                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20 dark:bg-rose-700'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}
                >
                  {estaEnRiesgo ? (
                    <>
                      <ShieldAlert className="h-3 w-3" />
                      SÍ
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      NO
                    </>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
