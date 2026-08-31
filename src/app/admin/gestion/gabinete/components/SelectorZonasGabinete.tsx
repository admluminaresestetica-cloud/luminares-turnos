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
  genero?: string;
}

interface SelectorZonasGabineteProps {
  sesionActual: any;
  zonasSeleccionadas: string[];
  setZonasSeleccionadas: (zonas: string[]) => void;
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
}: SelectorZonasGabineteProps) {
  const [servicios, setServicios] = useState<ServicioLaser[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [desplegado, setDesplegado] = useState<boolean>(true);

  useEffect(() => {
    const cargarServiciosLaser = async () => {
      setCargando(true);
      try {
        const { data, error } = await supabase
          .from('servicios_laser')
          .select('*'); // Traemos todo para verificar

        console.log('=== DIAGNÓSTICO GABINETE ===');
        console.log('Error Supabase:', error);
        console.log('Data Supabase:', data);
      } catch (err) {
        console.error('Error en try/catch:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarServiciosLaser();
  }, []);

  // Consolidar lista completa ordenada: Femenino primero, Masculino después, luego Unisex
  const zonasOrganizadas = useMemo(() => {
    // Mapa para saber el género de cada nombre de zona
    const mapaZonas = new Map<string, { nombre: string; genero: string }>();

    servicios.forEach((serv) => {
      if (serv.nombre) {
        mapaZonas.set(serv.nombre.toLowerCase().trim(), {
          nombre: serv.nombre,
          genero: obtenerGeneroLimpio(serv.genero),
        });
      }
    });

    // Asegurar que las zonas que seleccionó recepción también estén en la lista
    zonasSeleccionadas.forEach((z) => {
      if (z) {
        const key = z.toLowerCase().trim();
        if (!mapaZonas.has(key)) {
          mapaZonas.set(key, { nombre: z, genero: 'unisex' });
        }
      }
    });

    const listaCompleta = Array.from(mapaZonas.values());

    // Ordenar por prioridad de género: Femenino (1) -> Masculino (2) -> Unisex (3)
    const ordenGenero: Record<string, number> = { femenino: 1, masculino: 2, unisex: 3 };

    return listaCompleta.sort((a, b) => {
      const pA = ordenGenero[a.genero] || 3;
      const pB = ordenGenero[b.genero] || 3;

      if (pA !== pB) return pA - pB;
      return a.nombre.localeCompare(b.nombre);
    });
  }, [servicios, zonasSeleccionadas]);

  const toggleZona = (nombreZona: string) => {
    // Coincidencia insensible a mayúsculas/minúsculas para no duplicar
    const existe = zonasSeleccionadas.some(
      (z) => z.toLowerCase().trim() === nombreZona.toLowerCase().trim()
    );

    if (existe) {
      setZonasSeleccionadas(
        zonasSeleccionadas.filter(
          (z) => z.toLowerCase().trim() !== nombreZona.toLowerCase().trim()
        )
      );
    } else {
      setZonasSeleccionadas([...zonasSeleccionadas, nombreZona]);
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

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm transition-all overflow-hidden">
      {/* CABECERA */}
      <div
        onClick={() => setDesplegado(!desplegado)}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors select-none"
      >
        <div className="flex items-center space-x-2 text-slate-800">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Zonas a Tratar en Sesión
          </h3>
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

      {/* LISTADO DE TODAS LAS ZONAS */}
      {desplegado && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3">
          <p className="text-xs text-slate-500">
            Haz clic en las zonas para marcarlas o desmarcarlas según lo que se realizará hoy:
          </p>

          {cargando ? (
            <p className="text-xs text-slate-400 font-medium py-2">Cargando catálogo completo de zonas...</p>
          ) : zonasOrganizadas.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              No se encontraron zonas en la tabla servicios_laser.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {zonasOrganizadas.map((item) => {
                const estaSeleccionada = zonasSeleccionadas.some(
                  (z) => z.toLowerCase().trim() === item.nombre.toLowerCase().trim()
                );

                const esFem = item.genero === 'femenino';
                const esMasc = item.genero === 'masculino';

                // Colores para identificar rápido visualmente cada género
                let clasesBoton = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';

                if (estaSeleccionada) {
                  clasesBoton = esFem
                    ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                    : esMasc
                    ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                    : 'bg-indigo-600 border-indigo-600 text-white shadow-xs';
                } else {
                  clasesBoton = esFem
                    ? 'bg-rose-50/50 border-rose-200 text-rose-900 hover:bg-rose-100'
                    : esMasc
                    ? 'bg-sky-50/50 border-sky-200 text-sky-900 hover:bg-sky-100'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                }

                return (
                  <button
                    key={item.nombre}
                    type="button"
                    onClick={() => toggleZona(item.nombre)}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${clasesBoton}`}
                  >
                    <div className="flex flex-col items-start truncate pr-1">
                      <span className="truncate w-full text-left">{item.nombre}</span>
                      <span
                        className={`text-[9px] font-normal uppercase opacity-75 ${
                          estaSeleccionada ? 'text-white' : 'text-slate-500'
                        }`}
                      >
                        {esFem ? 'Fem' : esMasc ? 'Masc' : 'Gral'}
                      </span>
                    </div>

                    {estaSeleccionada && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
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