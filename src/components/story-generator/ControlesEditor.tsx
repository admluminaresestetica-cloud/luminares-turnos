"use client";

import { useState } from "react";
import {
  OpcionesStory,
  EstiloPlantilla,
  FormatoStory,
  TipoFuente,
  AlineacionTexto,
} from "@/types/story";
import { ColorPicker } from "./ColorPicker";
import { BadgesSelector } from "./BadgesSelector";
import { ProductEffectsControl } from "./subcomponents/ProductEffectsControl";
import {
  Smartphone,
  Square,
  RectangleHorizontal,
  Lightbulb,
  Flame,
  LayoutGrid,
  ShoppingBag,
  Maximize2,
  Minimize2,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sliders,
  RotateCw,
  Sun,
  Contrast,
  Palette,
  Eye,
  Layout,
  Baseline,
} from "lucide-react";

interface ControlesEditorProps {
  opciones: OpcionesStory;
  onChangeOpciones: (nuevasOpciones: OpcionesStory) => void;
}

export function ControlesEditor({
  opciones,
  onChangeOpciones,
}: ControlesEditorProps) {
  const [pestanaActiva, setPestanaActiva] = useState<
    "diseno" | "texto" | "filtros" | "opciones"
  >("diseno");

  const setEstiloPlantilla = (estiloPlantilla: EstiloPlantilla) => {
    const nuevoColorFondo =
      estiloPlantilla === "destacado" ? "#064e3b" : "#ffffff";
    onChangeOpciones({
      ...opciones,
      estiloPlantilla,
      colorFondo: nuevoColorFondo,
      usarColorPersonalizado: false,
      colorTexto: undefined, // Resetea para usar el contraste automático del preset
    });
  };

  const handleColorChange = (color: string) => {
    onChangeOpciones({
      ...opciones,
      colorFondo: color,
      usarColorPersonalizado: true,
    });
  };

  const handleToggle = (
    campo: "mostrarCuotas" | "mostrarDireccion" | "mostrarCategoria"
  ) => {
    onChangeOpciones({
      ...opciones,
      [campo]: !opciones[campo],
    });
  };

  const updateFiltro = (
    clave: keyof typeof opciones.filtrosImagen,
    valor: number
  ) => {
    onChangeOpciones({
      ...opciones,
      filtrosImagen: {
        ...(opciones.filtrosImagen || {
          brillo: 100,
          contraste: 100,
          saturacion: 100,
          rotacion: 0,
        }),
        [clave]: valor,
      },
    });
  };

  const rotarImagen = () => {
    const rotActual = opciones.filtrosImagen?.rotacion || 0;
    const nuevaRotacion = (rotActual + 90) % 360;
    updateFiltro("rotacion", nuevaRotacion);
  };

  return (
    <div className="flex flex-col gap-4 w-full sm:w-80 shrink-0 bg-white dark:bg-zinc-900 p-4 sm:p-5 pb-28 sm:pb-5 rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200/80 dark:border-zinc-800 shadow-xl sm:shadow-xs max-h-[80vh] sm:max-h-[580px] overflow-y-auto transition-colors">
      {/* Navegación por Pestañas */}
      <div className="flex items-center justify-around bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-bold text-slate-500 dark:text-zinc-400">
        <button
          type="button"
          onClick={() => setPestanaActiva("diseno")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            pestanaActiva === "diseno"
              ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs"
              : "hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Diseño</span>
        </button>

        <button
          type="button"
          onClick={() => setPestanaActiva("texto")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            pestanaActiva === "texto"
              ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs"
              : "hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Texto</span>
        </button>

        <button
          type="button"
          onClick={() => setPestanaActiva("filtros")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            pestanaActiva === "filtros"
              ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs"
              : "hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filtros</span>
        </button>

        <button
          type="button"
          onClick={() => setPestanaActiva("opciones")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            pestanaActiva === "opciones"
              ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs"
              : "hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Opciones</span>
        </button>
      </div>

      <hr className="border-slate-100 dark:border-zinc-800" />

      {/* PESTAÑA 1: DISEÑO Y FONDO */}
      {pestanaActiva === "diseno" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Formato de Canvas
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() =>
                  onChangeOpciones({ ...opciones, formato: "story" })
                }
                className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[11px] font-bold transition-all cursor-pointer ${
                  opciones.formato === "story"
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/80"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Story 9:16</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onChangeOpciones({ ...opciones, formato: "feed" })
                }
                className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[11px] font-bold transition-all cursor-pointer ${
                  opciones.formato === "feed"
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/80"
                }`}
              >
                <Square className="w-4 h-4" />
                <span>Feed 1:1</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onChangeOpciones({ ...opciones, formato: "banner" })
                }
                className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[11px] font-bold transition-all cursor-pointer ${
                  opciones.formato === "banner"
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/80"
                }`}
              >
                <RectangleHorizontal className="w-4 h-4" />
                <span>Banner 16:9</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Estilo / Plantilla
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setEstiloPlantilla("minimal")}
                className={`flex items-center gap-2 rounded-xl p-2 text-[11px] font-bold transition-all cursor-pointer ${
                  opciones.estiloPlantilla === "minimal" &&
                  !opciones.usarColorPersonalizado
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-50 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/80"
                }`}
              >
                <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Minimal</span>
              </button>

              <button
                type="button"
                onClick={() => setEstiloPlantilla("destacado")}
                className={`flex items-center gap-2 rounded-xl p-2 text-[11px] font-bold transition-all cursor-pointer ${
                  opciones.estiloPlantilla === "destacado" &&
                  !opciones.usarColorPersonalizado
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-50 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/80"
                }`}
              >
                <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">Destacado</span>
              </button>

              <button
                type="button"
                onClick={() => setEstiloPlantilla("collage")}
                className={`flex items-center gap-2 rounded-xl p-2 text-[11px] font-bold transition-all cursor-pointer ${
                  opciones.estiloPlantilla === "collage"
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-50 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/80"
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="truncate">Collage</span>
              </button>

              <button
                type="button"
                onClick={() => setEstiloPlantilla("ecommerce_modern")}
                className={`flex items-center gap-2 rounded-xl p-2 text-[11px] font-bold transition-all cursor-pointer ${
                  opciones.estiloPlantilla === "ecommerce_modern"
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-50 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/80"
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="truncate">E-Commerce</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Encuadre de Foto
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  onChangeOpciones({ ...opciones, fitImagen: "contain" })
                }
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                  opciones.fitImagen === "contain"
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/80"
                }`}
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Completa</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onChangeOpciones({ ...opciones, fitImagen: "cover" })
                }
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                  opciones.fitImagen === "cover"
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/80"
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Rellenar</span>
              </button>
            </div>
          </div>

          <ColorPicker
  colorSeleccionado={opciones.colorFondo}
  imagenFondo={opciones.imagenFondo}
  onChangeColor={handleColorChange}
  onChangeImagenFondo={(imagen) =>
    onChangeOpciones({ ...opciones, imagenFondo: imagen })
  }
/>
        </div>
      )}

      {/* PESTAÑA 2: TIPOGRAFÍA Y TEXTO */}
      {pestanaActiva === "texto" && (
        <div className="flex flex-col gap-4">
          {/* Selector de Color de Texto */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Baseline className="w-3.5 h-3.5" /> Color de Letras
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChangeOpciones({ ...opciones, colorTexto: undefined })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  !opciones.colorTexto
                    ? "bg-emerald-600 text-white border-transparent shadow-xs"
                    : "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700"
                }`}
              >
                Automático
              </button>
              <button
                type="button"
                onClick={() => onChangeOpciones({ ...opciones, colorTexto: "#0f172a" })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  opciones.colorTexto === "#0f172a"
                    ? "bg-emerald-600 text-white border-transparent shadow-xs"
                    : "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700"
                }`}
              >
                Negro
              </button>
              <button
                type="button"
                onClick={() => onChangeOpciones({ ...opciones, colorTexto: "#ffffff" })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  opciones.colorTexto === "#ffffff"
                    ? "bg-emerald-600 text-white border-transparent shadow-xs"
                    : "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700"
                }`}
              >
                Blanco
              </button>
              <input
                type="color"
                value={opciones.colorTexto || "#111827"}
                onChange={(e) => onChangeOpciones({ ...opciones, colorTexto: e.target.value })}
                className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200 dark:border-zinc-700 p-0.5 bg-transparent"
                title="Color personalizado de texto"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Estilo de Letra
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "modern", nombre: "Moderna", clase: "font-sans" },
                { id: "bold", nombre: "Bold / Impacto", clase: "font-black" },
                { id: "display", nombre: "Display", clase: "font-mono" },
                { id: "serif", nombre: "Elegante Serif", clase: "font-serif" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() =>
                    onChangeOpciones({
                      ...opciones,
                      fuenteTipografica: f.id as TipoFuente,
                    })
                  }
                  className={`p-2.5 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                    opciones.fuenteTipografica === f.id
                      ? "bg-emerald-600 dark:bg-emerald-500 text-white border-transparent shadow-md shadow-emerald-600/20"
                      : "bg-slate-50 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700/80"
                  } ${f.clase}`}
                >
                  {f.nombre}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Alineación
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "left", icon: AlignLeft },
                { id: "center", icon: AlignCenter },
                { id: "right", icon: AlignRight },
              ].map((a) => {
                const IconComponent = a.icon;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() =>
                      onChangeOpciones({
                        ...opciones,
                        alineacionTexto: a.id as AlineacionTexto,
                      })
                    }
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      opciones.alineacionTexto === a.id
                        ? "bg-emerald-600 dark:bg-emerald-500 text-white border-transparent shadow-md shadow-emerald-600/20"
                        : "bg-slate-50 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700/80"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: FILTROS DE IMAGEN */}
      {pestanaActiva === "filtros" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Ajustes de Fotografía
            </span>
            <button
              type="button"
              onClick={rotarImagen}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotar 90°</span>
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-zinc-300">
              <span className="flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" /> Brillo
              </span>
              <span>{opciones.filtrosImagen?.brillo || 100}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={opciones.filtrosImagen?.brillo || 100}
              onChange={(e) => updateFiltro("brillo", Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-zinc-300">
              <span className="flex items-center gap-1">
                <Contrast className="w-3.5 h-3.5 text-indigo-500" /> Contraste
              </span>
              <span>{opciones.filtrosImagen?.contraste || 100}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={opciones.filtrosImagen?.contraste || 100}
              onChange={(e) => updateFiltro("contraste", Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-zinc-300">
              <span className="flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-rose-500" /> Saturación
              </span>
              <span>{opciones.filtrosImagen?.saturacion || 100}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={opciones.filtrosImagen?.saturacion || 100}
              onChange={(e) =>
                updateFiltro("saturacion", Number(e.target.value))
              }
              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      )}

      {/* PESTAÑA 4: OPCIONES Y VISIBILIDAD */}
      {pestanaActiva === "opciones" && (
        <div className="flex flex-col gap-4">
          <BadgesSelector
            badgeSeleccionado={opciones.badge}
            onChangeBadge={(badge) =>
              onChangeOpciones({ ...opciones, badge })
            }
          />

          {/* Efectos de Producto: Sombras, Marcos e Insignias */}
<ProductEffectsControl
  sombra={opciones.sombraProducto || "ninguna"}
  borde={opciones.bordeProducto || "ninguno"}
  sticker={opciones.stickerDecorativo || "ninguno"}
  onChangeSombra={(sombra) =>
    onChangeOpciones({ ...opciones, sombraProducto: sombra })
  }
  onChangeBorde={(borde) =>
    onChangeOpciones({ ...opciones, bordeProducto: borde })
  }
  onChangeSticker={(sticker) =>
    onChangeOpciones({ ...opciones, stickerDecorativo: sticker })
  }
/>

          <hr className="border-slate-100 dark:border-zinc-800" />

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Elementos Visibles
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
      )}
    </div>
  );
}