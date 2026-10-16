"use client";

import { OpcionesStory, EstiloPlantilla, BadgeTipo, FormatoStory, FitImagen } from "@/types/story";
import { ColorPicker } from "./ColorPicker";
import { BadgesSelector } from "./BadgesSelector";
import { Smartphone, Square, Lightbulb, Flame, Maximize2, Minimize2 } from "lucide-react";

interface ControlesEditorProps {
  opciones: OpcionesStory;
  onChangeOpciones: (nuevasOpciones: OpcionesStory) => void;
}

export function ControlesEditor({
  opciones,
  onChangeOpciones,
}: ControlesEditorProps) {
  const setEstiloPlantilla = (estiloPlantilla: EstiloPlantilla) => {
    const nuevoColorFondo = estiloPlantilla === "destacado" ? "#064e3b" : "#ffffff";
    onChangeOpciones({
      ...opciones,
      estiloPlantilla,
      colorFondo: nuevoColorFondo,
      usarColorPersonalizado: false,
    });
  };

  const handleColorChange = (color: string) => {
    onChangeOpciones({
      ...opciones,
      colorFondo: color,
      usarColorPersonalizado: true,
    });
  };

  const handleToggle = (campo: "mostrarCuotas" | "mostrarDireccion" | "mostrarCategoria") => {
    onChangeOpciones({
      ...opciones,
      [campo]: !opciones[campo],
    });
  };

 return (
    <div className="flex flex-col gap-5 w-full sm:w-64 shrink-0 bg-white dark:bg-zinc-900 p-5 pb-32 sm:pb-5 rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200/80 dark:border-zinc-800 shadow-xl sm:shadow-xs max-h-[85vh] sm:max-h-[520px] overflow-y-auto transition-colors">
      
      {/* Formato de Lienzo (Story vs Feed) */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
          Formato
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChangeOpciones({ ...opciones, formato: "story" })}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              opciones.formato === "story"
                ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Story (9:16)</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeOpciones({ ...opciones, formato: "feed" })}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              opciones.formato === "feed"
                ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80"
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>Feed (1:1)</span>
          </button>
        </div>
      </div>

      <hr className="border-slate-100 dark:border-zinc-800" />

      {/* Plantillas Preset */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
          Plantilla
        </span>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setEstiloPlantilla("minimal")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold text-left transition-all cursor-pointer ${
              opciones.estiloPlantilla === "minimal" && !opciones.usarColorPersonalizado
                ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-50 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80"
            }`}
          >
            <Lightbulb className="w-4 h-4 text-emerald-400" />
            <span>Elegante / Minimal</span>
          </button>

          <button
            type="button"
            onClick={() => setEstiloPlantilla("destacado")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold text-left transition-all cursor-pointer ${
              opciones.estiloPlantilla === "destacado" && !opciones.usarColorPersonalizado
                ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-50 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80"
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Oferta / Destacado</span>
          </button>
        </div>
      </div>

      <hr className="border-slate-100 dark:border-zinc-800" />

      {/* Ajuste de Imagen */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
          Ajuste de Imagen
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChangeOpciones({ ...opciones, fitImagen: "contain" })}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
              opciones.fitImagen === "contain"
                ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80"
            }`}
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Completa</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeOpciones({ ...opciones, fitImagen: "cover" })}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
              opciones.fitImagen === "cover"
                ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80"
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Rellenar</span>
          </button>
        </div>
      </div>

      <hr className="border-slate-100 dark:border-zinc-800" />

      {/* Selector de Color */}
      {ColorPicker && (
        <>
          <ColorPicker
            colorSeleccionado={opciones.colorFondo}
            onChangeColor={handleColorChange}
          />
          <hr className="border-slate-100 dark:border-zinc-800" />
        </>
      )}

      {/* Badges / Etiquetas */}
      {BadgesSelector && (
        <>
          <BadgesSelector
            badgeSeleccionado={opciones.badge}
            onChangeBadge={(badge: any) =>
              onChangeOpciones({ ...opciones, badge })
            }
          />
          <hr className="border-slate-100 dark:border-zinc-800" />
        </>
      )}

      {/* Interruptores de Visibilidad */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
          Visibilidad
        </span>
        <div className="flex flex-col gap-3 text-xs text-slate-700 dark:text-zinc-300 bg-slate-50/70 dark:bg-zinc-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-zinc-800">
          <label className="flex items-center justify-between cursor-pointer font-bold select-none">
            <span>Mostrar Cuotas</span>
            <input
              type="checkbox"
              checked={opciones.mostrarCuotas}
              onChange={() => handleToggle("mostrarCuotas")}
              className="rounded-md text-emerald-600 dark:text-emerald-500 focus:ring-emerald-500 h-4 w-4 accent-emerald-600 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer font-bold select-none">
            <span>Mostrar Categoría</span>
            <input
              type="checkbox"
              checked={opciones.mostrarCategoria}
              onChange={() => handleToggle("mostrarCategoria")}
              className="rounded-md text-emerald-600 dark:text-emerald-500 focus:ring-emerald-500 h-4 w-4 accent-emerald-600 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer font-bold select-none">
            <span>Mostrar Dirección</span>
            <input
              type="checkbox"
              checked={opciones.mostrarDireccion}
              onChange={() => handleToggle("mostrarDireccion")}
              className="rounded-md text-emerald-600 dark:text-emerald-500 focus:ring-emerald-500 h-4 w-4 accent-emerald-600 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}