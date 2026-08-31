'use client';

import { useState, useEffect } from 'react';
import HeaderOperadoraReloj from './components/HeaderOperadoraReloj';
import NotificacionNuevoCliente from './components/NotificacionNuevoCliente';
import SelectorPacientesDoble from './components/SelectorPacientesDoble';
import VisorAnamnesisDia from './components/VisorAnamnesisDia';
import FormularioCargaTecnica from './components/FormularioCargaTecnica';

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

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto bg-slate-100/50 min-h-screen">
      {/* TÍTULO DE LA VISTA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <span>⚡ Módulo PRO-GABINETE</span>
          </h1>
          <p className="text-xs text-slate-500">
            Control técnico, validación de anamnesis en vivo y registro de sesiones láser.
          </p>
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
        <div className="space-y-6 animate-fadeIn">
          {/* INFORMACIÓN DEL PACIENTE ACTIVO */}
          <div className="bg-indigo-900 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                Paciente en Tratamiento Activo
              </span>
              <h2 className="text-sm font-bold">
                {pacienteSeleccionado 
                  ? (pacienteSeleccionado.nombre_paciente || pacienteSeleccionado.nombre_completo || pacienteSeleccionado.nombre) 
                  : 'Paciente'}
              </h2>
            </div>
            <div className="text-xs bg-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-700">
              DNI: <span className="font-mono font-bold">{pacienteSeleccionado?.dni || 'N/A'}</span> • Tel: <span className="font-mono">{pacienteSeleccionado?.telefono || 'N/A'}</span>
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
  );
}