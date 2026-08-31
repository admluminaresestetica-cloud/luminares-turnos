'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import HeaderOperadoraReloj from './components/HeaderOperadoraReloj';
import NotificacionNuevoCliente from './components/NotificacionNuevoCliente';
import SelectorPacientesDoble from './components/SelectorPacientesDoble';
import VisorAnamnesisDia from './components/VisorAnamnesisDia';
import FormularioCargaTecnica from './components/FormularioCargaTecnica';
import CronometroSesion from './components/Cronometrosesion';

export default function GabinetePage() {
  const [operadoraActual, setOperadoraActual] = useState<string>('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);
  const [sesionActual, setSesionActual] = useState<any>(null);
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>([]);

  // Cada vez que cambia la sesión actual (ficha del paciente en espera), sincronizamos las zonas realizadas/previas
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

  const nombrePacienteActivo = pacienteSeleccionado
    ? pacienteSeleccionado.nombre_paciente || pacienteSeleccionado.nombre_completo || pacienteSeleccionado.nombre
    : 'Paciente';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-5 sm:space-y-6">

        {/* TÍTULO DE LA VISTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
              <Sparkles className="w-5 h-5 text-emerald-600" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight">
                Gabinete
              </h1>
              <p className="text-xs text-slate-500">
                Control técnico, validación de anamnesis y registro de sesiones láser.
              </p>
            </div>
          </div>
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
          <div className="space-y-5 sm:space-y-6 animate-fadeIn">

            {/* CRONÓMETRO DE SESIÓN — fijo al hacer scroll para no perderlo de vista */}
            <div className="sticky top-2 z-30">
              <CronometroSesion sesionActual={sesionActual} nombrePaciente={nombrePacienteActivo} />
            </div>

            {/* INFORMACIÓN DEL PACIENTE ACTIVO */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="hidden sm:flex h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                <div className="min-w-0">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                    Paciente en tratamiento activo
                  </span>
                  <h2 className="text-sm font-semibold truncate">
                    {nombrePacienteActivo}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 self-start sm:self-auto">
                <span className="text-slate-400">DNI</span>
                <span className="font-mono font-semibold">{pacienteSeleccionado?.dni || 'N/A'}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">Tel</span>
                <span className="font-mono font-semibold">{pacienteSeleccionado?.telefono || 'N/A'}</span>
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