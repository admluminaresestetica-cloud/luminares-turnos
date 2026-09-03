'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ModalHistorialSesionesProps {
  pacienteId: string;
  celularPaciente?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalHistorialSesiones({
  pacienteId,
  celularPaciente,
  isOpen,
  onClose,
}: ModalHistorialSesionesProps) {
  const [sesiones, setSesiones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sesionSeleccionada, setSesionSeleccionada] = useState<any>(null);

  useEffect(() => {
    if (isOpen && (pacienteId || celularPaciente)) {
      cargarHistorial();
    }
  }, [isOpen, pacienteId, celularPaciente]);

  const cargarHistorial = async () => {
  setLoading(true);
  try {
    let query = supabase
      .from('sesiones_laser')
      .select('*');

    // Filtro por paciente_id o celular_paciente
    const condiciones: string[] = [];
    if (pacienteId) condiciones.push(`paciente_id.eq.${pacienteId}`);
    if (celularPaciente) condiciones.push(`celular_paciente.eq.${celularPaciente}`);

    if (condiciones.length > 0) {
      query = query.or(condiciones.join(','));
    }

    // Ordenar por fecha de creación (created_at) o campo alternativo
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    
    setSesiones(data || []);
    if (data && data.length > 0) {
      setSesionSeleccionada(data[0]);
    } else {
      setSesionSeleccionada(null);
    }
  } catch (err) {
    console.error('Error al cargar historial de sesiones_laser:', err);
  } finally {
    setLoading(false);
  }
};

  const obtenerZonasSeguras = (sesion: any) => {
    if (!sesion) return [];
    const rawZonas = sesion.zonas_tratadas || sesion.zonas_realizadas || sesion.zonas_preasignadas;
    if (Array.isArray(rawZonas)) return rawZonas;
    if (typeof rawZonas === 'string') {
      try {
        const parsed = JSON.parse(rawZonas);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return rawZonas.split(',').map((z: string) => z.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const obtenerDetallesTecnicos = (sesion: any) => {
    if (!sesion) return { operadora: 'No registrada', equipo: 'Soprano / Ice', detalles: [] };

    // Si viene directamente de los campos directos de la nueva tabla
    const tieneValoresDirectos = sesion.julios !== undefined || sesion.milisegundos !== undefined || sesion.pasadas !== undefined;

    let detalles: any[] = [];

    if (tieneValoresDirectos) {
      const zonas = obtenerZonasSeguras(sesion);
      detalles = [
        {
          zona: zonas.length > 0 ? zonas.join(', ') : 'Zonas Generales',
          afluencia: sesion.julios ?? '-',
          pulso: sesion.milisegundos ?? '-',
          pasadas: sesion.pasadas ?? '-',
        },
      ];
    } else {
      // Compatibilidad con la estructura previa guardada dentro de un JSON
      const params = sesion?.parametros_tecnicos;
      if (params) {
        let rawDetalles = params.detalles_zonas || [];
        if (typeof rawDetalles === 'string') {
          try { rawDetalles = JSON.parse(rawDetalles); } catch { rawDetalles = []; }
        }
        detalles = Array.isArray(rawDetalles) ? rawDetalles : [];
      }
    }

    return {
      operadora: sesion.atendido_por || sesion.parametros_tecnicos?.operadora || 'No registrada',
      equipo: sesion.equipo || sesion.parametros_tecnicos?.equipo || 'Soprano / Ice',
      detalles,
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              📋 Historial Clínico de Sesiones
            </h3>
            <p className="text-xs text-slate-500">
              {sesiones.length} sesión(es) registrada(s) en el sistema.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Cerrar [X]
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Cargando historial clínico...</div>
        ) : sesiones.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No hay sesiones registradas previas para este paciente.</p>
        ) : (
          <div className="space-y-4">
            {/* TIMELINE DE SESIONES */}
            <div className="flex flex-wrap gap-2 border-b pb-3">
              {sesiones.map((sesion, index) => {
                const fechaRaw = sesion.fecha_sesion || sesion.created_at || sesion.updated_at;
                const fecha = fechaRaw
                  ? new Date(fechaRaw).toLocaleDateString('es-AR')
                  : `Sesión ${sesiones.length - index}`;
                const esActiva = sesionSeleccionada?.id === sesion.id;

                return (
                  <button
                    key={sesion.id || index}
                    onClick={() => setSesionSeleccionada(sesion)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                      esActiva
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-semibold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    📅 {fecha} {sesion.estado_atencion === 'atendido' || sesion.atendido_por ? '✅' : '⏳'}
                  </button>
                );
              })}
            </div>

            {/* DETALLE DE LA SESIÓN SELECCIONADA */}
            {sesionSeleccionada && (() => {
              const infoTecnica = obtenerDetallesTecnicos(sesionSeleccionada);
              const notaGabinete =
                sesionSeleccionada.observaciones ||
                sesionSeleccionada.observaciones_gabinete ||
                sesionSeleccionada.parametros_tecnicos?.observaciones_gabinete;

              const fechaDetalleRaw = sesionSeleccionada.fecha_sesion || sesionSeleccionada.updated_at || sesionSeleccionada.created_at;

              return (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3 bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fecha de Atención</span>
                      <span className="font-bold text-slate-800 text-sm">
                        {fechaDetalleRaw ? new Date(fechaDetalleRaw).toLocaleString('es-AR') : 'N/D'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Atendido por</span>
                      <span className="font-bold text-indigo-700">{infoTecnica.operadora}</span>
                    </div>
                  </div>

                  {/* PARÁMETROS TÉCNICOS */}
                  <div>
                    <strong className="block text-slate-800 font-bold mb-2">⚡ Parámetros Técnicos Aplicados en Gabinete:</strong>
                    {infoTecnica.detalles.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                              <th className="p-2">Zona</th>
                              <th className="p-2">Fluencia (J/cm²)</th>
                              <th className="p-2">Largo de Pulso (ms) / Hz</th>
                              <th className="p-2">Pasadas</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {infoTecnica.detalles.map((det: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="p-2 font-bold text-slate-800">{det.zona}</td>
                                <td className="p-2 font-mono text-indigo-600 font-bold">{det.afluencia || det.fluencia || '-'}</td>
                                <td className="p-2 font-mono">{det.energy || det.pulso || '-'}</td>
                                <td className="p-2 font-mono">{det.pasadas || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-amber-800 text-[11px]">
                        ⚠️ No se registraron parámetros técnicos detallados en esta sesión.
                      </div>
                    )}
                  </div>

                  {/* ZONAS TRATADAS */}
                  <div>
                    <strong className="block text-slate-700 mb-1">Zonas Solicitadas/Realizadas:</strong>
                    <div className="flex flex-wrap gap-1">
                      {obtenerZonasSeguras(sesionSeleccionada).length > 0 ? (
                        obtenerZonasSeguras(sesionSeleccionada).map((zona: string, i: number) => (
                          <span key={i} className="bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded-md font-medium shadow-2xs">
                            {zona}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">Sin zonas registradas.</span>
                      )}
                    </div>
                  </div>

                  {/* CHECKLIST / ANAMNESIS */}
                  <div>
                    <strong className="block text-slate-700 mb-1">Checklist / Anamnesis:</strong>
                    {sesionSeleccionada.anamnesis_sesion && Object.keys(sesionSeleccionada.anamnesis_sesion).length > 0 ? (
                      <div className="bg-white p-3 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.entries(sesionSeleccionada.anamnesis_sesion).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${value ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            <span className="text-slate-700 font-medium capitalize text-[11px]">
                              {key.replace(/_/g, ' ')}: <strong>{value ? 'SÍ' : 'NO'}</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">Sin registro de anamnesis.</p>
                    )}
                  </div>

                  {/* NOTAS DE GABINETE Y RECEPCIÓN */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <strong className="block text-slate-700 mb-1 font-bold">
                        📝 Notas de Gabinete (Operadora):
                      </strong>
                      <p className="bg-amber-50/60 border border-amber-200 p-2.5 rounded-lg text-slate-700 italic min-h-[50px]">
                        {notaGabinete || 'Sin observaciones registradas en gabinete.'}
                      </p>
                    </div>

                    <div>
                      <strong className="block text-slate-700 mb-1 font-bold">
                        📌 Notas de Recepción:
                      </strong>
                      <p className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-600 min-h-[50px]">
                        {sesionSeleccionada.observaciones_recepcion || 'Sin notas de recepción.'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}