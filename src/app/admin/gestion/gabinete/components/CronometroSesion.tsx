'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, CheckCircle2, RotateCcw } from 'lucide-react';

interface CronometroSesionProps {
  sesionActual: any;
  nombrePaciente?: string;
}

type EstadoCronometro = 'no_iniciado' | 'corriendo' | 'pausado' | 'finalizado';

const formatearTiempo = (totalSegundos: number) => {
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos
    .toString()
    .padStart(2, '0')}`;
};

export default function CronometroSesion({ sesionActual, nombrePaciente }: CronometroSesionProps) {
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState<number>(0);
  const [estado, setEstado] = useState<EstadoCronometro>('no_iniciado');

  // Al cambiar de paciente/sesión, el cronómetro arranca de cero
  useEffect(() => {
    setTiempoTranscurrido(0);
    setEstado('no_iniciado');
  }, [sesionActual?.id]);

  // Tick del cronómetro mientras está corriendo
  useEffect(() => {
    if (estado !== 'corriendo') return;
    const intervalo = setInterval(() => {
      setTiempoTranscurrido((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(intervalo);
  }, [estado]);

  if (!sesionActual) return null;

  const iniciar = () => setEstado('corriendo');
  const pausar = () => setEstado('pausado');
  const reanudar = () => setEstado('corriendo');
  const finalizar = () => setEstado('finalizado');
  const reiniciar = () => {
    setTiempoTranscurrido(0);
    setEstado('no_iniciado');
  };

  // ── ESTADO 1: HERO — sesión aún no iniciada ──────────────────────────────
  if (estado === 'no_iniciado') {
    return (
      <div className="relative bg-white border border-emerald-100 rounded-2xl shadow-sm p-4 sm:p-5 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide mb-0.5">
              Paciente listo
            </p>
            <h3 className="text-sm font-semibold text-slate-800 leading-snug">
              Iniciá el cronómetro para registrar el tiempo de la sesión
              {nombrePaciente ? ` de ${nombrePaciente}` : ''}.
            </h3>
          </div>

          <button
            type="button"
            onClick={iniciar}
            className="relative shrink-0 w-full sm:w-auto"
          >
            {/* Halo de brillo sutil para atraer la atención */}
            <span className="absolute -inset-1.5 rounded-2xl bg-emerald-400/40 blur-lg animate-pulse" />
            <span className="relative flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-3.5 sm:py-3 rounded-2xl shadow-md transition-all active:scale-95 w-full">
              <Play className="w-5 h-5 fill-white" strokeWidth={0} />
              Iniciar sesión
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ── ESTADOS 2-4: corriendo / pausado / finalizado ────────────────────────
  const estadoLabel =
    estado === 'corriendo' ? 'Sesión en curso' : estado === 'pausado' ? 'Sesión en pausa' : 'Sesión finalizada';

  const puntoColor =
    estado === 'corriendo'
      ? 'bg-emerald-500 animate-pulse'
      : estado === 'pausado'
      ? 'bg-amber-500'
      : 'bg-slate-300';

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${puntoColor}`} />
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
            {estadoLabel}
            {nombrePaciente ? ` · ${nombrePaciente}` : ''}
          </p>
          <p className="text-xl sm:text-2xl font-mono font-bold text-slate-800 tabular-nums leading-tight">
            {formatearTiempo(tiempoTranscurrido)}
          </p>
        </div>
      </div>

      {estado !== 'finalizado' ? (
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={estado === 'corriendo' ? pausar : reanudar}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 ${
              estado === 'corriendo'
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {estado === 'corriendo' ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pausar
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" strokeWidth={0} /> Reanudar
              </>
            )}
          </button>

          <button
            type="button"
            onClick={finalizar}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all active:scale-95"
          >
            <Square className="w-3.5 h-3.5 fill-current" strokeWidth={0} /> Finalizar
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Tiempo registrado
          </span>
          <button
            type="button"
            onClick={reiniciar}
            title="Reiniciar cronómetro"
            className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}