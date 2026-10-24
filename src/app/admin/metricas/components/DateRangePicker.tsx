'use client';

import React from 'react';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';

export type RangoFecha = 'hoy' | 'semana' | 'mes' | 'personalizado';

interface DateRangePickerProps {
  rangoSeleccionado: RangoFecha;
  setRangoSeleccionado: (rango: RangoFecha) => void;
  fechaInicio: string;
  setFechaInicio: (fecha: string) => void;
  fechaFin: string;
  setFechaFin: (fecha: string) => void;
}

export default function DateRangePicker({
  rangoSeleccionado,
  setRangoSeleccionado,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
}: DateRangePickerProps) {
  const botones: { id: RangoFecha; label: string }[] = [
    { id: 'hoy', label: 'Hoy' },
    { id: 'semana', label: 'Esta Semana' },
    { id: 'mes', label: 'Este Mes' },
    { id: 'personalizado', label: 'Personalizado' },
  ];

return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-white">
      {/* Botones de selección rápida */}
      <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-xl overflow-x-auto no-scrollbar">
        {botones.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setRangoSeleccionado(b.id)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              rangoSeleccionado === b.id
                ? 'bg-white text-blue-700 shadow-md dark:bg-zinc-900 dark:text-blue-400'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Inputs de fecha si selecciona "Personalizado" */}
      {rangoSeleccionado === 'personalizado' && (
        <div className="flex items-center gap-2 text-xs font-semibold text-white/90 flex-wrap">
          <div className="flex items-center gap-2 bg-white/15 border border-white/25 px-3 py-1.5 rounded-xl shadow-2xs">
            <CalendarIcon className="w-4 h-4 text-white" />
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none [color-scheme:dark]"
            />
          </div>
          <span className="text-white/70 font-medium">hasta</span>
          <div className="flex items-center gap-2 bg-white/15 border border-white/25 px-3 py-1.5 rounded-xl shadow-2xs">
            <CalendarIcon className="w-4 h-4 text-white" />
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none [color-scheme:dark]"
            />
          </div>
        </div>
      )}
    </div>
  );
}