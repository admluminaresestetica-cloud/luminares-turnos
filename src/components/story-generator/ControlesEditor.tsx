"use client";

import { OpcionesStory, EstiloPlantilla, BadgeTipo, FormatoStory, FitImagen } from "@/types/story";
import { ColorPicker } from "./ColorPicker";
import { BadgesSelector } from "./BadgesSelector";

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
    <div className="flex flex-col gap-5 w-full sm:w-64 shrink-0 bg-white p-5 pb-32 sm:pb-5 rounded-t-2xl sm:rounded-2xl border-t sm:border border-gray-200/80 shadow-lg sm:shadow-sm max-h-[85vh] sm:max-h-[520px] overflow-y-auto">
      {/* Formato de Lienzo (Story vs Feed) */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Formato
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChangeOpciones({ ...opciones, formato: "story" })}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              opciones.formato === "story"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/80"
            }`}
          >
            📱 Story (9:16)
          </button>
          <button
            type="button"
            onClick={() => onChangeOpciones({ ...opciones, formato: "feed" })}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              opciones.formato === "feed"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/80"
            }`}
          >
            🖼️ Feed (1:1)
          </button>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Plantillas Preset */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Plantilla
        </span>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setEstiloPlantilla("minimal")}
            className={`rounded-xl px-4 py-2.5 text-xs font-semibold text-left transition-all ${
              opciones.estiloPlantilla === "minimal" && !opciones.usarColorPersonalizado
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            ✨ Elegante / Minimal
          </button>
          <button
            type="button"
            onClick={() => setEstiloPlantilla("destacado")}
            className={`rounded-xl px-4 py-2.5 text-xs font-semibold text-left transition-all ${
              opciones.estiloPlantilla === "destacado" && !opciones.usarColorPersonalizado
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            🔥 Oferta / Destacado
          </button>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Ajuste de Imagen */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Ajuste de Imagen
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChangeOpciones({ ...opciones, fitImagen: "contain" })}
            className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${
              opciones.fitImagen === "contain"
                ? "bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/80"
            }`}
          >
            Completa
          </button>
          <button
            type="button"
            onClick={() => onChangeOpciones({ ...opciones, fitImagen: "cover" })}
            className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${
              opciones.fitImagen === "cover"
                ? "bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/80"
            }`}
          >
            Rellenar
          </button>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Selector de Color */}
      <ColorPicker
        colorSeleccionado={opciones.colorFondo}
        onChangeColor={handleColorChange}
      />

      <hr className="border-gray-100" />

      {/* Badges / Etiquetas */}
      <BadgesSelector
        badgeSeleccionado={opciones.badge}
        onChangeBadge={(badge: BadgeTipo) =>
          onChangeOpciones({ ...opciones, badge })
        }
      />

      <hr className="border-gray-100" />

      {/* Interruptores de Visibilidad */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Visibilidad
        </span>
        <div className="flex flex-col gap-3 text-xs text-gray-700 bg-gray-50/60 p-3.5 rounded-xl border border-gray-100">
          <label className="flex items-center justify-between cursor-pointer font-medium">
            <span>Mostrar Cuotas</span>
            <input
              type="checkbox"
              checked={opciones.mostrarCuotas}
              onChange={() => handleToggle("mostrarCuotas")}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 accent-emerald-600"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer font-medium">
            <span>Mostrar Categoría</span>
            <input
              type="checkbox"
              checked={opciones.mostrarCategoria}
              onChange={() => handleToggle("mostrarCategoria")}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 accent-emerald-600"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer font-medium">
            <span>Mostrar Dirección</span>
            <input
              type="checkbox"
              checked={opciones.mostrarDireccion}
              onChange={() => handleToggle("mostrarDireccion")}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 accent-emerald-600"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
