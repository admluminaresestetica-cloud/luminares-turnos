"use client";
import { Palette } from "lucide-react";
interface ColorPickerProps {
  colorSeleccionado: string;
  onChangeColor: (color: string) => void;
}

const PALETA_RAPIDA = [
  { nombre: "Blanco", hex: "#ffffff" },
  { nombre: "Negro", hex: "#0f172a" },
  { nombre: "Verde Esmeralda", hex: "#065f46" },
  { nombre: "Rosa Pastel", hex: "#fbcfe8" },
  { nombre: "Púrpura", hex: "#581c87" },
  { nombre: "Gris Suave", hex: "#f3f4f6" },
];

export function ColorPicker({
  colorSeleccionado,
  onChangeColor,
}: ColorPickerProps) {
return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
        Color de Fondo
      </span>

      {/* Swatches de acceso rápido */}
      <div className="flex items-center gap-2 flex-wrap">
        {PALETA_RAPIDA.map((item: any) => {
          const isSelected =
            colorSeleccionado.toLowerCase() === item.hex.toLowerCase();
          return (
            <button
              key={item.hex}
              type="button"
              title={item.nombre}
              onClick={() => onChangeColor(item.hex)}
              className={`h-7 w-7 rounded-full border border-slate-300 dark:border-zinc-700 transition-all cursor-pointer ${
                isSelected
                  ? "scale-110 ring-2 ring-emerald-500 dark:ring-emerald-400 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900"
                  : "hover:scale-105 opacity-90 hover:opacity-100"
              }`}
              style={{ backgroundColor: item.hex }}
            />
          );
        })}

        {/* Input Picker Personalizado */}
        <div className="relative flex items-center">
          <input
            type="color"
            value={colorSeleccionado}
            onChange={(e) => onChangeColor(e.target.value)}
            className="h-7 w-7 cursor-pointer opacity-0 absolute inset-0 z-10"
            title="Elegir color personalizado"
          />
          <div
            className="h-7 w-7 rounded-full border-2 border-dashed border-slate-300 dark:border-zinc-600 flex items-center justify-center text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all shadow-2xs"
            style={{ backgroundColor: colorSeleccionado }}
          >
            <Palette className="w-3.5 h-3.5 mix-blend-difference text-white" />
          </div>
        </div>
      </div>

      {/* Indicador de Código HEX */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/60 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-zinc-800 mt-0.5">
        <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">HEX</span>
        <span className="uppercase font-extrabold text-slate-800 dark:text-zinc-200">{colorSeleccionado}</span>
      </div>
    </div>
  );
}