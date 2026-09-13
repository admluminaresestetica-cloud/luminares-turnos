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
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs text-slate-400 dark:text-zinc-500">
          Seleccioná un paciente en espera para gestionar sus zonas y parámetros de tratamiento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* SECCIÓN SUPERIOR: ZONAS DISPONIBLES PARA SUMAR */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={() => setDesplegado(!desplegado)}
          className="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50/80 active:bg-slate-100 dark:hover:bg-zinc-800/50 dark:active:bg-zinc-800"
        >
          <div className="flex items-center gap-2.5 text-slate-800 dark:text-zinc-100">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50">
              <Layers className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
              Agregar zonas a la sesión
            </h3>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
              {zonasDisponiblesNoSeleccionadas.length} disponibles
            </span>
            <span className="text-slate-400 dark:text-zinc-500">
              {desplegado ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          </div>
        </button>

        {desplegado && (
          <div className="space-y-3 border-t border-slate-100 px-4 pb-4 pt-1 dark:border-zinc-800">
            <p className="pt-3 text-xs text-slate-400 dark:text-zinc-500">
              Tocá una zona para añadirla a la tabla de trabajo de hoy.
            </p>

            {cargando ? (
              <p className="py-2 text-xs text-slate-400 dark:text-zinc-500">Cargando catálogo…</p>
            ) : zonasDisponiblesNoSeleccionadas.length === 0 ? (
              <p className="py-2 text-xs text-slate-400 dark:text-zinc-500">
                Todas las zonas disponibles ya fueron agregadas a la sesión.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {zonasDisponiblesNoSeleccionadas.map((item) => {
                  const esFem = item.genero === 'femenino';
                  const esMasc = item.genero === 'masculino';

                  let clasesBoton =
                    'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100 dark:bg-zinc-800/60 dark:border-zinc-700/60 dark:text-zinc-300 dark:hover:bg-zinc-800';

                  if (esFem) {
                    clasesBoton =
                      'bg-rose-50/60 border-rose-100 text-rose-900 hover:bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-200 dark:hover:bg-rose-950/50';
                  } else if (esMasc) {
                    clasesBoton =
                      'bg-sky-50/60 border-sky-100 text-sky-900 hover:bg-sky-50 dark:bg-sky-950/30 dark:border-sky-900/40 dark:text-sky-200 dark:hover:bg-sky-950/50';
                  }

                  return (
                    <button
                      key={item.nombre}
                      type="button"
                      onClick={() => agregarZona(item.nombre)}
                      className={`flex min-h-[52px] items-center justify-between gap-1 rounded-xl border p-2.5 text-xs font-medium transition-all active:scale-95 ${clasesBoton}`}
                    >
                      <span className="flex flex-col items-start truncate text-left">
                        <span className="w-full truncate capitalize">{item.nombre}</span>
                        <span className="text-[9px] font-normal opacity-60">
                          {esFem ? 'Femenino' : esMasc ? 'Masculino' : 'General'}
                        </span>
                      </span>
                      <Plus className="h-3.5 w-3.5 shrink-0 opacity-50" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECCIÓN INFERIOR: TABLA DE TRABAJO (PARÁMETROS TÉCNICOS) */}
      <div className="space-y-3 rounded-2xl border border-slate-200/85 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
            Tabla de parámetros de sesión
          </h3>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            {zonasSeleccionadas.length} zonas en tratamiento
          </span>
        </div>

        {zonasSeleccionadas.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500">
            No hay zonas seleccionadas para esta sesión. Agregá una desde el catálogo de arriba.
          </p>
        ) : (
          <>
            {/* Vista tabla — desktop / tablet */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400">
                    <th className="border-b border-slate-200 p-2.5 dark:border-zinc-800">Zona</th>
                    <th className="border-b border-slate-200 p-2.5 dark:border-zinc-800">Afluencia / Frecuencia</th>
                    <th className="border-b border-slate-200 p-2.5 dark:border-zinc-800">Energy</th>
                    <th className="border-b border-slate-200 p-2.5 dark:border-zinc-800">Pasadas</th>
                    <th className="w-10 border-b border-slate-200 p-2.5 dark:border-zinc-800"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs dark:divide-zinc-800">
                  {zonasSeleccionadas.map((zona) => {
                    const param = parametrosZonas[zona] || {
                      afluencia: '',
                      energy: '',
                      pasadas: '',
                    };

                    return (
                      <tr key={zona} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                        <td className="p-2 font-medium capitalize text-slate-800 dark:text-zinc-200">{zona}</td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            placeholder="Ej: 12 J/cm² / 10Hz"
                            value={param.afluencia}
                            onChange={(e) => cambiarParametro(zona, 'afluencia', e.target.value)}
                            className="w-full rounded-lg border border-slate-200/80 bg-slate-50/50 p-2 text-xs focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            placeholder="Ej: 40 ms"
                            value={param.energy}
                            onChange={(e) => cambiarParametro(zona, 'energy', e.target.value)}
                            className="w-full rounded-lg border border-slate-200/80 bg-slate-50/50 p-2 text-xs focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            placeholder="Ej: 2 pasadas"
                            value={param.pasadas}
                            onChange={(e) => cambiarParametro(zona, 'pasadas', e.target.value)}
                            className="w-full rounded-lg border border-slate-200/80 bg-slate-50/50 p-2 text-xs focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => quitarZona(zona)}
                            title="Quitar zona de la sesión"
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 active:scale-90 dark:text-zinc-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Vista tarjetas — mobile */}
            <div className="space-y-3 sm:hidden">
              {zonasSeleccionadas.map((zona) => {
                const param = parametrosZonas[zona] || {
                  afluencia: '',
                  energy: '',
                  pasadas: '',
                };

                return (
                  <div
                    key={zona}
                    className="space-y-2.5 rounded-xl border border-slate-200/80 bg-slate-50/40 p-3 dark:border-zinc-800 dark:bg-zinc-800/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold capitalize text-slate-800 dark:text-zinc-200">
                        {zona}
                      </span>
                      <button
                        type="button"
                        onClick={() => quitarZona(zona)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 active:scale-90 dark:text-zinc-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        placeholder="Afluencia / Frecuencia — Ej: 12 J/cm² / 10Hz"
                        value={param.afluencia}
                        onChange={(e) => cambiarParametro(zona, 'afluencia', e.target.value)}
                        className="w-full rounded-lg border border-slate-200/80 bg-white p-2.5 text-xs focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                      />
                      <input
                        type="text"
                        placeholder="Energy — Ej: 40 ms"
                        value={param.energy}
                        onChange={(e) => cambiarParametro(zona, 'energy', e.target.value)}
                        className="w-full rounded-lg border border-slate-200/80 bg-white p-2.5 text-xs focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                      />
                      <input
                        type="text"
                        placeholder="Pasadas — Ej: 2 pasadas"
                        value={param.pasadas}
                        onChange={(e) => cambiarParametro(zona, 'pasadas', e.target.value)}
                        className="w-full rounded-lg border border-slate-200/80 bg-white p-2.5 text-xs focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
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