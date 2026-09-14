'use client';

import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
  Settings,
  CheckCircle2,
  Loader2,
  Layers,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  Zap,
  NotebookPen,
} from 'lucide-react';

// Instancia única del cliente de Supabase
const supabase = createBrowserClient(
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

  // 1. Cargar catálogo de servicios_laser
  useEffect(() => {
    const cargarServiciosLaser = async () => {
      setCargandoCatalogo(true);
      try {
        console.log('🔍 [FormularioCargaTecnica] Cargando catálogo servicios_laser...');
        const { data, error } = await supabase
          .from('servicios_laser')
          .select('id, nombre_zona, genero')
          .order('nombre_zona', { ascending: true });

        if (error) {
          console.error('❌ Error al cargar servicios_laser:', error);
        } else if (data) {
          console.log(`✅ [FormularioCargaTecnica] Se cargaron ${data.length} servicios del catálogo.`);
          setServicios(data);
        }
      } catch (err) {
        console.error('❌ Excepción en la petición de servicios_laser:', err);
      } finally {
        setCargandoCatalogo(false);
      }
    };

    cargarServiciosLaser();
  }, []);

  // 2. Cargar datos previos de la sesión si existen
  useEffect(() => {
    if (sesionActual) {
      console.log('📋 [FormularioCargaTecnica] Cargando datos de la sesión actual:', sesionActual);
      if (sesionActual.parametros_tecnicos) {
        const pTech = sesionActual.parametros_tecnicos;
        setEquipo(pTech.equipo || 'Laser Soprano / Diodo');

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
      setObservacionesGabinete(
        sesionActual.observaciones_gabinete ||
          sesionActual.parametros_tecnicos?.observaciones_gabinete ||
          ''
      );
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
    console.log(`➕ [FormularioCargaTecnica] Agregando zona: "${nombreZona}"`);
    setZonasSeleccionadas([...zonasSeleccionadas, nombreZona]);
    if (!parametrosZonas[nombreZona]) {
      setParametrosZonas((prev) => ({
        ...prev,
        [nombreZona]: { afluencia: '', energy: '', pasadas: '' },
      }));
    }
  };

  const quitarZona = (nombreZona: string) => {
    console.log(`➖ [FormularioCargaTecnica] Quitando zona: "${nombreZona}"`);
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
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs text-slate-400 dark:text-zinc-500">
          Seleccioná un paciente para habilitar la carga de parámetros técnicos.
        </p>
      </div>
    );
  }

  const handleGuardarYFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    console.group('🚀 [FormularioCargaTecnica] Proceso de guardado iniciado');

    if (!operadoraActual) {
      console.warn('⚠️ Guardado cancelado: No hay operadora seleccionada.');
      alert('Por favor selecciona una operadora en la barra superior antes de finalizar.');
      console.groupEnd();
      return;
    }

    if (!sesionActual?.id) {
      console.warn('⚠️ Guardado cancelado: ID de sesión no válido.');
      alert('Error: No hay una sesión o paciente seleccionado correctamente.');
      console.groupEnd();
      return;
    }

    setGuardando(true);
    try {
      const detalles_zonas = zonasSeleccionadas.map((zona) => ({
        zona,
        afluencia: parametrosZonas[zona]?.afluencia || '',
        energy: parametrosZonas[zona]?.energy || '',
        pasadas: parametrosZonas[zona]?.pasadas || '',
      }));

      const parametros_tecnicos = {
        equipo: equipo || 'Laser Soprano / Diodo',
        detalles_zonas,
        operadora: operadoraActual,
        observaciones_gabinete: observacionesGabinete || '',
        fecha_atencion: new Date().toISOString(),
      };

      // 1️⃣ Payload para actualizar pacientes_ficha y pasarlo a "atendido"
      const payloadFicha = {
        zonas_realizadas: zonasSeleccionadas,
        parametros_tecnicos: parametros_tecnicos,
        observaciones_gabinete: observacionesGabinete || '',
        estado_atencion: 'atendido',
        updated_at: new Date().toISOString(),
      };

      console.log('Actualizando pacientes_ficha ID:', sesionActual.id);
      
      const { error: errorFicha } = await supabase
        .from('pacientes_ficha')
        .update(payloadFicha)
        .eq('id', sesionActual.id);

      if (errorFicha) {
        console.error('❌ Error al actualizar pacientes_ficha:', errorFicha);
        alert(`Error al actualizar ficha del paciente: ${errorFicha.message}`);
        return;
      }

      // 2️⃣ REGISTRO HISTÓRICO REAL EN LA TABLA sesiones_laser
      const payloadSesion = {
        paciente_id: sesionActual.id,
        estado_atencion: 'atendido',
        zonas_realizadas: zonasSeleccionadas,
        observaciones_recepcion: sesionActual.observaciones_recepcion || sesionActual.observaciones || '',
        anamnesis_sesion: sesionActual.anamnesis_sesion || sesionActual.antecedentes_medicos || null,
        parametros_tecnicos: parametros_tecnicos,
        observaciones_gabinete: observacionesGabinete || '',
        atendido_por: operadoraActual,
      };

      console.log('Insertando en sesiones_laser:', payloadSesion);

      const { error: errorSesion } = await supabase
        .from('sesiones_laser')
        .insert([payloadSesion]);

      if (errorSesion) {
        console.error('❌ Error al registrar en sesiones_laser:', errorSesion);
        alert(`Atención actualizada en ficha, pero hubo un detalle al crear el registro histórico: ${errorSesion.message}`);
      } else {
        console.log('✅ Sesión registrada exitosamente en sesiones_laser');
      }

      alert('¡Atención finalizada con éxito!');

      if (typeof onSesionCompletada === 'function') {
        console.log('🔄 Ejecutando callback onSesionCompletada()...');
        onSesionCompletada();
      }
    } catch (err: any) {
      console.error('💥 Excepción inesperada durante el guardado:', err);
      alert(`Hubo un error inesperado: ${err?.message || 'Error desconocido'}`);
    } finally {
      setGuardando(false);
      console.groupEnd();
    }
  };

  return (
    <form onSubmit={handleGuardarYFinalizar} className="space-y-4 sm:space-y-5">
      {/* SECCIÓN SUPERIOR: CATÁLOGO DE ZONAS NO SELECCIONADAS */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={() => setDesplegadoCatalogo(!desplegadoCatalogo)}
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
              {desplegadoCatalogo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          </div>
        </button>

        {desplegadoCatalogo && (
          <div className="space-y-3 border-t border-slate-100 px-4 pb-4 pt-1 dark:border-zinc-800">
            <p className="pt-3 text-xs text-slate-400 dark:text-zinc-500">
              Tocá una zona para añadirla a la tabla de trabajo.
            </p>

            {cargandoCatalogo ? (
              <p className="py-2 text-xs text-slate-400 dark:text-zinc-500">Cargando catálogo…</p>
            ) : zonasDisponiblesNoSeleccionadas.length === 0 ? (
              <p className="py-2 text-xs text-slate-400 dark:text-zinc-500">
                Todas las zonas del catálogo están cargadas en la tabla.
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

      {/* SECCIÓN INFERIOR: PARÁMETROS TÉCNICOS Y NOTAS DE GABINETE */}
      <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 text-slate-800 dark:text-zinc-100">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50">
              <Settings className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
              Parámetros técnicos y notas de gabinete
            </h3>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            {zonasSeleccionadas.length} zonas
          </span>
        </div>

        {/* Campo Equipo */}
        <div className="max-w-xs">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-zinc-400">
            <Zap className="h-3 w-3 text-slate-400 dark:text-zinc-500" />
            Equipo / Tecnología
          </label>
          <input
            type="text"
            value={equipo}
            onChange={(e) => setEquipo(e.target.value)}
            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 p-2.5 text-xs focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            placeholder="Ej: Diodo Soprano"
          />
        </div>

        {/* TABLA DINÁMICA DE ZONAS */}
        <div>
          <label className="mb-2 block text-[11px] font-medium text-slate-600 dark:text-zinc-400">
            Detalle por zona
          </label>
          {zonasSeleccionadas.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-zinc-800 dark:text-zinc-500">
              No hay zonas seleccionadas. Elegí zonas arriba para ingresar sus parámetros.
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

        {/* Observaciones */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-zinc-400">
            <NotebookPen className="h-3 w-3 text-slate-400 dark:text-zinc-500" />
            Observaciones de gabinete
          </label>
          <textarea
            rows={3}
            value={observacionesGabinete}
            onChange={(e) => setObservacionesGabinete(e.target.value)}
            className="w-full resize-none rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-xs focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            placeholder="Escribí notas relevantes sobre la piel, tolerancia al tratamiento o recomendaciones dadas…"
          />
        </div>

        {/* Botón Submit */}
        <div className="flex justify-end border-t border-slate-100 pt-3 dark:border-zinc-800">
          <button
            type="submit"
            disabled={guardando}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {guardando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Guardando en ficha…</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Guardar y finalizar atención</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}