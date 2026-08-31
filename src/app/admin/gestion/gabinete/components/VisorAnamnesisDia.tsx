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
    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <span>🛡️ CHECKLIST DE ANAMNESIS / SALUD</span>
        </h3>
        <span className="text-[10px] text-slate-400 font-medium">Verificado en recepción</span>
      </div>

      {/* NOTA DE RECEPCIÓN PARA GABINETE */}
      {sesionActual?.observaciones_recepcion && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-0.5">
          <p className="font-bold uppercase tracking-wider text-[10px] text-blue-700">
            📌 Nota enviada desde Recepción:
          </p>
          <p className="font-medium">{sesionActual.observaciones_recepcion}</p>
        </div>
      )}

      {entradas.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No hay preguntas de anamnesis registradas para este paciente.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {entradas.map(([pregunta, valor]) => {
            const estaEnRiesgo = valor === true;
            return (
              <div
                key={pregunta}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                  estaEnRiesgo
                    ? 'bg-rose-50 border-rose-200 text-rose-900 font-medium'
                    : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                }`}
              >
                <span className="leading-tight text-xs">{pregunta}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    estaEnRiesgo ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
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