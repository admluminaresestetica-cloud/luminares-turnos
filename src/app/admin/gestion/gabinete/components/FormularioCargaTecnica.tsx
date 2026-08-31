'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Settings, CheckCircle2, Loader2, Layers, ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ServicioLaser {
  id?: string;
  nombre_zona: string;
  genero?: string;
}

interface FormularioCargaTecnicaProps {
  sesionActual: any;
  operadoraActual: string;
  zonasSeleccionadas: string[];
  setZonasSeleccionadas: (zonas: string[]) => void;
  onSesionCompletada: () => void;
}

const obtenerGeneroLimpio = (val: any): string => {
  if (!val) return 'unisex';
  const str = String(val).toLowerCase().trim();
  if (str.startsWith('f') || str.includes('fem') || str.includes('muj')) return 'femenino';
  if (str.startsWith('m') || str.includes('masc') || str.includes('homb')) return 'masculino';
  return 'unisex';
};

export default function FormularioCargaTecnica({
  sesionActual,
  operadoraActual,
  zonasSeleccionadas,
  setZonasSeleccionadas,
  onSesionCompletada,
}: FormularioCargaTecnicaProps) {
  const [equipo, setEquipo] = useState('Laser Soprano / Diodo');
  const [observacionesGabinete, setObservacionesGabinete] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Estado para los parámetros técnicos individuales de cada zona
  const [parametrosZonas, setParametrosZonas] = useState<
    Record<string, { afluencia: string; energy: string; pasadas: string }>
  >({});

  // Catálogo completo de servicios
  const [servicios, setServicios] = useState<ServicioLaser[]>([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState<boolean>(true);
  const [desplegadoCatalogo, setDesplegadoCatalogo] = useState<boolean>(true);

  // Cargar catálogo de servicios_laser
  useEffect(() => {
    const cargarServiciosLaser = async () => {
      setCargandoCatalogo(true);
      try {
        const { data, error } = await supabase
          .from('servicios_laser')
          .select('id, nombre_zona, genero')
          .order('nombre_zona', { ascending: true });

        if (error) {
          console.error('Error al cargar servicios_laser:', error);
        } else if (data) {
          setServicios(data);
        }
      } catch (err) {
        console.error('Error en la petición de servicios_laser:', err);
      } finally {
        setCargandoCatalogo(false);
      }
    };

    cargarServiciosLaser();
  }, []);

  // Cargar datos previos de la sesión si existen
  useEffect(() => {
    if (sesionActual) {
      if (sesionActual.parametros_tecnicos) {
        const pTech = sesionActual.parametros_tecnicos;
        setEquipo(pTech.equipo || 'Laser Soprano / Diodo');

        // Si existen detalles cargados previamente por zona
        if (pTech.detalles_zonas && Array.isArray(pTech.detalles_zonas)) {
          const mapaPrevio: Record<string, { afluencia: string; energy: string; pasadas: string }> = {};
          pTech.detalles_zonas.forEach((d: any) => {
            if (d.zona) {
              mapaPrevio[d.zona] = {
                afluencia: d.afluencia || '',
                energy: d.energy || '',
                pasadas: d.pasadas || '',
              };
            }
          });
          setParametrosZonas(mapaPrevio);
        }
      }
      setObservacionesGabinete(sesionActual.observaciones_gabinete || '');
    }
  }, [sesionActual]);

  // Consolidar catálogo completo ordenado
  const todasLasZonas = useMemo(() => {
    const mapaZonas = new Map<string, { nombre: string; genero: string }>();

    servicios.forEach((serv) => {
      if (serv.nombre_zona) {
        mapaZonas.set(serv.nombre_zona.toLowerCase().trim(), {
          nombre: serv.nombre_zona,
          genero: obtenerGeneroLimpio(serv.genero),
        });
      }
    });

    zonasSeleccionadas.forEach((z) => {
      if (z) {
        const key = z.toLowerCase().trim();
        if (!mapaZonas.has(key)) {
          mapaZonas.set(key, { nombre: z, genero: 'unisex' });
        }
      }
    });

    const listaCompleta = Array.from(mapaZonas.values());
    const ordenGenero: Record<string, number> = { femenino: 1, masculino: 2, unisex: 3 };

    return listaCompleta.sort((a, b) => {
      const pA = ordenGenero[a.genero] || 3;
      const pB = ordenGenero[b.genero] || 3;
      if (pA !== pB) return pA - pB;
      return a.nombre.localeCompare(b.nombre);
    });
  }, [servicios, zonasSeleccionadas]);

  // Zonas no seleccionadas que se muestran en el panel superior
  const zonasDisponiblesNoSeleccionadas = useMemo(() => {
    return todasLasZonas.filter(
      (item) =>
        !zonasSeleccionadas.some(
          (z) => z.toLowerCase().trim() === item.nombre.toLowerCase().trim()
        )
    );
  }, [todasLasZonas, zonasSeleccionadas]);

  const agregarZona = (nombreZona: string) => {
    setZonasSeleccionadas([...zonasSeleccionadas, nombreZona]);
    if (!parametrosZonas[nombreZona]) {
      setParametrosZonas((prev) => ({
        ...prev,
        [nombreZona]: { afluencia: '', energy: '', pasadas: '' },
      }));
    }
  };

  const quitarZona = (nombreZona: string) => {
    setZonasSeleccionadas(
      zonasSeleccionadas.filter(
        (z) => z.toLowerCase().trim() !== nombreZona.toLowerCase().trim()
      )
    );
  };

  const cambiarParametro = (
    zona: string,
    campo: 'afluencia' | 'energy' | 'pasadas',
    valor: string
  ) => {
    setParametrosZonas((prev) => ({
      ...prev,
      [zona]: {
        ...(prev[zona] || { afluencia: '', energy: '', pasadas: '' }),
        [campo]: valor,
      },
    }));
  };

  if (!sesionActual) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
        <p className="text-xs text-slate-400 italic">
          Selecciona un paciente para habilitar la carga de parámetros técnicos.
        </p>
      </div>
    );
  }

  const handleGuardarYFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operadoraActual) {
      alert('Por favor selecciona una operadora en la barra superior antes de finalizar.');
      return;
    }

    setGuardando(true);
    try {
      // Estructura de detalles por zona
      const detalles_zonas = zonasSeleccionadas.map((zona) => ({
        zona,
        afluencia: parametrosZonas[zona]?.afluencia || '',
        energy: parametrosZonas[zona]?.energy || '',
        pasadas: parametrosZonas[zona]?.pasadas || '',
      }));

      const parametros_tecnicos = {
        equipo,
        detalles_zonas,
        operadora: operadoraActual,
        observaciones_gabinete: observacionesGabinete,
        fecha_atencion: new Date().toISOString(),
      };

      // UPDATE a pacientes_ficha
      const { error } = await supabase
        .from('pacientes_ficha')
        .update({
          zonas_realizadas: zonasSeleccionadas,
          parametros_tecnicos,
          estado_atencion: 'atendido',
          updated_at: new Date().toISOString(),
        })
        .eq('id', sesionActual.id);

      if (error) throw error;

      alert('¡Atención finalizada con éxito! La ficha del paciente fue actualizada.');
      onSesionCompletada();
    } catch (err) {
      console.error('Error al guardar la sesión:', err);
      alert('Hubo un error al guardar los datos en la ficha del paciente.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleGuardarYFinalizar} className="space-y-4">
      {/* SECCIÓN SUPERIOR: CATÁLOGO DE ZONAS NO SELECCIONADAS */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm transition-all overflow-hidden">
        <div
          onClick={() => setDesplegadoCatalogo(!desplegadoCatalogo)}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors select-none"
        >
          <div className="flex items-center space-x-2 text-slate-800">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Agregar Zonas a la Sesión
            </h3>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
              {zonasDisponiblesNoSeleccionadas.length} disponibles
            </span>

            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
            >
              {desplegadoCatalogo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {desplegadoCatalogo && (
          <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3">
            <p className="text-xs text-slate-500">
              Haz clic en una zona para añadirla a la tabla de trabajo:
            </p>

            {cargandoCatalogo ? (
              <p className="text-xs text-slate-400 font-medium py-2">Cargando catálogo...</p>
            ) : zonasDisponiblesNoSeleccionadas.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                Todas las zonas del catálogo están cargadas en la tabla.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {zonasDisponiblesNoSeleccionadas.map((item) => {
                  const esFem = item.genero === 'femenino';
                  const esMasc = item.genero === 'masculino';

                  let clasesBoton =
                    'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';

                  if (esFem) {
                    clasesBoton =
                      'bg-rose-50/50 border-rose-200 text-rose-900 hover:bg-rose-100';
                  } else if (esMasc) {
                    clasesBoton =
                      'bg-sky-50/50 border-sky-200 text-sky-900 hover:bg-sky-100';
                  }

                  return (
                    <button
                      key={item.nombre}
                      type="button"
                      onClick={() => agregarZona(item.nombre)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${clasesBoton}`}
                    >
                      <div className="flex flex-col items-start truncate pr-1">
                        <span className="truncate w-full text-left capitalize">
                          {item.nombre}
                        </span>
                        <span className="text-[9px] font-normal uppercase opacity-75 text-slate-500">
                          {esFem ? 'Fem' : esMasc ? 'Masc' : 'Gral'}
                        </span>
                      </div>
                      <Plus className="w-3.5 h-3.5 shrink-0 ml-1 text-slate-400" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECCIÓN INFERIOR: PARÁMETROS TÉCNICOS Y NOTAS DE GABINETE */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-2 text-slate-800">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Parámetros Técnicos y Notas de Gabinete
            </h3>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full">
            {zonasSeleccionadas.length} zonas seleccionadas
          </span>
        </div>

        {/* Campo Equipo */}
        <div className="max-w-xs">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Equipo / Tecnología</label>
          <input
            type="text"
            value={equipo}
            onChange={(e) => setEquipo(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
            placeholder="Ej: Diodo Soprano"
          />
        </div>

        {/* TABLA DINÁMICA DE ZONAS */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-2">
            Detalle por Zona
          </label>
          {zonasSeleccionadas.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-4 border border-dashed border-slate-200 rounded-lg">
              No hay zonas seleccionadas. Selecciona zonas arriba para ingresar sus parámetros.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                    <th className="p-2.5 border border-slate-200 rounded-l-md">Zonas</th>
                    <th className="p-2.5 border border-slate-200">Afluencia / Frecuencia</th>
                    <th className="p-2.5 border border-slate-200">Energy</th>
                    <th className="p-2.5 border border-slate-200">Pasadas</th>
                    <th className="p-2.5 border border-slate-200 rounded-r-md text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {zonasSeleccionadas.map((zona) => {
                    const param = parametrosZonas[zona] || {
                      afluencia: '',
                      energy: '',
                      pasadas: '',
                    };

                    return (
                      <tr key={zona} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-2 border border-slate-200 font-semibold text-slate-800 capitalize bg-slate-50/30">
                          {zona}
                        </td>
                        <td className="p-1.5 border border-slate-200">
                          <input
                            type="text"
                            placeholder="Ej: 12 J/cm² / 10Hz"
                            value={param.afluencia}
                            onChange={(e) =>
                              cambiarParametro(zona, 'afluencia', e.target.value)
                            }
                            className="w-full p-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                          />
                        </td>
                        <td className="p-1.5 border border-slate-200">
                          <input
                            type="text"
                            placeholder="Ej: 40 ms"
                            value={param.energy}
                            onChange={(e) => cambiarParametro(zona, 'energy', e.target.value)}
                            className="w-full p-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                          />
                        </td>
                        <td className="p-1.5 border border-slate-200">
                          <input
                            type="text"
                            placeholder="Ej: 2 pasadas"
                            value={param.pasadas}
                            onChange={(e) => cambiarParametro(zona, 'pasadas', e.target.value)}
                            className="w-full p-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                          />
                        </td>
                        <td className="p-1.5 border border-slate-200 text-center">
                          <button
                            type="button"
                            onClick={() => quitarZona(zona)}
                            title="Quitar zona de la sesión"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Observaciones de Gabinete (Notas de la Sesión)
          </label>
          <textarea
            rows={3}
            value={observacionesGabinete}
            onChange={(e) => setObservacionesGabinete(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
            placeholder="Escribe notas relevantes sobre la piel, tolerancia al tratamiento o recomendaciones dadas..."
          />
        </div>

        {/* Botón Submit */}
        <div className="flex justify-end pt-2 border-t">
          <button
            type="submit"
            disabled={guardando}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {guardando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando en ficha...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar y Finalizar Atencion</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}