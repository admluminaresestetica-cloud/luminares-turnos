'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
    return <div className="text-xs text-slate-400">Cargando zonas de la base de datos...</div>;
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase text-slate-700">
        ✂️ Zonas a Realizar Hoy (Clic para seleccionar)
      </label>
      <div className="flex flex-wrap gap-2">
        {listaZonas.map((item) => {
          const seleccionada = zonasSeleccionadas.includes(item.nombre_zona);
          const esMasculino = (item.genero || '').toLowerCase().includes('masculino');

          // Clases por género: Azul para masculino, Rosa para femenino
          let estiloColor = '';

          if (esMasculino) {
            estiloColor = seleccionada
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100';
          } else {
            estiloColor = seleccionada
              ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
              : 'bg-pink-50 text-pink-800 border-pink-200 hover:bg-pink-100';
          }

          return (
            <button
              key={item.nombre_zona}
              type="button"
              onClick={() => toggleZona(item.nombre_zona)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${estiloColor}`}
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