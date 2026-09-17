"use client";

import { useRef, useState } from "react";
import { X, Download, Sparkles, Camera, MapPin } from "lucide-react";
import { toPng } from "html-to-image";
import { calcularCuotas } from "@/lib/precios";
import { ConfiguracionEmpresa } from "@/lib/supabase/configuracion-empresa";

interface ModalGeneradorStoryProps {
  isOpen: boolean;
  onClose: () => void;
  producto: any | null;
  config: ConfiguracionEmpresa | null;
}

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
        pixelRatio: 3,
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

  const cuotaInfo = calcularCuotas(producto.precio);

  // 👈 FIX: Lee correctamente instagram_usuario de Supabase
  const usuarioInstagram =
    config?.instagram_usuario ||
    `@${(config?.nombre_empresa || "luminares").toLowerCase().replace(/\s+/g, "")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[95vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
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
        <div className="flex flex-1 flex-col sm:flex-row p-6 gap-6 items-center justify-center bg-gray-100 overflow-y-auto">
          {/* Controles de Estilo */}
          <div className="flex flex-col gap-4 w-full sm:w-48 shrink-0">
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
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
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
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                Oferta / Destacado
              </button>
            </div>
          </div>

          {/* Lienzo Story (Proporción exacta 9:16) */}
          <div className="flex-1 flex justify-center items-center py-2 w-full overflow-hidden">
            <div
              ref={cardRef}
              className={`relative flex h-[500px] w-[281px] shrink-0 flex-col justify-between p-5 shadow-xl transition-all ${
                estiloPlantilla === "destacado"
                  ? "bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white"
                  : "bg-white text-gray-900"
              }`}
            >
              {/* Encabezado Marca */}
              <div className="flex items-center justify-between z-10 border-b border-gray-100/20 pb-3">
                <span
                  className={`text-xs font-black tracking-widest uppercase ${
                    estiloPlantilla === "destacado" ? "text-emerald-400" : "text-emerald-700"
                  }`}
                >
                  {config?.nombre_empresa || "Luminares"}
                </span>
                <div className="flex items-center gap-1">
                  <IconInstagram
                    className={`h-3.5 w-3.5 ${
                      estiloPlantilla === "destacado" ? "text-emerald-400" : "text-gray-400"
                    }`}
                  />
                  <span className="text-[10px] font-semibold text-gray-400">
                    {usuarioInstagram}
                  </span>
                </div>
              </div>

              {/* Imagen central */}
              <div className="relative my-auto flex h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-gray-50 shadow-inner my-2">
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
              <div className="space-y-2 z-10">
                <span className="inline-block rounded-md bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  {producto.categoria || "Producto"}
                </span>
                
                <h4 className="text-sm font-bold line-clamp-2 leading-tight">
                  {producto.nombre}
                </h4>

                <div className="flex items-baseline gap-2 pt-0.5">
                  <span className="text-2xl font-black">${producto.precio}</span>
                  {producto.precio_original && (
                    <span className="text-xs text-gray-400 line-through">
                      ${producto.precio_original}
                    </span>
                  )}
                </div>

                {/* Info Cuotas */}
                {producto.permite_cuotas !== false && (
                  <p className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-md inline-block">
                    💳 3 cuotas sin interés de ${cuotaInfo.montoCuota.toLocaleString("es-AR")}
                  </p>
                )}

                {/* Footer Call To Action + Dirección */}
                <div className="pt-2 border-t border-gray-100/20 text-center flex flex-col items-center gap-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${
                    estiloPlantilla === "destacado" ? "text-emerald-400" : "text-emerald-700"
                  }`}>
                    📲 ¡Pedilo por Tienda Online!
                  </span>

                  {/* 👈 FIX: Dirección dinámica en la imagen */}
                  {config?.direccion_texto && (
                    <span className="text-[9px] font-medium text-gray-400 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      {config.direccion_texto}
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