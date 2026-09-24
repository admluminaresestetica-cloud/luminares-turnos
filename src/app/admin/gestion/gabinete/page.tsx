'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, UserCheck, ShieldAlert, Activity } from 'lucide-react';
import Link from 'next/link';
import HeaderOperadoraReloj from './components/HeaderOperadoraReloj';
import NotificacionNuevoCliente from './components/NotificacionNuevoCliente';
import SelectorPacientesDoble from './components/SelectorPacientesDoble';
import VisorAnamnesisDia from './components/VisorAnamnesisDia';
import FormularioCargaTecnica from './components/FormularioCargaTecnica';
import CronometroSesion from './components/CronometroSesion';

export interface Paciente {
  id?: string;
  nombre_paciente?: string;
  nombre_completo?: string;
  nombre?: string;
  dni?: string;
  telefono?: string;
}

export interface Sesion {
  id: string;
  nombre_paciente?: string;
  zonas_realizadas?: string[] | string;
  zonas_preasignadas?: string[] | string;
  [key: string]: any;
}

export default function GabinetePage() {
  const [operadoraActual, setOperadoraActual] = useState<string>('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);
  const [sesionActual, setSesionActual] = useState<Sesion | null>(null);
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>([]);

  useEffect(() => {
    if (sesionActual) {
      const rawZonas = sesionActual.zonas_realizadas || sesionActual.zonas_preasignadas || [];

      if (Array.isArray(rawZonas)) {
        setZonasSeleccionadas(rawZonas);
      } else if (typeof rawZonas === 'string') {
        try {
          const parsed = JSON.parse(rawZonas);
          if (Array.isArray(parsed)) {
            setZonasSeleccionadas(parsed);
          } else {
            setZonasSeleccionadas([rawZonas]);
          }
        } catch {
          setZonasSeleccionadas(rawZonas.split(',').map((z: string) => z.trim()).filter(Boolean));
        }
      } else {
        setZonasSeleccionadas([]);
      }
    } else {
      setZonasSeleccionadas([]);
    }
  }, [sesionActual]);

  const handleSesionCompletada = () => {
    setSesionActual(null);
    setPacienteSeleccionado(null);
    setZonasSeleccionadas([]);
  };

  const nombrePacienteActivo =
    pacienteSeleccionado?.nombre_paciente ||
    pacienteSeleccionado?.nombre_completo ||
    pacienteSeleccionado?.nombre ||
    sesionActual?.nombre_paciente ||
    'Paciente';

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl space-y-6 px-3 py-3 sm:px-6 sm:py-6 lg:px-8">

        {/* Encabezado Principal */}
        <header className="flex flex-col gap-3 border-b border-slate-200/85 pb-4 transition-colors dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-600/20">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-2xl">
                Gabinete Técnico
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 sm:text-sm">
                Control clínico, validación de anamnesis y registro de sesiones láser
              </p>
            </div>
          </div>

          <Link
            href="/admin"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 sm:h-11 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
            <span>Menú Admin</span>
          </Link>
        </header>

        {/* Notificación en Tiempo Real */}
        <NotificacionNuevoCliente />

        {/* Header: Reloj y Operadora */}
        <HeaderOperadoraReloj
          operadoraActual={operadoraActual}
          setOperadoraActual={setOperadoraActual}
        />

        {/* Bandeja de Pacientes (Espera / Atendidos) */}
        <SelectorPacientesDoble
          pacienteSeleccionado={pacienteSeleccionado}
          setPacienteSeleccionado={setPacienteSeleccionado}
          sesionActual={sesionActual}
          setSesionActual={setSesionActual}
        />

        {/* Bloque Clínico y Técnico Activo */}
        {sesionActual && (
          <div className="space-y-6 animate-fadeIn">

            {/* Cronógrafo de Sesión */}
            <div className="sticky top-4 z-30">
              <CronometroSesion sesionActual={sesionActual} nombrePaciente={nombrePacienteActivo} />
            </div>

            {/* Tarjeta de Información del Paciente Activo */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-100 dark:bg-teal-950/60 dark:text-teal-400 dark:ring-teal-900">
                  <UserCheck className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Tratamiento activo en curso
                    </span>
                  </div>
                  <h2 className="truncate text-base font-bold text-slate-900 dark:text-zinc-100 sm:text-lg">
                    {nombrePacienteActivo}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-zinc-800 sm:border-0 sm:pt-0">
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-zinc-800/60 dark:text-zinc-300">
                  <span className="text-slate-400 dark:text-zinc-500">DNI</span>
                  <span className="font-mono text-slate-800 dark:text-zinc-100">{pacienteSeleccionado?.dni || '—'}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-zinc-800/60 dark:text-zinc-300">
                  <span className="text-slate-400 dark:text-zinc-500">Tel</span>
                  <span className="font-mono text-slate-800 dark:text-zinc-100">{pacienteSeleccionado?.telefono || '—'}</span>
                </div>
              </div>
            </div>

            {/* Visor de Anamnesis del Día */}
            <VisorAnamnesisDia sesionActual={sesionActual} />

            {/* Formulario de Carga Técnica */}
            <FormularioCargaTecnica
              sesionActual={sesionActual}
              operadoraActual={operadoraActual}
              zonasSeleccionadas={zonasSeleccionadas}
              setZonasSeleccionadas={setZonasSeleccionadas}
              onSesionCompletada={handleSesionCompletada}
            />
          </div>
        )}
      </div>
    </div>
  );
}
