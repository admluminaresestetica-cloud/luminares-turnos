'use client';

import { useState, useEffect } from 'react';
import { Clock, UserCheck } from 'lucide-react';

interface HeaderOperadoraProps {
  operadoraActual: string;
  setOperadoraActual: (nombre: string) => void;
}

// Puedes cambiar o ampliar esta lista según las operadoras de tu gabinete
const OPERADORAS_DISPONIBLES = [
  'Lic. Romina Gómez',
  'Lic. Sofía Benítez',
  'Dra. Mariana Acosta',
  'Operadora General'
];

export default function HeaderOperadoraReloj({
  operadoraActual,
  setOperadoraActual,
}: HeaderOperadoraProps) {
  const [horaActual, setHoraActual] = useState<string>('');
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState<number>(0);
  const [cronometroActivo, setCronometroActivo] = useState<boolean>(false);

  // 1. Reloj en tiempo real
  useEffect(() => {
    const actualizarReloj = () => {
      const ahora = new Date();
      setHoraActual(ahora.toLocaleTimeString());
    };
    actualizarReloj();
    const intervalReloj = setInterval(actualizarReloj, 1000);
    return () => clearInterval(intervalReloj);
  }, []);

  // 2. Temporizador de sesión
  useEffect(() => {
    let intervalCronometro: NodeJS.Timeout;
    if (cronometroActivo) {
      intervalCronometro = setInterval(() => {
        setTiempoTranscurrido((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(intervalCronometro);
  }, [cronometroActivo]);

  const formatearTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
      {/* SECCIÓN OPERADORA */}
      <div className="flex items-center space-x-3 w-full md:w-auto">
        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Operadora en Turno
          </span>
          <select
            value={operadoraActual}
            onChange={(e) => setOperadoraActual(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
          >
            <option value="" disabled>Selecciona operadora...</option>
            {OPERADORAS_DISPONIBLES.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECCIÓN RELOJ Y TEMPORIZADOR */}
      <div className="flex items-center space-x-4">
        {/* Cronómetro de sesión */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <span className="text-xs font-bold text-slate-600">Sesión:</span>
          <span className="text-xs font-mono font-bold text-indigo-600">
            {formatearTiempo(tiempoTranscurrido)}
          </span>
          <button
            onClick={() => setCronometroActivo(!cronometroActivo)}
            className={`text-[10px] px-2 py-0.5 rounded font-bold text-white transition-colors ${
              cronometroActivo ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {cronometroActivo ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            onClick={() => {
              setCronometroActivo(false);
              setTiempoTranscurrido(0);
            }}
            className="text-[10px] text-slate-400 hover:text-slate-600 px-1"
            title="Reiniciar cronómetro"
          >
            🔄
          </button>
        </div>

        {/* Reloj general */}
        <div className="flex items-center space-x-2 text-slate-600 border-l pl-4 border-slate-200">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono font-medium">{horaActual || '--:--:--'}</span>
        </div>
      </div>
    </header>
  );
}