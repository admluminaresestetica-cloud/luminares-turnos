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
      <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm dark:border-emerald-950/60 dark:bg-zinc-900 sm:p-5">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Paciente listo
            </p>
            <h3 className="text-sm font-semibold leading-snug text-slate-800 dark:text-zinc-100">
              Iniciá el cronómetro para registrar el tiempo de la sesión
              {nombrePaciente ? ` de ${nombrePaciente}` : ''}.
            </h3>
          </div>

          <button
            type="button"
            onClick={iniciar}
            className="relative w-full shrink-0 sm:w-auto"
          >
            {/* Halo de brillo sutil para atraer la atención */}
            <span className="absolute -inset-1.5 rounded-2xl bg-emerald-400/40 blur-lg animate-pulse dark:bg-emerald-500/20" />
            <span className="relative flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all active:scale-95 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:py-3">
              <Play className="h-5 w-5 fill-white" strokeWidth={0} />
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
      : 'bg-slate-300 dark:bg-zinc-700';

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:p-4">
      <div className="flex w-full items-center gap-3 sm:w-auto">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${puntoColor}`} />
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-400">
            {estadoLabel}
            {nombrePaciente ? ` · ${nombrePaciente}` : ''}
          </p>
          <p className="font-mono text-xl font-bold tabular-nums leading-tight text-slate-800 dark:text-zinc-100 sm:text-2xl">
            {formatearTiempo(tiempoTranscurrido)}
          </p>
        </div>
      </div>

      {estado !== 'finalizado' ? (
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button
            type="button"
            onClick={estado === 'corriendo' ? pausar : reanudar}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all active:scale-95 sm:flex-none ${
              estado === 'corriendo'
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500'
            }`}
          >
            {estado === 'corriendo' ? (
              <>
                <Pause className="h-3.5 w-3.5" /> Pausar
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" strokeWidth={0} /> Reanudar
              </>
            )}
          </button>

          <button
            type="button"
            onClick={finalizar}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white transition-all active:scale-95 hover:bg-slate-900 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 sm:flex-none"
          >
            <Square className="h-3.5 w-3.5 fill-current" strokeWidth={0} /> Finalizar
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Tiempo registrado
          </span>
          <button
            type="button"
            onClick={reiniciar}
            title="Reiniciar cronómetro"
            className="flex items-center gap-1 text-slate-400 transition-colors hover:text-slate-600 active:scale-95 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}