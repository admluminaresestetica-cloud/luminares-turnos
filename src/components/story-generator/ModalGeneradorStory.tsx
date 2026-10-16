"use client";

import { useRef, useState } from "react";
import {Smartphone, X, Share2, Download, Loader2} from "lucide-react";
import { toPng } from "html-to-image";
import { ConfiguracionEmpresa } from "@/lib/supabase/configuracion-empresa";
import { OpcionesStory } from "@/types/story";
import { LienzoStory } from "./LienzoStory";
import { ControlesEditor } from "./ControlesEditor";
import { compartirOGuardarImagen, descargarImagenDirecta } from "@/utils/shareImage";

interface ModalGeneradorStoryProps {
  isOpen: boolean;
  onClose: () => void;
  producto: any | null;
  config: ConfiguracionEmpresa | null;
}

export function ModalGeneradorStory({
  isOpen,
  onClose,
  producto,
  config,
}: ModalGeneradorStoryProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [procesando, setProcesando] = useState(false);

  // Estado inicial con todas las opciones de personalización (Etapa 1 a 4)
  const [opciones, setOpciones] = useState<OpcionesStory>({
    estiloPlantilla: "minimal",
    formato: "story", // "story" (9:16) | "feed" (1:1)
    fitImagen: "contain", // "contain" | "cover"
    colorFondo: "#ffffff",
    usarColorPersonalizado: false,
    badge: "ninguno",
    mostrarCuotas: true,
    mostrarDireccion: true,
    mostrarCategoria: true,
  });

  if (!isOpen || !producto) return null;

  // Genera el dataUrl en formato PNG a partir del lienzo
  const generarDataUrl = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    try {
      return await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      });
    } catch (err) {
      console.error("Error al generar la imagen:", err);
      return null;
    }
  };

  // Nombres de archivo formateados
  const sufijoFormato = opciones.formato === "feed" ? "feed" : "story";
  const nombreLimpio = (producto.nombre || "producto")
    .toLowerCase()
    .replace(/\s+/g, "-");
  const nombreArchivo = `${sufijoFormato}-${nombreLimpio}.png`;

  // Acción 1: Compartir directamente en apps (WhatsApp, Instagram, etc.)
  const compartirStory = async () => {
    setProcesando(true);
    const dataUrl = await generarDataUrl();
    if (dataUrl) {
      await compartirOGuardarImagen({
        dataUrl,
        nombreArchivo,
        titulo: producto.nombre || "Promoción",
        texto: `¡Mirá esta oferta de ${producto.nombre || "nuestra tienda"}!`,
      });
    }
    setProcesando(false);
  };

  // Acción 2: Descargar directamente el archivo PNG
  const descargarStory = async () => {
    setProcesando(true);
    const dataUrl = await generarDataUrl();
    if (dataUrl) {
      descargarImagenDirecta(dataUrl, nombreArchivo);
    }
    setProcesando(false);
  };

 return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/75 p-2 sm:p-4 backdrop-blur-sm transition-all">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden transition-colors">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 px-4 py-3.5 sm:px-6 sm:py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              Generador de Imagen Promocional
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-90 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo: Panel Lateral de Controles + Vista Previa en Vivo */}
        <div className="flex flex-1 flex-col sm:flex-row p-4 sm:p-6 gap-4 sm:gap-6 items-stretch sm:items-center justify-start sm:justify-center bg-slate-50 dark:bg-zinc-950/50 overflow-y-auto">
          {/* Editor de controles con límite de altura en mobile */}
          <div className="w-full sm:w-auto shrink-0">
            <ControlesEditor
              opciones={opciones}
              onChangeOpciones={setOpciones}
            />
          </div>

          {/* Área de vista previa adaptativa y centrada */}
          <div className="flex-1 flex justify-center items-center p-3 w-full min-h-[300px] sm:min-h-0 overflow-hidden bg-slate-200/50 dark:bg-zinc-900/80 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
            <div className="transform scale-[0.65] xs:scale-[0.75] sm:scale-100 transition-transform origin-center flex items-center justify-center">
              <LienzoStory
                ref={cardRef}
                producto={producto}
                config={config}
                opciones={opciones}
              />
            </div>
          </div>
        </div>

        {/* Pie de acciones (Fijo abajo) */}
        <div className="flex flex-wrap items-center justify-end border-t border-slate-100 dark:border-zinc-800 px-4 py-3.5 sm:px-6 sm:py-4 gap-2.5 bg-white dark:bg-zinc-900 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
          >
            Cancelar
          </button>

          {/* Botón Principal: Compartir */}
          <button
            type="button"
            onClick={compartirStory}
            disabled={procesando}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white active:scale-95 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {procesando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            <span>{procesando ? "Generando..." : "Compartir en Redes"}</span>
          </button>

          {/* Botón Secundario: Descargar */}
          <button
            type="button"
            onClick={descargarStory}
            disabled={procesando}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Descargar</span>
          </button>
        </div>
      </div>
    </div>
  );
}