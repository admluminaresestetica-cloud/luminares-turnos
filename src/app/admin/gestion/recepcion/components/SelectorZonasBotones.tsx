'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Sparkles } from 'lucide-react';

interface ZonaItem {
  nombre_zona: string;
  genero: string;
}

interface SelectorProps {
  zonasSeleccionadas: string[];
  setZonasSeleccionadas: (zonas: string[]) => void;
}

export default function SelectorZonasBotones({
  zonasSeleccionadas,
  setZonasSeleccionadas,
}: SelectorProps) {
  const [listaZonas, setListaZonas] = useState<ZonaItem[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarZonas = async () => {
      try {
        const { data, error } = await supabase
          .from('servicios_laser')
          .select('nombre_zona, genero')
          .eq('activo', true)
          .order('nombre_zona', { ascending: true });

        if (error) throw error;

        if (data) {
          setListaZonas(data);
        }
      } catch (err) {
        console.error('Error al cargar zonas de servicios_laser:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarZonas();
  }, []);

  const toggleZona = (zonaNombre: string) => {
    if (zonasSeleccionadas.includes(zonaNombre)) {
      setZonasSeleccionadas(zonasSeleccionadas.filter((z) => z !== zonaNombre));
    } else {
      setZonasSeleccionadas([...zonasSeleccionadas, zonaNombre]);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs italic text-slate-400 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-500">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-teal-500 dark:border-zinc-600 dark:border-t-teal-400" />
        Cargando zonas de la base de datos...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Zonas a realizar hoy
          </span>
        </div>
        {zonasSeleccionadas.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-bold text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            {zonasSeleccionadas.length} seleccionada{zonasSeleccionadas.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {listaZonas.map((item) => {
          const seleccionada = zonasSeleccionadas.includes(item.nombre_zona);
          const esMasculino = (item.genero || '').toLowerCase().includes('masculino');

          // Clases por género: Azul para masculino, Rosa para femenino, adaptadas a modo oscuro
          let estiloColor = '';

          if (esMasculino) {
            estiloColor = seleccionada
              ? 'border-transparent bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm shadow-blue-600/20 dark:from-blue-500 dark:to-blue-600'
              : 'border-blue-200/80 bg-blue-50 text-blue-800 hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50';
          } else {
            estiloColor = seleccionada
              ? 'border-transparent bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-sm shadow-pink-600/20 dark:from-pink-500 dark:to-pink-600'
              : 'border-pink-200/80 bg-pink-50 text-pink-800 hover:bg-pink-100 dark:border-pink-900/60 dark:bg-pink-950/40 dark:text-pink-300 dark:hover:bg-pink-900/50';
          }

          return (
            <button
              key={item.nombre_zona}
              type="button"
              onClick={() => toggleZona(item.nombre_zona)}
              className={`min-h-11 rounded-full border px-4 py-2 text-xs font-semibold transition-all active:scale-95 ${estiloColor}`}
            >
              {seleccionada ? '✓ ' : '+ '}
              {item.nombre_zona}
            </button>
          );
        })}
      </div>
    </div>
  );
}