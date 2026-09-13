'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import HeaderOperadoraReloj from './components/HeaderOperadoraReloj';
import NotificacionNuevoCliente from './components/NotificacionNuevoCliente';
import SelectorPacientesDoble from './components/SelectorPacientesDoble';
import VisorAnamnesisDia from './components/VisorAnamnesisDia';
import FormularioCargaTecnica from './components/FormularioCargaTecnica';
import CronometroSesion from './components/CronometroSesion';

// Tipos sugeridos para mayor seguridad técnica
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

  // Cada vez que cambia la sesión actual (ficha del paciente en espera), sincronizamos las zonas
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
    // Limpiar selección actual al finalizar la atención
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
      <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6 sm:space-y-6">

        {/* TÍTULO DE LA VISTA CON BOTÓN DE RETORNO AL MENÚ ADMIN */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 dark:border-teal-900 dark:bg-teal-950/40">
              <Sparkles className="h-5 w-5 text-teal-600 dark:text-teal-400" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-slate-800 dark:text-white sm:text-lg">
                Gabinete
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Control técnico, validación de anamnesis y registro de sesiones láser.
              </p>
            </div>
          </div>

          {/* BOTÓN VOLVER AL MENÚ ADMIN */}
          <Link
            href="/admin"
            className="inline-flex self-start items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 hover:shadow active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white sm:self-auto"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
            <span>Menú Admin</span>
          </Link>
        </div>

        {/* NOTIFICACIÓN EN TIEMPO REAL DE NUEVOS PACIENTES EN ESPERA */}
        <NotificacionNuevoCliente />

        {/* HEADER: RELOJ Y OPERADORA (Conectado a la tabla operadoras) */}
        <HeaderOperadoraReloj
          operadoraActual={operadoraActual}
          setOperadoraActual={setOperadoraActual}
        />

        {/* BANDEJA DE PACIENTES (ESPERA Y ATENDIDOS) DESDE PACIENTES_FICHA */}
        <SelectorPacientesDoble
          pacienteSeleccionado={pacienteSeleccionado}
          setPacienteSeleccionado={setPacienteSeleccionado}
          sesionActual={sesionActual}
          setSesionActual={setSesionActual}
        />

        {/* BLOQUE CLÍNICO Y TÉCNICO (SE ACTIVA AL SELECCIONAR UN PACIENTE) */}
        {sesionActual && (
          <div className="space-y-5 animate-fadeIn sm:space-y-6">

            {/* CRONÓMETRO DE SESIÓN — fijo al hacer scroll para no perderlo de vista */}
            <div className="sticky top-2 z-30">
              <CronometroSesion sesionActual={sesionActual} nombrePaciente={nombrePacienteActivo} />
            </div>

            {/* INFORMACIÓN DEL PACIENTE ACTIVO */}
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:p-5">
              <div className="flex items-center gap-3 min-w-0">
                <span className="hidden h-2.5 w-2.5 shrink-0 rounded-full bg-teal-400 animate-pulse sm:flex" />
                <div className="min-w-0">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-400">
                    Paciente en tratamiento activo
                  </span>
                  <h2 className="text-sm font-semibold truncate text-white">
                    {nombrePacienteActivo}
                  </h2>
                </div>
              </div>
              <div className="inline-flex self-start items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-800/50 sm:self-auto">
                <span className="text-slate-400 dark:text-zinc-400">DNI</span>
                <span className="font-mono font-semibold text-white">{pacienteSeleccionado?.dni || 'N/A'}</span>
                <span className="text-slate-600 dark:text-zinc-600">•</span>
                <span className="text-slate-400 dark:text-zinc-400">Tel</span>
                <span className="font-mono font-semibold text-white">{pacienteSeleccionado?.telefono || 'N/A'}</span>
              </div>
            </div>

            {/* VISOR DE LA ANAMNESIS DEL DÍA */}
            <VisorAnamnesisDia sesionActual={sesionActual} />

            {/* FORMULARIO DE CARGA TÉCNICA Y CIERRE (INCLUYE CATÁLOGO Y TABLA DE ZONAS) */}
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