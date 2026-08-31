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

  // Cargar servicios_laser (nombre y género) desde Supabase
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

  // Map de ayuda para saber el género de cada zona rápidamente
  const mapaGeneros = useMemo(() => {
    const map = new Map<string, string>();
    servicios.forEach((s) => {
      if (s.nombre) {
        map.set(s.nombre.toLowerCase().trim(), (s.genero || '').toLowerCase().trim());
      }
    });
    return map;
  }, [servicios]);

  // Unimos las zonas traídas de la base con cualquier zona previa seleccionada
  const listaZonasDisponibles = useMemo(() => {
    const nombresBd = servicios.map((s) => s.nombre).filter(Boolean);
    const lista = [...nombresBd];
    zonasSeleccionadas.forEach((z) => {
      if (z && !lista.includes(z)) {
        lista.push(z);
      }
    });
    return lista;
  }, [servicios, zonasSeleccionadas]);

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
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
            {zonasSeleccionadas.length} seleccionadas
          </span>

          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            title={desplegado ? 'Ocultar zonas' : 'Mostrar zonas'}
          >
            {desplegado ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CONTENIDO DESPLEGABLE */}
      {desplegado && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-500 gap-1">
            <p>Haz clic en las zonas para marcarlas o desmarcarlas:</p>
            {/* Leyenda de colores */}
            <div className="flex items-center space-x-3 text-[10px] font-semibold">
              <span className="flex items-center space-x-1 text-rose-600">
                <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
                <span>Femenino</span>
              </span>
              <span className="flex items-center space-x-1 text-sky-600">
                <span className="w-2 h-2 rounded-full bg-sky-400 inline-block"></span>
                <span>Masculino</span>
              </span>
            </div>
          </div>

          {cargando ? (
            <p className="text-xs text-slate-400 font-medium py-2">Cargando zonas de depilación...</p>
          ) : listaZonasDisponibles.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">No se encontraron zonas en servicios_laser.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {listaZonasDisponibles.map((zona) => {
                const estaSeleccionada = zonasSeleccionadas.includes(zona);
                const genero = mapaGeneros.get(zona.toLowerCase().trim()) || '';

                // Definición de estilos dinámicos según el género
                let clasesBoton = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';

                if (genero === 'femenino') {
                  clasesBoton = estaSeleccionada
                    ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                    : 'bg-rose-50/70 border-rose-200 text-rose-800 hover:bg-rose-100';
                } else if (genero === 'masculino') {
                  clasesBoton = estaSeleccionada
                    ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                    : 'bg-sky-50/70 border-sky-200 text-sky-800 hover:bg-sky-100';
                } else {
                  // Sin género especificado o neutro
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