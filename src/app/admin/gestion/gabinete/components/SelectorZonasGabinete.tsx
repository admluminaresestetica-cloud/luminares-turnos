'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Check, Layers, ChevronDown, ChevronUp } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ServicioLaser {
  id?: string;
  nombre: string;
  genero?: string; // 'femenino', 'masculino', etc.
}

interface SelectorZonasGabineteProps {
  sesionActual: any;
  zonasSeleccionadas: string[];
  setZonasSeleccionadas: (zonas: string[]) => void;
}

export default function SelectorZonasGabinete({
  sesionActual,
  zonasSeleccionadas,
  setZonasSeleccionadas,
}: SelectorZonasGabineteProps) {
  const [servicios, setServicios] = useState<ServicioLaser[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [desplegado, setDesplegado] = useState<boolean>(true);

  // Obtener género del paciente en sesión (femenino / masculino)
  const generoPaciente = useMemo(() => {
    if (!sesionActual) return '';
    const rawGender = sesionActual.genero || sesionActual.sexo || '';
    return rawGender.toString().toLowerCase().trim();
  }, [sesionActual]);

  // Cargar servicios_laser desde Supabase
  useEffect(() => {
    const cargarServiciosLaser = async () => {
      setCargando(true);
      try {
        const { data, error } = await supabase
          .from('servicios_laser')
          .select('id, nombre, genero')
          .order('nombre', { ascending: true });

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

  // Filtrar zonas según el género del paciente
  const zonasFiltradas = useMemo(() => {
    if (!generoPaciente) {
      // Si por alguna razón el paciente no tiene género definido, mostramos todas
      return servicios;
    }

    return servicios.filter((serv) => {
      const gServ = (serv.genero || '').toLowerCase().trim();
      // Incluye si coincide con el género del paciente o si no tiene género asignado (unisex)
      return gServ === '' || gServ === generoPaciente;
    });
  }, [servicios, generoPaciente]);

  // Consolidar la lista a mostrar asegurando que zonas seleccionadas previamente no se pierdan
  const listaZonasDisponibles = useMemo(() => {
    const nombresBd = zonasFiltradas.map((s) => s.nombre).filter(Boolean);
    const lista = [...nombresBd];

    zonasSeleccionadas.forEach((z) => {
      if (z && !lista.includes(z)) {
        lista.push(z);
      }
    });

    return lista;
  }, [zonasFiltradas, zonasSeleccionadas]);

  const toggleZona = (zona: string) => {
    if (zonasSeleccionadas.includes(zona)) {
      setZonasSeleccionadas(zonasSeleccionadas.filter((z) => z !== zona));
    } else {
      setZonasSeleccionadas([...zonasSeleccionadas, zona]);
    }
  };

  if (!sesionActual) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
        <p className="text-xs text-slate-400 italic">
          Selecciona un paciente en espera para gestionar sus zonas de tratamiento.
        </p>
      </div>
    );
  }

  const esFemenino = generoPaciente === 'femenino';
  const esMasculino = generoPaciente === 'masculino';

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm transition-all overflow-hidden">
      {/* CABECERA DESPLEGABLE */}
      <div
        onClick={() => setDesplegado(!desplegado)}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors select-none"
      >
        <div className="flex items-center space-x-2 text-slate-800">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Zonas a Tratar en Sesión
          </h3>
          {generoPaciente && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                esFemenino
                  ? 'bg-rose-100 text-rose-700'
                  : esMasculino
                  ? 'bg-sky-100 text-sky-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {generoPaciente}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
            {zonasSeleccionadas.length} seleccionadas
          </span>

          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
            title={desplegado ? 'Ocultar zonas' : 'Mostrar zonas'}
          >
            {desplegado ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CONTENIDO DESPLEGABLE */}
      {desplegado && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3">
          <p className="text-xs text-slate-500">
            Haz clic en las zonas para marcarlas o desmarcarlas según lo que se realizará hoy:
          </p>

          {cargando ? (
            <p className="text-xs text-slate-400 font-medium py-2">Cargando zonas de depilación...</p>
          ) : listaZonasDisponibles.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              No se encontraron zonas correspondientes para este género.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {listaZonasDisponibles.map((zona) => {
                const estaSeleccionada = zonasSeleccionadas.includes(zona);

                // Colores acordes al género correspondiente
                let clasesBoton = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';

                if (esFemenino) {
                  clasesBoton = estaSeleccionada
                    ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                    : 'bg-rose-50/70 border-rose-200 text-rose-800 hover:bg-rose-100';
                } else if (esMasculino) {
                  clasesBoton = estaSeleccionada
                    ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                    : 'bg-sky-50/70 border-sky-200 text-sky-800 hover:bg-sky-100';
                } else {
                  if (estaSeleccionada) {
                    clasesBoton = 'bg-indigo-600 border-indigo-600 text-white shadow-xs';
                  }
                }

                return (
                  <button
                    key={zona}
                    type="button"
                    onClick={() => toggleZona(zona)}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${clasesBoton}`}
                  >
                    <span className="truncate pr-1">{zona}</span>
                    {estaSeleccionada && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}