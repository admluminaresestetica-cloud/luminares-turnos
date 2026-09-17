"use client";

import { useRef, useState } from "react";
import { X, Download, Sparkles, Camera } from "lucide-react";
import { toPng } from "html-to-image";
import { ConfiguracionEmpresa } from "@/lib/supabase/configuracion-empresa";

interface ModalGeneradorStoryProps {
  isOpen: boolean;
  onClose: () => void;
  producto: any | null;
  config: ConfiguracionEmpresa | null;
}

// Componente SVG para el icono de Instagram
const IconInstagram = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export function ModalGeneradorStory({
  isOpen,
  onClose,
  producto,
  config,
}: ModalGeneradorStoryProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [descargando, setDescargando] = useState(false);
  const [estiloPlantilla, setEstiloPlantilla] = useState<"minimal" | "destacado">("minimal");

  if (!isOpen || !producto) return null;

  const descargarStory = async () => {
    if (!cardRef.current) return;
    try {
      setDescargando(true);
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `story-${producto.nombre.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error al generar la imagen:", err);
    } finally {
      setDescargando(false);
    }
  };

  const imagenPortada =
    producto.imagenes_urls && producto.imagenes_urls.length > 0
      ? producto.imagenes_urls[0]
      : producto.imagen_url || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-bold text-gray-800">Generador de Story</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex flex-1 flex-col sm:flex-row overflow-y-auto p-6 gap-6 items-center justify-center bg-gray-50">
          {/* Controles laterales */}
          <div className="flex flex-col gap-4 w-full sm:w-48">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Diseño
            </span>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setEstiloPlantilla("minimal")}
                className={`rounded-xl px-4 py-2.5 text-xs font-semibold text-left transition-all ${
                  estiloPlantilla === "minimal"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Elegante / Minimal
              </button>
              <button
                type="button"
                onClick={() => setEstiloPlantilla("destacado")}
                className={`rounded-xl px-4 py-2.5 text-xs font-semibold text-left transition-all ${
                  estiloPlantilla === "destacado"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Oferta / Destacado
              </button>
            </div>
          </div>

          {/* Vista previa / Lienzo Story (Proporción 9:16) */}
          <div className="flex-1 flex justify-center items-center">
            <div
              ref={cardRef}
              className={`relative flex h-[480px] w-[270px] flex-col justify-between p-6 shadow-2xl transition-all ${
                estiloPlantilla === "destacado"
                  ? "bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white"
                  : "bg-white text-gray-900"
              }`}
            >
              {/* Encabezado Marca */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold tracking-wider uppercase ${
                    estiloPlantilla === "destacado" ? "text-emerald-400" : "text-emerald-700"
                  }`}
                >
                  {config?.nombre_empresa || "Luminares"}
                </span>
                <IconInstagram
                  className={`h-4 w-4 ${
                    estiloPlantilla === "destacado" ? "text-emerald-400" : "text-gray-400"
                  }`}
                />
              </div>

              {/* Imagen central */}
              <div className="relative my-auto flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-100 shadow-md">
                {imagenPortada ? (
                  <img
                    src={imagenPortada}
                    alt={producto.nombre}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="h-10 w-10 text-gray-300" />
                )}
              </div>

              {/* Contenido inferior */}
              <div className="space-y-2">
                <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  {producto.categoria || "Producto"}
                </span>
                <h4 className="text-sm font-bold line-clamp-2 leading-tight">
                  {producto.nombre}
                </h4>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-xl font-black">${producto.precio}</span>
                  {producto.precio_original && (
                    <span className="text-xs text-gray-400 line-through">
                      ${producto.precio_original}
                    </span>
                  )}
                </div>
              </div>
            </div>
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