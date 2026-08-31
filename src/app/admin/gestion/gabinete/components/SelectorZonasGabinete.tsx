'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Check, Layers, ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ServicioLaser {
  id?: string;
  nombre_zona: string;
  genero?: string;
}

export interface ParametroZona {
  zona: string;
  afluencia: string;
  energy: string;
  pasadas: string;
}

interface SelectorZonasGabineteProps {
  sesionActual: any;
  zonasSeleccionadas: string[];
  setZonasSeleccionadas: (zonas: string[]) => void;
  parametrosZonas: Record<string, { afluencia: string; energy: string; pasadas: string }>;
  setParametrosZonas: React.Dispatch<
    React.SetStateAction<Record<string, { afluencia: string; energy: string; pasadas: string }>>
  >;
}

// Limpia el texto del género para agrupar fácil
const obtenerGeneroLimpio = (val: any): string => {
  if (!val) return 'unisex';
  const str = String(val).toLowerCase().trim();
  if (str.startsWith('f') || str.includes('fem') || str.includes('muj')) return 'femenino';
  if (str.startsWith('m') || str.includes('masc') || str.includes('homb')) return 'masculino';
  return 'unisex';
};

export default function SelectorZonasGabinete({
  sesionActual,
  zonasSeleccionadas,
  setZonasSeleccionadas,
  parametrosZonas,
  setParametrosZonas,
}: SelectorZonasGabineteProps) {
  const [servicios, setServicios] = useState<ServicioLaser[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [desplegado, setDesplegado] = useState<boolean>(true);

  // Cargar catálogo completo de servicios_laser
  useEffect(() => {
    const cargarServiciosLaser = async () => {
      setCargando(true);
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
        setCargando(false);
      }
    };

    cargarServiciosLaser();
  }, []);

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

    // Asegurar zonas precargadas si no están en la lista
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

  // Zonas NO SELECCIONADAS (se muestran arriba para agregar)
  const zonasDisponiblesNoSeleccionadas = useMemo(() => {
    return todasLasZonas.filter(
      (item) =>
        !zonasSeleccionadas.some(
          (z) => z.toLowerCase().trim() === item.nombre.toLowerCase().trim()
        )
    );
  }, [todasLasZonas, zonasSeleccionadas]);

  // Agregar zona a la tabla
  const agregarZona = (nombreZona: string) => {
    setZonasSeleccionadas([...zonasSeleccionadas, nombreZona]);
    
    // Inicializar parámetros limpios si no existen
    if (!parametrosZonas[nombreZona]) {
      setParametrosZonas((prev) => ({
        ...prev,
        [nombreZona]: { afluencia: '', energy: '', pasadas: '' },
      }));
    }
  };

  // Quitar zona de la tabla (vuelve arriba)
  const quitarZona = (nombreZona: string) => {
    setZonasSeleccionadas(
      zonasSeleccionadas.filter(
        (z) => z.toLowerCase().trim() !== nombreZona.toLowerCase().trim()
      )
    );
  };

  // Actualizar parámetros de un campo en la tabla
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
          Selecciona un paciente en espera para gestionar sus zonas y parámetros de tratamiento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* SECCIÓN SUPERIOR: ZONAS DISPONIBLES PARA SUMAR */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm transition-all overflow-hidden">
        <div
          onClick={() => setDesplegado(!desplegado)}
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
              {desplegado ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {desplegado && (
          <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3">
            <p className="text-xs text-slate-500">
              Haz clic en una zona para añadirla a la tabla de trabajo de hoy:
            </p>

            {cargando ? (
              <p className="text-xs text-slate-400 font-medium py-2">Cargando catálogo...</p>
            ) : zonasDisponiblesNoSeleccionadas.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                Todas las zonas disponibles han sido agregadas a la sesión.
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

      {/* SECCIÓN INFERIOR: TABLA DE TRABAJO (PARÁMETROS TÉCNICOS) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Tabla de Parámetros de Sesión
          </h3>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full">
            {zonasSeleccionadas.length} zonas en tratamiento
          </span>
        </div>

        {zonasSeleccionadas.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-6">
            No hay zonas seleccionadas para esta sesión. Agrega una desde el catálogo superior.
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
                      {/* Nombre de la zona */}
                      <td className="p-2 border border-slate-200 font-semibold text-slate-800 capitalize bg-slate-50/30">
                        {zona}
                      </td>

                      {/* Input Afluencia */}
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

                      {/* Input Energy */}
                      <td className="p-1.5 border border-slate-200">
                        <input
                          type="text"
                          placeholder="Ej: 40 ms"
                          value={param.energy}
                          onChange={(e) => cambiarParametro(zona, 'energy', e.target.value)}
                          className="w-full p-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        />
                      </td>

                      {/* Input Pasadas */}
                      <td className="p-1.5 border border-slate-200">
                        <input
                          type="text"
                          placeholder="Ej: 2 pasadas"
                          value={param.pasadas}
                          onChange={(e) => cambiarParametro(zona, 'pasadas', e.target.value)}
                          className="w-full p-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        />
                      </td>

                      {/* Botón Quitar */}
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
    </div>
  );
}