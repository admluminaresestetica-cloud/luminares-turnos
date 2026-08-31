'use client';

import { ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

interface VisorAnamnesisDiaProps {
  sesionActual: any;
}

export default function VisorAnamnesisDia({ sesionActual }: VisorAnamnesisDiaProps) {
  if (!sesionActual) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
        <p className="text-xs text-slate-400 italic">
          Selecciona un paciente en espera para ver su anamnesis de hoy.
        </p>
      </div>
    );
  }

  const anamnesis = sesionActual.anamnesis_sesion;

  // Filtramos las entradas para ignorar claves que parezcan UUIDs o sean demasiado largas
  const entradasValidas = anamnesis 
    ? Object.entries(anamnesis).filter(([key]) => {
        // Un UUID típico tiene 36 caracteres y guiones, o podemos filtrar si la clave es muy larga (> 32 caracteres)
        const esUuidOId = key.length > 30 || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}/.test(key);
        return !esUuidOId;
      })
    : [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center space-x-2 text-slate-800">
          <ShieldAlert className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Anamnesis del Día (Checklist de Recepción)
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">
          Registrada hoy
        </span>
      </div>

      {entradasValidas.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center space-x-2 text-amber-800 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>No hay un registro de anamnesis guardado para esta sesión específica.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {entradasValidas.map(([key, value]) => {
            const tieneAlerta = Boolean(value);

            return (
              <div
                key={key}
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                  tieneAlerta
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}
              >
                <span className="text-xs font-medium capitalize truncate pr-2">
                  {key.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center space-x-1 shrink-0">
                  {tieneAlerta ? (
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
            );
          })}
        </div>
      )}
    </div>
  );
}