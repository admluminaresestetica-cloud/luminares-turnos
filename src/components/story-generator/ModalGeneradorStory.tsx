"use client";

import { useRef, useState } from "react";
import { X, Download, Sparkles, Share2 } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm sm:text-base font-bold text-gray-800">
              Generador de Imagen Promocional
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo: Panel Lateral de Controles + Vista Previa en Vivo */}
        <div className="flex flex-1 flex-col sm:flex-row p-4 sm:p-6 gap-4 sm:gap-6 items-stretch sm:items-center justify-start sm:justify-center bg-gray-100 overflow-y-auto">
          {/* Editor de controles con límite de altura en mobile */}
          <div className="w-full sm:w-auto shrink-0">
            <ControlesEditor
              opciones={opciones}
              onChangeOpciones={setOpciones}
            />
          </div>

          {/* Área de vista previa adaptativa y centrada */}
          <div className="flex-1 flex justify-center items-center p-2 w-full min-h-[300px] sm:min-h-0 overflow-hidden bg-gray-200/50 rounded-xl border border-gray-200/60">
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
        <div className="flex flex-wrap items-center justify-end border-t border-gray-100 px-4 py-3 sm:px-6 sm:py-4 gap-2.5 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>

          {/* Botón Principal: Compartir */}
          <button
            type="button"
            onClick={compartirStory}
            disabled={procesando}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
          >
            <Share2 className="h-4 w-4" />
            <span>{procesando ? "Generando..." : "Compartir en Redes"}</span>
          </button>

          {/* Botón Secundario: Descargar */}
          <button
            type="button"
            onClick={descargarStory}
            disabled={procesando}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>Descargar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
