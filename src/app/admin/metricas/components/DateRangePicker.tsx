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
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Botones de selección rápida */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl overflow-x-auto">
        {botones.map((b) => (
          <button
            key={b.id}
            onClick={() => setRangoSeleccionado(b.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              rangoSeleccionado === b.id
                ? 'bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Inputs de fecha si selecciona "Personalizado" */}
      {rangoSeleccionado === 'personalizado' && (
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-zinc-400 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl">
            <CalendarIcon className="w-3.5 h-3.5 text-violet-500" />
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-zinc-200 focus:outline-none"
            />
          </div>
          <span>hasta</span>
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl">
            <CalendarIcon className="w-3.5 h-3.5 text-violet-500" />
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-zinc-200 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}