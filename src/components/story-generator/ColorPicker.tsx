"use "client";
import { useState } from "react";
import { Palette, Sparkles, Grid } from "lucide-react";

interface ColorPickerProps {
  colorSeleccionado: string;
  onChangeColor: (color: string) => void;
}

const PALETA_SOLIDA = [
  { nombre: "Blanco", value: "#ffffff" },
  { nombre: "Negro", value: "#0f172a" },
  { nombre: "Verde Esmeralda", value: "#065f46" },
  { nombre: "Rosa Pastel", value: "#fbcfe8" },
  { nombre: "Púrpura", value: "#581c87" },
  { nombre: "Gris Suave", value: "#f3f4f6" },
];

const DEGRADADOS = [
  { nombre: "Sunset Warm", value: "linear-gradient(to bottom right, #ff7e5f, #feb47b)" },
  { nombre: "Ocean Breeze", value: "linear-gradient(to bottom right, #2b5876, #4e4376)" },
  { nombre: "Neon Purple", value: "linear-gradient(to bottom right, #833ab4, #fd1d1d, #fcb045)" },
  { nombre: "Mint Fresh", value: "linear-gradient(to bottom right, #11998e, #38ef7d)" },
  { nombre: "Dark Elegant", value: "linear-gradient(to bottom right, #0f172a, #1e293b, #334155)" },
  { nombre: "Rose Gold", value: "linear-gradient(to bottom right, #f43f5e, #fb7185, #fbcfe8)" },
];

const PATRONES = [
  {
    nombre: "Puntos Sutiles",
    value: "radial-gradient(#cbd5e1 1px, transparent 1px)",
    backgroundSize: "12px 12px",
    backgroundColor: "#f8fafc",
  },
  {
    nombre: "Grid Comercial",
    value: "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
    backgroundSize: "20px 20px",
    backgroundColor: "#ffffff",
  },
  {
    nombre: "Diagonal Dark",
    value: "repeating-linear-gradient(45deg, #1e293b, #1e293b 10px, #0f172a 10px, #0f172a 20px)",
    backgroundSize: "auto",
    backgroundColor: "#0f172a",
  },
];

export function ColorPicker({
  colorSeleccionado,
  onChangeColor,
}: ColorPickerProps) {
  const [pestana, setPestana] = useState<"solido" | "degradado" | "patron">("solido");

  return (
    <div className="flex flex-col gap-3">
      {/* Selector de Pestañas de Fondo */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Fondo del Lienzo
        </span>
        <div className="flex bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setPestana("solido")}
            className={`px-2 py-1 rounded-md text-[11px] transition-all ${
              pestana === "solido"
                ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
            }`}
          >
            Sólido
          </button>
          <button
            type="button"
            onClick={() => setPestana("degradado")}
            className={`px-2 py-1 rounded-md text-[11px] flex items-center gap-1 transition-all ${
              pestana === "degradado"
                ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            Degradado
          </button>
          <button
            type="button"
            onClick={() => setPestana("patron")}
            className={`px-2 py-1 rounded-md text-[11px] flex items-center gap-1 transition-all ${
              pestana === "patron"
                ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
            }`}
          >
            <Grid className="w-3 h-3 text-indigo-500" />
            Patrón
          </button>
        </div>
      </div>

      {/* Vista Colores Sólidos */}
      {pestana === "solido" && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {PALETA_SOLIDA.map((item) => {
              const isSelected =
                colorSeleccionado.toLowerCase() === item.value.toLowerCase();
              return (
                <button
                  key={item.value}
                  type="button"
                  title={item.nombre}
                  onClick={() => onChangeColor(item.value)}
                  className={`h-7 w-7 rounded-full border border-slate-300 dark:border-zinc-700 transition-all cursor-pointer ${
                    isSelected
                      ? "scale-110 ring-2 ring-emerald-500 dark:ring-emerald-400 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900"
                      : "hover:scale-105 opacity-90 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: item.value }}
                />
              );
            })}

            {/* Input Picker Personalizado */}
            <div className="relative flex items-center">
              <input
                type="color"
                value={colorSeleccionado.startsWith("#") ? colorSeleccionado : "#ffffff"}
                onChange={(e) => onChangeColor(e.target.value)}
                className="h-7 w-7 cursor-pointer opacity-0 absolute inset-0 z-10"
                title="Elegir color personalizado"
              />
              <div
                className="h-7 w-7 rounded-full border-2 border-dashed border-slate-300 dark:border-zinc-600 flex items-center justify-center text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all shadow-2xs"
                style={{ backgroundColor: colorSeleccionado.startsWith("#") ? colorSeleccionado : "#ffffff" }}
              >
                <Palette className="w-3.5 h-3.5 mix-blend-difference text-white" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/60 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-zinc-800">
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">HEX</span>
            <span className="uppercase font-extrabold text-slate-800 dark:text-zinc-200">
              {colorSeleccionado.startsWith("#") ? colorSeleccionado : "Personalizado"}
            </span>
          </div>
        </div>
      )}

      {/* Vista Degradados */}
      {pestana === "degradado" && (
        <div className="grid grid-cols-3 gap-2">
          {DEGRADADOS.map((item) => {
            const isSelected = colorSeleccionado === item.value;
            return (
              <button
                key={item.nombre}
                type="button"
                onClick={() => onChangeColor(item.value)}
                className={`h-10 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex items-end p-1 ${
                  isSelected
                    ? "ring-2 ring-emerald-500 dark:ring-emerald-400 border-transparent scale-105 shadow-sm"
                    : "border-slate-200 dark:border-zinc-700 hover:scale-102"
                }`}
                style={{ background: item.value }}
              >
                <span className="text-[9px] font-bold text-white bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded-md w-full truncate text-center">
                  {item.nombre}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Vista Patrones */}
      {pestana === "patron" && (
        <div className="grid grid-cols-3 gap-2">
          {PATRONES.map((item) => {
            const isSelected = colorSeleccionado === item.value;
            return (
              <button
                key={item.nombre}
                type="button"
                onClick={() => onChangeColor(item.value)}
                className={`h-10 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex items-end p-1 ${
                  isSelected
                    ? "ring-2 ring-emerald-500 dark:ring-emerald-400 border-transparent scale-105 shadow-sm"
                    : "border-slate-200 dark:border-zinc-700 hover:scale-102"
                }`}
                style={{
                  backgroundImage: item.value,
                  backgroundSize: item.backgroundSize,
                  backgroundColor: item.backgroundColor,
                }}
              >
                <span className="text-[9px] font-bold text-slate-800 dark:text-slate-100 bg-white/80 dark:bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded-md w-full truncate text-center border border-slate-200/50 dark:border-zinc-700/50">
                  {item.nombre}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
