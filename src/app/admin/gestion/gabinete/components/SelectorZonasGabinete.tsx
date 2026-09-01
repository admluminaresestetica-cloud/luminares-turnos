'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Layers, ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';

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
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm text-center">
        <p className="text-xs text-slate-400">
          Seleccioná un paciente en espera para gestionar sus zonas y parámetros de tratamiento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* SECCIÓN SUPERIOR: ZONAS DISPONIBLES PARA SUMAR */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setDesplegado(!desplegado)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors active:bg-slate-100"
        >
          <div className="flex items-center gap-2.5 text-slate-800">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <h3 className="text-xs font-semibold text-slate-700">
              Agregar zonas a la sesión
            </h3>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
              {zonasDisponiblesNoSeleccionadas.length} disponibles
            </span>
            <span className="text-slate-400">
              {desplegado ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </div>
        </button>

        {desplegado && (
          <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3">
            <p className="text-xs text-slate-400 pt-3">
              Tocá una zona para añadirla a la tabla de trabajo de hoy.
            </p>

            {cargando ? (
              <p className="text-xs text-slate-400 py-2">Cargando catálogo…</p>
            ) : zonasDisponiblesNoSeleccionadas.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                Todas las zonas disponibles ya fueron agregadas a la sesión.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {zonasDisponiblesNoSeleccionadas.map((item) => {
                  const esFem = item.genero === 'femenino';
                  const esMasc = item.genero === 'masculino';

                  let clasesBoton =
                    'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100';

                  if (esFem) {
                    clasesBoton =
                      'bg-rose-50/60 border-rose-100 text-rose-900 hover:bg-rose-50';
                  } else if (esMasc) {
                    clasesBoton =
                      'bg-sky-50/60 border-sky-100 text-sky-900 hover:bg-sky-50';
                  }

                  return (
                    <button
                      key={item.nombre}
                      type="button"
                      onClick={() => agregarZona(item.nombre)}
                      className={`min-h-[52px] p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-1 transition-all active:scale-95 ${clasesBoton}`}
                    >
                      <span className="flex flex-col items-start truncate text-left">
                        <span className="truncate w-full capitalize">{item.nombre}</span>
                        <span className="text-[9px] font-normal opacity-60">
                          {esFem ? 'Femenino' : esMasc ? 'Masculino' : 'General'}
                        </span>
                      </span>
                      <Plus className="w-3.5 h-3.5 shrink-0 opacity-50" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECCIÓN INFERIOR: TABLA DE TRABAJO (PARÁMETROS TÉCNICOS) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-semibold text-slate-700">
            Tabla de parámetros de sesión
          </h3>
          <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
            {zonasSeleccionadas.length} zonas en tratamiento
          </span>
        </div>

        {zonasSeleccionadas.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No hay zonas seleccionadas para esta sesión. Agregá una desde el catálogo de arriba.
          </p>
        ) : (
          <>
            {/* Vista tabla — desktop / tablet */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[520px]">
                <thead>
                  <tr className="text-slate-500 text-[11px] font-medium uppercase tracking-wide">
                    <th className="p-2.5 border-b border-slate-200">Zona</th>
                    <th className="p-2.5 border-b border-slate-200">Afluencia / Frecuencia</th>
                    <th className="p-2.5 border-b border-slate-200">Energy</th>
                    <th className="p-2.5 border-b border-slate-200">Pasadas</th>
                    <th className="p-2.5 border-b border-slate-200 w-10"></th>
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
                      <tr key={zona} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-2 font-medium text-slate-800 capitalize">{zona}</td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            placeholder="Ej: 12 J/cm² / 10Hz"
                            value={param.afluencia}
                            onChange={(e) => cambiarParametro(zona, 'afluencia', e.target.value)}
                            className="w-full p-2 text-xs border border-slate-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-slate-50/50"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            placeholder="Ej: 40 ms"
                            value={param.energy}
                            onChange={(e) => cambiarParametro(zona, 'energy', e.target.value)}
                            className="w-full p-2 text-xs border border-slate-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-slate-50/50"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            placeholder="Ej: 2 pasadas"
                            value={param.pasadas}
                            onChange={(e) => cambiarParametro(zona, 'pasadas', e.target.value)}
                            className="w-full p-2 text-xs border border-slate-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-slate-50/50"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => quitarZona(zona)}
                            title="Quitar zona de la sesión"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors active:scale-90"
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

            {/* Vista tarjetas — mobile */}
            <div className="sm:hidden space-y-3">
              {zonasSeleccionadas.map((zona) => {
                const param = parametrosZonas[zona] || {
                  afluencia: '',
                  energy: '',
                  pasadas: '',
                };

                return (
                  <div
                    key={zona}
                    className="border border-slate-200/80 rounded-xl p-3 space-y-2.5 bg-slate-50/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 capitalize">{zona}</span>
                      <button
                        type="button"
                        onClick={() => quitarZona(zona)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors active:scale-90"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        placeholder="Afluencia / Frecuencia — Ej: 12 J/cm² / 10Hz"
                        value={param.afluencia}
                        onChange={(e) => cambiarParametro(zona, 'afluencia', e.target.value)}
                        className="w-full p-2.5 text-xs border border-slate-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Energy — Ej: 40 ms"
                        value={param.energy}
                        onChange={(e) => cambiarParametro(zona, 'energy', e.target.value)}
                        className="w-full p-2.5 text-xs border border-slate-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Pasadas — Ej: 2 pasadas"
                        value={param.pasadas}
                        onChange={(e) => cambiarParametro(zona, 'pasadas', e.target.value)}
                        className="w-full p-2.5 text-xs border border-slate-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}