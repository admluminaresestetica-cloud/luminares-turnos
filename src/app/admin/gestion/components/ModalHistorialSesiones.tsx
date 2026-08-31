'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ModalHistorialSesionesProps {
  pacienteId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalHistorialSesiones({
  pacienteId,
  isOpen,
  onClose,
}: ModalHistorialSesionesProps) {
  const [sesiones, setSesiones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sesionSeleccionada, setSesionSeleccionada] = useState<any>(null);

  useEffect(() => {
    if (isOpen && pacienteId) {
      cargarHistorial();
    }
  }, [isOpen, pacienteId]);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sesiones_gabinete')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSesiones(data || []);
      if (data && data.length > 0) {
        setSesionSeleccionada(data[0]); // Seleccionar la más reciente por defecto
      }
    } catch (err) {
      console.error('Error al cargar historial:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar blindada para convertir zonas a un arreglo seguro
  const obtenerZonasSeguras = (sesion: any) => {
    const rawZonas = sesion.zonas_realizadas || sesion.zonas_preasignadas;
    
    if (Array.isArray(rawZonas)) return rawZonas;
    
    if (typeof rawZonas === 'string') {
      try {
        const parsed = JSON.parse(rawZonas);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Si es un string separado por comas o texto plano
        return rawZonas.split(',').map((z: string) => z.trim()).filter(Boolean);
      }
    }
    
    return [];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-base font-bold text-slate-800">
            📋 Historial Clínico de Sesiones
          </h3>
          <button
            onClick={onClose}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded"
          >
            Cerrar [X]
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-slate-500 font-medium">Cargando sesiones...</p>
        ) : sesiones.length === 0 ? (
          <p className="text-xs text-slate-500">No hay sesiones registradas previas para este paciente.</p>
        ) : (
          <div className="space-y-4">
            {/* CHIPS DE NÚMERO DE SESIÓN */}
            <div className="flex flex-wrap gap-2 border-b pb-3">
              {sesiones.map((sesion, index) => {
                const numeroSesion = sesiones.length - index;
                const fecha = new Date(sesion.created_at).toLocaleDateString();
                const esActiva = sesionSeleccionada?.id === sesion.id;

                return (
                  <button
                    key={sesion.id}
                    onClick={() => setSesionSeleccionada(sesion)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                      esActiva
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Sesión {numeroSesion} ({fecha})
                  </button>
                );
              })}
            </div>

            {/* DETALLE TÉCNICO DE LA SESIÓN SELECCIONADA */}
            {sesionSeleccionada && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 text-xs">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-slate-800">
                    Fecha: {new Date(sesionSeleccionada.created_at).toLocaleString()}
                  </span>
                  <span className="text-slate-600">
                    Operadora: <strong>{sesionSeleccionada.operadora_nombre || 'No especificada'}</strong>
                  </span>
                </div>

                <div>
                  <strong className="block text-slate-700 mb-1">Zonas Realizadas:</strong>
                  <div className="flex flex-wrap gap-1">
                    {obtenerZonasSeguras(sesionSeleccionada).length > 0 ? (
                      obtenerZonasSeguras(sesionSeleccionada).map((zona: string, i: number) => (
                        <span key={i} className="bg-white border text-slate-800 px-2 py-0.5 rounded font-medium">
                          {zona}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">Sin zonas registradas en esta sesión.</span>
                    )}
                  </div>
                </div>

                {/* 📸 FOTO HISTÓRICA DE LA ANAMNESIS DE ESE DÍA */}
                <div>
                  <strong className="block text-slate-700 mb-1">Checklist / Anamnesis Registrada en la Sesión:</strong>
                  {sesionSeleccionada.anamnesis_sesion && Object.keys(sesionSeleccionada.anamnesis_sesion).length > 0 ? (
                    <div className="bg-white p-2.5 rounded border border-slate-200 grid grid-cols-2 gap-2">
                      {Object.entries(sesionSeleccionada.anamnesis_sesion).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${value ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                          <span className="text-slate-700 font-medium capitalize">
                            {key.replace(/_/g, ' ')}: <strong>{value ? 'SÍ' : 'NO'}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Sin registro histórico de anamnesis para esta sesión.</p>
                  )}
                </div>

                {/* PARÁMETROS TÉCNICOS GUARDADOS */}
                <div>
                  <strong className="block text-slate-700 mb-1">Parámetros Técnicos Aplicados:</strong>
                  {sesionSeleccionada.parametros_tecnicos &&
                  Object.keys(sesionSeleccionada.parametros_tecnicos).length > 0 ? (
                    <pre className="bg-white p-2 rounded border border-slate-200 text-[11px] overflow-x-auto text-slate-800 font-mono">
                      {JSON.stringify(sesionSeleccionada.parametros_tecnicos, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-slate-400 italic">Sin registro de parámetros técnicos.</p>
                  )}
                </div>

                {/* OBSERVACIONES */}
                <div>
                  <strong className="block text-slate-700">Notas de Recepción:</strong>
                  <p className="text-slate-600">{sesionSeleccionada.observaciones_recepcion || 'Sin notas.'}</p>
                </div>
                <div>
                  <strong className="block text-slate-700">Notas de Gabinete:</strong>
                  <p className="text-slate-600">{sesionSeleccionada.observaciones_gabinete || 'Sin notas.'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}