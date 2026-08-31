'use client';

import { useMemo } from 'react';
import { Check, Layers } from 'lucide-react';

interface SelectorZonasGabineteProps {
  sesionActual: any; // Representa el objeto de pacientes_ficha
  zonasSeleccionadas: string[];
  setZonasSeleccionadas: (zonas: string[]) => void;
}

const ZONAS_COMUNES = [
  'Cavo Axilas',
  'Cavo Pelvis',
  'Tiro de Cavo',
  'Medias Piernas',
  'Piernas Enteras',
  'Rostro Completo',
  'Bozo',
  'Espalda',
  'Abdomen',
  'Brazos Enteros'
];

export default function SelectorZonasGabinete({
  sesionActual,
  zonasSeleccionadas,
  setZonasSeleccionadas,
}: SelectorZonasGabineteProps) {
  if (!sesionActual) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
        <p className="text-xs text-slate-400 italic">
          Selecciona un paciente en espera para gestionar sus zonas de tratamiento.
        </p>
      </div>
    );
  }

  // Unimos las zonas comunes con cualquier otra zona previa que pueda traer el paciente
  const listaZonasDisponibles = useMemo(() => {
    const lista = [...ZONAS_COMUNES];
    zonasSeleccionadas.forEach((z) => {
      if (z && !lista.includes(z)) {
        lista.push(z);
      }
    });
    return lista;
  }, [zonasSeleccionadas]);

  const toggleZona = (zona: string) => {
    if (zonasSeleccionadas.includes(zona)) {
      setZonasSeleccionadas(zonasSeleccionadas.filter((z) => z !== zona));
    } else {
      setZonasSeleccionadas([...zonasSeleccionadas, zona]);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center space-x-2 text-slate-800">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Zonas a Tratar en Sesión
          </h3>
        </div>
        <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
          {zonasSeleccionadas.length} seleccionadas
        </span>
      </div>

      <p className="text-xs text-slate-500">
        Haz clic en las zonas para marcarlas o desmarcarlas según lo que se realizará en el gabinete hoy:
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {listaZonasDisponibles.map((zona) => {
          const estaSeleccionada = zonasSeleccionadas.includes(zona);

          return (
            <button
              key={zona}
              type="button"
              onClick={() => toggleZona(zona)}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
                estaSeleccionada
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="truncate pr-1">{zona}</span>
              {estaSeleccionada && <Check className="w-3.5 h-3.5 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}