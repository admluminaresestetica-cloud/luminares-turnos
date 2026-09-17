"use client";

import { useRef, useState } from "react";
import { X, Download, Sparkles } from "lucide-react";
import { toPng } from "html-to-image";
import { ConfiguracionEmpresa } from "@/lib/supabase/configuracion-empresa";
import { OpcionesStory } from "@/types/story";
import { LienzoStory } from "./LienzoStory";
import { ControlesEditor } from "./ControlesEditor";

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
  const [descargando, setDescargando] = useState(false);

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

  // Función para capturar el nodo DOM y exportar la imagen a PNG
  const descargarStory = async () => {
    if (!cardRef.current) return;
    try {
      setDescargando(true);
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      });

      const link = document.createElement("a");
      const sufijoFormato = opciones.formato === "feed" ? "feed" : "story";
      const nombreLimpio = (producto.nombre || "producto")
        .toLowerCase()
        .replace(/\s+/g, "-");

      link.download = `${sufijoFormato}-${nombreLimpio}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error al generar la imagen:", err);
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[95vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-bold text-gray-800">
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
        <div className="flex flex-1 flex-col sm:flex-row p-6 gap-6 items-center justify-center bg-gray-100 overflow-y-auto">
          <ControlesEditor
            opciones={opciones}
            onChangeOpciones={setOpciones}
          />

          <div className="flex-1 flex justify-center items-center py-2 w-full overflow-hidden">
            <LienzoStory
              ref={cardRef}
              producto={producto}
              config={config}
              opciones={opciones}
            />
          </div>
        </div>

        {/* Pie de acciones */}
        <div className="flex justify-end border-t border-gray-100 px-6 py-4 gap-3 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={descargarStory}
            disabled={descargando}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{descargando ? "Generando..." : "Descargar PNG"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}